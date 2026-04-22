import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSettings } from "../../contexts/SettingsContext";
import { 
  FaFileAlt,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBars,
  FaTimes,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaPrescriptionBottle,
  FaBoxes,
  FaTruck,
  FaCog,
  FaEye,
  FaMoneyBillWave
} from "react-icons/fa";
import { MdDashboard } from 'react-icons/md';

interface Feuille {
  _id: string;
  patientId: {
    _id: string;
    nom: string;
    prenom: string;
    telephone: string;
  };
  dateSoin: string;
  montantTotal: number;
  montantRembourse: number;
  priseEnCharge: boolean;
  assurance?: string;
}

export default function FeuillesList() {
  const { settings } = useSettings();
  const [feuilles, setFeuilles] = useState<Feuille[]>([]);
  const [filteredFeuilles, setFilteredFeuilles] = useState<Feuille[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeuilles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = feuilles.filter(f =>
        `${f.patientId.nom} ${f.patientId.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.assurance?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFeuilles(filtered);
    } else {
      setFilteredFeuilles(feuilles);
    }
  }, [searchTerm, feuilles]);

  const fetchFeuilles = async () => {
    try {
      const res = await fetch("${API_URL}/feuilles");
      const data = await res.json();

      if (data.success) {
        setFeuilles(data.data);
        setFilteredFeuilles(data.data);
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette feuille de soin?")) return;

    try {
      const res = await fetch(`${API_URL}/feuilles/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Feuille de soin supprimée");
        fetchFeuilles();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const menuItems = [
    { icon: <MdDashboard className="text-lg" />, title: "Dashboard", link: "/dashboard", color: "text-blue-500" },
    { icon: <FaUsers className="text-lg" />, title: "Patients", link: "/patients", color: "text-green-500" },
    { icon: <FaCalendarAlt className="text-lg" />, title: "Rendez-vous", link: "/appointments", color: "text-purple-500" },
    { icon: <FaFileAlt className="text-lg" />, title: "Feuilles de Soin", link: "/feuilles", color: "text-pink-500" },
    { icon: <FaFileInvoiceDollar className="text-lg" />, title: "Factures", link: "/factures", color: "text-yellow-500" },
    { icon: <FaPrescriptionBottle className="text-lg" />, title: "Ordonnances", link: "/ordonnances", color: "text-rose-500" },
    { icon: <FaBoxes className="text-lg" />, title: "Inventaire", link: "/inventory", color: "text-red-500" },
    { icon: <FaTruck className="text-lg" />, title: "Fournisseurs", link: "/suppliers", color: "text-indigo-500" },
  ];

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
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
              {sidebarOpen && <span className="text-sm font-medium group-hover:text-white">{item.title}</span>}
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
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-md">
                <FaFileAlt className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Feuilles de Soin</h1>
                <p className="text-sm text-gray-500">Gestion des actes médicaux et remboursements</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/feuilles/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <FaPlus />
              Nouvelle Feuille
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-xl shadow-md p-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par patient ou assurance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
              </div>
            ) : filteredFeuilles.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune feuille de soin</h3>
                <p className="text-gray-500 mb-6">Commencez par créer une feuille de soin</p>
                <button
                  onClick={() => navigate("/feuilles/create")}
                  className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                >
                  Créer la première feuille
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  <span className="font-semibold">{filteredFeuilles.length}</span> feuille(s) trouvée(s)
                </div>
                
                {/* Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Patient</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Date Soin</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Montant Total</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Remboursement</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Assurance</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeuilles.map((feuille, index) => (
                          <tr
                            key={feuille._id}
                            className={`border-b border-gray-100 hover:bg-pink-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {feuille.patientId.nom.charAt(0)}{feuille.patientId.prenom.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{feuille.patientId.nom} {feuille.patientId.prenom}</p>
                                  <p className="text-sm text-gray-500">{feuille.patientId.telephone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {new Date(feuille.dateSoin).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-green-600">{feuille.montantTotal.toFixed(2)} MAD</span>
                            </td>
                            <td className="px-6 py-4">
                              {feuille.priseEnCharge ? (
                                <span className="font-bold text-blue-600">{feuille.montantRembourse.toFixed(2)} MAD</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {feuille.priseEnCharge ? (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                  {feuille.assurance || "Oui"}
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                  Non
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => navigate(`/feuilles/view/${feuille._id}`)}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Voir"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  onClick={() => navigate(`/feuilles/edit/${feuille._id}`)}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Modifier"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(feuille._id)}
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
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
