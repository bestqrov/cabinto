import { API_URL } from '../config';
import logo from "../../assits/Logo.png";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = () => {
    if (!email.trim()) return "L'adresse email est requise";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Format d'email invalide";
    if (!password) return "Le mot de passe est requis";
    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    return null;
  };

  const redirectByRole = (role: string) => {
    if (role === "Receptionist") window.location.href = "/secretary-dashboard";
    else if (role === "Dentist") window.location.href = "/doctor-dashboard";
    else window.location.href = "/dashboard";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (data?.error) {
        setErrorMessage(data.error);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setEmail("");
        setPassword("");
        toast.success(`Bienvenue ${data.user.fullname}`);
        redirectByRole(data.user.role);
      }
    } catch (error) {
      console.log(error);
      toast.error("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: "admin" | "secretary" | "doctor") => {
    setLoading(true);
    setErrorMessage("");
    const credentials = {
      admin: { email: "admin@admin.com", password: "admin1234567890" },
      secretary: { email: "secretary@dental.com", password: "secretary123" },
      doctor: { email: "doctor@dental.com", password: "doctor123" },
    };
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials[role]),
      });
      const data = await res.json();
      if (data?.error) {
        setErrorMessage(data.error);
        toast.error(data.error);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(`Connexion rapide - ${data.user.fullname}`);
        redirectByRole(data.user.role);
      }
    } catch (error) {
      console.log(error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="ltr">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">

        {/* Logo centered */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Cabinto" className="w-24 h-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Cabinto</h2>
          <p className="text-sm text-gray-500 mt-1">Gestion de cabinet médical</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-xs">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1" htmlFor="email">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
              placeholder="nom@cabinet.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-gray-500 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-gray-300 text-blue-600" />
              Se souvenir de moi
            </label>
            <a href="#" className="text-blue-600 hover:underline font-medium">Mot de passe oublié ?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {/* Demo quick login */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium tracking-widest">Demo</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["Admin", "Secretary", "Doctor"] as const).map((role) => (
              <button
                key={role}
                type="button"
                disabled={loading}
                onClick={() => quickLogin(role.toLowerCase() as any)}
                className="py-2 px-1 text-[10px] font-bold uppercase tracking-tight bg-gray-50 border border-gray-100 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all text-gray-600 disabled:opacity-50"
              >
                {role}
              </button>
            ))}
          </div>
        </form>

        <p className="text-center text-gray-400 text-[10px] mt-6 uppercase tracking-widest">
          &copy; 2026 Cabinto — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
