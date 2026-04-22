import { API_URL } from '../config';
// ----------------------------
// Main.tsx
// ----------------------------
import { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import toast from "react-hot-toast";
import { FaTrashAlt, FaHome } from "react-icons/fa";

interface User {
  _id: string;
  fullname: string;
  email: string;
  avatar?: string;
  cover?: string;
  bio?: string;
  role?: string;
}

export default function Main() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);

  const token = localStorage.getItem("token");

  // ----------------------------
  // Récupérer l'utilisateur actuel
  // ----------------------------
  useEffect(() => {
    (async () => {
      const res = await fetch("${API_URL}/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: User = await res.json();
      setCurrentUser(data);
    })();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      const res = await fetch("${API_URL}/auth/users", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: User[] = await res.json();

      setUsers(data.filter((u) => u._id !== currentUser?._id));
    })();
  }, [currentUser]);

  // ----------------------------
  // Récupérer les informations d'un utilisateur
  // ----------------------------
  const fetchUserById = async (id: string) => {
    if (selected?._id === id) {
      setSelected(null);
      return;
    }

    const res = await fetch(`${API_URL}/auth/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data: User = await res.json();
    setSelected(data);
  };

  // ----------------------------
  // Changer le rôle (Admin uniquement)
  // ----------------------------
  const changeRole = async (role: string) => {
    if (!selected) return;

    try {
      const res = await fetch(
        `${API_URL}/role/role/${selected._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );

      const data = await res.json();

      if (!res.ok) return toast.error(data.message || "Échec du changement de rôle");

      toast.success("Rôle mis à jour avec succès");

      // تحديث الواجهة مباشرة
      setSelected({ ...selected, role });

      // تحديث القائمة أيضاً
      setUsers(users.map((u) => (u._id === selected._id ? { ...u, role } : u)));
    } catch {
      toast.error("Erreur de connexion au serveur");
    }
  };

  // ----------------------------
  // Supprimer un utilisateur
  // ----------------------------
  const deleteUser = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer l'utilisateur?")) return;

    const res = await fetch(`${API_URL}/auth/user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setUsers(users.filter((u) => u._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success("Utilisateur supprimé");
    } else {
      toast.error("Échec de la suppression");
    }
  };

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FaHome className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Personnel</h1>
              <p className="text-sm text-gray-500">Gérer les utilisateurs du système</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden flex">
          {/* Users List Sidebar */}
          <aside className="w-80 bg-white border-r overflow-y-auto p-4">
            <h2 className="text-xl font-semibold mb-4">Tous les utilisateurs</h2>

            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => fetchUserById(u._id)}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm mb-3 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                <img
                  src={u.avatar || "/default-avatar.png"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{u.fullname}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>

              {currentUser?.role === "Admin" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteUser(u._id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrashAlt />
                </button>
              )}
            </div>
          ))}
        </aside>

        {/* Main Profile View */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Sélectionnez un utilisateur pour voir les détails</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
                <img
                  src={selected.avatar || "/default-avatar.png"}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover absolute -bottom-14 left-10"
                />
              </div>

              <div className="mt-16 p-8">
                <h1 className="text-3xl font-bold">{selected.fullname}</h1>
                <p className="text-gray-600">{selected.email}</p>
                <p className="text-sm text-gray-500">
                  Rôle actuel: {selected.role}
                </p>

                {/* Bouton changer le rôle (Admin uniquement) */}
                {currentUser?.role === "Admin" && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => changeRole("Dentist")}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Convertir en Dentiste
                    </button>

                    <button
                      onClick={() => changeRole("Receptionist")}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Convertir en Réceptionniste
                    </button>

                    <button
                      onClick={() => changeRole("user")}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Convertir en Utilisateur
                    </button>
                  </div>
                )}

                <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold mb-2">Biographie</h2>
                  <p className="text-gray-700">{selected.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}
