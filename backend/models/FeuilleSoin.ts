import { Schema, model, Types } from "mongoose";

const ActeSchema = new Schema(
  {
    date: { type: Date, required: true },
    procedure: { type: String, required: true },
    zone: { type: String },
    code: { type: String },
    quantite: { type: Number, default: 1 },
    prixUnitaire: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  { _id: false }
);

const VersionSchema = new Schema(
  {
    version: Number,
    date: Date,
    modifiePar: String
  },
  { _id: false }
);

const FeuilleDeSoinsSchema = new Schema(
  {
    // 🔗 Liaison directe avec dossier patient
    patientId: {
      type: Types.ObjectId,
      ref: "Patient",
      required: true
    },

    // 🦷 Actes dentaires
    actes: [ActeSchema],

    // 🩺 Résumé médical
    diagnostic: String,
    traitementEffectue: String,
    observations: String,

    // 💰 Facturation
    facturation: {
      montantTotal: { type: Number, required: true },
      partPatient: { type: Number, required: true },
      partAssurance: { type: Number, required: true },
      modePaiement: {
        type: String,
        enum: ["Espèces", "Carte", "Virement"],
        default: "Espèces"
      },
      statutPaiement: {
        type: String,
        enum: ["Payé", "Partiel", "En attente"],
        default: "En attente"
      }
    },

    // ✍️ Signature électronique
    signature: {
      nomPraticien: String,
      signatureImage: String, // base64 ou URL
      dateSignature: Date
    },

    // 📤 Envoi automatique
    envoiPatient: {
      type: Boolean,
      default: true
    },

    // 🔔 Rappel paiement
    rappelPaiement: {
      type: Boolean,
      default: false
    },

    // 🗂 Archivage légal
    archive: {
      type: Boolean,
      default: false
    },

    // 🕒 Historique & versioning
    versions: [VersionSchema],

    // 🏥 Export assurance
    exportAssurance: {
      cnss: { type: Boolean, default: false },
      cnops: { type: Boolean, default: false },
      exportDate: Date,
      fichierUrl: String
    }
  },
  {
    timestamps: true
  }
);

export const FeuilleDeSoins = model(
  "FeuilleDeSoins",
  FeuilleDeSoinsSchema,
  "feuilles_de_soins"
);

export default FeuilleDeSoins;
