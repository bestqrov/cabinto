import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaFileInvoiceDollar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaBars,
  FaTimes,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaPrescriptionBottle,
  FaBoxes,
  FaTruck,
  FaCog,
  FaSearch,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useSettings } from "../../contexts/SettingsContext";

interface Facture {
  _id: string;
  numeroFacture: string;
  patientId: {
    _id: string;
    nom: string;
    prenom: string;
    telephone: string;
  };
  dateFacture: string;
  totalTTC: number;
  montantVerse: number;
  resteAPayer: number;
  modePaiement: string;
}

export default function FacturesList() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      const res = await fetch("${API_URL}/factures");
      const data = await res.json();

      if (data.success) {
        setFactures(data.data);
      } else {
        toast.error("Erreur lors du chargement");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/factures/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Facture supprimée");
        fetchFactures();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const handleDownloadPDF = (id: string, numeroFacture: string) => {
    window.open(`${API_URL}/factures/${id}/pdf`, "_blank");
    toast.success(`Téléchargement de ${numeroFacture}`);
  };

  const getStatutBadge = (facture: Facture) => {
    if (facture.resteAPayer === 0) {
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
          Payé
        </span>
      );
    } else if (facture.montantVerse === 0) {
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
          Impayé
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
          Partiel
        </span>
      );
    }
  };

  const filteredFactures = factures.filter(
    (facture) =>
      facture.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.patientId.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.patientId.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { icon: <MdDashboard className="text-lg" />, title: "Dashboard", link: "/dashboard", color: "text-blue-500" },
    { icon: <FaUsers className="text-lg" />, title: "Patients", link: "/patients", color: "text-green-500" },
    { icon: <FaCalendarAlt className="text-lg" />, title: "Rendez-vous", link: "/appointments", color: "text-purple-500" },
    { icon: <FaFileAlt className="text-lg" />, title: "Feuilles de Soin", link: "/feuilles", color: "text-pink-500" },
    { icon: <FaFileInvoiceDollar className="text-lg" />, title: "Factures", link: "/factures", color: "text-blue-500" },
    { icon: <FaPrescriptionBottle className="text-lg" />, title: "Ordonnances", link: "/ordonnances", color: "text-rose-500" },
    { icon: <FaBoxes className="text-lg" />, title: "Inventaire", link: "/inventory", color: "text-red-500" },
    { icon: <FaTruck className="text-lg" />, title: "Fournisseurs", link: "/suppliers", color: "text-indigo-500" },
  ];

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                {settings.logo ? (
                  <img src={settings.logo} alt="Cabinet Logo" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                )}
                <span className="font-bold text-lg">{settings.name || "Dental Clinic"}</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.link)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 group"
            >
              <span className={item.color}>{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium group-hover:text-white">
                  {item.title}
                </span>
              )}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <FaCog className="text-lg" />
              <span className="text-sm font-medium">Paramètres</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
                <FaFileInvoiceDollar className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Factures Dentaires</h1>
                <p className="text-sm text-gray-500">
                  Gestion complète des factures du cabinet
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/factures/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <FaPlus />
              Nouvelle Facture
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredFactures.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileInvoiceDollar className="mx-auto text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? "Aucune facture trouvée" : "Aucune facture enregistrée"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => navigate("/factures/create")}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Créer la première facture
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          N° Facture
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Patient</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Total TTC</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Versé</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Reste</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Statut</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredFactures.map((facture) => (
                        <tr key={facture._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-blue-600">
                              {facture.numeroFacture}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                {facture.patientId.nom[0]}
                                {facture.patientId.prenom[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {facture.patientId.nom} {facture.patientId.prenom}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {facture.patientId.telephone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(facture.dateFacture).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-800">
                            {facture.totalTTC.toFixed(2)} DH
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-green-600">
                            {facture.montantVerse.toFixed(2)} DH
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-red-600">
                            {facture.resteAPayer.toFixed(2)} DH
                          </td>
                          <td className="px-6 py-4 text-center">
                            {getStatutBadge(facture)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => navigate(`/factures/view/${facture._id}`)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Voir"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(facture._id, facture.numeroFacture)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Télécharger PDF"
                              >
                                <FaDownload />
                              </button>
                              <button
                                onClick={() => navigate(`/factures/edit/${facture._id}`)}
                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(facture._id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Stats Summary */}
            {!loading && filteredFactures.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Factures</p>
                  <p className="text-3xl font-bold text-blue-600">{filteredFactures.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Payées</p>
                  <p className="text-3xl font-bold text-green-600">
                    {filteredFactures.filter((f) => f.resteAPayer === 0).length}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Partielles</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {
                      filteredFactures.filter(
                        (f) => f.montantVerse > 0 && f.resteAPayer > 0
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Impayées</p>
                  <p className="text-3xl font-bold text-red-600">
                    {filteredFactures.filter((f) => f.montantVerse === 0).length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
