import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { FaFileUpload } from "react-icons/fa";

export default function MedicalFileCreate() {
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== "Admin") {
      toast.error("Accès non autorisé");
      window.location.href = "/";
      return;
    }
  }, []);
  const [patients, setPatients] = useState<any[]>([]);
  const [patient, setPatient] = useState("");
  const [fileType, setFileType] = useState("image");
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<any[]>([]);

  const token = localStorage.getItem("token");

  // Récupérer les patients
  async function fetchPatients() {
    try {
      const res = await fetch("${API_URL}/patient", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPatients(await res.json());
    } catch (error) {
      console.error(error);
    }
  }

  // Récupérer tous les fichiers
  async function fetchFiles() {
    try {
      const res = await fetch("${API_URL}/medicalFile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFiles(await res.json());
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchPatients();
    fetchFiles();
  }, []);

  // Télécharger un fichier
  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!file) return toast.error("Veuillez sélectionner un fichier");
    if (!patient) return toast.error("Veuillez sélectionner un patient");

    const formData = new FormData();
    formData.append("patient", patient);
    formData.append("fileType", fileType);
    formData.append("file", file);

    try {
      const res = await fetch("${API_URL}/medicalFile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.error || data.message) {
        toast.error(data.error || data.message);
      } else {
        toast.success("Fichier téléchargé avec succès");
        setFile(null);
        setPatient("");
        fetchFiles();
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement du fichier");
    }
  }

  // Supprimer un fichier
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${API_URL}/medicalFile/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return toast.error("Erreur lors de la suppression");

      toast.success("Fichier supprimé");
      fetchFiles();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
              <FaFileUpload className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dossiers Médicaux</h1>
              <p className="text-sm text-gray-500">Télécharger et gérer les fichiers médicaux</p>
            </div>
          </div>
        </header>

        {/* Form Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Télécharger un fichier médical</h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nom} {p.prenom}
                    </option>
                  ))}
                </select>

                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                >
                  <option value="image">Image</option>
                  <option value="xray">Radiographie</option>
                  <option value="pdf">PDF</option>
                </select>

                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />

                <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg">
                  Télécharger le fichier
                </button>
              </form>
            </div>

            {/* Afficher les fichiers */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tous les fichiers</h2>

              <div className="space-y-3">
                {files.map((f) => (
                  <div
                    key={f._id}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-medium">👤 Patient: {f.patient?.nom} {f.patient?.prenom}</p>
                      <p className="text-sm text-gray-600">📁 Type: {f.fileType}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={f.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Voir
                      </a>
                      <button
                        onClick={() => handleDelete(f._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
