import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connecDB } from "./libs/connectDB";
import userRouter from "./routes/user.route";
import supplierRouter from "./routes/supplier.route";
import prescriptionRouter from "./routes/prescription.route";
import patientRouter from "./routes/patient.route";
import medicalFileRouter from "./routes/medicalFile.route";
import invoiceRouter from "./routes/invoice.route";
import inventoryRouter from "./routes/inventory.route";
import appointmentRouter from "./routes/appointment.route";
import roleRouter from "./routes/role.route";
import feuilleSoinRouter from "./routes/feuilleSoin.route";
import ordonnanceRouter from "./routes/ordonnance.route";
import factureRouter from "./routes/facture.route";
import { checkUpcomingAppointments } from "./appointmentReminder";
import notificationRouter from "./routes/notification.routes";
import settingsRouter from "./routes/settings.route";
import personnelRouter from "./routes/personnel.route";
import whatsappRouter from "./routes/whatsapp.route";
import doctorRouter from "./routes/doctor.route";
import path from "path";

dotenv.config();
const app = express();

connecDB();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "محاولات كثيرة جداً، يرجى الانتظار 15 دقيقة" },
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : ["http://localhost:5173", "http://localhost:5000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Serve Static Files for Backend Assets if any
// ...

// API Routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", userRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/prescription", prescriptionRouter);
app.use("/api/patient", patientRouter);
app.use("/api/medicalFile", medicalFileRouter);
app.use("/api/invoice", invoiceRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/role", roleRouter);
app.use("/api/feuilles", feuilleSoinRouter);
app.use("/api/ordonnances", ordonnanceRouter);
app.use("/api/factures", factureRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/personnel", personnelRouter);
app.use("/api/whatsapp", whatsappRouter);
app.use("/api/doctor", doctorRouter);

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Catch-all route to serve the Frontend's index.html
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

setInterval(() => {
  console.log("Loading...");
  checkUpcomingAppointments().catch(console.error);
}, 60 * 1000);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
