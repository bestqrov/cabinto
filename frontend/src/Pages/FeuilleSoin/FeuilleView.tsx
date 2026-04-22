import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaFileAlt,
  FaArrowLeft,
  FaEdit,
  FaDownload,
  FaUser,
  FaCalendarAlt,
  FaTooth,
  FaMoneyBillWave,
  FaNotesMedical,
  FaCheckCircle
} from "react-icons/fa";
import { useSettings } from "../../contexts/SettingsContext";

interface Acte {
  acteNom: string;
  prix: number;
  zone?: string;
}

interface Feuille {
  _id: string;
  patientId: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    cin?: string;
    dateNaissance?: string;
  };
  dateSoin: string;
  diagnostic?: string;
  actes: Acte[];
  montantTotal: number;
  priseEnCharge: boolean;
  assurance?: string;
  tauxRemboursement: number;
  montantRembourse: number;
  notes?: string;
  createdAt: string;
}

export default function FeuilleView() {
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [feuille, setFeuille] = useState<Feuille | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchFeuille();
    }
  }, [id]);

  const fetchFeuille = async () => {
    try {
      const res = await fetch(`${API_URL}/feuilles/${id}`);
      const data = await res.json();

      if (data.success) {
        setFeuille(data.data);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600"></div>
      </div>
    );
  }

  if (!feuille) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50">
        <div className="text-center">
          <FaFileAlt className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Feuille de soin non trouvée</h2>
          <button
            onClick={() => navigate("/feuilles")}
            className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Buttons - Hidden on print */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => navigate("/feuilles")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <FaArrowLeft />
            Retour
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/feuilles/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaEdit />
              Modifier
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaDownload />
              Imprimer/PDF
            </button>
          </div>
        </div>

        {/* Document */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="border-b-4 border-pink-600 pb-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {settings.logo ? (
                  <img src={settings.logo} alt="Cabinet Logo" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{settings.name || "Feuille de Soin"}</h1>
                  <p className="text-gray-600">{settings.address || "Cabinet Zoneaire"}</p>
                  <p className="text-gray-600">Tél: {settings.phone || "+212 5XX XXX XXX"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date d'émission</p>
                <p className="font-bold text-gray-800">{new Date(feuille.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="mb-8 bg-pink-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaUser className="text-2xl text-pink-600" />
              <h2 className="text-xl font-bold text-gray-800">Informations Patient</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-semibold text-gray-800">{feuille.patientId.nom} {feuille.patientId.prenom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-semibold text-gray-800">{feuille.patientId.telephone}</p>
              </div>
              {feuille.patientId.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{feuille.patientId.email}</p>
                </div>
              )}
              {feuille.patientId.cin && (
                <div>
                  <p className="text-sm text-gray-600">CIN</p>
                  <p className="font-semibold text-gray-800">{feuille.patientId.cin}</p>
                </div>
              )}
            </div>
          </div>

          {/* Soin Info */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FaCalendarAlt className="text-2xl text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Détails du Soin</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date du soin</p>
                <p className="font-semibold text-gray-800">{new Date(feuille.dateSoin).toLocaleDateString('fr-FR')}</p>
              </div>
              {feuille.diagnostic && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Diagnostic</p>
                  <p className="font-semibold text-gray-800">{feuille.diagnostic}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actes */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FaTooth className="text-2xl text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Actes Médicaux</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Acte</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Zone</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Prix (MAD)</th>
                  </tr>
                </thead>
                <tbody>
                  {feuille.procedures.map((acte, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-3 text-gray-800">{acte.procedureNom}</td>
                      <td className="px-4 py-3 text-gray-600">{acte.zone || "-"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{acte.prix.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-pink-100 font-bold">
                    <td colSpan={2} className="px-4 py-4 text-right text-lg">Montant Total</td>
                    <td className="px-4 py-4 text-right text-xl text-green-600">{feuille.montantTotal.toFixed(2)} MAD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Assurance */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FaMoneyBillWave className="text-2xl text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-800">Remboursement</h2>
            </div>
            {feuille.priseEnCharge ? (
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaCheckCircle className="text-green-600 text-xl" />
                  <span className="font-semibold text-gray-800">Prise en charge par assurance</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Assurance</p>
                    <p className="font-semibold text-gray-800">{feuille.assurance || "Non spécifiée"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Taux de remboursement</p>
                    <p className="font-semibold text-gray-800">{feuille.tauxRemboursement}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Montant remboursé</p>
                    <p className="text-2xl font-bold text-blue-600">{feuille.montantRembourse.toFixed(2)} MAD</p>
                  </div>
                  <div className="col-span-2 bg-white rounded-lg p-4 border-2 border-blue-300">
                    <p className="text-sm text-gray-600">Reste à charge patient</p>
                    <p className="text-2xl font-bold text-red-600">
                      {(feuille.montantTotal - feuille.montantRembourse).toFixed(2)} MAD
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <p className="text-gray-600">Aucune prise en charge</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{feuille.montantTotal.toFixed(2)} MAD à la charge du patient</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {feuille.notes && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FaNotesMedical className="text-2xl text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Notes</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{feuille.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-600">
            <p>Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
