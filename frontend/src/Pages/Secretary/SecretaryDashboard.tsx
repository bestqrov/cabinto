import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FileText, Calendar, Bell, CreditCard, BarChart3, LogOut } from "lucide-react";
import { Card, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import Sidebar from "../../Components/Sidebar";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSettings } from "../../contexts/SettingsContext";
import logo from "../../images/logo.avif";

export default function SecretaryDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [patientsToday, setPatientsToday] = useState<number>(0);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<number>(0);
  const navigate = useNavigate();
  const { settings } = useSettings();

  const isSameDate = (d1: string | Date, d2: Date) => {
    const date1 = new Date(d1);
    return (
      date1.getFullYear() === d2.getFullYear() &&
      date1.getMonth() === d2.getMonth() &&
      date1.getDate() === d2.getDate()
    );
  };

  const fetchStats = async () => {
    try {
      const [aptsRes, invRes] = await Promise.all([
        fetch("${API_URL}/appointment"),
        fetch("${API_URL}/invoice"),
      ]);

      const [aptsData, invData] = await Promise.all([aptsRes.json(), invRes.json()]);

      // appointments
      const today = new Date();
      const apts = Array.isArray(aptsData) ? aptsData : [];
      const patientsTodayCount = apts.filter((a: any) => isSameDate(a.date, today)).length;
      const upcomingCount = apts.filter((a: any) => new Date(a.date) >= new Date(new Date().setHours(0,0,0,0))).length;

      // invoices
      const invoices = Array.isArray(invData) ? invData : [];
      const pendingCount = invoices.filter((inv: any) => inv.status !== "مدفوع").length;

      setPatientsToday(patientsTodayCount);
      setAppointmentsCount(upcomingCount);
      setPendingPayments(pendingCount);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    // Check if user is secretary
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (parsedUser.role !== "Receptionist" && parsedUser.role !== "Admin") {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Déconnexion réussie");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50" dir="ltr">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
              <img src={settings.logo || logo} alt="Cabinet Logo" className="w-14 h-14 rounded-xl shadow-lg object-cover border-2 border-pink-400 bg-white" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {settings.name || "Cabinet Médical"}
                </h1>
                <p className="text-sm text-gray-500">{settings.address || "Adresse non définie"}</p>
                <p className="text-sm text-gray-500">{settings.phone || "Téléphone non défini"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm"
            >
              <LogOut className="text-base" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Gold Animated Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-pink-600 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-pulse">
              ✨ Tableau de bord – Secrétariat ✨
            </h1>
            <p className="text-gray-600 text-lg">
              Gérez les rendez-vous, patients et paiements
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-pink-50 to-white border-l-8 border-pink-500">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                  <Users className="text-white text-3xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Patients aujourd'hui</p>
                  <p className="text-4xl font-bold text-pink-600">{patientsToday}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-purple-50 to-white border-l-8 border-purple-500">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Calendar className="text-white text-3xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Rendez-vous</p>
                  <p className="text-4xl font-bold text-purple-600">{appointmentsCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-indigo-50 to-white border-l-8 border-indigo-500">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                  <CreditCard className="text-white text-3xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">Paiements en attente</p>
                  <p className="text-4xl font-bold text-indigo-600">{pendingPayments}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <BarChart3 className="text-pink-500" />
              Actions Rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {user?.permissions?.patients !== false && (
                <Button 
                  onClick={() => navigate("/patients")}
                  className="rounded-2xl py-6 flex gap-3 justify-center bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg"
                >
                  <Users className="text-xl" /> Nouveau patient
                </Button>
              )}
              {user?.permissions?.medicalFiles !== false && (
                <Button 
                  onClick={() => navigate("/medical-files")}
                  className="rounded-2xl py-6 flex gap-3 justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
                >
                  <FileText className="text-xl" /> Feuille de soins
                </Button>
              )}
              {user?.permissions?.appointments !== false && (
                <Button 
                  onClick={() => navigate("/appointments")}
                  className="rounded-2xl py-6 flex gap-3 justify-center bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg"
                >
                  <Bell className="text-xl" /> Rappels
                </Button>
              )}
              {user?.permissions?.invoices !== false && (
                <Button 
                  onClick={() => navigate("/factures")}
                  className="rounded-2xl py-6 flex gap-3 justify-center bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg"
                >
                  <BarChart3 className="text-xl" /> Statistiques
                </Button>
              )}
            </div>
          </div>

          {/* Liste rapide */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FileText className="text-pink-500" />
              Feuilles de Soins Enregistrées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-l-4 border-green-500 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    ZE
                  </div>
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full font-semibold text-xs">
                    ✓ Payé
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-base mb-1">Zahra El Amrani</p>
                <p className="text-xs text-gray-600 mb-2">20/12/2024</p>
                <p className="font-bold text-xl text-green-600">300 MAD</p>
              </div>

              {/* Card 2 */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-l-4 border-orange-500 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    SB
                  </div>
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full font-semibold text-xs">
                    ⏳ En attente
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-base mb-1">Salma Benali</p>
                <p className="text-xs text-gray-600 mb-2">20/12/2024</p>
                <p className="font-bold text-xl text-orange-600">450 MAD</p>
              </div>

              {/* Card 3 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-l-4 border-green-500 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    AM
                  </div>
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full font-semibold text-xs">
                    ✓ Payé
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-base mb-1">Ahmed Mansouri</p>
                <p className="text-xs text-gray-600 mb-2">19/12/2024</p>
                <p className="font-bold text-xl text-green-600">650 MAD</p>
              </div>

              {/* Card 4 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    LK
                  </div>
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full font-semibold text-xs">
                    ✓ Payé
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-base mb-1">Laila Kadiri</p>
                <p className="text-xs text-gray-600 mb-2">19/12/2024</p>
                <p className="font-bold text-xl text-purple-600">500 MAD</p>
              </div>

              {/* Card 5 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    YA
                  </div>
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full font-semibold text-xs">
                    ⏳ En attente
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-base mb-1">Youssef Alami</p>
                <p className="text-xs text-gray-600 mb-2">18/12/2024</p>
                <p className="font-bold text-xl text-blue-600">350 MAD</p>
              </div>

              {/* Card 6 */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl border-l-4 border-pink-500 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    NS
                  </div>
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full font-semibold text-xs">
                    ✓ Payé
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-base mb-1">Nadia Senhaji</p>
                <p className="text-xs text-gray-600 mb-2">18/12/2024</p>
                <p className="font-bold text-xl text-pink-600">400 MAD</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
