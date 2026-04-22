import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import { FaBoxes } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  async function fetchInventory() {
    try {
      const res = await fetch("${API_URL}/inventory", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (data.error || data.message) {
        toast(data.error || data.message);
      } else {
        setItems(data);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

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
              <h1 className="text-2xl font-bold text-gray-800">Stock</h1>
              <p className="text-sm text-gray-500">Inventaire médical</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">📦 Liste d'inventaire</h1>

        {/* IF EMPTY */}
        {items.length === 0 && (
          <p className="text-center text-gray-600 mt-10">
            Aucun article dans l'inventaire
          </p>
        )}

        <div className="space-y-4">
          {items.map((item: any) => (
            <Link
              to={`/inventory/${item._id}`}
              key={item._id}
              className="block border p-4 rounded-lg shadow-sm hover:shadow-md transition bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <p className="text-gray-700">Quantité: {item.qty}</p>
                  <p className="text-gray-700">Seuil minimum: {item.threshold}</p>

                  {item.supplier && (
                    <p className="text-blue-600 mt-1">
                      Fournisseur: {item.supplier.name}
                    </p>
                  )}
                </div>

                {/* Indicator for low quantity */}
                {item.qty <= item.threshold && (
                  <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                    Faible!
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
