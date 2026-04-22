import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    // Cabinet Settings
    name: { type: String, default: "Cabinet Médical" },
    specialite: { type: String, default: "Médecine Générale" },
    targetLine: { type: String, default: "Votre santé, notre priorité" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    address: { type: String, default: "" },
    country: { type: String, default: "Maroc" },
    if: { type: String, default: "" },
    ice: { type: String, default: "" },
    cnss: { type: String, default: "" },
    logo: { type: String, default: "" },
    
    // Admin Settings
    adminName: { type: String, default: "" },
    adminEmail: { type: String, default: "" },
    adminRole: { type: String, default: "Admin" },
    adminPhoto: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", SettingsSchema);
