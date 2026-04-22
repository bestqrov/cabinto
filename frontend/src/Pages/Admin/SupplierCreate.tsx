import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { FaTruck } from "react-icons/fa";

export default function SupplierCreate() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== "Admin") {
      toast.error("غير مصرح لك بدخول هذه الصفحة");
      window.location.href = "/";
      return;
    }
  }, []);

  const handleChange = (e: any) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
  };

  const fetchSupplier = async () => {
    try {
      const res = await fetch(`${API_URL}/supplier/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data) {
        toast(data.error || data.message);
      } else {
        setSupplier({
          name: data.name,
          phone: data.phone || "",
          email: data.email,
          address: data.address,
        });
      }
    } catch {
      toast.error("خطأ أثناء جلب بيانات المورد");
    }
  };

  useEffect(() => {
    if (id) fetchSupplier();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = "${API_URL}/supplier";
      let method = "POST";

      if (id) {
        url = `${API_URL}/supplier/${id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplier),
      });

      const data = await res.json();

      if (data) toast(data.error || data.message);
      else toast.success(id ? "تم التعديل بنجاح" : "تم إنشاء المورد");

      navigate("/supplier");
    } catch {
      toast.error("خطأ أثناء حفظ المورد");
    }

    setLoading(false);
  };

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <FaTruck className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gérer Fournisseurs</h1>
              <p className="text-sm text-gray-500">Gestion des fournisseurs</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          {id ? "تعديل مورد" : "إضافة مورد جديد"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg p-6 rounded-xl grid gap-4"
        >
          <input
            name="name"
            placeholder="اسم المورد"
            value={supplier.name}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="phone"
            placeholder="رقم الهاتف (اختياري)"
            value={supplier.phone}
            onChange={handleChange}
            className="input"
          />

          <input
            name="email"
            placeholder="الإيميل"
            value={supplier.email}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            name="address"
            placeholder="العنوان"
            value={supplier.address}
            onChange={handleChange}
            className="input"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "جاري الحفظ..." : id ? "تعديل" : "إضافة"}
          </button>
        </form>
          </div>
        </main>
      </div>
    </div>
  );
}
