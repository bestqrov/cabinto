import { API_URL } from '../../config';
import { useState, useEffect } from "react";
import { PenTool, FileText, Clock, Send, FileDown, Link2, Bell, Archive, Loader, Trash2, Edit, Plus, X } from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import toast from "react-hot-toast";

interface Acte {
  date: string;
  acte: string;
  dent: string;
  code: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

interface FeuilleDeSoins {
  _id: string;
  patientId: any;
  actes: Acte[];
  diagnostic: string;
  traitementEffectue: string;
  observations: string;
  facturation: {
    montantTotal: number;
    partPatient: number;
    partAssurance: number;
    modePaiement: string;
    statutPaiement: string;
  };
  signature: {
    nomPraticien: string;
    dateSignature: string;
  };
  envoiPatient: boolean;
  rappelPaiement: boolean;
  createdAt: string;
}

export default function FeuilleDeSoinsForm() {
  const [form, setForm] = useState({
    patientId: "",
    acte: "",
    dent: "",
    diagnostic: "",
    observations: "",
    montantTotal: "",
    partPatient: "",
    partAssurance: "",
    modePaiement: "Espèces",
    statutPaiement: "En attente",
    nomPraticien: "",
    envoyerPatient: true,
    rappelPaiement: false,
  });
  
  const [feuilles, setFeuilles] = useState<FeuilleDeSoins[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  // Get user role
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const isSecretary = user?.role === "Receptionist";

  useEffect(() => {
    fetchFeuilles();
    fetchPatients();
  }, []);

  const fetchFeuilles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("${API_URL}/feuilles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setFeuilles(data.data || data);
        toast.success(`${data.data?.length || 0} feuille(s) chargée(s)`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("${API_URL}/patient", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setPatients(data.data || data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de chargement des patients");
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    const token = localStorage.getItem("token");
    const payload = {
      patientId: form.patientId,
      actes: [{
        date: new Date().toISOString(),
        acte: form.acte,
        dent: form.dent,
        code: "ACT001",
        quantite: 1,
        prixUnitaire: parseFloat(form.montantTotal) || 0,
        total: parseFloat(form.montantTotal) || 0
      }],
      diagnostic: form.diagnostic,
      observations: form.observations,
      facturation: {
        montantTotal: parseFloat(form.montantTotal) || 0,
        partPatient: parseFloat(form.partPatient) || 0,
        partAssurance: parseFloat(form.partAssurance) || 0,
        modePaiement: form.modePaiement,
        statutPaiement: form.statutPaiement
      },
      signature: {
        nomPraticien: form.nomPraticien,
        dateSignature: new Date().toISOString()
      },
      envoiPatient: form.envoyerPatient,
      rappelPaiement: form.rappelPaiement
    };

    try {
      const url = editingId 
        ? `${API_URL}/feuilles/${editingId}`
        : "${API_URL}/feuilles";
      
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? "Feuille modifiée avec succès" : "Feuille créée avec succès");
        fetchFeuilles();
        resetForm();
        setShowForm(false);
      } else {
        const data = await res.json();
        toast.error(data.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette feuille ?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/feuilles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Feuille supprimée");
        fetchFeuilles();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion");
    }
  };

  const handleEdit = (feuille: FeuilleDeSoins) => {
    setEditingId(feuille._id);
    setForm({
      patientId: feuille.patientId,
      acte: feuille.actes[0]?.acte || "",
      dent: feuille.actes[0]?.dent || "",
      diagnostic: feuille.diagnostic || "",
      observations: feuille.observations || "",
      montantTotal: feuille.facturation.montantTotal.toString(),
      partPatient: feuille.facturation.partPatient.toString(),
      partAssurance: feuille.facturation.partAssurance.toString(),
      modePaiement: feuille.facturation.modePaiement,
      statutPaiement: feuille.facturation.statutPaiement,
      nomPraticien: feuille.signature.nomPraticien,
      envoyerPatient: feuille.envoiPatient,
      rappelPaiement: feuille.rappelPaiement,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      patientId: "",
      acte: "",
      dent: "",
      diagnostic: "",
      observations: "",
      montantTotal: "",
      partPatient: "",
      partAssurance: "",
      modePaiement: "Espèces",
      statutPaiement: "En attente",
      nomPraticien: "",
      envoyerPatient: true,
      rappelPaiement: false,
    });
    setEditingId(null);
  };

  const totalFeuilles = feuilles.length;
  const feuillesPayees = feuilles.filter(f => f.facturation.statutPaiement === "Payé").length;
  const feuillesEnAttente = feuilles.filter(f => f.facturation.statutPaiement === "En attente").length;

  // Filter feuilles by month and year
  const filteredFeuilles = feuilles.filter((feuille) => {
    const feuilleDate = new Date(feuille.createdAt);
    const feuilleMonth = (feuilleDate.getMonth() + 1).toString();
    const feuilleYear = feuilleDate.getFullYear().toString();

    const monthMatch = !filterMonth || feuilleMonth === filterMonth;
    const yearMatch = !filterYear || feuilleYear === filterYear;

    return monthMatch && yearMatch;
  });

  // Get unique years from all feuilles
  const availableYears = [...new Set(feuilles.map(f => new Date(f.createdAt).getFullYear()))].sort((a, b) => b - a);

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Dossiers Médicaux
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="w-12 h-12 animate-spin text-pink-500" />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl shadow-lg p-6 border-2 border-pink-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-600 font-semibold text-sm mb-1">Total Feuilles</p>
                      <p className="text-3xl font-bold text-pink-700">{totalFeuilles}</p>
                    </div>
                    <FileText className="w-12 h-12 text-pink-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-semibold text-sm mb-1">Payées</p>
                      <p className="text-3xl font-bold text-green-700">{feuillesPayees}</p>
                    </div>
                    <Clock className="w-12 h-12 text-green-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-semibold text-sm mb-1">En Attente</p>
                      <p className="text-3xl font-bold text-blue-700">{feuillesEnAttente}</p>
                    </div>
                    <Bell className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Create Button - Hidden for Secretaries */}
              {!showForm && !isSecretary && (
                <div className="border-2 border-dashed border-pink-300 rounded-2xl p-8 bg-pink-50/50 hover:bg-pink-50 transition-colors cursor-pointer" onClick={() => setShowForm(true)}>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Plus className="w-16 h-16 text-pink-400" />
                    <p className="text-xl font-semibold text-pink-600">Créer une nouvelle Feuille de Soins</p>
                  </div>
                </div>
              )}

              {/* Form Section */}
              {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editingId ? "Modifier la Feuille" : "Nouvelle Feuille de Soins"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Liaison Patient */}
                    <section className="space-y-2">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-pink-500" />
                        Liaison Patient
                      </h2>
                      <select
                        name="patientId"
                        value={form.patientId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                      >
                        <option value="">Sélectionner un patient (CIN)</option>
                        {patients.map((patient) => (
                          <option key={patient._id} value={patient._id}>
                            {patient.cin} - {patient.nom} {patient.prenom}
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-500 italic">💡 Choisissez le patient par son numéro CIN</p>
                    </section>

                    {/* Acte Médical */}
                    <section className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-500" />
                        Acte Médical
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="acte"
                          value={form.acte}
                          onChange={handleChange}
                          placeholder="Acte"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        <input
                          type="text"
                          name="dent"
                          value={form.dent}
                          onChange={handleChange}
                          placeholder="Dent"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <textarea
                        name="diagnostic"
                        value={form.diagnostic}
                        onChange={handleChange}
                        placeholder="Diagnostic"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                      />
                      <textarea
                        name="observations"
                        value={form.observations}
                        onChange={handleChange}
                        placeholder="Observations"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                      />
                    </section>

                    {/* Facturation */}
                    <section className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        Facturation
                      </h2>
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="number"
                          name="montantTotal"
                          value={form.montantTotal}
                          onChange={handleChange}
                          placeholder="Montant Total"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                        <input
                          type="number"
                          name="partPatient"
                          value={form.partPatient}
                          onChange={handleChange}
                          placeholder="Part Patient"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                        <input
                          type="number"
                          name="partAssurance"
                          value={form.partAssurance}
                          onChange={handleChange}
                          placeholder="Part Assurance"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          name="modePaiement"
                          value={form.modePaiement}
                          onChange={handleChange}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="Espèces">Espèces</option>
                          <option value="Carte">Carte</option>
                          <option value="Chèque">Chèque</option>
                          <option value="Virement">Virement</option>
                        </select>
                        <select
                          name="statutPaiement"
                          value={form.statutPaiement}
                          onChange={handleChange}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="En attente">En attente</option>
                          <option value="Payé">Payé</option>
                          <option value="Partiel">Partiel</option>
                        </select>
                      </div>
                    </section>

                    {/* Signature */}
                    <section className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-pink-500" />
                        Signature
                      </h2>
                      <input
                        type="text"
                        name="nomPraticien"
                        value={form.nomPraticien}
                        onChange={handleChange}
                        placeholder="Nom du Praticien"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                      />
                    </section>

                    {/* Options */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="envoyerPatient"
                            checked={form.envoyerPatient}
                            onChange={handleChange}
                            className="w-5 h-5 text-pink-500 focus:ring-pink-500 rounded"
                          />
                          <span className="text-gray-700">Envoyer au patient</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="rappelPaiement"
                            checked={form.rappelPaiement}
                            onChange={handleChange}
                            className="w-5 h-5 text-pink-500 focus:ring-pink-500 rounded"
                          />
                          <span className="text-gray-700">Rappel paiement (via WhatsApp)</span>
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 italic mt-2">💡 Le rappel de paiement sera envoyé via WhatsApp si le patient a un numéro WhatsApp enregistré</p>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader className="w-5 h-5 animate-spin" />
                            Enregistrement...
                          </span>
                        ) : (
                          editingId ? "Modifier" : "Créer"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Feuilles List */}
              {!showForm && feuilles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Feuilles de Soins Enregistrées</h2>
                    
                    {/* Filter Controls */}
                    <div className="flex gap-3">
                      <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                      >
                        <option value="">Tous les mois</option>
                        <option value="1">Janvier</option>
                        <option value="2">Février</option>
                        <option value="3">Mars</option>
                        <option value="4">Avril</option>
                        <option value="5">Mai</option>
                        <option value="6">Juin</option>
                        <option value="7">Juillet</option>
                        <option value="8">Août</option>
                        <option value="9">Septembre</option>
                        <option value="10">Octobre</option>
                        <option value="11">Novembre</option>
                        <option value="12">Décembre</option>
                      </select>
                      
                      <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                      >
                        <option value="">Toutes les années</option>
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredFeuilles.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-lg text-gray-500">Aucune feuille trouvée pour cette période</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">{filteredFeuilles.length} feuille(s) trouvée(s)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFeuilles.map((feuille) => (
                      <div key={feuille._id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-pink-200 transition-colors">
                        {/* Patient Info */}
                        <div className="mb-4 pb-4 border-b">
                          <p className="text-sm text-gray-500 mb-1">Patient</p>
                          <p className="font-semibold text-gray-800">
                            {feuille.patientId?.nom} {feuille.patientId?.prenom}
                          </p>
                          <p className="text-sm text-gray-600">{feuille.patientId?.telephone}</p>
                        </div>

                        {/* Actes */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Actes</p>
                          <div className="space-y-2">
                            {feuille.actes.map((acte, idx) => (
                              <div key={idx} className="bg-purple-50 rounded-lg p-3">
                                <p className="font-semibold text-purple-700">{acte.acte}</p>
                                <p className="text-sm text-purple-600">Dent: {acte.dent || "N/A"}</p>
                                <p className="text-sm text-purple-600">{acte.total} MAD</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Facturation */}
                        <div className="mb-4 bg-indigo-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-600">Total</p>
                              <p className="font-bold text-indigo-700">{feuille.facturation.montantTotal} MAD</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Patient</p>
                              <p className="font-semibold text-indigo-600">{feuille.facturation.partPatient} MAD</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Assurance</p>
                              <p className="font-semibold text-indigo-600">{feuille.facturation.partAssurance} MAD</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Mode</p>
                              <p className="font-semibold text-indigo-600">{feuille.facturation.modePaiement}</p>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            feuille.facturation.statutPaiement === "Payé" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {feuille.facturation.statutPaiement}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(feuille)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(feuille._id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!showForm && feuilles.length === 0 && (
                <div className="text-center py-12">
                  <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">Aucune feuille de soins enregistrée</p>
                  <p className="text-gray-400 mt-2">Cliquez sur le bouton ci-dessus pour créer votre première feuille</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
