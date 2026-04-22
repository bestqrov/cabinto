import type { Request, Response } from "express";
import mongoose from "mongoose";
import Ordonnance from "../models/Ordonnance";
import Patient from "../models/Patient";

// Créer une ordonnance
export async function createOrdonnance(req: Request, res: Response) {
  try {
    const { patientId } = req.body;

    // Vérifier que le patient existe
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID patient invalide" 
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: "Patient non trouvé" 
      });
    }

    const { dateOrdonnance, medicaments, instructionGenerale, signatureMedecin } = req.body;
    const ordonnance = new Ordonnance({ patientId, dateOrdonnance, medicaments, instructionGenerale, signatureMedecin });
    await ordonnance.save();

    res.status(201).json({ 
      success: true, 
      data: ordonnance,
      message: "Ordonnance créée avec succès" 
    });
  } catch (err: any) {
    console.error("Erreur création ordonnance:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
}

// Récupérer toutes les ordonnances
export async function getOrdonnances(req: Request, res: Response) {
  try {
    const ordonnances = await Ordonnance.find()
      .populate("patientId", "nom prenom telephone email cin dateNaissance")
      .sort({ dateOrdonnance: -1 });

    res.json({ 
      success: true, 
      data: ordonnances 
    });
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
}

// Récupérer une ordonnance par ID
export async function getOrdonnanceById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID ordonnance invalide" 
      });
    }

    const ordonnance = await Ordonnance.findById(id)
      .populate("patientId", "nom prenom telephone email cin dateNaissance adresse");

    if (!ordonnance) {
      return res.status(404).json({ 
        success: false, 
        message: "Ordonnance non trouvée" 
      });
    }

    res.json({ 
      success: true, 
      data: ordonnance 
    });
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
}

// Mettre à jour une ordonnance
export async function updateOrdonnance(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID ordonnance invalide" 
      });
    }

    const ordonnance = await Ordonnance.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );

    if (!ordonnance) {
      return res.status(404).json({ 
        success: false, 
        message: "Ordonnance non trouvée" 
      });
    }

    res.json({ 
      success: true, 
      data: ordonnance,
      message: "Ordonnance mise à jour avec succès" 
    });
  } catch (err: any) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
}

// Supprimer une ordonnance
export async function deleteOrdonnance(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID ordonnance invalide" 
      });
    }

    const ordonnance = await Ordonnance.findByIdAndDelete(id);

    if (!ordonnance) {
      return res.status(404).json({ 
        success: false, 
        message: "Ordonnance non trouvée" 
      });
    }

    res.json({ 
      success: true, 
      message: "Ordonnance supprimée avec succès" 
    });
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
}
