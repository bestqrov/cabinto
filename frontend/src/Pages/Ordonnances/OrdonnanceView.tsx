import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPrint, FaEdit, FaArrowLeft, FaUserMd } from "react-icons/fa";
import { useSettings } from "../../contexts/SettingsContext";

interface Medicament {
  nom: string;
  dosage: string;
  frequence: string;
  duree: string;
  notes: string;
}

interface Ordonnance {
  _id: string;
  patientId: {
    _id: string;
    nom: string;
    prenom: string;
    cin: string;
    dateNaissance: string;
    telephone: string;
  };
  dateOrdonnance: string;
  medicaments: Medicament[];
  instructionGenerale: string;
  signatureMedecin: string;
}

export default function OrdonnanceView() {
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordonnance, setOrdonnance] = useState<Ordonnance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdonnance();
  }, [id]);

  const fetchOrdonnance = async () => {
    try {
      const res = await fetch(`${API_URL}/ordonnances/${id}`);
      const data = await res.json();

      if (data.success) {
        setOrdonnance(data.data);
      } else {
        toast.error("Erreur lors du chargement");
        navigate("/ordonnances");
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!ordonnance) {
    return null;
  }

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="ltr">
      {/* Action Buttons - Hidden on print */}
      <div className="no-print bg-white shadow-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate("/ordonnances")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <FaArrowLeft />
          Retour
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/ordonnances/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit />
            Modifier
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FaPrint />
            Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Prescription Document */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none relative">
          {/* Watermark image positioned behind document content */}
          <img
            src={settings.logo || '/src/images/logo.avif'}
            alt=""
            className="print-watermark"
            aria-hidden="true"
          />
          {/* Header */}
          <div className="border-b-4 border-rose-600 bg-gradient-to-r from-rose-50 to-pink-50 p-8 print:bg-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {settings.logo ? (
                    <img src={settings.logo} alt="Cabinet Logo" className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-lg" />
                  )}
                  <h1 className="text-3xl font-bold text-gray-800">{settings.name || "Cabinet Médical"}</h1>
                </div>
                <div className="text-gray-600 space-y-1 ml-12">
                  <p className="font-semibold text-rose-700">Dr. {ordonnance.signatureMedecin.replace("Dr. ", "")}</p>
                  <p className="flex items-center gap-2">
                    <FaUserMd className="text-rose-500" />
                    Chirurgien Praticien
                  </p>
                  <p>{settings.address || "123 Avenue Mohammed V, Casablanca"}</p>
                  <p>Tél: {settings.phone || "+212 522 123 456"}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-rose-600 text-white px-4 py-2 rounded-lg mb-3">
                  <p className="text-sm font-semibold">ORDONNANCE</p>
                  <p className="text-xs">N° {ordonnance._id.slice(-8).toUpperCase()}</p>
                </div>
                <p className="text-gray-600 font-semibold">
                  {new Date(ordonnance.dateOrdonnance).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 p-6 border-b-2 border-gray-200">
            <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Informations Patient</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Nom et Prénom</p>
                <p className="font-bold text-lg text-gray-800">
                  {ordonnance.patientId.nom} {ordonnance.patientId.prenom}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">CIN</p>
                <p className="font-semibold text-gray-800">{ordonnance.patientId.cin || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Date de Naissance / Âge</p>
                <p className="font-semibold text-gray-800">
                  {new Date(ordonnance.patientId.dateNaissance).toLocaleDateString("fr-FR")} ({calculateAge(ordonnance.patientId.dateNaissance)} ans)
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Téléphone</p>
                <p className="font-semibold text-gray-800">{ordonnance.patientId.telephone}</p>
              </div>
            </div>
          </div>

          {/* Prescription Content */}
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-rose-600 rounded"></div>
                <h2 className="text-xl font-bold text-gray-800">Prescription</h2>
              </div>

              <div className="space-y-4">
                {ordonnance.medicaments.map((med, index) => (
                  <div key={index} className="border-l-4 border-rose-500 pl-4 py-3 bg-rose-50 rounded-r-lg">
                    <p className="font-bold text-lg text-gray-800 mb-2">{index + 1}. {med.nom}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      {med.dosage && (
                        <p className="text-gray-700">
                          <span className="font-semibold text-rose-700">Dosage:</span> {med.dosage}
                        </p>
                      )}
                      {med.frequence && (
                        <p className="text-gray-700">
                          <span className="font-semibold text-rose-700">Fréquence:</span> {med.frequence}
                        </p>
                      )}
                      {med.duree && (
                        <p className="text-gray-700">
                          <span className="font-semibold text-rose-700">Durée:</span> {med.duree}
                        </p>
                      )}
                      {med.notes && (
                        <p className="text-gray-700 col-span-2">
                          <span className="font-semibold text-rose-700">Notes:</span> {med.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions générales */}
            {ordonnance.instructionGenerale && (
              <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                <h3 className="font-bold text-gray-800 mb-2">Instructions Générales</h3>
                <p className="text-gray-700 whitespace-pre-line">{ordonnance.instructionGenerale}</p>
              </div>
            )}

            {/* Signature */}
            <div className="flex justify-end mt-12">
              <div className="text-center">
                <div className="border-t-2 border-gray-300 pt-2 mb-1 min-w-[250px]">
                  <p className="font-bold text-gray-800 text-lg">{ordonnance.signatureMedecin}</p>
                  <p className="text-gray-600 text-sm">Chirurgien Praticien</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">Cachet et Signature</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 p-4 text-center border-t-2 border-gray-200">
            <p className="text-xs text-gray-600">
              Cette ordonnance est valable pour une durée de 3 mois à compter de la date d'émission
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {`${settings.name || "Cabinet Médical"} - ${settings.address || "123 Avenue Mohammed V, Casablanca"} - Tél: ${settings.phone || "+212 522 123 456"}`}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
