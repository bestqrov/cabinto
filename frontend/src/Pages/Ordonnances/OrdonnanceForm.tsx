import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaPrescriptionBottle,
  FaUser,
  FaSave,
  FaTimes,
  FaBars,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaFileInvoiceDollar,
  FaBoxes,
  FaTruck,
  FaCog,
  FaPlus,
  FaTrash,
  FaPills,
  FaNotesMedical
} from "react-icons/fa";
import { MdDashboard } from 'react-icons/md';
import { useSettings } from "../../contexts/SettingsContext";

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
}

interface Medicament {
  nom: string;
  dosage: string;
  frequence: string;
  duree: string;
  notes: string;
}

const MEDICAMENTS_DENTAIRES = [
  "Amoxicilline 1g",
  "Augmentin 1g",
  "Metronidazole 500mg",
  "Céphalexine 500mg",
  "Azithromycine 500mg",
  "Ibuprofène 400mg",
  "Paracétamol 1g",
  "Ketoprofène 100mg",
  "Diclofénac 50mg",
  "Nifluril",
  "Arnica montana 9CH",
  "Corsodyl (Chlorhexidine 0.12%)",
  "Méthylprednisolone 16mg",
  "Prednisone 20mg",
  "Oméprazole 20mg",
  "Tramadol 50mg",
  "Codéine 30mg",
  "Autre (à préciser)",
];

export default function OrdonnanceForm() {
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState({
    patientId: "",
    dateOrdonnance: "",
    instructionGenerale: "",
    signatureMedecin: "Dr. ",
  });
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [currentMed, setCurrentMed] = useState<Medicament>({
    nom: "",
    dosage: "",
    frequence: "",
    duree: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchOrdonnance();
    }
    fetchPatients();
    // eslint-disable-next-line
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

  const fetchOrdonnance = async () => {
    try {
      const res = await fetch(`${API_URL}/ordonnances/${id}`);
      const data = await res.json();

      if (data.success) {
        setForm({
          patientId: data.data.patientId._id,
          dateOrdonnance: data.data.dateOrdonnance.split('T')[0],
          instructionGenerale: data.data.instructionGenerale || "",
          signatureMedecin: data.data.signatureMedecin || "Dr. ",
        });
        setMedicaments(data.data.medicaments || []);
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

  const handleMedChange = (e: any) => {
    setCurrentMed({ ...currentMed, [e.target.name]: e.target.value });
  };

  const addMedicament = () => {
    if (!currentMed.nom) {
      toast.error("Veuillez sélectionner un médicament");
      return;
    }

    setMedicaments([...medicaments, currentMed]);
    setCurrentMed({
      nom: "",
      dosage: "",
      frequence: "",
      duree: "",
      notes: "",
    });
    toast.success("Médicament ajouté");
  };

  const removeMedicament = (index: number) => {
    setMedicaments(medicaments.filter((_, i) => i !== index));
    toast.success("Médicament supprimé");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (medicaments.length === 0) {
      toast.error("Veuillez ajouter au moins un médicament");
      return;
    }

    setLoading(true);

    try {
      const url = id
        ? `${API_URL}/ordonnances/${id}`
        : "${API_URL}/ordonnances";

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          medicaments,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        navigate("/ordonnances");
      } else {
        toast.error(data.message);
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
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-md">
                <FaPrescriptionBottle className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {id ? "Modifier Ordonnance" : "Nouvelle Ordonnance"}
                </h1>
                <p className="text-sm text-gray-500">
                  {id ? "Mettre à jour la prescription" : "Créer une nouvelle prescription médicale"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-rose-50 to-pink-50 p-6">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations Générales */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-rose-500">
                  <FaUser className="text-2xl text-rose-600" />
                  <h2 className="text-xl font-bold text-gray-800">Informations Patient</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="text-rose-500" />
                      Patient *
                    </label>
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un patient</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.nom} {p.prenom} - {p.telephone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaCalendarAlt className="text-green-500" />
                      Date de l'Ordonnance
                    </label>
                    <input
                      type="date"
                      name="dateOrdonnance"
                      value={form.dateOrdonnance}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Signature */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaUserMd className="text-blue-500" />
                      Signature Médecin
                    </label>
                    <input
                      type="text"
                      name="signatureMedecin"
                      value={form.signatureMedecin}
                      onChange={handleChange}
                      placeholder="Dr. Nom du médecin"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Médicaments */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-rose-500">
                  <FaPills className="text-2xl text-rose-600" />
                  <h2 className="text-xl font-bold text-gray-800">Médicaments</h2>
                </div>

                {/* Ajouter un Médicament */}
                <div className="bg-rose-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-700 mb-4">Ajouter un médicament</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <select
                        name="nom"
                        value={currentMed.nom}
                        onChange={handleMedChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">Sélectionner un médicament *</option>
                        {MEDICAMENTS_DENTAIRES.map((med, idx) => (
                          <option key={idx} value={med}>{med}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="dosage"
                        value={currentMed.dosage}
                        onChange={handleMedChange}
                        placeholder="Dosage (ex: 1 comprimé)"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="frequence"
                        value={currentMed.frequence}
                        onChange={handleMedChange}
                        placeholder="Fréquence (ex: 3 fois/jour)"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="duree"
                        value={currentMed.duree}
                        onChange={handleMedChange}
                        placeholder="Durée (ex: 7 jours)"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="notes"
                        value={currentMed.notes}
                        onChange={handleMedChange}
                        placeholder="Notes (ex: Avant repas)"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addMedicament}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all font-semibold"
                  >
                    <FaPlus />
                    Ajouter le médicament
                  </button>
                </div>

                {/* Liste des Médicaments */}
                {medicaments.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Médicament</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Dosage</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Fréquence</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Durée</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Notes</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicaments.map((med, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-rose-50">
                            <td className="px-4 py-3 font-semibold text-gray-800">{med.nom}</td>
                            <td className="px-4 py-3 text-gray-600">{med.dosage || "-"}</td>
                            <td className="px-4 py-3 text-gray-600">{med.frequence || "-"}</td>
                            <td className="px-4 py-3 text-gray-600">{med.duree || "-"}</td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{med.notes || "-"}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeMedicament(index)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-rose-500">
                  <FaNotesMedical className="text-2xl text-rose-600" />
                  <h2 className="text-xl font-bold text-gray-800">Instructions Générales</h2>
                </div>

                <textarea
                  name="instructionGenerale"
                  value={form.instructionGenerale}
                  onChange={handleChange}
                  placeholder="Instructions générales pour le patient..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  <FaSave className="text-xl" />
                  {loading ? "Enregistrement..." : (id ? "Mettre à Jour" : "Créer Ordonnance")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/ordonnances")}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold flex items-center gap-2"
                >
                  <FaTimes />
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
