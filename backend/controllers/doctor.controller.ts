import type { Request, Response } from "express";
import User from "../models/User";
import Patient from "../models/Patient";
import Appointment from "../models/Appointment";
import FeuilleDeSoins from "../models/FeuilleSoin";
import Personnel from "../models/Personnel";
import mongoose from "mongoose";

export async function getDoctorDashboard(req: Request, res: Response) {
  try {
    const doctor = req.user;
    if (!doctor) return res.status(401).json({ error: "غير مصرح بك" });

    // Fetch patients belonging to this doctor
    const patients = await Patient.find({ userId: doctor._id }).sort({ createdAt: -1 });
    const patientIds = patients.map((p: any) => p._id);

    // Stats
    const patientsCount = patients.length;
    const careSheetsCount = await FeuilleDeSoins.countDocuments({ patientId: { $in: patientIds } });

    // Appointments today for this doctor's patients OR matching dentist field
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointmentsRaw = await Appointment.find({ date: { $gte: start, $lte: end } }).populate("patient");

    const appointmentsToday = appointmentsRaw.filter((app: any) => {
      if (app.patient && app.patient.userId) {
        if (String(app.patient.userId) === String(doctor._id)) return true;
      }
      if (app.praticien) {
        if (String(app.praticien) === String(doctor.fullname)) return true;
        if (String(app.praticien) === String(doctor._id)) return true;
      }
      return false;
    });

    // Recent patients (limit 5)
    const recentPatients = patients.slice(0, 5);

    // Recent care sheets for the doctor's patients
    const recentCareSheets = await FeuilleDeSoins.find({ patientId: { $in: patientIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patientId", "nom prenom");

    // try to get personnel record to include sexe
    const personnel = await Personnel.findOne({ userId: doctor._id }).select("sexe");

    // If doctor has a personnel record, ensure they are approved by admin
    const personnelFull = await Personnel.findOne({ userId: doctor._id }).select("approved");
    if (personnelFull && !personnelFull.approved) {
      return res.status(403).json({ error: "حساب الطبيب غير مفوّض من قبل المشرف" });
    }

    res.json({
      doctor: {
        _id: doctor._id,
        fullname: doctor.fullname,
        avatar: doctor.avatar,
        specialization: doctor.specialization,
        email: doctor.email,
        sexe: personnel?.sexe || null,
      },
      stats: {
        patientsCount,
        careSheetsCount,
      },
      appointmentsToday,
      recentPatients,
      recentCareSheets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
}
