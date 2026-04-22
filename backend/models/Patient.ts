import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  cin: { type: String, required: true },
  sexe: { type: String, enum: ["Homme", "Femme", "Autre"], required: true },
  telephone: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String },
  adresse: { type: String },
  maladies: { type: String },
  allergies: { type: String },
  medicaments: { type: String },
  antecedents: { type: String },
  hygiene: { type: String, enum: ["Bonne", "Moyenne", "Faible"] },
  tabac: { type: String, enum: ["Oui", "Non"] },
  sucre: { type: String, enum: ["Faible", "Modérée", "Élevée"] },
  motif: { type: String },
  groupeSanguin: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  contactUrgence: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  visits: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
}, { timestamps: true });

export default mongoose.model("Patient", PatientSchema);
