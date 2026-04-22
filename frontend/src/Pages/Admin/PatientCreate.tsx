import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { 
  FaUser, 
  FaIdCard, 
  FaBirthdayCake, 
  FaVenusMars, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaHeart,
  FaAllergies,
  FaPills,
  FaTooth,
  FaSoap,
  FaSmoking,
  FaCandy,
  FaNotesMedical,
  FaTint,
  FaPhoneAlt,
  FaSave,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaWhatsapp
} from "react-icons/fa";

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  cin: string;
  sexe: string;
  telephone: string;
  whatsapp?: string;
  email?: string;
  adresse?: string;
  maladies?: string;
  allergies?: string;
  medicaments?: string;
  antecedents?: string;
  hygiene?: string;
  tabac?: string;
  sucre?: string;
  motif?: string;
  groupeSanguin?: string;
  contactUrgence?: string;
}

export default function PatientCreate() {
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== "Admin") {
      toast.error("Accès non autorisé");
      window.location.href = "/"; 
      return;
    }

    fetchPatients();
  }, []);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    cin: "",
    sexe: "",
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
    groupeSanguin: "",
    contactUrgence: "",
  });

  const token = localStorage.getItem("token");

  // ---------------- Fetch Patients ----------------
  const fetchPatients = async () => {
    try {
      const res = await fetch("${API_URL}/patient", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message || "Erreur de chargement");

      setPatients(data);
    } catch {
      toast.error("Erreur de connexion au serveur");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------- Create / Update ----------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // Extraction de userId depuis localStorage
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const userId = user ? user._id : null;

    if (!userId) {
      toast.error("Utilisateur non trouvé");
      setLoading(false);
      return;
    }

    try {
      let url = "${API_URL}/patient";
      let method = "POST";

      if (editingId) {
        url = `${API_URL}/patient/${editingId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          userId, // ← très important
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Patient creation error:", data);
        
        // Show detailed validation errors if available
        if (data.details && Array.isArray(data.details)) {
          data.details.forEach((detail: any) => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          toast.error(data.error || data.message || "Erreur lors de l'enregistrement");
        }
      } else {
        toast.success(editingId ? "Modifié avec succès" : "Ajouté avec succès");
      }

      // Réinitialiser les champs
      setForm({
        nom: "",
        prenom: "",
        dateNaissance: "",
        cin: "",
        sexe: "",
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
        groupeSanguin: "",
        contactUrgence: "",
      });

      setEditingId(null);
      fetchPatients();
    } catch {
      toast.error("Erreur de connexion au serveur");
    }

    setLoading(false);
  };

  // ---------------- Delete ----------------
  const deletePatient = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer?")) return;

    try {
      const res = await fetch(`${API_URL}/patient/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) toast.error(data.message || "Erreur lors de la suppression");
      else {
        toast.success("Supprimé avec succès");
        fetchPatients();
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    }
  };

  // ---------------- Fill Form for Edit ----------------
  const editPatient = (p: Patient) => {
    setForm({
      nom: p.nom,
      prenom: p.prenom,
      dateNaissance: p.dateNaissance,
      cin: p.cin,
      sexe: p.sexe,
      telephone: p.telephone,
      whatsapp: p.whatsapp || "",
      email: p.email || "",
      adresse: p.adresse || "",
      maladies: p.maladies || "",
      allergies: p.allergies || "",
      medicaments: p.medicaments || "",
      antecedents: p.antecedents || "",
      hygiene: p.hygiene || "",
      tabac: p.tabac || "",
      sucre: p.sucre || "",
      motif: p.motif || "",
      groupeSanguin: p.groupeSanguin || "",
      contactUrgence: p.contactUrgence || "",
    });
    setEditingId(p._id);
  };

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <FaUser className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Créer Patient</h1>
              <p className="text-sm text-gray-500">Gestion des patients</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Gold Animated Title */}
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                {editingId ? "✨ Modifier Patient ✨" : "🏥 Ajouter un Nouveau Patient 🏥"}
              </h1>
              <p className="text-gray-600 text-lg">
                {editingId ? "Mettez à jour les informations du patient" : "Enregistrez un nouveau patient dans le système"}
              </p>
            </div>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl mb-10 overflow-hidden"
      >
        {/* Section 1: Informations Personnelles */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
          <div className="flex items-center gap-3 text-white">
            <FaUser className="text-3xl" />
            <h2 className="text-2xl font-bold">Informations Personnelles</h2>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Nom */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaUser className="text-emerald-500" />
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              name="nom"
              placeholder="Nom de famille"
              value={form.nom}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-300 focus:border-emerald-500 transition-all"
              required
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
              placeholder="Prénom"
              value={form.prenom}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:ring-4 focus:ring-teal-300 focus:border-teal-500 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">💡 Ex: Fatima</p>
          </div>

          {/* CIN */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaIdCard className="text-green-500" />
              CIN <span className="text-red-500">*</span>
            </label>
            <input
              name="cin"
              placeholder="Numéro CIN"
              value={form.cin}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">💡 Ex: B654321</p>
          </div>

          {/* Date de Naissance */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaBirthdayCake className="text-pink-500" />
              Date de Naissance <span className="text-red-500">*</span>
            </label>
            <input
              name="dateNaissance"
              type="date"
              value={form.dateNaissance}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">💡 Sélectionnez la date</p>
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
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
              required
            >
              <option value="">Choisir le sexe</option>
              <option value="Homme">👨 Homme</option>
              <option value="Femme">👩 Femme</option>
              <option value="Autre">⚧ Autre</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">💡 Sélectionnez une option</p>
          </div>

          {/* Groupe Sanguin */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaTint className="text-red-500" />
              Groupe Sanguin
            </label>
            <select
              name="groupeSanguin"
              value={form.groupeSanguin}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all"
            >
              <option value="">Groupe sanguin (optionnel)</option>
              <option value="A+">🅰️ A+</option>
              <option value="A-">🅰️ A-</option>
              <option value="B+">🅱️ B+</option>
              <option value="B-">🅱️ B-</option>
              <option value="AB+">🆎 AB+</option>
              <option value="AB-">🆎 AB-</option>
              <option value="O+">🅾️ O+</option>
              <option value="O-">🅾️ O-</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">💡 Type sanguin du patient</p>
          </div>
        </div>

        {/* Section 2: Coordonnées */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6">
          <div className="flex items-center gap-3 text-white">
            <FaPhone className="text-3xl" />
            <h2 className="text-2xl font-bold">Coordonnées</h2>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Téléphone */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaPhone className="text-cyan-500" />
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              name="telephone"
              placeholder="Téléphone"
              value={form.telephone}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
              required
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
              placeholder="WhatsApp (ex: 212612345678)"
              value={form.whatsapp}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">💡 Format international avec indicatif</p>
          </div>

          {/* Email */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaEnvelope className="text-blue-500" />
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Email (optionnel)"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">💡 Ex: patient@email.com</p>
          </div>

          {/* Adresse */}
          <div className="group col-span-1 md:col-span-2 lg:col-span-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaMapMarkerAlt className="text-red-500" />
              Adresse
            </label>
            <input
              name="adresse"
              placeholder="Adresse (optionnel)"
              value={form.adresse}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">💡 Ex: 123 Rue Mohammed V, Casablanca</p>
          </div>

          {/* Contact d'urgence */}
          <div className="group col-span-1 md:col-span-2 lg:col-span-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaPhoneAlt className="text-orange-500" />
              Contact d'Urgence
            </label>
            <input
              name="contactUrgence"
              placeholder="Contact d'urgence (optionnel)"
              value={form.contactUrgence}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">💡 Numéro d'un proche à contacter en cas d'urgence</p>
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
              Maladies
            </label>
            <textarea
              name="maladies"
              placeholder="Maladies (optionnel)"
              value={form.maladies}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-rose-200 rounded-lg focus:ring-4 focus:ring-rose-300 focus:border-rose-500 transition-all h-24"
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
              placeholder="Allergies (optionnel)"
              value={form.allergies}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all h-24"
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
              placeholder="Médicaments actuels (optionnel)"
              value={form.medicaments}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all h-24"
            />
            <p className="text-xs text-gray-500 mt-1">💡 Traitements en cours</p>
          </div>

          {/* Antécédents Médicaux */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaNotesMedical className="text-blue-500" />
              Antécédents Médicaux
            </label>
            <textarea
              name="antecedents"
              placeholder="Antécédents médicaux (optionnel)"
              value={form.antecedents}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all h-24"
            />
            <p className="text-xs text-gray-500 mt-1">Antécédents médicaux du patient</p>
          </div>
        </div>

        {/* Section 4: Habitudes & Mode de Vie */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
          <div className="flex items-center gap-3 text-white">
            <FaSoap className="text-3xl" />
            <h2 className="text-2xl font-bold">Habitudes & Mode de Vie</h2>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Hygiène */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaSoap className="text-cyan-500" />
              Hygiène Générale
            </label>
            <select
              name="hygiene"
              value={form.hygiene}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
            >
              <option value="">Hygiène (optionnel)</option>
              <option value="Bonne">✅ Bonne</option>
              <option value="Moyenne">⚠️ Moyenne</option>
              <option value="Faible">❌ Faible</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Qualité d'hygiène du patient</p>
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
              <option value="">Tabac (optionnel)</option>
              <option value="Oui">🚬 Oui</option>
              <option value="Non">🚭 Non</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">💡 Consommation de tabac</p>
          </div>

          {/* Diabète */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaCandyCane className="text-pink-500" />
              Diabète
            </label>
            <select
              name="sucre"
              value={form.sucre}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all"
            >
              <option value="">Diabète (optionnel)</option>
              <option value="Oui">🍬 Oui</option>
              <option value="Non">✅ Non</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">💡 Patient diabétique</p>
          </div>
        </div>

        {/* Section 5: Motif de Visite */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
          <div className="flex items-center gap-3 text-white">
            <FaNotesMedical className="text-3xl" />
            <h2 className="text-2xl font-bold">Motif de Visite</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaNotesMedical className="text-indigo-500" />
              Motif de la Visite
            </label>
            <textarea
              name="motif"
              placeholder="Motif de la visite (optionnel)"
              value={form.motif}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all h-24"
            />
            <p className="text-xs text-gray-500 mt-1">💡 Raison de la consultation</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Enregistrement en cours...
              </>
            ) : editingId ? (
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
        </div>
      </form>

      {/* Tableau */}
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
        <FaUserPlus className="text-emerald-600" />
        Liste des Patients
      </h2>

      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <FaUserPlus className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun patient actuellement</p>
          <p className="text-gray-400 text-sm mt-2">Ajoutez votre premier patient en utilisant le formulaire ci-dessus</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-2xl">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <tr>
                <th className="p-4 text-left font-bold">Nom</th>
                <th className="p-4 text-left font-bold">Prénom</th>
                <th className="p-4 text-left font-bold">CIN</th>
                <th className="p-4 text-left font-bold">Date de naissance</th>
                <th className="p-4 text-left font-bold">Sexe</th>
                <th className="p-4 text-left font-bold">Téléphone</th>
                <th className="p-4 text-left font-bold">WhatsApp</th>
                <th className="p-4 text-left font-bold">Email</th>
                <th className="p-4 text-left font-bold">Adresse</th>
                <th className="p-4 text-left font-bold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((p, index) => (
                <tr key={p._id} className={`border-b hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}>
                  <td className="p-4 font-semibold text-gray-800">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-emerald-500" />
                      {p.nom}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{p.prenom}</td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaIdCard className="text-teal-500" />
                      {p.cin}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{p.dateNaissance}</td>
                  <td className="p-4 text-gray-600">{p.sexe}</td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-cyan-500" />
                      {p.telephone}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {p.whatsapp ? (
                      <div className="flex items-center gap-2">
                        <FaWhatsapp className="text-green-500" />
                        {p.whatsapp}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-gray-600">{p.email || '-'}</td>
                  <td className="p-4 text-gray-600">{p.adresse || '-'}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => editPatient(p)}
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-105 flex items-center gap-2 shadow-md font-semibold"
                    >
                      <FaEdit />
                      Modifier
                    </button>

                    <button
                      onClick={() => deletePatient(p._id)}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center gap-2 shadow-md font-semibold"
                    >
                      <FaTrash />
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}
