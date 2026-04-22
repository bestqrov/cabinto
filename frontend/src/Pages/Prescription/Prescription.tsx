import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import { FaPrescriptionBottle } from "react-icons/fa";

export default function Prescription() {
  const [data, setData] = useState([]);
  const token = localStorage.getItem("token");

  async function fetchData() {
    const res = await fetch("${API_URL}/prescription", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    fetchData();
  }, []);

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
              <h1 className="text-2xl font-bold text-gray-800">Ordonnances</h1>
              <p className="text-sm text-gray-500">Liste des ordonnances</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">جميع الوصفات</h1>

        <div className="space-y-4">
          {data.map((p: any) => (
            <div
              key={p._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <p>👤 {p.patient?.name}</p>
                <p>🩺 {p.praticien?.name}</p>
                <p>📅 {p.date?.slice(0, 10)}</p>
              </div>

              <a
                href={`/prescription/${p._id}`}
                className="px-4 py-1 bg-blue-600 text-white rounded"
              >
                عرض التفاصيل
              </a>
            </div>
          ))}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
