import type { Request, Response } from "express";
import mongoose from "mongoose";
import FeuilleSoin from "../models/FeuilleSoin";
import Patient from "../models/Patient";
import { sendPaymentReminder } from "../libs/whatsapp";

// Créer une feuille de soin
export async function createFeuilleSoin(req: Request, res: Response) {
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

    const {
      patientId: _pid, actes, diagnostic, traitementEffectue, observations,
      facturation, signature, envoiPatient, rappelPaiement, archive,
      versions, exportAssurance,
    } = req.body;

    const feuilleSoin = new FeuilleSoin({
      patientId, actes, diagnostic, traitementEffectue, observations,
      facturation, signature, envoiPatient, rappelPaiement, archive,
      versions, exportAssurance,
    });
    await feuilleSoin.save();

    if (rappelPaiement && patient.whatsapp) {
      try {
        await sendPaymentReminder(
          patient.whatsapp,
          `${patient.nom} ${patient.prenom}`,
          facturation?.montantTotal || 0
        );
      } catch {
        // Continue even if WhatsApp fails
      }
    }

    res.status(201).json({ 
      success: true, 
      data: feuilleSoin,
      message: "Feuille de soin créée avec succès" 
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

// Récupérer toutes les feuilles de soin
export async function getAllFeuilles(req: Request, res: Response) {
  try {
    const feuilles = await FeuilleSoin.find()
      .populate("patientId", "nom prenom telephone email")
      .sort({ dateSoin: -1 });

    res.json({ 
      success: true, 
      data: feuilles 
    });
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
}

// Récupérer une feuille de soin par ID
export async function getFeuilleById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID feuille de soin invalide" 
      });
    }

    const feuille = await FeuilleSoin.findById(id)
      .populate("patientId", "nom prenom telephone email cin dateNaissance");

    if (!feuille) {
      return res.status(404).json({ 
        success: false, 
        message: "Feuille de soin non trouvée" 
      });
    }

    res.json({ 
      success: true, 
      data: feuille 
    });
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
}

// Mettre à jour une feuille de soin
export async function updateFeuille(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID feuille de soin invalide" 
      });
    }

    const feuille = await FeuilleSoin.findById(id);
    if (!feuille) {
      return res.status(404).json({ 
        success: false, 
        message: "Feuille de soin non trouvée" 
      });
    }

    // Mettre à jour les champs
    Object.assign(feuille, req.body);
    await feuille.save(); // Déclenche le middleware de calcul

    res.json({ 
      success: true, 
      data: feuille,
      message: "Feuille de soin mise à jour avec succès" 
    });
  } catch (err: any) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
}

// Supprimer une feuille de soin
export async function deleteFeuille(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID feuille de soin invalide" 
      });
    }

    const feuille = await FeuilleSoin.findByIdAndDelete(id);

    if (!feuille) {
      return res.status(404).json({ 
        success: false, 
        message: "Feuille de soin non trouvée" 
      });
    }

    res.json({ 
      success: true, 
      message: "Feuille de soin supprimée avec succès" 
    });
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
}
