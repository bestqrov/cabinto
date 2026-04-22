import type { Request, Response } from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";

// Créer un rendez-vous
export async function createAppointment(req: Request, res: Response) {
  try {
    const { isNewPatient, patient, praticien, date, heure, motif, gsm, whatsapp, statut, notes, patientName } = req.body;

    let finalAppointment;
    if (isNewPatient && typeof patient === 'string') {
      finalAppointment = new Appointment({ praticien, date, heure, motif, gsm, whatsapp, statut, notes, patientName: patient });
    } else {
      finalAppointment = new Appointment({ patient, praticien, date, heure, motif, gsm, whatsapp, statut, notes, patientName });
    }

    await finalAppointment.save();
    res.status(201).json(finalAppointment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Récupérer tous les rendez-vous
export async function getAllAppointments(req: Request, res: Response) {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    
    // Populate only if patient is ObjectId
    const populatedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        if (apt.patient && mongoose.Types.ObjectId.isValid(apt.patient as string)) {
          return await apt.populate("patient", "nom prenom telephone email");
        }
        return apt;
      })
    );
    
    res.json(populatedAppointments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Récupérer un rendez-vous par ID
export async function getAppointmentById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID rendez-vous invalide" });
    }

    const appointment = await Appointment.findById(id)
      .populate("patient", "nom prenom telephone email");

    if (!appointment) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }

    res.json(appointment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Mettre à jour un rendez-vous
export async function updateAppointment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID rendez-vous invalide" });
    }

    const appointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true });

    if (!appointment) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }

    res.json(appointment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Supprimer un rendez-vous
export async function deleteAppointment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID rendez-vous invalide" });
    }

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }

    res.json({ message: "Rendez-vous supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAppointment(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "غير مصرح بك" });

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "معرف موعد غير صالح" });
    }

    const appointment = await Appointment.findOneAndDelete({ _id: id });

    if (!appointment) {
      return res.status(404).json({ message: "الموعد غير موجود" });
    }

    return res.status(200).json({ success: "تم حذف الموعد بنجاح" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "حدث خطأ اثناء حذف الموعد" });
  }
}
