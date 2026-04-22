import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../images/logo.avif";
import { 
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaNotesMedical,
  FaSave,
  FaTimes,
  FaBars,
  FaUserMd,
  FaUsers,
  FaFileInvoiceDollar,
  FaPrescriptionBottle,
  FaBoxes,
  FaTruck,
  FaFileAlt,
  FaCog,
  FaPhone,
  FaWhatsapp,
  FaStethoscope,
  FaEdit,
  FaCalendarPlus,
  FaCheckCircle,
  FaUserPlus
} from "react-icons/fa";
import { MdDashboard } from 'react-icons/md';

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
}

export default function AppointmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");

  const [form, setForm] = useState({
    patient: "",
    praticien: "",
    date: "",
    heure: "",
    motif: "",
    gsm: "",
    whatsapp: "",
    statut: "Prévu",
    notes: "",
  });

  useEffect(() => {
    fetchPatients();
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchPatients = async () => {
    try {
      const res = await fetch("${API_URL}/patient");
      const data = await res.json();
      if (res.ok) {
        setPatients(data);
      }
    } catch {
      toast.error("Erreur lors du chargement des patients");
    }
  };

  const fetchAppointment = async () => {
    try {
      const res = await fetch(`${API_URL}/appointment/${id}`);
      const data = await res.json();

      if (res.ok) {
        setForm({
          patient: data.patient._id,
          praticien: data.praticien,
          date: data.date.split('T')[0],
          heure: data.heure,
          motif: data.motif,
          gsm: data.gsm || "",
          whatsapp: data.whatsapp || "",
          statut: data.statut,
          notes: data.notes || "",
        });
      } else {
        toast.error("Erreur lors du chargement");
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

    try {
      const url = id
        ? `${API_URL}/appointment/${id}`
        : "${API_URL}/appointment";

      const method = id ? "PUT" : "POST";

      // Prepare data with new patient name if applicable
      const submitData = {
        ...form,
        patient: isNewPatient ? newPatientName : form.patient,
        isNewPatient: isNewPatient,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        toast.success(id ? "Rendez-vous modifié avec succès" : "Rendez-vous créé avec succès");
        navigate("/appointments");
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: <MdDashboard className="text-lg" />, title: "Dashboard", link: "/dashboard", color: "text-blue-500" },
    { icon: <FaUsers className="text-lg" />, title: "Patients", link: "/patients", color: "text-green-500" },
    { icon: <FaCalendarAlt className="text-lg" />, title: "Rendez-vous", link: "/appointments", color: "text-purple-500" },
    { icon: <FaFileInvoiceDollar className="text-lg" />, title: "Factures", link: "/factures", color: "text-yellow-500" },
    { icon: <FaPrescriptionBottle className="text-lg" />, title: "Ordonnances", link: "/ordonnances", color: "text-pink-500" },
    { icon: <FaBoxes className="text-lg" />, title: "Inventaire", link: "/inventory", color: "text-red-500" },
    { icon: <FaTruck className="text-lg" />, title: "Fournisseurs", link: "/suppliers", color: "text-indigo-500" },
    { icon: <FaFileAlt className="text-lg" />, title: "Dossiers Médicaux", link: "/medical-files", color: "text-teal-500" },
  ];

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
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
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FaCalendarAlt className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {id ? "Modifier Rendez-vous" : "Nouveau Rendez-vous"}
                </h1>
                <p className="text-sm text-gray-500">
                  {id ? "Mettre à jour les informations du rendez-vous" : "Planifier un nouveau rendez-vous"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-5xl mx-auto">
            {/* Gold Animated Title */}
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent animate-pulse">
                {id ? "✨ Modifier Rendez-vous ✨" : "📅 Nouveau Rendez-vous 📅"}
              </h1>
              <p className="text-gray-600 text-lg">
                {id ? "Mettez à jour toutes les informations du rendez-vous" : "Créez un nouveau rendez-vous médical"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl overflow-hidden">
              {/* Section 1: Sélection du Patient */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaUser className="text-3xl" />
                  <h2 className="text-2xl font-bold">Sélection du Patient</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="group">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FaUser className="text-blue-500" />
                      Patient <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewPatient(!isNewPatient);
                        if (!isNewPatient) {
                          setForm({ ...form, patient: "" });
                        } else {
                          setNewPatientName("");
                        }
                      }}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                    >
                      <FaUserPlus />
                      {isNewPatient ? "Patient existant" : "Nouveau patient"}
                    </button>
                  </div>
                  
                  {isNewPatient ? (
                    <>
                      <input
                        type="text"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        placeholder="Écrire le nom complet du nouveau patient"
                        required
                        className="w-full px-4 py-3 border-2 border-indigo-300 bg-indigo-50 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">💡 Pour un patient de première visite</p>
                    </>
                  ) : (
                    <>
                      <select
                        name="patient"
                        value={form.patient}
                        onChange={handleChange}
                        required={!isNewPatient}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                      >
                        <option value="">Sélectionner un patient</option>
                        {patients.map((p) => (
                          <option key={p._id} value={p._id}>
                            👤 {p.nom} {p.prenom} - {p.telephone}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">💡 Choisissez le patient dans la liste</p>
                    </>
                  )}
                </div>
              </div>

              {/* Section 2: Praticien */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaUserMd className="text-3xl" />
                  <h2 className="text-2xl font-bold">Praticien</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaUserMd className="text-indigo-500" />
                    Praticien <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="praticien"
                    value={form.praticien}
                    onChange={handleChange}
                    placeholder="Nom du praticien"
                    required
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Ex: Dr. Dupont, Dr. Martin</p>
                </div>
              </div>

              {/* Section 3: Date & Heure */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaClock className="text-3xl" />
                  <h2 className="text-2xl font-bold">Date & Heure</h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaCalendarAlt className="text-purple-500" />
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Sélectionnez la date du rendez-vous</p>
                </div>

                {/* Heure */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaClock className="text-pink-500" />
                    Heure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="heure"
                    value={form.heure}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Ex: 14:30, 09:00</p>
                </div>
              </div>

              {/* Section 4: Détails du Rendez-vous */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaStethoscope className="text-3xl" />
                  <h2 className="text-2xl font-bold">Détails du Rendez-vous</h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Motif */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaNotesMedical className="text-teal-500" />
                    Motif <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="motif"
                    value={form.motif}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:ring-4 focus:ring-teal-300 focus:border-teal-500 transition-all"
                  >
                    <option value="">Sélectionner le motif</option>
                    <option value="Douleur">😣 Douleur</option>
                    <option value="Contrôle">🔍 Contrôle</option>
                    <option value="Consultation">🩺 Consultation</option>
                    <option value="Suivi">📋 Suivi</option>
                    <option value="Urgence">🚨 Urgence</option>
                    <option value="Esthétique">✨ Esthétique</option>
                    <option value="Autre">📌 Autre</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">💡 Raison de la consultation</p>
                </div>

                {/* Statut */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaCheckCircle className="text-cyan-500" />
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="statut"
                    value={form.statut}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
                  >
                    <option value="Prévu">📅 Prévu</option>
                    <option value="Terminé">✅ Terminé</option>
                    <option value="Annulé">❌ Annulé</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">💡 État actuel du rendez-vous</p>
                </div>
              </div>

              {/* Section 5: Coordonnées */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaPhone className="text-3xl" />
                  <h2 className="text-2xl font-bold">Coordonnées de Contact</h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GSM */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaPhone className="text-blue-500" />
                    Numéro GSM
                  </label>
                  <input
                    type="tel"
                    name="gsm"
                    value={form.gsm}
                    onChange={handleChange}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Numéro de téléphone mobile</p>
                </div>

                {/* WhatsApp */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaWhatsapp className="text-green-500" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Pour les rappels par WhatsApp</p>
                </div>
              </div>

              {/* Section 6: Notes */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <FaNotesMedical className="text-3xl" />
                  <h2 className="text-2xl font-bold">Notes Complémentaires</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaNotesMedical className="text-orange-500" />
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Notes additionnelles ou observations..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Informations complémentaires sur le rendez-vous</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Enregistrement en cours...
                      </>
                    ) : id ? (
                      <>
                        <FaEdit className="text-2xl" />
                        Mettre à Jour le Rendez-vous
                      </>
                    ) : (
                      <>
                        <FaSave className="text-2xl" />
                        Créer le Rendez-vous
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/appointments")}
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
