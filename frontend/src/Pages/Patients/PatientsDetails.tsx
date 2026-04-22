import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { FaUser } from "react-icons/fa";

interface Patient {
  _id: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  medical_history: string;
}

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);

  const token = localStorage.getItem("token");

  const fetchPatient = async () => {
    try {
      const res = await fetch(`${API_URL}/patient/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Erreur lors du chargement");

      setPatient(data);
    } catch {
      toast.error("Erreur de connexion au serveur");
    }
  };

  useEffect(() => {
    fetchPatient();
  }, []);

  if (!patient) {
    return <p className="text-center p-10">Chargement...</p>;
  }

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <FaUser className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Détails du Patient</h1>
              <p className="text-sm text-gray-500">Informations complètes du patient</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations Patient</h2>

              <div className="space-y-4 text-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><span className="font-bold text-gray-700">Nom:</span> <span className="text-gray-600">{patient.name}</span></p>
                  <p><span className="font-bold text-gray-700">Date de naissance:</span> <span className="text-gray-600">{patient.dob}</span></p>
                  <p><span className="font-bold text-gray-700">Sexe:</span> <span className="text-gray-600">{patient.gender}</span></p>
                  <p><span className="font-bold text-gray-700">Téléphone:</span> <span className="text-gray-600">{patient.phone}</span></p>
                  <p><span className="font-bold text-gray-700">WhatsApp:</span> <span className="text-gray-600">{patient.whatsapp || 'Non renseigné'}</span></p>
                  <p><span className="font-bold text-gray-700">Email:</span> <span className="text-gray-600">{patient.email}</span></p>
                  <p><span className="font-bold text-gray-700">Adresse:</span> <span className="text-gray-600">{patient.address}</span></p>
                </div>

                <div className="mt-6">
                  <p className="font-bold text-gray-700 mb-2">Historique médical:</p>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {patient.medical_history || "Aucun"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
