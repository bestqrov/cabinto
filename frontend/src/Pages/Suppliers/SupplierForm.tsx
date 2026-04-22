import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaSave,
  FaArrowLeft,
  FaTruck,
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
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaInfoCircle,
  FaTags,
  FaShareAlt,
} from "react-icons/fa";
import logo from "../../images/logo.avif";

export default function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    activities: "",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchSupplier();
    }
  }, [id]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/supplier/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          activities: data.activities || "",
        });
      } else {
        toast.error("Erreur lors du chargement");
        navigate("/supplier");
      }
    } catch {
      toast.error("Erreur de connexion");
      navigate("/supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);

      const url = isEditMode
        ? `${API_URL}/supplier/${id}`
        : "${API_URL}/supplier";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          isEditMode
            ? "Fournisseur modifié avec succès"
            : "Fournisseur ajouté avec succès"
        );
        navigate("/supplier");
      } else {
        toast.error(data.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
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
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEditMode ? "Modifier Fournisseur" : "Nouveau Fournisseur"}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEditMode
                    ? "Modifiez les informations du fournisseur"
                    : "Ajoutez un nouveau fournisseur"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/supplier")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg border border-gray-200"
            >
              <FaArrowLeft />
              Retour
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
          <div className="max-w-3xl mx-auto">
            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaBuilding className="text-indigo-500" />
                    Nom du Fournisseur <span className="text-red-500">*</span>
                    <span className="ml-auto text-xs text-gray-500 font-normal flex items-center gap-1">
                      <FaInfoCircle className="text-indigo-400" />
                      Nom complet de l'entreprise
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300"
                    placeholder="Ex: Cabinet Médical Supplies Ltd"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaEnvelope className="text-blue-500" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                    placeholder="contact@fournisseur.com"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaPhone className="text-green-500" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>

                {/* Adresse */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" />
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all hover:border-red-300"
                    placeholder="Adresse complète du fournisseur..."
                  />
                </div>

                {/* Activités */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaTags className="text-purple-500" />
                    Activités / Produits
                    <span className="ml-auto text-xs text-gray-500 font-normal flex items-center gap-1">
                      <FaInfoCircle className="text-purple-400" />
                      Ex: Matériel médical, Équipements, Produits pharmaceutiques
                    </span>
                  </label>
                  <textarea
                    name="activities"
                    value={formData.activities}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all hover:border-purple-300"
                    placeholder="Décrivez les produits ou services fournis (équipement médical, consommables, médicaments, etc.)"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate("/supplier")}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
