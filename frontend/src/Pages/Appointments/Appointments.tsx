import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { FaCalendarAlt } from "react-icons/fa";

interface Appointment {
  _id: string;
  patient: { name: string; phone: string };
  praticien: { name: string };
  date: string;
  diagnosis: string;
  treatment: string;
  frequency: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      const res = await fetch("${API_URL}/appointment", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message || "Erreur lors du chargement");

      setAppointments(data);
    } catch {
      toast.error("Erreur de connexion au serveur");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return <p className="text-center text-xl p-10">Chargement...</p>;
  }

  // ⭐ Filtrage par fréquence
  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.frequency === filter);

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <FaCalendarAlt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Rendez-vous</h1>
              <p className="text-sm text-gray-500">Liste des rendez-vous</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-700 mb-6">
              Liste des rendez-vous
            </h1>

            {/* ⭐ Filtre fréquence */}
            <div className="mb-6">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-3 border rounded-lg shadow-md text-lg"
              >
                <option value="all">Afficher tout</option>
                <option value="مرة واحدة">Une fois</option>
                <option value="يوميًا">Quotidien</option>
                <option value="أسبوعيًا">Hebdomadaire</option>
                <option value="شهريًا">Mensuel</option>
              </select>
            </div>

            {filteredAppointments.length === 0 ? (
              <p className="text-gray-500">Aucun rendez-vous correspondant</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAppointments.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => navigate(`/appointments/${a._id}`)}
                    className="bg-white shadow-lg p-5 rounded-xl cursor-pointer border hover:shadow-2xl hover:border-blue-500 transition"
                  >
                    <h2 className="text-xl font-semibold text-blue-600 mb-2">
                      {a.patient.name}
                    </h2>

                    <p className="text-gray-600">🩺 Praticien: {a.dentist.name}</p>
                    <p className="text-gray-600">
                      ⏰ {new Date(a.date).toLocaleString("fr-FR")}
                    </p>

                    <p className="text-gray-600">📌 Diagnostic: {a.diagnosis}</p>
                    <p className="text-gray-600">💊 Traitement: {a.treatment}</p>

                    <span className="mt-3 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Fréquence: {a.frequency}
                    </span>

                    <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                      Voir les détails
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
