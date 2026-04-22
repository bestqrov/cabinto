import type { Request, Response } from "express";
import Personnel from "../models/Personnel";
import User from "../models/User";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Créer un personnel
export async function createPersonnel(req: Request, res: Response) {
  try {
    // Only admins may create a Dentiste directly
    if (req.body.poste === 'Dentiste' && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Seul un administrateur peut créer un Dentiste' });
    }

    // Enforce doctor limit
    if (req.body.poste === 'Dentiste') {
      const count = await Personnel.countDocuments({ poste: 'Dentiste' });
      if (count >= 10) return res.status(400).json({ error: 'Limite maximale de 10 médecins atteinte' });
    }

    const {
      nom, prenom, cin, dateNaissance, sexe, telephone, email,
      adresse, poste, specialite, dateEmbauche, salaire,
      horaireTravail, numeroCNSS, numeroCarteProf, photoProfile, notes,
    } = req.body;

    const personnel = new Personnel({
      nom, prenom, cin, dateNaissance, sexe, telephone, email,
      adresse, poste, specialite, dateEmbauche, salaire,
      horaireTravail, numeroCNSS, numeroCarteProf, photoProfile, notes,
    });
    await personnel.save();
    res.status(201).json(personnel);
  } catch (err: any) {
    // Handle duplicate key errors (E11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      
      const fieldNames: any = {
        cin: "CIN",
        email: "Email",
        telephone: "Téléphone"
      };
      
      const fieldLabel = fieldNames[field] || field;
      return res.status(400).json({ 
        error: `${fieldLabel} "${value}" est déjà utilisé`,
        field: field
      });
    }
    
    // Handle validation errors
    if (err.name === "ValidationError") {
      const errors = Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      }));
      return res.status(400).json({ 
        error: "Erreur de validation", 
        details: errors,
        message: err.message 
      });
    }
    
    res.status(400).json({ error: err.message });
  }
}

// Récupérer tous les personnels
export async function getAllPersonnel(req: Request, res: Response) {
  try {
    const personnel = await Personnel.find().sort({ createdAt: -1 });
    res.json(personnel);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Récupérer un personnel par ID
export async function getPersonnelById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID personnel invalide" });
    }

    const personnel = await Personnel.findById(id);
    
    if (!personnel) {
      return res.status(404).json({ error: "Personnel non trouvé" });
    }
    
    res.json(personnel);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Mettre à jour un personnel
export async function updatePersonnel(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID personnel invalide" });
    }

    // Prevent non-admins from changing approval/permissions/poste/userId
    const safeBody: any = { ...req.body };
    const actorRole = (req as any).user?.role;
    if (actorRole !== 'Admin') {
      delete safeBody.approved;
      delete safeBody.permissions;
      delete safeBody.poste;
      delete safeBody.userId;
    }

    // If updating to a Dentiste, enforce limit (only admin allowed already)
    if (safeBody.poste === 'Dentiste') {
      const count = await Personnel.countDocuments({ poste: 'Dentiste' });
      if (count >= 10) return res.status(400).json({ error: 'Limite maximale de 10 médecins atteinte' });
    }

    const personnel = await Personnel.findByIdAndUpdate(id, safeBody, { new: true });
    
    if (!personnel) {
      return res.status(404).json({ error: "Personnel non trouvé" });
    }
    
    res.json(personnel);
  } catch (err: any) {
    // Handle duplicate key errors (E11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      
      const fieldNames: any = {
        cin: "CIN",
        email: "Email",
        telephone: "Téléphone"
      };
      
      const fieldLabel = fieldNames[field] || field;
      return res.status(400).json({ 
        error: `${fieldLabel} "${value}" est déjà utilisé`,
        field: field
      });
    }
    
    res.status(400).json({ error: err.message });
  }
}

// Supprimer un personnel
export async function deletePersonnel(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID personnel invalide" });
    }

    const personnel = await Personnel.findByIdAndDelete(id);
    
    if (!personnel) {
      return res.status(404).json({ error: "Personnel non trouvé" });
    }
    
    res.json({ message: "Personnel supprimé avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Create Personnel along with a User account (useful for creating doctors)
export async function createPersonnelWithUser(req: Request, res: Response) {
  try {
    const {
      nom,
      prenom,
      cin,
      dateNaissance,
      sexe,
      telephone,
      email,
      adresse,
      poste,
      specialite,
      dateEmbauche,
      salaire,
      horaireTravail,
      numeroCNSS,
      numeroCarteProf,
      photoProfile,
      notes,
      password,
    } = req.body;

    if (!nom || !prenom || !cin || !dateEmbauche || !poste || !telephone || !email || !password) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    // If creating a Dentiste, enforce admin-only creation and doctor limit
    if (poste === 'Dentiste') {
      if ((req as any).user?.role !== 'Admin') {
        return res.status(403).json({ error: 'Seul un administrateur peut créer un Dentiste' });
      }
      const count = await Personnel.countDocuments({ poste: 'Dentiste' });
      if (count >= 10) return res.status(400).json({ error: 'Limite maximale de 10 médecins atteinte' });
    }

    // Check existing user/email
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // Create hashed password
    const hashed = await bcrypt.hash(password, 12);

    // Map poste to role
    const role = poste === "Dentiste" ? "Dentist" : poste === "Secrétaire" ? "Receptionist" : "user";

    const newUser = await User.create({
      fullname: `${prenom} ${nom}`,
      email,
      password: hashed,
      role,
      avatar: photoProfile || undefined,
      specialization: specialite || undefined,
    });

    try {
      const personnel = new Personnel({
        nom,
        prenom,
        cin,
        dateNaissance,
        sexe,
        telephone,
        email,
        adresse,
        poste,
        specialite,
        dateEmbauche,
        salaire,
        horaireTravail,
        numeroCNSS,
        numeroCarteProf,
        photoProfile,
        notes,
        userId: newUser._id,
      });

      await personnel.save();

      return res.status(201).json({ success: "Personnel et compte créés", personnel });
    } catch (err: any) {
      // rollback created user if personnel creation failed
      await User.findByIdAndDelete(newUser._id);
      throw err;
    }
  } catch (err: any) {
    console.error(err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(400).json({ error: `${field || 'Champ'} en doublon` });
    }
    return res.status(500).json({ error: err.message || "Erreur lors de la création" });
  }
}
