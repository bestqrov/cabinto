import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

interface WhatsAppMessage {
  to: string; // Phone number in international format (e.g., 212612345678)
  message: string;
}

/**
 * Send a text message via WhatsApp Business API
 */
export async function sendWhatsAppMessage({ to, message }: WhatsAppMessage) {
  try {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      throw new Error("WhatsApp API credentials not configured");
    }

    // Ensure phone number is in correct format (no + or spaces)
    const cleanPhoneNumber = to.replace(/[\s+\-\(\)]/g, "");

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ WhatsApp message sent:", response.data);
    return {
      success: true,
      messageId: response.data.messages[0].id,
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ WhatsApp sending failed:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

/**
 * Send payment reminder via WhatsApp
 */
export async function sendPaymentReminder(
  whatsappNumber: string,
  patientName: string,
  amount: number,
  dueDate?: string
) {
  const message = `
🏥 *Cabinet Médical - Rappel de Paiement*

Bonjour ${patientName},

Nous vous rappelons qu'un paiement de *${amount} MAD* est en attente.
${dueDate ? `\nDate d'échéance: ${dueDate}` : ""}

Pour toute question, n'hésitez pas à nous contacter.

Merci de votre confiance!
  `.trim();

  return sendWhatsAppMessage({
    to: whatsappNumber,
    message,
  });
}

/**
 * Send appointment reminder via WhatsApp
 */
export async function sendAppointmentReminder(
  whatsappNumber: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string
) {
  const message = `
🏥 *Cabinet Médical - Rappel de Rendez-vous*

Bonjour ${patientName},

Nous vous rappelons votre rendez-vous:
📅 Date: ${appointmentDate}
⏰ Heure: ${appointmentTime}

Merci de confirmer votre présence.
En cas d'empêchement, merci de nous prévenir 24h à l'avance.

À bientôt!
  `.trim();

  return sendWhatsAppMessage({
    to: whatsappNumber,
    message,
  });
}

/**
 * Send treatment confirmation via WhatsApp
 */
export async function sendTreatmentConfirmation(
  whatsappNumber: string,
  patientName: string,
  treatment: string,
  cost: number
) {
  const message = `
🏥 *Cabinet Médical - Confirmation de Traitement*

Bonjour ${patientName},

Votre traitement a été enregistré avec succès:
🩺 Traitement: ${treatment}
💰 Coût: ${cost} MAD

Vos documents sont disponibles dans votre dossier médical.

Prenez soin de votre santé!
  `.trim();

  return sendWhatsAppMessage({
    to: whatsappNumber,
    message,
  });
}
