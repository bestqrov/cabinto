import type { Request, Response } from "express";
import validator from "validator";
import User from "../models/User";
import Settings from "../models/Settings";
import bcrypt from "bcryptjs";
import { generateToken } from "../libs/token";
import cloudinary from "../libs/cloudinary";
import streamifier from "streamifier";
import mongoose from "mongoose";

export async function register(req: Request, res: Response) {
  try {
    const { fullname, email, password, role, specialization, permissions } = req.body;

    switch (true) {
      case !fullname || !email || !password:
        return res.status(400).json({ error: "Tous les champs sont requis" });

      case !validator.isEmail(email):
        return res.status(400).json({ error: "Email invalide" });

      case password.length < 8:
        return res
          .status(400)
          .json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(401).json({ error: "Email déjà enregistré" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const isAdmin =
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD;

    // Allow admin to set role, otherwise default to "user"
    let userRole = "user";
    if (isAdmin) {
      userRole = "Admin";
    } else if (role && (role === "Dentist" || role === "Receptionist")) {
      userRole = role;
    }

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      role: userRole,
      specialization: specialization || undefined,
      permissions: permissions || undefined,
      bio: "Hello User!",
    });

    const token = generateToken({
      _id: newUser._id,
      role: newUser.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: "Compte créé avec succès",
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        cover: newUser.cover,
        bio: newUser.bio,
        permissions: newUser.permissions,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erreur lors de la création du compte" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, passwordLength: password?.length });
    
    if (!email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Email incorrect" });
    }
    
    console.log("User found:", { email: user.email, role: user.role });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = generateToken({
      _id: user._id,
      role: user.role,
    });

    // Sync Settings if user is Admin
    if (user.role === "Admin") {
      await Settings.findOneAndUpdate(
        {},
        {
          adminName: user.fullname,
          adminEmail: user.email,
          adminRole: user.role,
          adminPhoto: user.avatar || "",
        },
        { upsert: true, new: true }
      );
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: "Connexion réussie",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        cover: user.cover,
        role: user.role,
        bio: user.bio,
        specialization: user.specialization,
        permissions: user.permissions,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erreur lors de la connexion" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Non autorisé" });
    }

    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      cover: user.cover,
      bio: user.bio,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erreur lors de l'affichage des données utilisateur" });
  }
}

export async function profileUser(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Non autorisé" });
    }

    const files = req.files as {
      avatar?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    };

    const avatarFile = files?.avatar?.[0];
    const coverFile = files?.cover?.[0];

    const updatedData: any = {};

    const extractPublicId = (url: string) => {
      const parts = url.split("/");
      const file = parts.pop()!;
      return file.split(".")[0];
    };

    const uploadToCloudinary = (file: Express.Multer.File, folder: string) => {
      return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    if (avatarFile) {
      if (user.avatar && user.avatar.includes("res.cloudinary.com")) {
        const oldId = extractPublicId(user.avatar);
        await cloudinary.uploader.destroy(`users/avatars/${oldId}`);
      }

      const avatarUpload = await uploadToCloudinary(
        avatarFile,
        "users/avatars"
      );

      updatedData.avatar = avatarUpload.secure_url;
    }

    if (coverFile) {
      if (user.cover && user.cover.includes("res.cloudinary.com")) {
        const oldId = extractPublicId(user.cover);
        await cloudinary.uploader.destroy(`users/covers/${oldId}`);
      }

      const coverUpload = await uploadToCloudinary(coverFile, "users/covers");

      updatedData.cover = coverUpload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, {
      new: true,
    });

    // Update Settings if user is Admin
    if (updatedUser && updatedUser.role === "Admin") {
      await Settings.findOneAndUpdate(
        {},
        {
          adminName: updatedUser.fullname,
          adminEmail: updatedUser.email,
          adminRole: updatedUser.role,
          adminPhoto: updatedUser.avatar || "",
        },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      success: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erreur lors de la mise à jour du profil",
    });
  }
}

export async function editBio(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "Non autorisé" });
    }

    const { bio } = req.body;
    if (!bio || typeof bio !== "string") {
      return res.status(400).json({ error: "Bio invalide" });
    }

    const updatedBio = await User.findOneAndUpdate(
      { _id: user._id },
      { bio },
      { new: true }
    );

    return res.status(200).json(updatedBio);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour de la bio" });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "Non autorisé" });
    }

    const { role } = req.query;

    let filter: any = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "حدث خطأ اثناء جلب مستخدمين" });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "غير مصرح بك" });
    }
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "معرف غير صالح" });
    }

    const userById = await User.findById(id);
    if (!userById) {
      return res.status(404).json({ error: "مستخدم غير موجود" });
    }
    return res.status(200).json(userById);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "حدث خطأ اثناء جلب مستخدم من خلال معرف" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "غير مصرح بك" });
    }
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "مستخدم غير موجود" });
    }
    const deleteUserById = await User.findByIdAndDelete(id);

    if (!deleteUserById) {
      return res.status(404).json({ error: "مستخدم غير موجود" });
    }
    return res.status(200).json(deleteUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "حدث خطأ اثناء حذف مستخدم",
    });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "غير مصرح بك" });
    }
    
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "مستخدم غير موجود" });
    }

    const { fullname, role, specialization, permissions } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        fullname,
        role,
        specialization,
        permissions,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "مستخدم غير موجود" });
    }

    return res.status(200).json({
      success: "تم تحديث المستخدم بنجاح",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "حدث خطأ اثناء تحديث مستخدم",
    });
  }
}
