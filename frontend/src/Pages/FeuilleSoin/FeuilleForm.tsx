import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSettings } from "../../contexts/SettingsContext";
import { 
  FaFileAlt,
  FaUser,
  FaSave,
  FaTimes,
  FaBars,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaPrescriptionBottle,
  FaBoxes,
  FaTruck,
  FaCog,
  FaPlus,
  FaTrash,
  FaTooth,
  FaMoneyBillWave,
  FaNotesMedical
} from "react-icons/fa";
import { MdDashboard } from 'react-icons/md';

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
}

interface Acte {
  acteNom: string;
  prix: number;
  zone: string;
}

export default function FeuilleForm() {
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [form, setForm] = useState({
    patientId: "",
    dateSoin: "",
    diagnostic: "",
    priseEnCharge: false,
    assurance: "",
    tauxRemboursement: 0,
    notes: "",
  });

  const [actes, setActes] = useState<Acte[]>([]);
  const [currentActe, setCurrentActe] = useState<Acte>({
    acteNom: "",
    prix: 0,
    zone: "",
  });

  useEffect(() => {
    fetchPatients();
    if (id) {
      fetchFeuille();
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

  const fetchFeuille = async () => {
    try {
      const res = await fetch(`${API_URL}/feuilles/${id}`);
      const data = await res.json();

      if (data.success) {
        setForm({
          patientId: data.data.patientId._id,
          dateSoin: data.data.dateSoin.split('T')[0],
          diagnostic: data.data.diagnostic || "",
          priseEnCharge: data.data.priseEnCharge,
          assurance: data.data.assurance || "",
          tauxRemboursement: data.data.tauxRemboursement || 0,
          notes: data.data.notes || "",
        });
        setActes(data.data.procedures || []);
      } else {
        toast.error("Erreur lors du chargement");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleActeChange = (e: any) => {
    const { name, value } = e.target;
    setCurrentActe({ 
      ...currentActe, 
      [name]: name === 'prix' ? parseFloat(value) || 0 : value 
    });
  };

  const addActe = () => {
    if (!currentActe.procedureNom || currentActe.prix <= 0) {
      toast.error("Veuillez remplir le nom et le prix de l'acte");
      return;
    }

    setActes([...procedures, currentActe]);
    setCurrentActe({ acteNom: "", prix: 0, zone: "" });
    toast.success("Acte ajouté");
  };

  const removeActe = (index: number) => {
    setActes(actes.filter((_, i) => i !== index));
    toast.success("Acte supprimé");
  };

  const calculateTotal = () => {
    return actes.reduce((sum, acte) => sum + acte.prix, 0);
  };

  const calculateRemboursement = () => {
    if (!form.priseEnCharge || form.tauxRemboursement <= 0) return 0;
    return (calculateTotal() * form.tauxRemboursement) / 100;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (actes.length === 0) {
      toast.error("Veuillez ajouter au moins un acte");
      return;
    }

    setLoading(true);

    try {
      const url = id
        ? `${API_URL}/feuilles/${id}`
        : "${API_URL}/feuilles";

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          actes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        navigate("/feuilles");
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
                <span className="font-bold text-lg">{settings.name || "Zoneal Clinic"}</span>
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
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-md">
                <FaFileAlt className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {id ? "Modifier Feuille de Soin" : "Nouvelle Feuille de Soin"}
                </h1>
                <p className="text-sm text-gray-500">
                  {id ? "Mettre à jour les informations" : "Créer une nouvelle feuille de soin"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50 p-6">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations Générales */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-pink-500">
                  <FaUser className="text-2xl text-pink-600" />
                  <h2 className="text-xl font-bold text-gray-800">Informations Générales</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="text-pink-500" />
                      Patient *
                    </label>
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un patient</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.nom} {p.prenom} - {p.telephone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date du Soin */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaCalendarAlt className="text-green-500" />
                      Date du Soin *
                    </label>
                    <input
                      type="date"
                      name="dateSoin"
                      value={form.dateSoin}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Diagnostic */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaNotesMedical className="text-blue-500" />
                      Diagnostic
                    </label>
                    <input
                      type="text"
                      name="diagnostic"
                      value={form.diagnostic}
                      onChange={handleChange}
                      placeholder="Ex: Consultation, Soins..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Actes Médicaux */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-pink-500">
                  <FaTooth className="text-2xl text-pink-600" />
                  <h2 className="text-xl font-bold text-gray-800">Actes Médicaux</h2>
                </div>

                {/* Ajouter un Acte */}
                <div className="bg-pink-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-700 mb-4">Ajouter un acte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        name="acteNom"
                        value={currentActe.procedureNom}
                        onChange={handleActeChange}
                        placeholder="Nom de l'acte *"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="prix"
                        value={currentActe.prix || ""}
                        onChange={handleActeChange}
                        placeholder="Prix (MAD) *"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="zone"
                        value={currentActe.zone}
                        onChange={handleActeChange}
                        placeholder="Zone (optionnel)"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addActe}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all font-semibold"
                  >
                    <FaPlus />
                    Ajouter l'acte
                  </button>
                </div>

                {/* Liste des Actes */}
                {actes.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Acte</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Prix (MAD)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Zone</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actes.map((acte, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-pink-50">
                            <td className="px-4 py-3 text-gray-800">{acte.procedureNom}</td>
                            <td className="px-4 py-3 font-semibold text-green-600">{acte.prix.toFixed(2)}</td>
                            <td className="px-4 py-3 text-gray-600">{acte.zone || "-"}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeActe(index)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-pink-100">
                          <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-800 text-lg">
                            Total
                          </td>
                          <td className="px-4 py-4 font-bold text-green-600 text-xl text-center">
                            {calculateTotal().toFixed(2)} MAD
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Assurance */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-pink-500">
                  <FaMoneyBillWave className="text-2xl text-pink-600" />
                  <h2 className="text-xl font-bold text-gray-800">Assurance & Remboursement</h2>
                </div>

                <div className="space-y-6">
                  {/* Prise en Charge */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="priseEnCharge"
                      checked={form.priseEnCharge}
                      onChange={handleChange}
                      className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <label className="font-semibold text-gray-700">Prise en charge par assurance</label>
                  </div>

                  {form.priseEnCharge && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 rounded-xl p-6">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Nom de l'assurance
                        </label>
                        <input
                          type="text"
                          name="assurance"
                          value={form.assurance}
                          onChange={handleChange}
                          placeholder="Ex: CNSS, CNOPS..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Taux de remboursement (%)
                        </label>
                        <input
                          type="number"
                          name="tauxRemboursement"
                          value={form.tauxRemboursement}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          placeholder="Ex: 70"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <div className="md:col-span-2 bg-white rounded-lg p-4 border-2 border-blue-300">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Montant Remboursé:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {calculateRemboursement().toFixed(2)} MAD
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-pink-500">
                  <FaNotesMedical className="text-2xl text-pink-600" />
                  <h2 className="text-xl font-bold text-gray-800">Notes</h2>
                </div>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Notes additionnelles..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  <FaSave className="text-xl" />
                  {loading ? "Enregistrement..." : (id ? "Mettre à Jour" : "Créer Feuille de Soin")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/feuilles")}
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
