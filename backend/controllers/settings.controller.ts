import type { Request, Response } from "express";
import Settings from "../models/Settings";
import cloudinary from "../libs/cloudinary";
import streamifier from "streamifier";

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

export async function getCabinetSettings(req: Request, res: Response) {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de la récupération des paramètres" });
  }
}

export async function updateCabinetSettings(req: Request, res: Response) {
  try {
    const { name, specialite, targetLine, email, phone, website, address, country, if: ifValue, ice, cnss } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    const updatedData: any = {
      name,
      specialite,
      targetLine,
      email,
      phone,
      website,
      address,
      country,
      if: ifValue,
      ice,
      cnss,
    };

    // Handle logo upload
    const files = req.files as { logo?: Express.Multer.File[] };
    const logoFile = files?.logo?.[0];

    if (logoFile) {
      if (settings.logo && settings.logo.includes("res.cloudinary.com")) {
        const oldId = settings.logo.split("/").pop()?.split(".")[0];
        if (oldId) {
          await cloudinary.uploader.destroy(`settings/logos/${oldId}`);
        }
      }

      const logoUpload = await uploadToCloudinary(logoFile, "settings/logos");
      updatedData.logo = logoUpload.secure_url;
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      updatedData,
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: "Paramètres du cabinet mis à jour avec succès",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour des paramètres" });
  }
}

export async function updateAdminSettings(req: Request, res: Response) {
  try {
    const { name, email, role } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }

    const updatedData: any = {
      adminName: name,
      adminEmail: email,
      adminRole: role,
    };

    // Handle admin photo upload
    const files = req.files as { photo?: Express.Multer.File[] };
    const photoFile = files?.photo?.[0];

    if (photoFile) {
      if (settings.adminPhoto && settings.adminPhoto.includes("res.cloudinary.com")) {
        const oldId = settings.adminPhoto.split("/").pop()?.split(".")[0];
        if (oldId) {
          await cloudinary.uploader.destroy(`settings/admin/${oldId}`);
        }
      }

      const photoUpload = await uploadToCloudinary(photoFile, "settings/admin");
      updatedData.adminPhoto = photoUpload.secure_url;
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      updatedData,
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: "Paramètres admin mis à jour avec succès",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour des paramètres admin" });
  }
}
