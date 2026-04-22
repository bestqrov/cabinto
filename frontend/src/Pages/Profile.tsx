import { API_URL } from '../config';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSettings } from "../contexts/SettingsContext";

export default function Profile() {
  const { refreshSettings } = useSettings();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bioText, setBioText] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const token = localStorage.getItem("token");

  // =============================
  //  Récupération des données GET
  // =============================
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("${API_URL}/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();

        setUser(data);
        setBioText(data.bio);
        setAvatarPreview(data.avatar);
        setCoverPreview(data.cover);
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Erreur lors du chargement du profil");
      }
    })();
  }, []);

  // =============================
  //    Mise à jour des images Avatar & Cover (PUT)
  // =============================
  const updateImages = async (e: any) => {
    const formData = new FormData();

    if (e.target.name === "avatar") {
      formData.append("avatar", e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }

    if (e.target.name === "cover") {
      formData.append("cover", e.target.files[0]);
      setCoverPreview(URL.createObjectURL(e.target.files[0]));
    }

    try {
      const res = await fetch("${API_URL}/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setUser(data.user);
      toast.success("Image mise à jour avec succès");
      
      // Refresh settings if admin profile photo changes
      if (data.user?.role === "Admin") {
        await refreshSettings();
      }
    } catch (err) {
      toast.error("Erreur lors du téléchargement de l'image");
    }
  };

  // =============================
  //       Mise à jour BIO (PUT JSON)
  // =============================
  const updateBio = async () => {
    try {
      const res = await fetch("${API_URL}/auth/bio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: bioText }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to update bio");
      }

      const data = await res.json();

      setUser(data);
      toast.success("Bio mise à jour avec succès");
    } catch (error: any) {
      console.error("Update bio error:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  if (loading) return <p className="text-center py-10">Chargement...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-5 p-4">

      {/* Couverture */}
      <div className="relative">
        <img
          src={coverPreview || "/default-cover.jpg"}
          className="w-full h-64 rounded-xl object-cover"
          alt="cover"
        />

        <label className="absolute bottom-3 right-3 bg-black/60 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-black">
          Changer la couverture
          <input type="file" name="cover" className="hidden" onChange={updateImages} />
        </label>

        {/* Avatar */}
        <div className="absolute -bottom-16 left-10">
          <label className="relative group cursor-pointer">
            <img
              src={avatarPreview || "/default-avatar.png"}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
              alt="avatar"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition">
              Changer la photo
            </div>
            <input type="file" name="avatar" className="hidden" onChange={updateImages} />
          </label>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="mt-20 px-5">
        <h1 className="text-3xl font-bold">{user.fullname}</h1>
        <p className="text-gray-600 mt-1">{user.email}</p>
        <p className="text-gray-600 mt-1">{user.role}</p>
      </div>

      {/* BIO */}
      <div className="mt-6 bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Biographie</h2>

        <textarea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          className="w-full p-3 border rounded-md h-32 resize-none"
        />

        <button
          onClick={updateBio}
          className="mt-3 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          Enregistrer les modifications
        </button>
      </div>

    </div>
  );
}
