import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaUsers, 
  FaUser, 
  FaCalendar,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaVenusMars,
  FaSave,
  FaTimes,
  FaBars,
  FaUserMd,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaPrescriptionBottle,
  FaBoxes,
  FaTruck,
  FaFileAlt,
  FaCog,
  FaIdCard,
  FaBirthdayCake,
  FaWhatsapp,
  FaPhoneAlt,
  FaHeart,
  FaAllergies,
  FaPills,
  FaTooth,
  FaSoap,
  FaSmoking,
  FaCandyCane,
  FaTint,
  FaEdit
} from "react-icons/fa";
import { MdDashboard } from 'react-icons/md';
import logo from "../../images/logo.avif";
import Sidebar from "../../Components/Sidebar";

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const sidebarOpen = true;

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    cin: "",
    sexe: "Homme",
    telephone: "",
    whatsapp: "",
    email: "",
    adresse: "",
    maladies: "",
    allergies: "",
    medicaments: "",
    antecedents: "",
    hygiene: "",
    tabac: "",
    sucre: "",
    motif: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      const res = await fetch(`${API_URL}/patient/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setForm({
          nom: data.nom || "",
          prenom: data.prenom || "",
          dateNaissance: data.dateNaissance?.split('T')[0] || "",
          cin: data.cin || "",
          sexe: data.sexe || "Homme",
          telephone: data.telephone || "",
          whatsapp: data.whatsapp || "",
          email: data.email || "",
          adresse: data.adresse || "",
          maladies: data.maladies || "",
          allergies: data.allergies || "",
          medicaments: data.medicaments || "",
          antecedents: data.antecedents || "",
          hygiene: data.hygiene || "",
          tabac: data.tabac || "",
          sucre: data.sucre || "",
          motif: data.motif || "",
        });
      } else {
        toast.error("Erreur lors du chargement du patient");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const userId = user ? user._id : null;

    if (!userId) {
      toast.error("Utilisateur non identifié");
      setLoading(false);
      return;
    }

    try {
      const url = id 
        ? `${API_URL}/patient/${id}`
        : "${API_URL}/patient";
      
      const method = id ? "PUT" : "POST";

      const payload = {
        ...form,
        userId,
      };

      console.log("Sending patient data:", payload);

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response from server:", data);

      if (!res.ok) {
        toast.error(data.message || "Erreur lors de l'enregistrement");
      } else {
        toast.success(id ? "Patient modifié avec succès" : "Patient créé avec succès");
        navigate("/patients");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: <MdDashboard className="text-lg" />, title: "Tableau de bord", link: "/dashboard", color: "text-blue-500" },
    { icon: <FaUsers className="text-lg" />, title: "Patients", link: "/patients", color: "text-green-500" },
    { icon: <FaCalendarAlt className="text-lg" />, title: "Rendez-vous", link: "/appointments", color: "text-purple-500" },
    { icon: <FaFileInvoiceDollar className="text-lg" />, title: "Factures", link: "/factures", color: "text-yellow-500" },
    { icon: <FaPrescriptionBottle className="text-lg" />, title: "Ordonnances", link: "/ordonnances", color: "text-pink-500" },
    { icon: <FaBoxes className="text-lg" />, title: "Stock", link: "/inventory", color: "text-red-500" },
    { icon: <FaTruck className="text-lg" />, title: "Fournisseurs", link: "/suppliers", color: "text-indigo-500" },
    { icon: <FaFileAlt className="text-lg" />, title: "Dossiers M\u00e9dicaux", link: "/medical-files", color: "text-teal-500" },
  ];

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <FaUser className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {id ? "Modifier Dossier Patient" : "Nouveau Dossier Patient"}
                </h1>
                <p className="text-sm text-gray-500">
                  {id ? "Mettre à jour les informations complètes" : "Enregistrer un nouveau patient"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-6">
          <div className="max-w-5xl mx-auto">
            {/* Gold Animated Title */}
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                {id ? "✨ Modifier Dossier Patient ✨" : "🏥 Nouveau Dossier Patient 🏥"}
              </h1>
              <p className="text-gray-600 text-lg">
                {id ? "Mettez à jour toutes les informations du patient" : "Créez un nouveau dossier médical complet"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl overflow-hidden">
              
              {/* Section 1: Informations Personnelles */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaUser className="text-3xl" />
                  <h2 className="text-2xl font-bold">Informations Personnelles</h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="text-emerald-500" />
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Nom de famille"
                    required
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-300 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Ex: El Amrani</p>
                </div>

                {/* Prénom */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="text-teal-500" />
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    placeholder="Prénom"
                    required
                    className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:ring-4 focus:ring-teal-300 focus:border-teal-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Ex: Fatima</p>
                </div>

                {/* Date de Naissance */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaBirthdayCake className="text-pink-500" />
                    Date de Naissance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={form.dateNaissance}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Sélectionnez la date</p>
                </div>

                {/* CIN */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaIdCard className="text-green-500" />
                    CIN / Identifiant
                  </label>
                  <input
                    name="cin"
                    value={form.cin}
                    onChange={handleChange}
                    placeholder="Numéro CIN"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Ex: B654321</p>
                </div>

                {/* Sexe */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaVenusMars className="text-purple-500" />
                    Sexe <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sexe"
                    value={form.sexe}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
                  >
                    <option value="Homme">👨 Homme</option>
                    <option value="Femme">👩 Femme</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">💡 Sélectionnez le sexe</p>
                </div>
              </div>

              {/* Section 2: Coordonnées */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaPhone className="text-3xl" />
                  <h2 className="text-2xl font-bold">Coordonnées</h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Téléphone */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaPhone className="text-cyan-500" />
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="Numéro de téléphone"
                    required
                    className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Ex: 0612345678</p>
                </div>

                {/* WhatsApp */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaWhatsapp className="text-green-500" />
                    WhatsApp
                  </label>
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="WhatsApp (ex: 212612345678)"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Format international avec indicatif</p>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaEnvelope className="text-blue-500" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Adresse email"
                    required
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Ex: patient@email.com</p>
                </div>

                {/* Adresse */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaMapMarkerAlt className="text-red-500" />
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="adresse"
                    value={form.adresse}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                    required
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Ex: 123 Rue Mohammed V, Casablanca</p>
                </div>
              </div>

              {/* Section 3: Historique Médical */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaHeart className="text-3xl" />
                  <h2 className="text-2xl font-bold">Historique Médical</h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maladies */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaHeart className="text-rose-500" />
                    Maladies Connues
                  </label>
                  <textarea
                    name="maladies"
                    value={form.maladies}
                    onChange={handleChange}
                    placeholder="Maladies connues"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:ring-4 focus:ring-rose-300 focus:border-rose-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Maladies chroniques ou antécédents</p>
                </div>

                {/* Allergies */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaAllergies className="text-pink-500" />
                    Allergies
                  </label>
                  <textarea
                    name="allergies"
                    value={form.allergies}
                    onChange={handleChange}
                    placeholder="Allergies connues"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Allergies médicamenteuses ou alimentaires</p>
                </div>

                {/* Médicaments */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaPills className="text-purple-500" />
                    Médicaments Actuels
                  </label>
                  <textarea
                    name="medicaments"
                    value={form.medicaments}
                    onChange={handleChange}
                    placeholder="Médicaments actuels"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Traitements en cours</p>
                </div>

                {/* Antécédents Dentaires */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaTooth className="text-blue-500" />
                    Antécédents Dentaires
                  </label>
                  <textarea
                    name="antecedents"
                    value={form.antecedents}
                    onChange={handleChange}
                    placeholder="Antécédents médicaux"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Antécédents médicaux du patient</p>
                </div>
              </div>

              {/* Section 4: Habitudes & Mode de Vie */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaSoap className="text-3xl" />
                  <h2 className="text-2xl font-bold">Habitudes & Mode de Vie</h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hygiène */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaSoap className="text-cyan-500" />
                    Hygiène Bucco-Dentaire
                  </label>
                  <select
                    name="hygiene"
                    value={form.hygiene}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
                  >
                    <option value="">Hygiène générale</option>
                    <option value="Bonne">✅ Bonne</option>
                    <option value="Moyenne">⚠️ Moyenne</option>
                    <option value="Faible">❌ Faible</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">💡 Qualité d'hygiène du patient</p>
                </div>

                {/* Tabac */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaSmoking className="text-gray-500" />
                    Tabac
                  </label>
                  <select
                    name="tabac"
                    value={form.tabac}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-gray-300 focus:border-gray-500 transition-all"
                  >
                    <option value="">Tabac</option>
                    <option value="Oui">🚬 Oui</option>
                    <option value="Non">🚭 Non</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">💡 Consommation de tabac</p>
                </div>

                {/* Sucre */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaCandyCane className="text-pink-500" />
                    Consommation de Sucre
                  </label>
                  <select
                    name="sucre"
                    value={form.sucre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all"
                  >
                    <option value="">Consommation de sucre</option>
                    <option value="Faible">✅ Faible</option>
                    <option value="Modérée">⚠️ Modérée</option>
                    <option value="Élevée">🍬 Élevée</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">💡 Niveau de consommation de sucre</p>
                </div>
              </div>

              {/* Section 5: Motif de Consultation */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaNotesMedical className="text-3xl" />
                  <h2 className="text-2xl font-bold">Motif de Consultation</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaNotesMedical className="text-indigo-500" />
                    Motif de la Visite
                  </label>
                  <select
                    name="motif"
                    value={form.motif}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Sélectionner un motif</option>
                    <option value="Douleur">😣 Douleur</option>
                    <option value="Contrôle">🔍 Contrôle</option>
                    <option value="Détartrage">🩺 Consultation</option>
                    <option value="Esthétique">✨ Esthétique</option>
                    <option value="Orthodontie">🩺 Suivi</option>
                    <option value="Autre">📌 Autre</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">💡 Raison principale de la consultation</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Enregistrement en cours...
                      </>
                    ) : id ? (
                      <>
                        <FaEdit className="text-2xl" />
                        Modifier le Patient
                      </>
                    ) : (
                      <>
                        <FaSave className="text-2xl" />
                        Enregistrer le Patient
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/patients")}
                    className="px-6 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-xl flex items-center gap-2"
                  >
                    <FaTimes className="text-xl" />
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
