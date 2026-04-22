import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { 
  FaUserMd, 
  FaUser, 
  FaIdCard, 
  FaBirthdayCake, 
  FaVenusMars, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaStethoscope, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaClock, 
  FaCheckCircle, 
  FaFileAlt,
  FaSave,
  FaEdit,
  FaTrash,
  FaUserPlus
} from "react-icons/fa";

interface Personnel {
  _id: string;
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  sexe: string;
  telephone: string;
  email?: string;
  adresse?: string;
  poste: string;
  specialite?: string;
  dateEmbauche: string;
  salaire?: number;
  horaireTravail?: string;
  statut: string;
  numeroCNSS?: string;
  numeroCarteProf?: string;
  photoProfile?: string;
  notes?: string;
}

export default function PersonnelCreate() {
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== "Admin") {
      toast.error("Accès non autorisé");
      window.location.href = "/";
      return;
    }

    fetchPersonnel();
  }, []);

  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    cin: "",
    dateNaissance: "",
    sexe: "",
    telephone: "",
    email: "",
    adresse: "",
    poste: "",
    specialite: "",
    dateEmbauche: "",
    salaire: "",
    horaireTravail: "",
    statut: "Actif",
    numeroCNSS: "",
    numeroCarteProf: "",
    notes: "",
  });

  const token = localStorage.getItem("token");

  // ---------------- Fetch Personnel ----------------
  const fetchPersonnel = async () => {
    try {
      const res = await fetch("${API_URL}/personnel", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message || "Erreur lors du chargement");

      setPersonnel(data);
    } catch {
      toast.error("Erreur de connexion au serveur");
    }
  };

  // Fetch user accounts from Settings/Personnel
  const fetchUserAccounts = async () => {
    try {
      const res = await fetch("${API_URL}/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter(
          (user: any) => user.role === "Receptionist" || user.role === "Dentist"
        );
        setUserAccounts(filtered);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  useEffect(() => {
    fetchPersonnel();
    fetchUserAccounts();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle user account selection
  const handleUserSelect = (e: any) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    
    if (userId) {
      const selectedUser = userAccounts.find(u => u._id === userId);
      if (selectedUser) {
        const nameParts = selectedUser.fullname.split(' ');
        setForm({
          ...form,
          nom: nameParts[nameParts.length - 1] || "",
          prenom: nameParts.slice(0, -1).join(' ') || selectedUser.fullname,
          email: selectedUser.email || "",
          poste: selectedUser.role === "Dentist" ? "Dentiste" : "Secrétaire",
          specialite: selectedUser.specialization || "",
        });
      }
    }
  };

  // ---------------- Create / Update ----------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const userId = user ? user._id : null;

    if (!userId) {
      toast.error("Utilisateur non trouvé");
      setLoading(false);
      return;
    }

    try {
      let url = "${API_URL}/personnel/create";
      let method = "POST";

      if (editingId) {
        url = `${API_URL}/personnel/${editingId}`;
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
          salaire: form.salaire ? Number(form.salaire) : undefined,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          data.details.forEach((detail: any) => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          toast.error(data.error || data.message || "Erreur lors de l'enregistrement");
        }
      } else {
        toast.success(editingId ? "Modifié avec succès" : "Ajouté avec succès");

        setForm({
          nom: "",
          prenom: "",
          cin: "",
          dateNaissance: "",
          sexe: "",
          telephone: "",
          email: "",
          adresse: "",
          poste: "",
          specialite: "",
          dateEmbauche: "",
          salaire: "",
          horaireTravail: "",
          statut: "Actif",
          numeroCNSS: "",
          numeroCarteProf: "",
          notes: "",
        });

        setEditingId(null);
        fetchPersonnel();
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    }

    setLoading(false);
  };

  // ---------------- Delete ----------------
  const deletePersonnel = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer?")) return;

    try {
      const res = await fetch(`${API_URL}/personnel/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) toast.error(data.message || "Erreur lors de la suppression");
      else {
        toast.success("Supprimé avec succès");
        fetchPersonnel();
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    }
  };

  // ---------------- Fill Form for Edit ----------------
  const editPersonnel = (p: Personnel) => {
    setForm({
      nom: p.nom,
      prenom: p.prenom,
      cin: p.cin,
      dateNaissance: p.dateNaissance,
      sexe: p.sexe,
      telephone: p.telephone,
      email: p.email || "",
      adresse: p.adresse || "",
      poste: p.poste,
      specialite: p.specialite || "",
      dateEmbauche: p.dateEmbauche,
      salaire: p.salaire?.toString() || "",
      horaireTravail: p.horaireTravail || "",
      statut: p.statut,
      numeroCNSS: p.numeroCNSS || "",
      numeroCarteProf: p.numeroCarteProf || "",
      notes: p.notes || "",
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
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
              <FaUserMd className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gérer Personnel</h1>
              <p className="text-sm text-gray-500">Gestion du personnel médical</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Gold Animated Title */}
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                {editingId ? "✨ Modifier un Employé ✨" : "⭐ Ajouter un Nouvel Employé ⭐"}
              </h1>
              <p className="text-gray-600 text-lg">
                {editingId ? "Mettez à jour les informations de l'employé" : "Remplissez tous les champs pour enregistrer un nouveau membre de l'équipe"}
              </p>
            </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-2xl mb-10 overflow-hidden"
        >
          {/* User Account Selection Dropdown */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
            <div className="flex items-center gap-3 text-white">
              <FaUserPlus className="text-3xl" />
              <h2 className="text-2xl font-bold">Sélectionner un Compte Utilisateur (Optionnel)</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="text-indigo-500" />
                Compte Utilisateur
              </label>
              <select
                value={selectedUserId}
                onChange={handleUserSelect}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
              >
                <option value="">-- Nouveau personnel (créer manuellement) --</option>
                {userAccounts.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullname} - {user.role === "Dentist" ? "Docteur" : "Secrétaire"} ({user.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">💡 Sélectionnez un compte créé dans Paramètres/Personnel ou créez manuellement ci-dessous</p>
            </div>
          </div>

          {/* Section 1: Informations Personnelles */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
            <div className="flex items-center gap-3 text-white">
              <FaUser className="text-3xl" />
              <h2 className="text-2xl font-bold">Informations Personnelles</h2>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nom */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="text-purple-500" />
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                name="nom"
                placeholder="Entrez le nom de famille"
                value={form.nom}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: El Amrani</p>
            </div>

            {/* Prénom */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="text-pink-500" />
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                name="prenom"
                placeholder="Entrez le prénom"
                value={form.prenom}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: Mohammed</p>
            </div>

            {/* CIN */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaIdCard className="text-indigo-500" />
                CIN <span className="text-red-500">*</span>
              </label>
              <input
                name="cin"
                placeholder="Numéro CIN"
                value={form.cin}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: AB123456</p>
            </div>

            {/* Date de Naissance */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaBirthdayCake className="text-yellow-500" />
                Date de Naissance <span className="text-red-500">*</span>
              </label>
              <input
                name="dateNaissance"
                type="date"
                value={form.dateNaissance}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Sélectionnez la date</p>
            </div>

            {/* Sexe */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaVenusMars className="text-blue-500" />
                Sexe <span className="text-red-500">*</span>
              </label>
              <select
                name="sexe"
                value={form.sexe}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                required
              >
                <option value="">Sélectionnez le sexe</option>
                <option value="Homme">👨 Homme</option>
                <option value="Femme">👩 Femme</option>
                <option value="Autre">⚧ Autre</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">💡 Choisissez une option</p>
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
                placeholder="Numéro de téléphone"
                value={form.telephone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: 0612345678</p>
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
                placeholder="Adresse email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: employe@email.com</p>
            </div>

            {/* Adresse */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaMapMarkerAlt className="text-red-500" />
                Adresse
              </label>
              <input
                name="adresse"
                placeholder="Adresse complète"
                value={form.adresse}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: 123 Rue Mohammed V, Casablanca</p>
            </div>
          </div>

          {/* Section 3: Informations Professionnelles */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
            <div className="flex items-center gap-3 text-white">
              <FaBriefcase className="text-3xl" />
              <h2 className="text-2xl font-bold">Informations Professionnelles</h2>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Poste */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaBriefcase className="text-green-500" />
                Poste <span className="text-red-500">*</span>
              </label>
              <select
                name="poste"
                value={form.poste}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                required
              >
                <option value="">Sélectionnez le poste</option>
                <option value="Dentiste">🩺 Médecin</option>
                <option value="Assistant(e)">👨‍⚕️ Assistant(e)</option>
                <option value="Secrétaire">📋 Secrétaire</option>
                <option value="Hygiéniste">🧼 Hygiéniste</option>
                <option value="Technicien(ne)">🔧 Technicien(ne)</option>
                <option value="Autre">📌 Autre</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">💡 Fonction dans la clinique</p>
            </div>

            {/* Spécialité */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaStethoscope className="text-teal-500" />
                Spécialité
              </label>
              <input
                name="specialite"
                placeholder="Spécialité du praticien"
                value={form.specialite}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:ring-4 focus:ring-teal-300 focus:border-teal-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: Dermatologie, Cardiologie</p>
            </div>

            {/* Date d'embauche */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaCalendarAlt className="text-emerald-500" />
                Date d'Embauche <span className="text-red-500">*</span>
              </label>
              <input
                name="dateEmbauche"
                type="date"
                value={form.dateEmbauche}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-300 focus:border-emerald-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Date de début de travail</p>
            </div>

            {/* Salaire */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaMoneyBillWave className="text-yellow-600" />
                Salaire (MAD)
              </label>
              <input
                name="salaire"
                type="number"
                placeholder="Salaire mensuel"
                value={form.salaire}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: 8000 MAD</p>
            </div>

            {/* Horaire de travail */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaClock className="text-orange-500" />
                Horaires de Travail
              </label>
              <input
                name="horaireTravail"
                placeholder="Horaires (ex: 9h-17h)"
                value={form.horaireTravail}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Ex: 9h-17h ou 8h-16h</p>
            </div>

            {/* Statut */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaCheckCircle className="text-green-600" />
                Statut
              </label>
              <select
                name="statut"
                value={form.statut}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
              >
                <option value="Actif">✅ Actif</option>
                <option value="Congé">🏖️ Congé</option>
                <option value="Inactif">❌ Inactif</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">💡 État actuel de l'employé</p>
            </div>
          </div>

          {/* Section 4: Informations Administratives */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <div className="flex items-center gap-3 text-white">
              <FaFileAlt className="text-3xl" />
              <h2 className="text-2xl font-bold">Informations Administratives</h2>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Numéro CNSS */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaIdCard className="text-orange-500" />
                Numéro CNSS
              </label>
              <input
                name="numeroCNSS"
                placeholder="Numéro CNSS"
                value={form.numeroCNSS}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Numéro de sécurité sociale</p>
            </div>

            {/* Numéro Carte Professionnelle */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaIdCard className="text-red-500" />
                Numéro Carte Professionnelle
              </label>
              <input
                name="numeroCarteProf"
                placeholder="Numéro carte professionnelle"
                value={form.numeroCarteProf}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Pour les professionnels de santé</p>
            </div>

            {/* Notes */}
            <div className="group col-span-1 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaFileAlt className="text-gray-500" />
                Notes
              </label>
              <textarea
                name="notes"
                placeholder="Notes ou commentaires supplémentaires..."
                value={form.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-gray-300 focus:border-gray-500 transition-all h-24"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Informations complémentaires</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-white py-4 px-6 rounded-xl hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Enregistrement en cours...
                </>
              ) : editingId ? (
                <>
                  <FaEdit className="text-2xl" />
                  Modifier l'Employé
                </>
              ) : (
                <>
                  <FaSave className="text-2xl" />
                  Ajouter l'Employé
                </>
              )}
            </button>
          </div>
        </form>

        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
          <FaUserMd className="text-blue-600" />
          Liste des Employés
        </h2>

        {personnel.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FaUserPlus className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun employé pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Ajoutez votre premier employé en utilisant le formulaire ci-dessus</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-2xl">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <tr>
                  <th className="p-4 text-left font-bold">Nom complet</th>
                  <th className="p-4 text-left font-bold">CIN</th>
                  <th className="p-4 text-left font-bold">Poste</th>
                  <th className="p-4 text-left font-bold">Téléphone</th>
                  <th className="p-4 text-left font-bold">Statut</th>
                  <th className="p-4 text-left font-bold">Date d'embauche</th>
                  <th className="p-4 text-left font-bold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {personnel.map((p, index) => (
                  <tr key={p._id} className={`border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <td className="p-4 font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        {p.nom} {p.prenom}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaIdCard className="text-indigo-500" />
                        {p.cin}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full text-sm font-semibold">
                        {p.poste}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-cyan-500" />
                        {p.telephone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${
                        p.statut === 'Actif' ? 'bg-green-100 text-green-800' :
                        p.statut === 'Congé' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {p.statut === 'Actif' ? '✅' : p.statut === 'Congé' ? '🏖️' : '❌'}
                        {p.statut}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-orange-500" />
                        {new Date(p.dateEmbauche).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => editPersonnel(p)}
                        className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all transform hover:scale-105 flex items-center gap-2 shadow-md font-semibold"
                      >
                        <FaEdit />
                        Modifier
                      </button>

                      <button
                        onClick={() => deletePersonnel(p._id)}
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
