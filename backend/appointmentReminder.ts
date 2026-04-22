import Appointment from "./models/Appointment";
import Notification from "./models/Notification";

export async function checkUpcomingAppointments() {
  const now = new Date();

  // دقيقة واحدة قبل الآن
  const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // نافذة دقيقة

  const appointments = await Appointment.find({
    createdAt: {
      $gte: twoMinutesAgo,
      $lte: oneMinuteAgo,
    },
    status: "قيد الأنتظار",
  })
    .populate("praticien", "_id name")
    .populate("patient", "name");

  for (const app of appointments) {
    const message = `تذكير: مضت دقيقة واحدة على إنشاء موعد مع ${
      app.patient.name
    } الساعة ${app.createdAt.toLocaleTimeString()}`;

    await Notification.create({
      user: "693b44314b27e689a345312f", //  انا قمت ب ذلك فقط ادمن من يحق له ان توصله اشعارات
      message,
      appointment: app._id,
    });
  }
}
