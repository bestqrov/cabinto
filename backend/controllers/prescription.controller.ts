import type { Request, Response } from "express";
import mongoose from "mongoose";
import Prescription from "../models/Prescription";

export async function createPrescription(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "غير مصرح لك" });

    const { patient, praticien, medicines, date } = req.body;

    if (!patient || !praticien || !medicines) {
      return res.status(400).json({
        message: "معرّف المريض والطبيب وقائمة الأدوية مطلوبة",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(patient)) {
      return res.status(400).json({ message: "معرّف المريض غير صالح" });
    }

    if (!mongoose.Types.ObjectId.isValid(praticien)) {
      return res.status(400).json({ message: "معرّف الطبيب غير صالح" });
    }

    const prescription = await Prescription.create({
      patient,
      praticien,
      medicines,
      date: date || new Date(),
    });

    return res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "حدث خطأ أثناء إنشاء الوصفة" });
  }
}

export async function getAllPrescriptions(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "غير مصرح لك" });

    const prescriptions = await Prescription.find()
      .populate("patient", "name phone")
      .populate("praticien", "name email role")
      .sort({ createdAt: -1 });

    if (!prescriptions || prescriptions.length === 0) {
      return res.status(404).json({ message: "لا توجد وصفات" });
    }

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "حدث خطأ أثناء جلب الوصفات" });
  }
}

export async function getPrescriptionById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const prescription = await Prescription.findById(id)
      .populate("patient", "name phone")
      .populate("praticien", "name email role");

    if (!prescription) {
      return res.status(404).json({ message: "الوصفة غير موجودة" });
    }

    return res.status(200).json(prescription);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "حدث خطأ أثناء جلب الوصفة" });
  }
}

export async function updatePrescription(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const updates = req.body;

    const updated = await Prescription.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "الوصفة غير موجودة" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: " حدث خطأ أثناء التعديل الوصفة" });
  }
}

export async function deletePrescription(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const deleted = await Prescription.findOneAndDelete({ _id: id });

    if (!deleted) {
      return res.status(404).json({ message: "الوصفة غير موجودة" });
    }

    return res.status(200).json({ success: "تم حذف الوصفة بنجاح" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "حدث خطأ أثناء الحذف الوصفة" });
  }
}
