import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { FaPrescriptionBottle } from "react-icons/fa";

export default function PrescriptionCreate() {
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== "Admin") {
      toast.error("غير مصرح لك بدخول هذه الصفحة");
      window.location.href = "/";
      return;
    }
  }, []);
  const [patient, setPatient] = useState("");
  const [praticien, setPraticien] = useState("");
  const [date, setDate] = useState("");
  const [medicines, setMedicines] = useState<any[]>([
    { name: "", dosage: "", directions: "" },
  ]);

  const [patients, setPatients] = useState([]);
  const [praticiens, setPraticiens] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [editId, setEditId] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  // جلب المرضى + الأطباء
  async function fetchData() {
    const res1 = await fetch("${API_URL}/patient", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res2 = await fetch(
      "${API_URL}/auth/users?role=Praticien",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setPatients(await res1.json());
    setPraticiens(await res2.json());
  }

  // جلب جميع الوصفات
  async function fetchPrescriptions() {
    const res = await fetch("${API_URL}/prescription", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setPrescriptions(await res.json());
  }

  useEffect(() => {
    fetchData();
    fetchPrescriptions();
  }, []);

  function updateMedicine(index: number, key: string, value: string) {
    const copy = [...medicines];
    copy[index][key] = value;
    setMedicines(copy);
  }

  function addMedicine() {
    setMedicines([...medicines, { name: "", dosage: "", directions: "" }]);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const body = { patient, praticien, date, medicines };
    const url = editId
      ? `${API_URL}/prescription/${editId}`
      : "${API_URL}/prescription";

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return toast.error("خطأ أثناء الحفظ");

    toast.success(editId ? "تم التعديل" : "تمت الإضافة");

    setPatient("");
    setPraticien("");
    setDate("");
    setMedicines([{ name: "", dosage: "", directions: "" }]);
    setEditId(null);

    fetchPrescriptions();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`${API_URL}/prescription/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return toast.error("خطأ أثناء الحذف");

    toast.success("تم الحذف");
    fetchPrescriptions();
  }

  function handleEdit(p: any) {
    setEditId(p._id);
    setPatient(p.patient._id);
    setPraticien(p.praticien._id);
    setDate(p.date?.slice(0, 10));
    setMedicines(p.medicines);
  }

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
              <FaPrescriptionBottle className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Créer Ordonnance</h1>
              <p className="text-sm text-gray-500">Gestion des ordonnances</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-3xl mx-auto">
  {/* Form */}
  <div className="bg-white shadow-md p-6 rounded-xl">
    <h1 className="text-2xl font-semibold mb-4">
      {editId ? "تعديل وصفة" : "إنشاء وصفة"}
    </h1>

    <form className="space-y-4" onSubmit={handleSubmit}>
      <select
        className="w-full border p-2 rounded"
        value={patient}
        onChange={(e) => setPatient(e.target.value)}
      >
        <option value="">اختر المريض</option>
        {patients.map((p: any) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        className="w-full border p-2 rounded"
        value={praticien}
        onChange={(e) => setPraticien(e.target.value)}
      >
        <option value="">اختر الطبيب</option>
        {praticiens.map((d: any) => (
          <option key={d._id} value={d._id}>
            {d.fullname}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="w-full border p-2 rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Medicines */}
      <div>
        <h2 className="font-semibold mb-2">الأدوية</h2>

        {medicines.map((m, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2"
          >
            <input
              type="text"
              placeholder="اسم الدواء"
              className="border p-2 rounded"
              value={m.name}
              onChange={(e) =>
                updateMedicine(idx, "name", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="الجرعة"
              className="border p-2 rounded"
              value={m.dosage}
              onChange={(e) =>
                updateMedicine(idx, "dosage", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="طريقة الاستخدام"
              className="border p-2 rounded"
              value={m.directions}
              onChange={(e) =>
                updateMedicine(idx, "directions", e.target.value)
              }
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addMedicine}
          className="px-4 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
        >
          + إضافة دواء
        </button>
      </div>

      <button className="w-full bg-green-600 text-white p-2 rounded">
        {editId ? "تعديل" : "إضافة"}
      </button>
    </form>
  </div>

  {/* All Prescriptions */}
  <div className="max-w-4xl mx-auto mt-10">
    <h2 className="text-xl font-semibold mb-3">جميع الوصفات</h2>

    <div className="space-y-3">
      {prescriptions.map((p: any) => (
        <div
          key={p._id}
          className="bg-white shadow p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4"
        >
          <div className="text-sm sm:text-base">
            <p>👤 المريض: {p.patient?.name}</p>
            <p>🩺 الطبيب: {p.praticien.fullname}</p>
            <p>📅 التاريخ: {p.date?.slice(0, 10)}</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleEdit(p)}
              className="px-3 py-1 bg-yellow-500 text-white rounded w-full sm:w-auto"
            >
              تعديل
            </button>

            <button
              onClick={() => handleDelete(p._id)}
              className="px-3 py-1 bg-red-600 text-white rounded w-full sm:w-auto"
            >
              حذف
            </button>

            <a
              href={`/prescription/${p._id}`}
              className="px-3 py-1 bg-blue-600 text-white rounded w-full sm:w-auto text-center"
            >
              عرض
            </a>
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
