import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { useSettings } from "../../contexts/SettingsContext";
import { FaFileInvoiceDollar } from "react-icons/fa";

interface Invoice {
  _id: string;
  patient: { name: string };
  total: number;
  status: string;
  issuedAt: string;
}

export default function Invoices() {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchInvoices = async () => {
    try {
      const res = await fetch("${API_URL}/invoice", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Erreur lors du chargement des factures");
      setInvoices(data);
    } catch {
      toast.error("Erreur de connexion au serveur");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  if (loading) return <p className="text-center p-10">Chargement...</p>;

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
              <FaFileInvoiceDollar className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Factures</h1>
              <p className="text-sm text-gray-500">Gestion des factures</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Factures</h1>

        {invoices.length === 0 ? (
          <p className="text-gray-500">Aucune facture</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {invoices.map((inv) => (
              <div
                key={inv._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-2xl border transition"
              >
                <h2 className="text-xl font-semibold text-blue-600 mb-2">
                  {inv.patient?.name}
                </h2>
                <p className="text-gray-600">
                  Total: {inv.total?.toLocaleString()} DH
                </p>
                <p className="text-gray-600">État: {inv.status}</p>
                <p className="text-gray-600">
                  Date: {new Date(inv.issuedAt).toLocaleString("fr-FR")}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/invoices/${inv._id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}
