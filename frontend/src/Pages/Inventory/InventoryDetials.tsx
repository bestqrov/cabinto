import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import { FaBoxes } from "react-icons/fa";

export default function InventoryDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [item, setItem] = useState<any>(null);

  async function fetchDetails() {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    const data = await res.json();
    setItem(data);
  }

  useEffect(() => {
    fetchDetails();
  }, []);

  if (!item) return <p className="text-center mt-10">جاري التحميل...</p>;

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <FaBoxes className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Détails Stock</h1>
              <p className="text-sm text-gray-500">Informations de l'article</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">{item.name}</h1>

        <p className="text-gray-700 mb-2">الكمية: {item.qty}</p>

        <p className="text-gray-700 mb-2">الحد الأدنى: {item.threshold}</p>

        {item.supplier && (
          <p className="text-gray-700 mb-2">المورد: {item.supplier.name}</p>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}
