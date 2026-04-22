import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import { FaPrescriptionBottle } from "react-icons/fa";

export default function PrescriptionDetails() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState<any>(null);
  const token = localStorage.getItem("token");

  async function fetchData() {
    const res = await fetch(`${API_URL}/prescription/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) setPrescription(await res.json());
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (!prescription)
    return (
      <div dir="ltr" className="flex h-screen bg-gray-100">
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white shadow-md px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                <FaPrescriptionBottle className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Détails Ordonnance</h1>
                <p className="text-sm text-gray-500">Informations de l'ordonnance</p>
              </div>
            </div>
          </header>

          {/* Content - Scrollable */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-2xl mx-auto">
        <p className="text-center mt-10">جاري التحميل...</p>
            </div>
          </main>
        </div>
      </div>
    );

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
              <FaPrescriptionBottle className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Détails Ordonnance</h1>
              <p className="text-sm text-gray-500">Informations de l'ordonnance</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">تفاصيل الوصفة</h1>

        <p>👤 المريض: {prescription.patient?.name}</p>
        <p>🩺 الطبيب: {prescription.praticien?.name}</p>
        <p>📅 التاريخ: {prescription.date?.slice(0, 10)}</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">الأدوية:</h2>

        {prescription.medicines.map((m: any, idx: number) => (
          <div key={idx} className="border p-3 rounded mb-2">
            <p>💊 اسم: {m.name}</p>
            <p>📦 الجرعة: {m.dosage}</p>
            <p>📘 طريقة الاستخدام: {m.directions}</p>
          </div>
        ))}          </div>
        </main>      </div>
    </div>
  );
}
