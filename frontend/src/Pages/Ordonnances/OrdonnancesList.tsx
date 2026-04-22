import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaPrescriptionBottle,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaPills
} from "react-icons/fa";
import Sidebar from "../../Components/Sidebar";

interface Ordonnance {
  _id: string;
  patientId: {
    _id: string;
    nom: string;
    prenom: string;
    telephone: string;
  };
  dateOrdonnance: string;
  medicaments: Array<{
    nom: string;
    dosage: string;
    frequence: string;
    duree: string;
  }>;
}

export default function OrdonnancesList() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [filteredOrdonnances, setFilteredOrdonnances] = useState<Ordonnance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Get user role
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const isSecretary = user?.role === "Receptionist";

  useEffect(() => {
    fetchOrdonnances();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = ordonnances.filter(o =>
        `${o.patientId.nom} ${o.patientId.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrdonnances(filtered);
    } else {
      setFilteredOrdonnances(ordonnances);
    }
  }, [searchTerm, ordonnances]);

  const fetchOrdonnances = async () => {
    try {
      const res = await fetch("${API_URL}/ordonnances");
      const data = await res.json();

      if (data.success) {
        setOrdonnances(data.data);
        setFilteredOrdonnances(data.data);
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette ordonnance?")) return;

    try {
      const res = await fetch(`${API_URL}/ordonnances/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Ordonnance supprimée");
        fetchOrdonnances();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-md">
                <FaPrescriptionBottle className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ordonnances</h1>
                <p className="text-sm text-gray-500">Gestion des prescriptions médicales</p>
              </div>
            </div>
            {!isSecretary && (
              <button
                onClick={() => navigate("/ordonnances/create")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                <FaPlus />
                Nouvelle Ordonnance
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-rose-50 to-pink-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-xl shadow-md p-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
              </div>
            ) : filteredOrdonnances.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <FaPrescriptionBottle className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune ordonnance</h3>
                <p className="text-gray-500 mb-6">{isSecretary ? "Aucune ordonnance disponible" : "Commencez par créer une ordonnance"}</p>
                {!isSecretary && (
                  <button
                    onClick={() => navigate("/ordonnances/create")}
                    className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                  >
                    Créer la première ordonnance
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  <span className="font-semibold">{filteredOrdonnances.length}</span> ordonnance(s) trouvée(s)
                </div>
                
                {/* Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Patient</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Médicaments</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrdonnances.map((ord, index) => (
                          <tr
                            key={ord._id}
                            className={`border-b border-gray-100 hover:bg-rose-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {ord.patientId.nom.charAt(0)}{ord.patientId.prenom.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{ord.patientId.nom} {ord.patientId.prenom}</p>
                                  <p className="text-sm text-gray-500">{ord.patientId.telephone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {new Date(ord.dateOrdonnance).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FaPills className="text-rose-500" />
                                <span className="font-semibold text-gray-700">{ord.medicaments.length} médicament(s)</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => navigate(`/ordonnances/view/${ord._id}`)}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Voir"
                                >
                                  <FaEye />
                                </button>
                                {!isSecretary && (
                                  <>
                                    <button
                                      onClick={() => navigate(`/ordonnances/edit/${ord._id}`)}
                                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                      title="Modifier"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(ord._id)}
                                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                      title="Supprimer"
                                    >
                                      <FaTrash />
                                    </button>
                                  </>
                                )}
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
