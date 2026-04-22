import { API_URL } from '../config';
import { Link } from "react-router-dom";
import praticien from "../images/praticien.webp";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

export default function Register() {
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("${API_URL}/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname, email, password }),
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
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error);
      toast.error("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timout = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timout);
    }
  }, [errorMessage]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100" dir="ltr">
      {/* Left side - Image */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src={praticien}
            alt="Dental Clinic"
            className="object-cover h-full w-full"
          />
        </div>
        <div className="relative z-10 text-white text-center">
          <h1 className="text-6xl font-bold mb-4">Cabinto</h1>
          <p className="text-xl opacity-90">Gestion moderne de cabinet médical</p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-700">Cabinto</h1>
            <p className="text-gray-600 mt-2">Gestion de cabinet médical</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Créer un compte
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Rejoignez Cabinto dès maintenant
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="fullname">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="fullname"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Dr. Jean Dupont"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création en cours..." : "Créer mon compte"}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Vous avez déjà un compte ?{" "}
              <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-8">
            © 2025 Cabinto. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
