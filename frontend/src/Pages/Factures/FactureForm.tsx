import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaFileInvoiceDollar,
  FaUser,
  FaSave,
  FaTimes,
  FaBars,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaPrescriptionBottle,
  FaBoxes,
  FaTruck,
  FaCog,
  FaPlus,
  FaTrash,
  FaTooth,
  FaMoneyBillWave,
  FaUpload,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

import { useSettings } from "../../contexts/SettingsContext";

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
}

interface Prestation {
  procedure: string;
  zone: string;
  prixUnitaire: number;
  quantite: number;
  total: number;
}

const ACTES_MEDICAUX = [
  "Consultation",
  "Consultation spécialisée",
  "Suivi médical",
  "Soins infirmiers",
  "Acte technique",
  "Analyse / Bilan",
  "Radiographie",
  "Échographie",
  "Injection / Perfusion",
  "Petite chirurgie",
  "Rééducation",
  "Autre",
];

export default function FactureForm() {
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [form, setForm] = useState({
    patientId: "",
    dateFacture: new Date().toISOString().split("T")[0],
    modePaiement: "Espèces",
    montantVerse: 0,
    TVA: 0,
    numeroCheque: "",
    dateCheque: "",
    notes: "",
  });

  const [fichierTracabilite, setFichierTracabilite] = useState<File | null>(null);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [currentPrestation, setCurrentPrestation] = useState<Prestation>({
    procedure: "",
    zone: "",
    prixUnitaire: 0,
    quantite: 1,
    total: 0,
  });

  // Calculs automatiques
  const totalHT = prestations.reduce((sum, p) => sum + p.total, 0);
  const totalTTC = totalHT + form.TVA;
  const resteAPayer = totalTTC - form.montantVerse;

  useEffect(() => {
    fetchPatients();
    if (id) {
      fetchFacture();
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

  const fetchFacture = async () => {
    try {
      const res = await fetch(`${API_URL}/factures/${id}`);
      const data = await res.json();

      if (data.success) {
        setForm({
          patientId: data.data.patientId._id,
          dateFacture: data.data.dateFacture.split("T")[0],
          modePaiement: data.data.modePaiement,
          montantVerse: data.data.montantVerse,
          TVA: data.data.TVA,
          numeroCheque: data.data.numeroCheque || "",
          dateCheque: data.data.dateCheque ? data.data.dateCheque.split("T")[0] : "",
          notes: data.data.notes || "",
        });
        setPrestations(data.data.prestations || []);
      } else {
        toast.error("Erreur lors du chargement");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "montantVerse" || name === "TVA" ? parseFloat(value) || 0 : value });
  };

  const handlePrestationChange = (e: any) => {
    const { name, value } = e.target;
    const newValue = name === "prixUnitaire" || name === "quantite" ? parseFloat(value) || 0 : value;
    
    const updated = { ...currentPrestation, [name]: newValue };
    
    // Calcul automatique du total
    if (name === "prixUnitaire" || name === "quantite") {
      updated.total = updated.prixUnitaire * updated.quantite;
    }
    
    setCurrentPrestation(updated);
  };

  const addPrestation = () => {
    if (!currentPrestation.procedure) {
      toast.error("Veuillez sélectionner une prestation");
      return;
    }
    if (currentPrestation.prixUnitaire <= 0) {
      toast.error("Le prix unitaire doit être supérieur à 0");
      return;
    }

    setPrestations([...prestations, currentPrestation]);
    setCurrentPrestation({
      procedure: "",
      zone: "",
      prixUnitaire: 0,
      quantite: 1,
      total: 0,
    });
    toast.success("Prestation ajoutée");
  };

  const removePrestation = (index: number) => {
    setPrestations(prestations.filter((_, i) => i !== index));
    toast.success("Prestation supprimée");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (prestations.length === 0) {
      toast.error("Veuillez ajouter au moins une prestation");
      return;
    }

    // Validation selon le mode de paiement
    if (form.modePaiement === "Chèque") {
      if (!form.numeroCheque || !form.dateCheque) {
        toast.error("Le numéro et la date du chèque sont requis");
        return;
      }
    }

    if ((form.modePaiement === "Carte" || form.modePaiement === "Virement") && !fichierTracabilite && !id) {
      toast.error("Veuillez uploader le fichier de traçabilité");
      return;
    }

    setLoading(true);

    try {
      const url = id
        ? `${API_URL}/factures/${id}`
        : "${API_URL}/factures";

      const method = id ? "PUT" : "POST";

      // Utiliser FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append("patientId", form.patientId);
      formData.append("dateFacture", form.dateFacture);
      formData.append("modePaiement", form.modePaiement);
      formData.append("montantVerse", form.montantVerse.toString());
      formData.append("TVA", form.TVA.toString());
      formData.append("notes", form.notes);
      formData.append("prestations", JSON.stringify(prestations));

      if (form.modePaiement === "Chèque") {
        formData.append("numeroCheque", form.numeroCheque);
        formData.append("dateCheque", form.dateCheque);
      }

      if (fichierTracabilite) {
        formData.append("fichierTracabilite", fichierTracabilite);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        navigate("/factures");
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
    { icon: <FaFileInvoiceDollar className="text-lg" />, title: "Factures", link: "/factures", color: "text-blue-500" },
    { icon: <FaPrescriptionBottle className="text-lg" />, title: "Ordonnances", link: "/ordonnances", color: "text-rose-500" },
    { icon: <FaBoxes className="text-lg" />, title: "Inventaire", link: "/inventory", color: "text-red-500" },
    { icon: <FaTruck className="text-lg" />, title: "Fournisseurs", link: "/suppliers", color: "text-indigo-500" },
  ];

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}
      >
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
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <FaFileInvoiceDollar className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {id ? "Modifier Facture" : "Nouvelle Facture"}
                </h1>
                <p className="text-sm text-gray-500">
                  {id ? "Mettre à jour la facture" : "Créer une nouvelle facture"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations Générales */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-500">
                  <FaUser className="text-2xl text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Informations Facture</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="text-blue-500" />
                      Patient *
                    </label>
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un patient</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.nom} {p.prenom} - {p.telephone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaCalendarAlt className="text-green-500" />
                      Date de la Facture
                    </label>
                    <input
                      type="date"
                      name="dateFacture"
                      value={form.dateFacture}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaMoneyBillWave className="text-green-500" />
                      Mode de Paiement
                    </label>
                    <select
                      name="modePaiement"
                      value={form.modePaiement}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Espèces">Espèces</option>
                      <option value="Carte">Carte Bancaire</option>
                      <option value="Virement">Virement</option>
                      <option value="Chèque">Chèque</option>
                      <option value="Non payé">Non payé</option>
                    </select>
                  </div>

                  {/* Champs conditionnels pour Chèque */}
                  {form.modePaiement === "Chèque" && (
                    <>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          Numéro de Chèque *
                        </label>
                        <input
                          type="text"
                          name="numeroCheque"
                          value={form.numeroCheque}
                          onChange={handleChange}
                          required
                          placeholder="Ex: 1234567"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          Date du Chèque *
                        </label>
                        <input
                          type="date"
                          name="dateCheque"
                          value={form.dateCheque}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </>
                  )}

                  {/* Champ conditionnel pour Carte Bancaire et Virement */}
                  {(form.modePaiement === "Carte" || form.modePaiement === "Virement") && (
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        Fichier de Traçabilité (Preuve de paiement) *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFichierTracabilite(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formats acceptés: Images (JPG, PNG) ou PDF
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prestations */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-500">
                  <FaTooth className="text-2xl text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Prestations Médicales</h2>
                </div>

                {/* Ajouter une Prestation */}
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-700 mb-4">Ajouter une prestation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <select
                        name="procedure"
                        value={currentPrestation.procedure}
                        onChange={handlePrestationChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une prestation *</option>
                        {ACTES_MEDICAUX.map((acte, idx) => (
                          <option key={idx} value={acte}>
                            {acte}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="zone"
                        value={currentPrestation.zone}
                        onChange={handlePrestationChange}
                        placeholder="Dent (ex: 16)"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="prixUnitaire"
                        value={currentPrestation.prixUnitaire || ""}
                        onChange={handlePrestationChange}
                        placeholder="Prix (DH)"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="quantite"
                        value={currentPrestation.quantite || ""}
                        onChange={handlePrestationChange}
                        placeholder="Qté"
                        min="1"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-semibold text-blue-600">
                      Total: {currentPrestation.total.toFixed(2)} DH
                    </div>
                    <button
                      type="button"
                      onClick={addPrestation}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                    >
                      <FaPlus />
                      Ajouter la prestation
                    </button>
                  </div>
                </div>

                {/* Liste des Prestations */}
                {prestations.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Acte</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Dent</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Prix Unit.</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Qté</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prestations.map((prestation, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-blue-50">
                            <td className="px-4 py-3 font-semibold text-gray-800">
                              {prestation.procedure}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{prestation.zone || "-"}</td>
                            <td className="px-4 py-3 text-right text-gray-600">
                              {prestation.prixUnitaire.toFixed(2)} DH
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {prestation.quantite}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-blue-600">
                              {prestation.total.toFixed(2)} DH
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removePrestation(index)}
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

              {/* Totaux et Paiement */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-500">
                  <FaMoneyBillWave className="text-2xl text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Totaux et Paiement</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      TVA (DH)
                    </label>
                    <input
                      type="number"
                      name="TVA"
                      value={form.TVA || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Montant Versé (DH)
                    </label>
                    <input
                      type="number"
                      name="montantVerse"
                      value={form.montantVerse || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Notes additionnelles..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total HT:</span>
                      <span className="text-xl font-bold text-gray-800">
                        {totalHT.toFixed(2)} DH
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">TVA:</span>
                      <span className="text-xl font-bold text-gray-800">
                        {form.TVA.toFixed(2)} DH
                      </span>
                    </div>
                    <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                      <span className="text-blue-700 font-bold text-lg">Total TTC:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {totalTTC.toFixed(2)} DH
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Montant Versé:</span>
                      <span className="text-xl font-bold text-green-600">
                        {form.montantVerse.toFixed(2)} DH
                      </span>
                    </div>
                    <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                      <span className="text-red-700 font-bold text-lg">Reste à Payer:</span>
                      <span
                        className={`text-2xl font-bold ${
                          resteAPayer > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {resteAPayer.toFixed(2)} DH
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  <FaSave className="text-xl" />
                  {loading ? "Enregistrement..." : id ? "Mettre à Jour" : "Créer Facture"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/factures")}
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
