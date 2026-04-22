import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { FaCalendarAlt } from "react-icons/fa";

interface Appointment {
  _id: string;
  patient: { name: string; phone: string; _id: string };
  dentist: { name: string; _id: string };
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  frequency: string;
}

export default function AppointmentsDetails() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const token = localStorage.getItem("token");

  const fetchAppointment = async () => {
    try {
      const res = await fetch(`${API_URL}/appointment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message || "خطأ أثناء الجلب");

      setAppointment(data);
    } catch {
      toast.error("خطأ أثناء الاتصال بالسيرفر");
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, []);

  if (!appointment) {
    return <p className="text-center p-10">جاري التحميل...</p>;
  }

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <FaCalendarAlt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Détails Rendez-vous</h1>
              <p className="text-sm text-gray-500">Informations du rendez-vous</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-2xl mx-auto" dir="ltr">
            <div className="bg-white shadow-xl rounded-2xl p-10">
              <h1 className="text-3xl font-bold text-blue-700 mb-6">
                تفاصيل الموعد
              </h1>

              <div className="space-y-4 text-lg">
          <p>
            <span className="font-bold">المريض:</span>{" "}
            {appointment.patient.name}
          </p>

          <p>
            <span className="font-bold">رقم الهاتف:</span>{" "}
            {appointment.patient.phone}
          </p>

          <p>
            <span className="font-bold">الطبيب:</span>{" "}
            {appointment.dentist.name}
          </p>

          <p>
            <span className="font-bold">الوقت:</span>{" "}
            {new Date(appointment.date).toLocaleString("fr-FR")}
          </p>

          <p>
            <span className="font-bold">التشخيص:</span>{" "}
            {appointment.diagnosis}
          </p>

          <p>
            <span className="font-bold">العلاج:</span> {appointment.treatment}
          </p>

          <p>
            <span className="font-bold">التكرار:</span>{" "}
            {appointment.frequency}
          </p>

          <p className="font-bold">ملاحظات:</p>
          <div className="p-4 bg-gray-100 rounded-xl border">
            {appointment.notes || "لا يوجد"}
          </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
