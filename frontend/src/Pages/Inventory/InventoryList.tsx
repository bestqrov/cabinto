import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaSearch,
  FaBoxes,
  FaExclamationCircle,
  FaClock,
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
  FaTruck,
  FaShareAlt,
} from "react-icons/fa";
import logo from "../../images/logo.avif";

interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  minimumQuantity: number;
  purchasePrice: number;
  sellPrice: number;
  supplier?: Supplier;
  lotNumber?: string;
  expirationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  "Tous",
  "Anesthésie",
  "Stérilisation",
  "Consommable",
  "Implant",
  "Produit d'hygiène",
  "Instrumentation",
  "Radiologie",
  "Médical",
  "Prothèse",
  "Endodontie",
  "Autre",
];

export default function InventoryList() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    expired: 0,
    expiring: 0,
  });

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, []);

  useEffect(() => {
    filterItems();
  }, [search, selectedCategory, items]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("${API_URL}/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setItems(data.data);
      } else {
        toast.error("Erreur lors du chargement");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [lowStockRes, expiredRes] = await Promise.all([
        fetch("${API_URL}/inventory/low-stock", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("${API_URL}/inventory/expired", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const lowStockData = await lowStockRes.json();
      const expiredData = await expiredRes.json();

      setStats({
        total: 0,
        lowStock: lowStockData.success ? lowStockData.count : 0,
        expired: expiredData.success ? expiredData.count.expired : 0,
        expiring: expiredData.success ? expiredData.count.expiring : 0,
      });
    } catch (error) {
      console.error("Erreur stats:", error);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.lotNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory !== "Tous") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
    setStats((prev) => ({ ...prev, total: filtered.length }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?"))
      return;

    try {
      const res = await fetch(`${API_URL}/inventory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Produit supprimé avec succès");
        fetchInventory();
        fetchStats();
      } else {
        toast.error(data.message || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const getStockBadge = (item: InventoryItem) => {
    if (item.quantity < item.minimumQuantity) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <FaExclamationTriangle /> Stock Faible
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        En Stock
      </span>
    );
  };

  const getExpirationBadge = (expirationDate?: string) => {
    if (!expirationDate) return null;

    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil(
      (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration < 0) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <FaExclamationCircle /> Expiré
        </span>
      );
    } else if (daysUntilExpiration <= 30) {
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <FaClock /> Expire dans {daysUntilExpiration}j
        </span>
      );
    }
    return null;
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
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
                <FaBoxes className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion d'Inventaire</h1>
                <p className="text-sm text-gray-500">
                  Gérez votre stock de produits médicaux
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/inventory/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <FaPlus />
              Ajouter Produit
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
          <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Produits</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.total}
                </p>
              </div>
              <FaBoxes className="text-4xl text-blue-300" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Stock Faible</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.lowStock}
                </p>
              </div>
              <FaExclamationTriangle className="text-4xl text-red-300" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Bientôt Expirés</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.expiring}
                </p>
              </div>
              <FaClock className="text-4xl text-orange-300" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Expirés</p>
                <p className="text-3xl font-bold text-gray-600">
                  {stats.expired}
                </p>
              </div>
              <FaExclamationCircle className="text-4xl text-gray-300" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou numéro de lot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Produit</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Quantité
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">Seuil</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Expiration
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Fournisseur
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Statut</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaBoxes className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        Aucun produit trouvé
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <tr
                      key={item._id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.name}
                          </p>
                          {item.lotNumber && (
                            <p className="text-xs text-gray-500">
                              Lot: {item.lotNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-bold text-lg ${
                            item.quantity < item.minimumQuantity
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.minimumQuantity}
                      </td>
                      <td className="px-6 py-4">
                        {item.expirationDate ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-700">
                              {new Date(item.expirationDate).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
                            {getExpirationBadge(item.expirationDate)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.supplier ? (
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {item.supplier.name}
                            </p>
                            {item.supplier.phone && (
                              <p className="text-xs text-gray-500">
                                {item.supplier.phone}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStockBadge(item)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/inventory/edit/${item._id}`)
                            }
                            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
