import mongoose from "mongoose";

interface IPrescription {
  patient: mongoose.Schema.Types.ObjectId;
  praticien: mongoose.Schema.Types.ObjectId;
  medicines: { name: string; dosage: string; directions: string }[];
  date: Date;
}

const prescriptionSchema = new mongoose.Schema<IPrescription>(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    praticien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicines: [
      {
        name: String,
        dosage: String,
        directions: String,
      },
    ],
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
