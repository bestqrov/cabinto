import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUser,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaPrescriptionBottle,
  FaBoxes,
  FaTruck,
  FaCog,
  FaBars,
  FaFileAlt,
  FaShare,
  FaTimes,
  FaTooth,
  FaPlus,
  FaTrash,
  FaSave,
  FaNotesMedical,
  FaMoneyBillWave,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaHospital,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import logo from "../../images/logo.avif";

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  dateNaissance: string;
  cin: string;
  adresse: string;
  groupeSanguin: string;
}

interface Acte {
  code: string;
  nom: string;
  description: string;
  zone: string;
  surface: string;
  prixUnitaire: number;
  quantite: number;
}

function FeuilleFormNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [form, setForm] = useState({
    patientId: "",
    dateSoin: new Date().toISOString().split('T')[0],
    
    // Cabinet Info
    cabinetNom: "",
    cabinetAdresse: "",
    cabinetTelephone: "",
    cabinetEmail: "",
    
    // Résumé Médical
    diagnostic: "",
    antecedents: "",
    allergies: "",
    traitementsEnCours: "",
    observations: "",
    
    // Facturation
    priseEnCharge: false,
    assurance: "",
    numeroAssurance: "",
    tauxRemboursement: 0,
    modePaiement: "Espèces",
    statut: "Non payé",
    
    // Notes
    notes: "",
    
    // Statut global
    statutGlobal: "Brouillon",
  });

  const [actes, setActes] = useState<Acte[]>([]);
  const [currentActe, setCurrentActe] = useState<Acte>({
    code: "",
    nom: "",
    description: "",
    zone: "",
    surface: "",
    prixUnitaire: 0,
    quantite: 1,
  });

  useEffect(() => {
    fetchPatients();
    loadCabinetInfo();
    if (id) {
      fetchFeuille();
    }
  }, [id]);

  const loadCabinetInfo = async () => {
    try {
      const res = await fetch("${API_URL}/settings/cabinet");
      const data = await res.json();
      if (data) {
        setForm(prev => ({
          ...prev,
          cabinetNom: data.name || "",
          cabinetAdresse: data.address || "",
          cabinetTelephone: data.phone || "",
          cabinetEmail: data.email || "",
        }));
      }
    } catch {
      console.log("Cabinet info not loaded");
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("${API_URL}/patient", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        const feuille = data.data;
        setForm({
          patientId: feuille.patientId._id,
          dateSoin: feuille.dateSoin.split('T')[0],
          cabinetNom: feuille.cabinetInfo?.nom || "",
          cabinetAdresse: feuille.cabinetInfo?.adresse || "",
          cabinetTelephone: feuille.cabinetInfo?.telephone || "",
          cabinetEmail: feuille.cabinetInfo?.email || "",
          diagnostic: feuille.resumeMedical?.diagnostic || "",
          antecedents: feuille.resumeMedical?.antecedents || "",
          allergies: feuille.resumeMedical?.allergies || "",
          traitementsEnCours: feuille.resumeMedical?.traitementsEnCours || "",
          observations: feuille.resumeMedical?.observations || "",
          priseEnCharge: feuille.facturation?.priseEnCharge || false,
          assurance: feuille.facturation?.assurance || "",
          numeroAssurance: feuille.facturation?.numeroAssurance || "",
          tauxRemboursement: feuille.facturation?.tauxRemboursement || 0,
          modePaiement: feuille.facturation?.modePaiement || "Espèces",
          statut: feuille.facturation?.statut || "Non payé",
          notes: feuille.notes || "",
          statutGlobal: feuille.statut || "Brouillon",
        });
        setActes(feuille.procedures || []);
        
        if (feuille.patientId) {
          setSelectedPatient(feuille.patientId);
        }
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const handlePatientChange = (patientId: string) => {
    setForm({ ...form, patientId });
    const patient = patients.find(p => p._id === patientId);
    setSelectedPatient(patient || null);
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
      [name]: name === 'prixUnitaire' || name === 'quantite' ? parseFloat(value) || 0 : value
    });
  };

  const addActe = () => {
    if (!currentActe.nom || currentActe.prixUnitaire <= 0) {
      toast.error("Veuillez remplir le nom et le prix de l'acte");
      return;
    }

    setActes([...procedures, currentActe]);
    setCurrentActe({
      code: "",
      nom: "",
      description: "",
      zone: "",
      surface: "",
      prixUnitaire: 0,
      quantite: 1,
    });
    toast.success("Acte ajouté");
  };

  const removeActe = (index: number) => {
    setActes(actes.filter((_, i) => i !== index));
    toast.success("Acte supprimé");
  };

  const calculateTotal = () => {
    return actes.reduce((sum, acte) => sum + (acte.prixUnitaire * acte.quantite), 0);
  };

  const calculateRemboursement = () => {
    if (!form.priseEnCharge || form.tauxRemboursement <= 0) return 0;
    return (calculateTotal() * form.tauxRemboursement) / 100;
  };

  const calculateMontantPatient = () => {
    return calculateTotal() - calculateRemboursement();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error("Veuillez sélectionner un patient");
      return;
    }

    if (actes.length === 0) {
      toast.error("Veuillez ajouter au moins un acte");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      const payload = {
        patientId: form.patientId,
        dateSoin: form.dateSoin,
        cabinetInfo: {
          nom: form.cabinetNom,
          adresse: form.cabinetAdresse,
          telephone: form.cabinetTelephone,
          email: form.cabinetEmail,
        },
        patientInfo: {
          nom: selectedPatient.nom,
          prenom: selectedPatient.prenom,
          dateNaissance: selectedPatient.dateNaissance,
          cin: selectedPatient.cin,
          telephone: selectedPatient.telephone,
          email: selectedPatient.email,
          adresse: selectedPatient.adresse,
          groupeSanguin: selectedPatient.groupeSanguin,
        },
        actes: actes,
        resumeMedical: {
          diagnostic: form.diagnostic,
          antecedents: form.antecedents,
          allergies: form.allergies,
          traitementsEnCours: form.traitementsEnCours,
          observations: form.observations,
        },
        facturation: {
          priseEnCharge: form.priseEnCharge,
          assurance: form.assurance,
          numeroAssurance: form.numeroAssurance,
          tauxRemboursement: form.tauxRemboursement,
          modePaiement: form.modePaiement,
          statut: form.statut,
        },
        notes: form.notes,
        statut: form.statutGlobal,
        auditLog: [{
          action: id ? "Modification" : "Création",
          utilisateur: user?.fullname || "Inconnu",
          date: new Date(),
          details: `Feuille de soin ${id ? 'modifiée' : 'créée'} par ${user?.fullname}`,
        }],
      };

      const url = id
        ? `${API_URL}/feuilles/${id}`
        : "${API_URL}/feuilles";

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
    { icon: <MdDashboard />, title: "Tableau de bord", link: "/dashboard", color: "text-blue-500" },
    { icon: <FaUsers />, title: "Patients", link: "/patients", color: "text-green-500" },
    { icon: <FaUserMd />, title: "Personnel", link: "/personnel/create", color: "text-cyan-500" },
    { icon: <FaCalendarAlt />, title: "Rendez-vous", link: "/appointments", color: "text-purple-500" },
    { icon: <FaPrescriptionBottle />, title: "Ordonnances", link: "/ordonnances", color: "text-pink-500" },
    { icon: <FaFileAlt />, title: "Dossiers Médicaux", link: "/medical-files", color: "text-teal-500" },
    { icon: <FaTruck />, title: "Fournisseurs", link: "/supplier", color: "text-indigo-500" },
    { icon: <FaFileInvoiceDollar />, title: "Factures", link: "/factures", color: "text-yellow-500" },
    { icon: <FaBoxes />, title: "Stock", link: "/inventory", color: "text-red-500" },
    { icon: <FaShare />, title: "SMM", link: "/smm", color: "text-blue-400" },
    { icon: <FaCog />, title: "Paramètres", link: "/settings", color: "text-gray-500" },
  ];

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <img src={logo} alt="Zoneal Clinic" className="w-10 h-10 rounded-lg object-cover" />
                <span className="font-bold text-lg">ZoneiSsra</span>
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
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
              <FaTooth className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {id ? "Modifier Feuille de Soin" : "Nouvelle Feuille de Soin"}
              </h1>
              <p className="text-sm text-gray-500">
                {id ? "Mettre à jour les informations médicales" : "Créer un nouveau document de soins"}
              </p>
            </div>
          </div>
        </header>

        {/* Form Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations Cabinet & Patient */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FaHospital className="text-pink-600" size={28} />
              Informations Générales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cabinet Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 text-lg border-b pb-2 flex items-center gap-2">
                  <FaHospital className="text-pink-600" />
                  Cabinet
                </h3>
                <input
                  type="text"
                  name="cabinetNom"
                  value={form.cabinetNom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  placeholder="Nom du cabinet"
                />
                <input
                  type="text"
                  name="cabinetTelephone"
                  value={form.cabinetTelephone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  placeholder="Téléphone"
                />
                <input
                  type="email"
                  name="cabinetEmail"
                  value={form.cabinetEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  placeholder="contact@cabinet.ma"
                />
                <input
                  type="text"
                  name="cabinetAdresse"
                  value={form.cabinetAdresse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  placeholder="Adresse complète"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informations Patient */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
              <FaUser className="text-2xl text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Informations Patient</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="text-pink-500" />
                  Sélectionner Patient *
                </label>
                <select
                  name="patientId"
                  value={form.patientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choisir un patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nom} {p.prenom} - {p.telephone}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">CIN</p>
                    <p className="font-semibold text-gray-800">{selectedPatient.cin || "N/A"}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Groupe Sanguin</p>
                    <p className="font-semibold text-gray-800">{selectedPatient.groupeSanguin || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-semibold text-gray-800">{selectedPatient.adresse || "N/A"}</p>
                  </div>
                </>
              )}

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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Actes Médicaux */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pink-500">
              <FaTooth className="text-2xl text-pink-600" />
              <h2 className="text-xl font-bold text-gray-800">Actes Médicaux</h2>
            </div>

            {/* Ajouter un Acte */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaPlus className="text-pink-600" />
                Ajouter un nouvel acte
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    name="code"
                    value={currentActe.code}
                    onChange={handleActeChange}
                    placeholder="Code (optionnel)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    name="nom"
                    value={currentActe.nom}
                    onChange={handleActeChange}
                    placeholder="Nom de l'acte *"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="lg:col-span-3">
                  <input
                    type="text"
                    name="description"
                    value={currentActe.description}
                    onChange={handleActeChange}
                    placeholder="Description (optionnel)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="zone"
                    value={currentActe.zone}
                    onChange={handleActeChange}
                    placeholder="N° Zone"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="surface"
                    value={currentActe.surface}
                    onChange={handleActeChange}
                    placeholder="Surface"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    name="quantite"
                    value={currentActe.quantite || ""}
                    onChange={handleActeChange}
                    placeholder="Qté"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="lg:col-span-2">
                  <input
                    type="number"
                    name="prixUnitaire"
                    value={currentActe.prixUnitaire || ""}
                    onChange={handleActeChange}
                    placeholder="Prix Unitaire (MAD) *"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={addActe}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    <FaPlus />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des Actes */}
            {actes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acte</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Zone</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Qté</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">P.U.</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actes.map((acte, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-pink-50">
                        <td className="px-4 py-3 text-gray-600 text-sm">{acte.code || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{acte.nom}</div>
                          {acte.description && (
                            <div className="text-xs text-gray-500">{acte.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{acte.zone || "-"}</td>
                        <td className="px-4 py-3 text-center font-semibold">{acte.quantite}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">
                          {acte.prixUnitaire.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          {(acte.prixUnitaire * acte.quantite).toFixed(2)}
                        </td>
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
                    <tr className="bg-gradient-to-r from-pink-100 to-rose-100">
                      <td colSpan={5} className="px-4 py-4 text-right font-bold text-gray-800 text-lg">
                        TOTAL GÉNÉRAL
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-green-600 text-2xl">
                        {calculateTotal().toFixed(2)} MAD
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Résumé Médical */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-500">
              <FaNotesMedical className="text-2xl text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Résumé Médical</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnostic
                </label>
                <textarea
                  name="diagnostic"
                  value={form.diagnostic}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Diagnostic principal..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Antécédents Médicaux
                </label>
                <textarea
                  name="antecedents"
                  value={form.antecedents}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Antécédents..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Allergies connues..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Traitements en Cours
                </label>
                <textarea
                  name="traitementsEnCours"
                  value={form.traitementsEnCours}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Médicaments actuels..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observations
                </label>
                <textarea
                  name="observations"
                  value={form.observations}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Observations cliniques..."
                />
              </div>
            </div>
          </div>

          {/* Section 5: Facturation */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-500">
              <FaMoneyBillWave className="text-2xl text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Facturation & Paiement</h2>
            </div>

            <div className="space-y-6">
              {/* Résumé Financier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">Montant Total</p>
                  <p className="text-2xl font-bold text-gray-800">{calculateTotal().toFixed(2)} MAD</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">Remboursement</p>
                  <p className="text-2xl font-bold text-blue-600">-{calculateRemboursement().toFixed(2)} MAD</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">À Payer</p>
                  <p className="text-2xl font-bold text-green-600">{calculateMontantPatient().toFixed(2)} MAD</p>
                </div>
              </div>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50 rounded-xl p-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de l'assurance
                    </label>
                    <input
                      type="text"
                      name="assurance"
                      value={form.assurance}
                      onChange={handleChange}
                      placeholder="Ex: CNSS, CNOPS..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      N° Assurance
                    </label>
                    <input
                      type="text"
                      name="numeroAssurance"
                      value={form.numeroAssurance}
                      onChange={handleChange}
                      placeholder="Numéro d'adhérent"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Taux Remboursement (%)
                    </label>
                    <input
                      type="number"
                      name="tauxRemboursement"
                      value={form.tauxRemboursement}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      placeholder="Ex: 70"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Paiement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mode de Paiement
                  </label>
                  <select
                    name="modePaiement"
                    value={form.modePaiement}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="Carte">Carte Bancaire</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Virement">Virement</option>
                    <option value="Assurance">Assurance</option>
                    <option value="Mixte">Mixte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Statut Paiement
                  </label>
                  <select
                    name="statut"
                    value={form.statut}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Non payé">Non payé</option>
                    <option value="Payé partiellement">Payé partiellement</option>
                    <option value="Payé">Payé</option>
                    <option value="Remboursé">Remboursé</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Validation & Notes */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-500">
              <FaCheckCircle className="text-2xl text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Validation & Notes</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Statut du Document
                </label>
                <select
                  name="statutGlobal"
                  value={form.statutGlobal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="Validé">Validé</option>
                  <option value="Archivé">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes Additionnelles
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Remarques, instructions, suivi recommandé..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
            >
              <FaSave className="text-2xl" />
              {loading ? "Enregistrement..." : (id ? "Mettre à Jour la Feuille" : "Créer la Feuille de Soin")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/feuilles")}
              className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold flex items-center gap-2"
            >
              <FaTimes className="text-xl" />
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

export default FeuilleFormNew;
      