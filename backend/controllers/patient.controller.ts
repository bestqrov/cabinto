import type { Request, Response } from "express";
import Patient from "../models/Patient";
import mongoose from "mongoose";

// Créer un patient
export async function createPatient(req: Request, res: Response) {
  try {
    const {
      nom, prenom, dateNaissance, cin, sexe, telephone, whatsapp,
      email, adresse, maladies, allergies, medicaments,
      antecedentsDentaires, hygiene, tabac, sucre, motif,
      groupeSanguin, contactUrgence, dentiste,
    } = req.body;

    const patient = new Patient({
      nom, prenom, dateNaissance, cin, sexe, telephone, whatsapp,
      email, adresse, maladies, allergies, medicaments,
      antecedentsDentaires, hygiene, tabac, sucre, motif,
      groupeSanguin, contactUrgence, dentiste,
    });
    await patient.save();
    res.status(201).json(patient);
  } catch (err: any) {
    // Handle duplicate key errors (E11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      
      const fieldNames: any = {
        telephone: "Téléphone",
        email: "Email",
        cin: "CIN",
        nom: "Nom",
        prenom: "Prénom"
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

// Récupérer tous les patients
export async function getAllPatients(req: Request, res: Response) {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Récupérer un patient par ID
export async function getPatientById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID patient invalide" });
    }

    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ error: "Patient non trouvé" });
    }
    
    res.json(patient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Mettre à jour un patient
export async function updatePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID patient invalide" });
    }

    const {
      nom, prenom, dateNaissance, cin, sexe, telephone, whatsapp,
      email, adresse, maladies, allergies, medicaments,
      antecedentsDentaires, hygiene, tabac, sucre, motif,
      groupeSanguin, contactUrgence,
    } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      id,
      {
        nom, prenom, dateNaissance, cin, sexe, telephone, whatsapp,
        email, adresse, maladies, allergies, medicaments,
        antecedentsDentaires, hygiene, tabac, sucre, motif,
        groupeSanguin, contactUrgence,
      },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient non trouvé" });
    }

    res.json(patient);
  } catch (err: any) {
    // Handle duplicate key errors (E11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      
      const fieldNames: any = {
        telephone: "Téléphone",
        email: "Email",
        cin: "CIN",
        nom: "Nom",
        prenom: "Prénom"
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

// Supprimer un patient
export async function deletePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID patient invalide" });
    }

    const patient = await Patient.findByIdAndDelete(id);
    
    if (!patient) {
      return res.status(404).json({ error: "Patient non trouvé" });
    }
    
    res.json({ message: "Patient supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
