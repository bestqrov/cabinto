import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: false, // Not required for new patients
  },
  patientName: {
    type: String, // Store new patient name if not in database
  },
  praticien: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  heure: {
    type: String,
    required: true,
  },
  motif: {
    type: String,
    required: true,
  },
  gsm: {
    type: String,
  },
  whatsapp: {
    type: String,
  },
  statut: {
    type: String,
    enum: ["Prévu", "Terminé", "Annulé"],
    default: "Prévu",
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model("Appointment", AppointmentSchema);
