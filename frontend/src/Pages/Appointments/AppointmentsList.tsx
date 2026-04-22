import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaCalendarAlt,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
  FaFilter
} from "react-icons/fa";
import Sidebar from "../../Components/Sidebar";

interface Appointment {
  _id: string;
  patient?: {
    _id: string;
    nom: string;
    prenom: string;
    telephone: string;
  };
  patientName?: string; // For new patients (first time)
  praticien: string;
  date: string;
  heure: string;
  motif: string;
  statut: "Prévu" | "Terminé" | "Annulé";
  notes?: string;
}

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("Tous");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await fetch("${API_URL}/appointment");
      const data = await res.json();

      if (res.ok) {
        setAppointments(data);
        setFilteredAppointments(data);
      } else {
        toast.error("Erreur lors du chargement");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;

    // Filter by status
    if (filterStatut !== "Tous") {
      filtered = filtered.filter(apt => apt.statut === filterStatut);
    }

    // Filter by selected date (day)
    if (viewMode === "calendar") {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        return (
          aptDate.getDate() === selectedDate.getDate() &&
          aptDate.getMonth() === selectedDate.getMonth() &&
          aptDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    } else {
      // Filter by month/year in list view
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        return (
          aptDate.getMonth() === selectedMonth &&
          aptDate.getFullYear() === selectedYear
        );
      });
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const patientName = apt.patientName || `${apt.patient?.nom || ''} ${apt.patient?.prenom || ''}`;
        return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.praticien.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.motif.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, filterStatut, appointments, selectedDate, selectedMonth, selectedYear, viewMode]);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous?")) return;

    try {
      const res = await fetch(`${API_URL}/appointment/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Rendez-vous supprimé");
        fetchAppointments();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "Prévu": return "bg-blue-100 text-blue-700";
      case "Terminé": return "bg-green-100 text-green-700";
      case "Annulé": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "Prévu": return <FaClock />;
      case "Terminé": return <FaCheckCircle />;
      case "Annulé": return <FaBan />;
      default: return <FaClock />;
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getAppointmentsForDate = (day: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getDate() === day &&
        aptDate.getMonth() === selectedMonth &&
        aptDate.getFullYear() === selectedYear
      );
    });
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day);
    setSelectedDate(newDate);
    setViewMode("calendar");
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50" dir="ltr">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-lg px-8 py-6 border-b-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <FaCalendarAlt className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Gestion des Rendez-vous
                </h1>
                <p className="text-sm text-gray-600 mt-1">Planification et suivi des consultations médicales</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/appointments/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <FaPlus className="text-lg" />
              <span>Nouveau Rendez-vous</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Filters and View Toggle */}
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gradient-to-r from-white to-purple-50"
                />
              </div>
              
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="Tous">📋 Tous les statuts</option>
                <option value="Prévu">🕐 Prévu</option>
                <option value="Terminé">✅ Terminé</option>
                <option value="Annulé">❌ Annulé</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <div className="flex-1 text-center font-semibold text-gray-700">
                  {monthNames[selectedMonth]} {selectedYear}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    viewMode === "calendar"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaCalendarDay />
                  <span className="text-sm font-medium">Jour</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaFilter />
                  <span className="text-sm font-medium">Mois</span>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <p className="text-xl text-gray-600 font-medium">Chargement des rendez-vous...</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === "calendar" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-600" />
                      Calendrier - {monthNames[selectedMonth]} {selectedYear}
                    </h3>
                    
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {dayNames.map(day => (
                        <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: getFirstDayOfMonth(selectedMonth, selectedYear) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                      ))}
                      
                      {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }).map((_, i) => {
                        const day = i + 1;
                        const dayAppointments = getAppointmentsForDate(day);
                        const isSelected = 
                          selectedDate.getDate() === day &&
                          selectedDate.getMonth() === selectedMonth &&
                          selectedDate.getFullYear() === selectedYear;
                        const isToday = 
                          new Date().getDate() === day &&
                          new Date().getMonth() === selectedMonth &&
                          new Date().getFullYear() === selectedYear;

                        return (
                          <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`aspect-square rounded-xl p-2 text-sm font-medium transition-all relative ${
                              isSelected
                                ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                                : isToday
                                ? "bg-purple-100 text-purple-700 border-2 border-purple-400"
                                : "bg-gray-50 text-gray-700 hover:bg-purple-50 hover:scale-105"
                            }`}
                          >
                            <span className="block">{day}</span>
                            {dayAppointments.length > 0 && (
                              <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                                isSelected ? "bg-white" : "bg-purple-600"
                              }`}></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Appointments */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <FaClock className="text-purple-600" />
                      Rendez-vous du {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>

                    {filteredAppointments.length === 0 ? (
                      <div className="text-center py-12">
                        <FaCalendarAlt className="text-6xl text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Aucun rendez-vous pour ce jour</p>
                        <button
                          onClick={() => navigate("/appointments/create")}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                          Ajouter un rendez-vous
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {filteredAppointments
                          .sort((a, b) => a.heure.localeCompare(b.heure))
                          .map(apt => (
                            <div
                              key={apt._id}
                              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-l-4 border-purple-500 hover:shadow-lg transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {apt.patientName ? (
                                      apt.patientName.charAt(0).toUpperCase()
                                    ) : (
                                      apt.patient.nom.charAt(0) + apt.patient.prenom.charAt(0)
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-800">
                                      {apt.patientName || `${apt.patient.nom} ${apt.patient.prenom}`}
                                    </p>
                                    {apt.patient && (
                                      <p className="text-sm text-gray-600">{apt.patient.telephone}</p>
                                    )}
                                  </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(apt.statut)}`}>
                                  {getStatutIcon(apt.statut)}
                                  {apt.statut}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <FaClock className="text-purple-500" />
                                  <span className="font-semibold">{apt.heure}</span>
                                </div>
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium">Dr. {apt.praticien}</span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 mb-3">
                                <span className="font-semibold">Motif:</span> {apt.motif}
                              </p>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/appointments/edit/${apt._id}`)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                                >
                                  <FaEdit />
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleDelete(apt._id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                                >
                                  <FaTrash />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Monthly List View
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FaCalendarAlt />
                      Rendez-vous de {monthNames[selectedMonth]} {selectedYear}
                      <span className="ml-auto text-sm bg-white/20 px-3 py-1 rounded-full">
                        {filteredAppointments.length} rendez-vous
                      </span>
                    </h3>
                  </div>

                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-20">
                      <FaCalendarAlt className="text-6xl text-gray-200 mx-auto mb-4" />
                      <p className="text-xl text-gray-500 mb-4">Aucun rendez-vous trouvé</p>
                      <button
                        onClick={() => navigate("/appointments/create")}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        Planifier un rendez-vous
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">Patient</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">Praticien</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">Date & Heure</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">Motif</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-purple-900">Statut</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-purple-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAppointments
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.heure.localeCompare(b.heure))
                            .map((apt, index) => (
                              <tr
                                key={apt._id}
                                className={`border-b border-purple-100 hover:bg-purple-50 transition-colors ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'
                                }`}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                      {apt.patientName ? (
                                        apt.patientName.charAt(0).toUpperCase()
                                      ) : (
                                        apt.patient.nom.charAt(0) + apt.patient.prenom.charAt(0)
                                      )}
                                    </div>
                                    <div>
                                      {apt.patientName ? (
                                        <>
                                          <p className="font-semibold text-gray-800">{apt.patientName}</p>
                                          <p className="text-xs text-purple-600 font-medium">Nouveau patient</p>
                                        </>
                                      ) : (
                                        <>
                                          <p className="font-semibold text-gray-800">{apt.patient.nom} {apt.patient.prenom}</p>
                                          <p className="text-sm text-gray-500">{apt.patient.telephone}</p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-gray-700 font-medium">Dr. {apt.praticien}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <FaCalendarAlt className="text-purple-500" />
                                    <div>
                                      <p className="font-semibold">{new Date(apt.date).toLocaleDateString('fr-FR')}</p>
                                      <p className="text-sm text-gray-500">{apt.heure}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-gray-700">{apt.motif}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${getStatutColor(apt.statut)}`}>
                                    {getStatutIcon(apt.statut)}
                                    {apt.statut}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => navigate(`/appointments/edit/${apt._id}`)}
                                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(apt._id)}
                                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
