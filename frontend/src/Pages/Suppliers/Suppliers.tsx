import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import { FaTruck } from "react-icons/fa";

interface Supplier {
  _id: string;
  name: string;
  phone?: number;
  email: string;
  address: string;
  createdAt: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  async function fetchSuppliers() {
    try {
      const res = await fetch("${API_URL}/supplier", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Échec du chargement des fournisseurs");

      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      toast.error("Erreur lors du chargement des fournisseurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSupplier(id: string) {
    const yes = confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur?");
    if (!yes) return;

    try {
      const res = await fetch(`${API_URL}/supplier/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Échec de la suppression");

      setSuppliers((prev) => prev.filter((s) => s._id !== id));
      toast.success("Fournisseur supprimé avec succès");
    } catch (err) {
      toast.error("Erreur lors de la suppression du fournisseur");
    }
  }

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-bold">
        Chargement...
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
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <FaTruck className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Fournisseurs</h1>
              <p className="text-sm text-gray-500">Liste des fournisseurs</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Tous les fournisseurs
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div
              key={supplier._id}
              className="bg-white shadow-md rounded-xl p-5 border hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold text-gray-800">
                {supplier.name}
              </h2>

              <p className="text-gray-600 mt-2">
                <span className="font-semibold">📧 Email:</span>{" "}
                {supplier.email}
              </p>

              {supplier.phone && (
                <p className="text-gray-600">
                  <span className="font-semibold">☎ Téléphone:</span>{" "}
                  {supplier.phone}
                </p>
              )}

              <p className="text-gray-600">
                <span className="font-semibold">📍 Adresse:</span>{" "}
                {supplier.address}
              </p>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => navigate(`/suppliers/${supplier._id}`)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Détails
                </button>

                <button
                  onClick={() => deleteSupplier(supplier._id)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {suppliers.length === 0 && (
          <div className="text-center text-gray-600 text-lg mt-10">
            Aucun fournisseur pour le moment
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}
