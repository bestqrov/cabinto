import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import { FaFileAlt } from "react-icons/fa";

export default function MedicalFileDetails() {
  const { patientId } = useParams();
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchFiles() {
      const res = await fetch(
        `${API_URL}/medicalFile/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setFiles(await res.json());
    }
    fetchFiles();
  }, [patientId]);

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
              <FaFileAlt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Détails Dossier Médical</h1>
              <p className="text-sm text-gray-500">Fichiers du patient</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">ملفات المريض</h1>

        {files.length === 0 && <p>لا توجد ملفات</p>}

        <div className="space-y-3">
          {files.map((f: any) => (
            <div
              key={f._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <p>📁 النوع: {f.fileType}</p>
                <p>👤 المرفع: {f.uploadedBy?.name}</p>
              </div>
              <a
                href={f.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                عرض الملف
              </a>
            </div>
          ))}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
