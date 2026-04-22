import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTruck,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserMd,
  FaTimes,
  FaBars,
  FaHome,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaFilePrescription,
  FaNotesMedical,
  FaUsers,
  FaCog,
  FaBoxes,
  FaTags,
  FaShareAlt,
} from "react-icons/fa";
import logo from "../../images/logo.avif";

interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  email: string;
  address: string;
  activities?: string;
  createdAt: string;
}

export default function SuppliersList() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [search, suppliers]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("${API_URL}/supplier", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setSuppliers(data);
      } else {
        toast.error("Erreur lors du chargement");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    if (search) {
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(search.toLowerCase()) ||
          supplier.email.toLowerCase().includes(search.toLowerCase()) ||
          supplier.phone?.includes(search)
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?"))
      return;

    try {
      const res = await fetch(`${API_URL}/supplier/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Fournisseur supprimé avec succès");
        fetchSuppliers();
      } else {
        toast.error(data.message || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { title: "Dashboard", icon: <FaHome />, link: "/dashboard", color: "text-blue-400" },
    { title: "Patients", icon: <FaUsers />, link: "/patients", color: "text-green-400" },
    { title: "Rendez-vous", icon: <FaCalendarAlt />, link: "/appointments", color: "text-purple-400" },
    { title: "Factures", icon: <FaFileInvoiceDollar />, link: "/factures", color: "text-cyan-400" },
    { title: "Ordonnances", icon: <FaFilePrescription />, link: "/ordonnances", color: "text-pink-400" },
    { title: "Feuilles de Soin", icon: <FaNotesMedical />, link: "/feuilles", color: "text-yellow-400" },
    { title: "Inventaire", icon: <FaBoxes />, link: "/inventory", color: "text-orange-400" },
    { title: "Fournisseurs", icon: <FaTruck />, link: "/supplier", color: "text-indigo-400" },
    { title: "SMM", icon: <FaShareAlt />, link: "/smm", color: "text-rose-400" },
  ];

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <img src={logo} alt="Dental Clinic" className="w-10 h-10 rounded-lg object-cover" />
                <span className="font-bold text-lg">Dental Clinic</span>
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
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                window.location.pathname === item.link
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
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
              className="w-full flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                <FaTruck className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Fournisseurs</h1>
                <p className="text-sm text-gray-500">
                  Gérez vos fournisseurs de produits médicaux
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/supplier/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <FaPlus />
              Nouveau Fournisseur
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Suppliers Grid */}
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                <FaTruck className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  {search ? "Aucun fournisseur trouvé" : "Aucun fournisseur enregistré"}
                </p>
                {!search && (
                  <button
                    onClick={() => navigate("/supplier/create")}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Ajouter un fournisseur
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-indigo-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <FaTruck className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {supplier.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Créé le {new Date(supplier.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaEnvelope className="text-indigo-500" />
                        <span className="text-sm">{supplier.email}</span>
                      </div>
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaPhone className="text-green-500" />
                          <span className="text-sm">{supplier.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span className="text-sm">{supplier.address}</span>
                      </div>
                      {supplier.activities && (
                        <div className="flex items-start gap-2 text-gray-600 mt-3 pt-3 border-t border-gray-100">
                          <FaTags className="text-purple-500 mt-1" />
                          <span className="text-sm italic">{supplier.activities}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/supplier/edit/${supplier._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        <FaEdit />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(supplier._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FaTrash />
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
