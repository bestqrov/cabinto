import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPrint, FaEdit, FaArrowLeft, FaDownload } from "react-icons/fa";
import { useSettings } from "../../contexts/SettingsContext";


interface Prestation {
  procedure: string;
  zone?: string;
  prixUnitaire: number;
  quantite: number;
  total: number;
}

interface Facture {
  _id: string;
  numeroFacture: string;
  patientId: {
    _id: string;
    nom: string;
    prenom: string;
    cin: string;
    dateNaissance: string;
    telephone: string;
    adresse?: string;
  };
  dateFacture: string;
  prestations: Prestation[];
  totalHT: number;
  TVA: number;
  totalTTC: number;
  montantVerse: number;
  resteAPayer: number;
  modePaiement: string;
  numeroCheque?: string;
  dateCheque?: string;
  fichierTracabilite?: string;
  notes?: string;
}

export default function FactureView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [facture, setFacture] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacture();
  }, [id]);

  const fetchFacture = async () => {
    try {
      const res = await fetch(`${API_URL}/factures/${id}`);
      const data = await res.json();

      if (data.success) {
        setFacture(data.data);
      } else {
        toast.error("Erreur lors du chargement");
        navigate("/factures");
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

  const handleDownloadPDF = () => {
    window.open(`${API_URL}/factures/${id}/pdf`, "_blank");
    toast.success("Téléchargement du PDF...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!facture) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="ltr">
      {/* Action Buttons - Hidden on print */}
      <div className="no-print bg-white shadow-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate("/factures")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <FaArrowLeft />
          Retour
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/factures/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <FaEdit />
            Modifier
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload />
            Télécharger PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FaPrint />
            Imprimer
          </button>
        </div>
      </div>

      {/* Facture Document */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="border-b-4 border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 p-8 print:bg-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="w-20 h-20 rounded-lg object-cover" 
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-blue-700 mb-2">
                    {settings.name || "Cabinet Zoneaire"}
                  </h1>
                  <div className="text-gray-600 space-y-1">
                    <p className="font-semibold text-blue-600">{settings.adminName || "Dr. Admin"}</p>
                    <p className="text-sm font-medium">{settings.targetLine || "Chirurgien-Zoneiste"}</p>
                    <p className="text-sm">{settings.address || "Casablanca, Maroc"}</p>
                    <p className="text-sm">Tél: {settings.phone || "+212 5XX XXX XXX"}</p>
                    {settings.email && <p className="text-sm">Email: {settings.email}</p>}
                    {settings.website && <p className="text-sm">Web: {settings.website}</p>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-lg mb-3">
                  <p className="text-sm font-semibold">FACTURE</p>
                  <p className="text-xs">N° {facture.numeroFacture}</p>
                </div>
                <p className="text-gray-600 font-semibold">
                  {new Date(facture.dateFacture).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  {settings.if && <p>IF: {settings.if}</p>}
                  {settings.ice && <p>ICE: {settings.ice}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 p-6 border-b-2 border-gray-200">
            <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">
              Informations Patient
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Nom et Prénom</p>
                <p className="font-bold text-lg text-gray-800">
                  {facture.patientId.nom} {facture.patientId.prenom}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">CIN</p>
                <p className="font-semibold text-gray-800">
                  {facture.patientId.cin || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Téléphone</p>
                <p className="font-semibold text-gray-800">
                  {facture.patientId.telephone}
                </p>
              </div>
              {facture.patientId.adresse && (
                <div>
                  <p className="text-gray-600 text-sm">Adresse</p>
                  <p className="font-semibold text-gray-800">
                    {facture.patientId.adresse}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Prestations */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded"></div>
                Prestations Zoneaires
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acte</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Zone</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">
                        Prix Unit.
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Qté</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facture.prestations.map((prestation, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {prestation.procedure}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {prestation.zone || "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {prestation.prixUnitaire.toFixed(2)} DH
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {prestation.quantite}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">
                          {prestation.total.toFixed(2)} DH
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totaux */}
            <div className="flex justify-end mt-6">
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Total HT:</span>
                  <span className="font-bold text-gray-800">
                    {facture.totalHT.toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">TVA:</span>
                  <span className="font-bold text-gray-800">
                    {facture.TVA.toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg">
                  <span className="font-bold text-lg">Total TTC:</span>
                  <span className="font-bold text-2xl">
                    {facture.totalTTC.toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-2 bg-green-50 rounded border-2 border-green-200">
                  <span className="font-medium text-green-700">Montant Versé:</span>
                  <span className="font-bold text-green-600">
                    {facture.montantVerse.toFixed(2)} DH
                  </span>
                </div>
                <div
                  className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                    facture.resteAPayer > 0
                      ? "bg-red-50 border-2 border-red-200"
                      : "bg-green-50 border-2 border-green-200"
                  }`}
                >
                  <span
                    className={`font-bold text-lg ${
                      facture.resteAPayer > 0 ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    Reste à Payer:
                  </span>
                  <span
                    className={`font-bold text-2xl ${
                      facture.resteAPayer > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {facture.resteAPayer.toFixed(2)} DH
                  </span>
                </div>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Mode de paiement:</span>{" "}
                <span className="text-blue-700 font-bold">{facture.modePaiement}</span>
              </p>
              {facture.modePaiement === "Chèque" && facture.numeroCheque && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">N° Chèque:</span>{" "}
                    <span className="text-blue-700 font-bold">{facture.numeroCheque}</span>
                  </p>
                  {facture.dateCheque && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Date Chèque:</span>{" "}
                      <span className="text-blue-700 font-bold">
                        {new Date(facture.dateCheque).toLocaleDateString("fr-FR")}
                      </span>
                    </p>
                  )}
                </div>
              )}
              {(facture.modePaiement === "Carte" || facture.modePaiement === "Virement") && facture.fichierTracabilite && (
                <div className="mt-2">
                  <a
                    href={facture.fichierTracabilite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline font-semibold"
                  >
                    📎 Voir le fichier de traçabilité
                  </a>
                </div>
              )}
            </div>

            {/* Notes */}
            {facture.notes && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                <h3 className="font-bold text-gray-800 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-line">{facture.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-100 p-6 text-center border-t-2 border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              Facture générée automatiquement — {settings.name || "Cabinet Zoneaire"}
            </p>
            {(settings.if || settings.ice || settings.cnss) && (
              <p className="text-xs text-gray-500">
                {settings.if && `IF: ${settings.if}`}
                {settings.if && settings.ice && " | "}
                {settings.ice && `ICE: ${settings.ice}`}
                {(settings.if || settings.ice) && settings.cnss && " | "}
                {settings.cnss && `CNSS: ${settings.cnss}`}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {settings.address || "Casablanca, Maroc"} | Tél: {settings.phone || "+212 5XX XXX XXX"}
            </p>
            {settings.email && (
              <p className="text-xs text-gray-500">Email: {settings.email}</p>
            )}
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
