import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaSave, 
  FaArrowLeft, 
  FaBoxes, 
  FaTag,
  FaLayerGroup,
  FaBoxOpen,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaTruck,
  FaBarcode,
  FaCalendarAlt,
  FaStickyNote,
  FaDollarSign,
  FaInfoCircle,
  FaUserMd,
  FaTimes,
  FaBars,
  FaHome,
  FaCalendarAlt as FaCalendar,
  FaFileInvoiceDollar,
  FaFilePrescription,
  FaNotesMedical,
  FaUsers,
  FaCog,
  FaShareAlt,
} from "react-icons/fa";
import logo from "../../images/logo.avif";

interface Supplier {
  _id: string;
  name: string;
}

const categories = [
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

export default function InventoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Consommable",
    quantity: 0,
    minimumQuantity: 5,
    purchasePrice: 0,
    sellPrice: 0,
    supplier: "",
    lotNumber: "",
    expirationDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchSuppliers();
    if (isEditMode) {
      fetchInventoryItem();
    }
  }, [id]);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("${API_URL}/supplier", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Erreur chargement fournisseurs:", error);
    }
  };

  const fetchInventoryItem = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        const item = data.data;
        setFormData({
          name: item.name || "",
          category: item.category || "Consommable",
          quantity: item.quantity || 0,
          minimumQuantity: item.minimumQuantity || 5,
          purchasePrice: item.purchasePrice || 0,
          sellPrice: item.sellPrice || 0,
          supplier: item.supplier?._id || "",
          lotNumber: item.lotNumber || "",
          expirationDate: item.expirationDate
            ? new Date(item.expirationDate).toISOString().split("T")[0]
            : "",
          notes: item.notes || "",
        });
      } else {
        toast.error("Erreur lors du chargement");
        navigate("/inventory");
      }
    } catch {
      toast.error("Erreur de connexion");
      navigate("/inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" ||
        name === "minimumQuantity" ||
        name === "purchasePrice" ||
        name === "sellPrice"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.quantity < 0) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);

      const url = isEditMode
        ? `${API_URL}/inventory/${id}`
        : "${API_URL}/inventory";

      const method = isEditMode ? "PUT" : "POST";

      // Préparer les données en nettoyant les champs vides
      const dataToSend = {
        ...formData,
        supplier: formData.supplier || undefined,
        lotNumber: formData.lotNumber || undefined,
        expirationDate: formData.expirationDate || undefined,
        notes: formData.notes || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          isEditMode
            ? "Produit modifié avec succès"
            : "Produit ajouté avec succès"
        );
        navigate("/inventory");
      } else {
        console.error("Erreur backend:", data);
        toast.error(data.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
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
    { title: "Rendez-vous", icon: <FaCalendar />, link: "/appointments", color: "text-purple-400" },
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
                <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? "Modifier Produit" : "Ajouter Produit"}</h1>
                <p className="text-sm text-gray-500">
                  {isEditMode
                    ? "Modifiez les informations du produit"
                    : "Ajoutez un nouveau produit à votre inventaire"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/inventory")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg border border-gray-200"
            >
              <FaArrowLeft />
              Retour
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
          <div className="max-w-5xl mx-auto">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaTag className="text-blue-500" />
                Nom du Produit <span className="text-red-500">*</span>
                <span className="ml-auto text-xs text-gray-500 font-normal flex items-center gap-1">
                  <FaInfoCircle className="text-blue-400" />
                  Nom complet du produit
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                  placeholder="Ex: Anesthésique Lidocaïne 2%"
                />
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaLayerGroup className="text-purple-500" />
                Catégorie <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none bg-white hover:border-purple-300"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaTruck className="text-green-500" />
                Fournisseur
                <span className="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
              </label>
              <div className="relative">
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none bg-white hover:border-green-300"
                >
                  <option value="">-- Sélectionner --</option>
                  {suppliers.map((sup) => (
                    <option key={sup._id} value={sup._id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaBoxOpen className="text-blue-500" />
                Quantité en Stock <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                  placeholder="Ex: 50"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                  unités
                </div>
              </div>
            </div>

            {/* Seuil Minimum */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaExclamationTriangle className="text-orange-500" />
                Seuil Minimum <span className="text-red-500">*</span>
                <span className="ml-auto text-xs text-gray-500 font-normal flex items-center gap-1">
                  <FaInfoCircle className="text-orange-400" />
                  Alerte stock faible
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="minimumQuantity"
                  value={formData.minimumQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all hover:border-orange-300"
                  placeholder="Ex: 10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                  min
                </div>
              </div>
            </div>

            {/* Prix d'achat */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Prix d'Achat
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold">
                  DH
                </div>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                  placeholder="150.00"
                />
              </div>
            </div>

            {/* Prix de vente */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaDollarSign className="text-emerald-600" />
                Prix de Vente
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-bold">
                  DH
                </div>
                <input
                  type="number"
                  name="sellPrice"
                  value={formData.sellPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-300"
                  placeholder="200.00"
                />
              </div>
            </div>

            {/* Numéro de lot */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaBarcode className="text-indigo-500" />
                Numéro de Lot
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lotNumber"
                  value={formData.lotNumber}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300"
                  placeholder="Ex: LOT-2025-001"
                />
              </div>
            </div>

            {/* Date d'expiration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-red-500" />
                Date d'Expiration
                <span className="ml-auto text-xs text-gray-500 font-normal flex items-center gap-1">
                  <FaInfoCircle className="text-red-400" />
                  Contrôle péremption
                </span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-red-300"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaStickyNote className="text-yellow-500" />
                Notes
                <span className="ml-auto text-xs text-gray-500 font-normal">Informations supplémentaires</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none transition-all hover:border-yellow-300"
                placeholder="Informations supplémentaires sur le produit..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/inventory")}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <FaSave className="text-lg" />
              {loading
                ? "Enregistrement..."
                : isEditMode
                ? "Modifier"
                : "Ajouter"}
            </button>
          </div>
        </form>
          </div>
        </main>
      </div>
    </div>
  );
}
