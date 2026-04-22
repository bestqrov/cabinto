import { API_URL } from '../config';
import { Link } from "react-router-dom";
import logo from "../images/logo.avif";
import { useEffect, useState, useRef } from "react";
import { FaBars, FaTimes, FaBell } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import toast from "react-hot-toast";
import { useSettings } from "../contexts/SettingsContext";

export default function Navbar() {
  const { settings } = useSettings();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const plusRef = useRef(null);

  const navLinksByRole: Record<string, { title: string; link: string }[]> = {
    Admin: [
      { title: "Tableau de bord", link: "/dashboard" },
      { title: "Patients", link: "/patients" },
      { title: "Rendez-vous", link: "/appointments" },
      { title: "Factures", link: "/factures" },
      { title: "Stock", link: "/inventory" },
      { title: "Ordonnances", link: "/ordonnances" },
      { title: "Fournisseurs", link: "/supplier" },
      { title: "Dossiers M\u00e9dicaux", link: "/feuilles" },
    ],
    Praticien: [
      { title: "Tableau de bord", link: "/doctor-dashboard" },
      { title: "Patients", link: "/patients" },
      { title: "Rendez-vous", link: "/appointments" },
      { title: "Factures", link: "/factures" },
      { title: "Ordonnances", link: "/ordonnances" },
    ],
    Receptionist: [
      { title: "Tableau de bord", link: "/secretary-dashboard" },
      { title: "Rendez-vous", link: "/appointments" },
      { title: "Factures", link: "/factures" },
      { title: "Feuilles de soins", link: "/feuilles" },
    ],
  };

  const adminActions = [
    { title: "Cr\u00e9er un rendez-vous", link: "/appointments/create" },
    { title: "Cr\u00e9er une facture", link: "/factures/create" },
    { title: "Cr\u00e9er un patient", link: "/patients/create" },
    { title: "Cr\u00e9er un fournisseur", link: "/supplier/create" },
    { title: "Cr\u00e9er une ordonnance", link: "/ordonnances/create" },
    { title: "Cr\u00e9er un stock", link: "/inventory/create" },
    { title: "Cr\u00e9er un dossier m\u00e9dical", link: "/feuilles/create" },
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("${API_URL}/notification", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Échec du chargement des notifications");
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notification/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: any) {
      if (plusRef.current && !(plusRef.current as any).contains(e.target)) {
        setPlusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && token) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
    setMenuOpen(false);
  };

  const showLinks =
    user && user.role !== "user" ? navLinksByRole[user.role] || [] : [];

  return (
    <>
      {/* Navbar */}
      <div className="flex items-center justify-between bg-blue-600 px-6 py-3 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <img 
            className="w-16 h-16 rounded-full object-cover" 
            src={settings.logo || logo} 
            alt="logo" 
          />
          <span className="hidden md:block text-white font-bold text-lg">
            {settings.name || "Cabinet Médical"}
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-3">
          {showLinks.map((item) => (
            <Link
              key={item.title}
              className="text-white px-3 hover:underline"
              to={item.link}
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {/* Admin Notifications & Actions */}
          {user?.role === "Admin" && (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  className="bg-white text-blue-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-100 transition"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell className="text-xl" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md w-64 p-2 z-50 max-h-80 overflow-auto">
                    {notifications.length === 0 && (
                      <p className="text-gray-600">Aucune notification</p>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() => markAsRead(n._id)}
                      >
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin + button */}
              <div className="relative" ref={plusRef}>
                <button
                  onClick={() => setPlusOpen(!plusOpen)}
                  className="bg-white text-blue-600 w-10 h-10 flex items-center justify-center rounded-full text-3xl hover:bg-blue-100 transition"
                >
                  <IoAdd />
                </button>

                {plusOpen && (
                  <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md w-48 p-2 z-50">
                    {adminActions.map((item) => (
                      <Link
                        key={item.title}
                        to={item.link}
                        className="block px-3 py-2 hover:bg-blue-100 rounded-md text-blue-700"
                        onClick={() => setPlusOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Avatar + Logout */}
          {user ? (
            <>
              <Link to="/profile">
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border-2 border-white hover:scale-105 transition"
                />
              </Link>
              <button
                onClick={handleLogout}
                className="py-2 px-4 rounded-md bg-white text-blue-600 font-semibold hover:bg-red-500 hover:text-white transition"
              >
                D\u00e9connexion
              </button>
            </>
          ) : (
            <>
              <Link
                className="py-2 px-4 rounded-md bg-white text-blue-600 border border-white hover:bg-transparent hover:text-white transition font-semibold"
                to="/login"
              >
                Connexion
              </Link>
              <Link
                className="py-2 px-4 rounded-md bg-white text-blue-600 border border-white hover:bg-transparent hover:text-white transition font-semibold"
                to="/register"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-blue-700 z-50 text-white p-6 transition-all duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Bienvenue</h2>
          <FaTimes
            className="text-2xl cursor-pointer"
            onClick={() => setMenuOpen(false)}
          />
        </div>

        {user ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={user.avatar}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <p className="font-semibold">{user.fullname}</p>
            </div>

            {user.role === "Admin" && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaBell className="text-2xl" />
                  <span>{notifications.length}</span>
                </div>

                <h3 className="text-lg font-semibold mb-2">Ajouter</h3>
                {adminActions.map((item) => (
                  <Link
                    key={item.title}
                    to={item.link}
                    className="block py-2 border-b border-white/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {showLinks.map((item) => (
                <Link
                  key={item.title}
                  className="block py-2 border-b border-white/30"
                  to={item.link}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="mt-4 w-full py-2 bg-white text-blue-700 font-semibold rounded-md hover:bg-red-500 hover:text-white transition"
              >
                Déconnexion
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            <Link
              className="py-2 px-4 text-center bg-white text-blue-700 rounded-md font-semibold"
              to="/login"
              onClick={() => setMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link
              className="py-2 px-4 text-center bg-white text-blue-700 rounded-md font-semibold"
              to="/register"
              onClick={() => setMenuOpen(false)}
            >
              S'inscrire
            </Link>
          </div>
        )}
      </div>
    </>
  );
}