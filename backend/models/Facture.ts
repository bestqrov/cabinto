import mongoose, { Schema, Document } from "mongoose";

interface IPrestation {
  procedure: string;
  zone?: string;
  prixUnitaire: number;
  quantite: number;
  total: number;
}

export interface IFacture extends Document {
  patientId: mongoose.Types.ObjectId;
  dateFacture: Date;
  numeroFacture: string;
  prestations: IPrestation[];
  totalHT: number;
  TVA: number;
  totalTTC: number;
  montantVerse: number;
  resteAPayer: number;
  modePaiement: string;
  numeroCheque?: string;
  dateCheque?: Date;
  fichierTracabilite?: string;
  notes?: string;
  createdAt: Date;
}

const PrestationSchema = new Schema({
  procedure: {
    type: String,
    required: true,
  },
  zone: {
    type: String,
  },
  prixUnitaire: {
    type: Number,
    required: true,
    min: 0,
  },
  quantite: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  total: {
    type: Number,
    required: true,
  },
});

const FactureSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    dateFacture: {
      type: Date,
      default: Date.now,
    },
    numeroFacture: {
      type: String,
      unique: true,
      required: true,
    },
    prestations: {
      type: [PrestationSchema],
      required: true,
      validate: {
        validator: function (v: IPrestation[]) {
          return v && v.length > 0;
        },
        message: "Au moins une prestation est requise",
      },
    },
    totalHT: {
      type: Number,
      required: true,
      default: 0,
    },
    TVA: {
      type: Number,
      default: 0,
    },
    totalTTC: {
      type: Number,
      required: true,
      default: 0,
    },
    montantVerse: {
      type: Number,
      default: 0,
      min: 0,
    },
    resteAPayer: {
      type: Number,
      default: 0,
    },
    modePaiement: {
      type: String,
      enum: ["Espèces", "Carte", "Virement", "Chèque", "Non payé"],
      default: "Espèces",
    },
    numeroCheque: {
      type: String,
    },
    dateCheque: {
      type: Date,
    },
    fichierTracabilite: {
      type: String, // URL Cloudinary ou chemin fichier
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Calcul automatique avant sauvegarde
FactureSchema.pre("save", function (this: IFacture) {
  // Calculer le total de chaque prestation
  this.prestations.forEach((prestation) => {
    prestation.total = prestation.prixUnitaire * prestation.quantite;
  });

  // Calculer totalHT
  this.totalHT = this.prestations.reduce((sum, p) => sum + p.total, 0);

  // Calculer totalTTC
  this.totalTTC = this.totalHT + this.TVA;

  // Calculer resteAPayer
  this.resteAPayer = this.totalTTC - this.montantVerse;
});

export default mongoose.model<IFacture>("Facture", FactureSchema);
