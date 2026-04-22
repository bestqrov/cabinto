import { API_URL } from '../../config';
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { FaFileInvoiceDollar } from "react-icons/fa";

interface Patient {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface InvoiceItem {
  description: string;
  price: number | "";
  qty: number | "";
}

interface Invoice {
  _id: string;
  patient: Patient | string;
  items: InvoiceItem[];
  total: number;
  status: "مدفوع" | "غير مدفوع" | "جزئي";
  issuedAt: string;
  paidAt?: string;
}

export default function InvoicesCreate() {
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== "Admin") {
      toast.error("غير مصرح لك بدخول هذه الصفحة");
      window.location.href = "/";
      return;
    }
  }, []);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    patient: "",
    items: [
      { description: "", price: "" as number | "", qty: "" as number | "" },
    ],
    status: "غير مدفوع",
    paidAt: "",
  });

  // حماية المسار — دخول Admin فقط
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    if (!user || user.role !== "Admin") {
      toast.error("غير مصرح لك بدخول هذه الصفحة");
      window.location.href = "/";
      return;
    }
    fetchPatients();
    fetchInvoices();
  }, []);

  // حساب المجموع تلقائيًا
  const total = useMemo(() => {
    const items = form.items || [];
    return items.reduce((sum, it) => {
      const p = typeof it.price === "number" ? it.price : Number(it.price || 0);
      const q = typeof it.qty === "number" ? it.qty : Number(it.qty || 0);
      return sum + (isNaN(p) || isNaN(q) ? 0 : p * q);
    }, 0);
  }, [form.items]);

  // ----- Fetch Patients -----
  const fetchPatients = async () => {
    try {
      const res = await fetch("${API_URL}/patient", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "خطأ أثناء جلب المرضى");
      setPatients(data);
    } catch {
      toast.error("خطأ في الاتصال بالسيرفر");
    }
  };

  // ----- Fetch Invoices -----
  const fetchInvoices = async () => {
    try {
      const res = await fetch("${API_URL}/invoice", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "خطأ أثناء جلب الفواتير");
      setInvoices(data);
    } catch {
      toast.error("خطأ في الاتصال بالسيرفر");
    }
  };

  // ----- Handlers -----
  const handleItemChange = (
    index: number,
    key: keyof InvoiceItem,
    value: any
  ) => {
    const items = [...form.items];
    items[index] = { ...items[index], [key]: value };
    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: "", price: "", qty: "" }],
    });
  };

  const removeItem = (index: number) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // validation basic
    if (!form.patient) {
      toast.error("اختر مريضاً");
      setLoading(false);
      return;
    }
    if (!form.items || form.items.length === 0) {
      toast.error("أضف بند واحد على الأقل");
      setLoading(false);
      return;
    }

    try {
      let url = "${API_URL}/invoice";
      let method = "POST";

      if (editingId) {
        url = `${API_URL}/invoice/${editingId}`;
        method = "PUT";
      }

      const payload = {
        patient: form.patient,
        items: form.items.map((it) => ({
          description: it.description,
          price: Number(it.price || 0),
          qty: Number(it.qty || 0),
        })),
        status: form.status,
        paidAt: form.paidAt || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error || "حدث خطأ");
      } else {
        toast.success(editingId ? "تم تعديل الفاتورة" : "تم إنشاء الفاتورة");
        setForm({
          patient: "",
          items: [
            {
              description: "",
              price: "" as number | "",
              qty: "" as number | "",
            },
          ],
          status: "غير مدفوع",
          paidAt: "",
        });
        setEditingId(null);
        fetchInvoices();
      }
    } catch {
      toast.error("خطأ في الاتصال بالسيرفر");
    }

    setLoading(false);
  };

  const handleEdit = async (inv: Invoice) => {
    // ملء الفورم بالقيم
    setEditingId(inv._id);
    setForm({
      patient:
        typeof inv.patient === "string"
          ? inv.patient
          : (inv.patient as Patient)._id,
      items: inv.items.map((it) => ({
        description: it.description,
        price: it.price,
        qty: it.qty,
      })),
      status: inv.status,
      paidAt: inv.paidAt ? new Date(inv.paidAt).toISOString().slice(0, 16) : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف الفاتورة؟")) return;
    try {
      const res = await fetch(`${API_URL}/invoice/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.message || data.error || "فشل الحذف");
      else {
        toast.success("تم حذف الفاتورة");
        fetchInvoices();
      }
    } catch {
      toast.error("خطأ أثناء الحذف");
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
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
              <FaFileInvoiceDollar className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Créer Facture</h1>
              <p className="text-sm text-gray-500">Gestion des factures</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-6xl mx-auto" dir="ltr">
    <h1 className="text-3xl font-bold mb-6 text-blue-700">
      {editingId ? "تعديل فاتورة" : "إنشاء فاتورة جديدة"}
    </h1>

    {/* form */}
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 bg-white p-6 rounded-xl shadow-lg mb-8"
    >
      <select
        name="patient"
        value={form.patient}
        onChange={handleChange}
        className="input"
        required
      >
        <option value="">اختر المريض</option>
        {patients.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} {p.phone ? `- ${p.phone}` : ""}
          </option>
        ))}
      </select>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h3 className="font-semibold text-lg">عناصر الفاتورة</h3>
          <button
            type="button"
            onClick={addItem}
            className="text-sm bg-green-500 text-white px-3 py-1 rounded w-full sm:w-auto"
          >
            أضف بند
          </button>
        </div>

        {form.items.map((it, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
          >
            <input
              className="sm:col-span-6 p-2 border rounded"
              placeholder="الوصف"
              value={it.description}
              onChange={(e) =>
                handleItemChange(idx, "description", e.target.value)
              }
              required
            />

            <input
              className="sm:col-span-2 p-2 border rounded"
              placeholder="السعر"
              type="number"
              min="0"
              value={String(it.price)}
              onChange={(e) =>
                handleItemChange(idx, "price", Number(e.target.value))
              }
              required
            />

            <input
              className="sm:col-span-2 p-2 border rounded"
              placeholder="الكمية"
              type="number"
              min="1"
              value={String(it.qty)}
              onChange={(e) =>
                handleItemChange(idx, "qty", Number(e.target.value))
              }
              required
            />

            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="sm:col-span-2 bg-red-500 text-white py-2 rounded w-full"
            >
              حذف
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full">
          <label className="block mb-1 font-semibold">الحالة</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="غير مدفوع">غير مدفوع</option>
            <option value="جزئي">جزئي</option>
            <option value="مدفوع">مدفوع</option>
          </select>
        </div>

        <div className="flex-1 w-full">
          <label className="block mb-1 font-semibold">
            تاريخ الدفع (اختياري)
          </label>
          <input
            name="paidAt"
            value={form.paidAt}
            onChange={handleChange}
            type="datetime-local"
            className="input w-full"
          />
        </div>

        <div className="text-right w-full sm:w-auto mt-3 sm:mt-0">
          <p className="text-sm text-gray-600">المجموع:</p>
          <p className="text-2xl font-semibold">{total.toLocaleString()} ج.م</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          {loading
            ? "جارٍ الحفظ..."
            : editingId
            ? "حفظ التعديلات"
            : "إنشاء الفاتورة"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                patient: "",
                items: [
                  {
                    description: "",
                    price: "" as number | "",
                    qty: "" as number | "",
                  },
                ],
                status: "غير مدفوع",
                paidAt: "",
              });
            }}
            className="bg-gray-300 px-4 py-2 rounded w-full sm:w-auto"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>

    {/* invoices table */}
    <h2 className="text-2xl font-semibold mb-4 text-blue-600">
      قائمة الفواتير
    </h2>

    {invoices.length === 0 ? (
      <p className="text-gray-500">لا توجد فواتير</p>
    ) : (
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full bg-white shadow rounded-lg min-w-[600px]">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">المريض</th>
              <th className="p-3">المجموع</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">التاريخ</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">
                  {typeof inv.patient === "string"
                    ? inv.patient
                    : inv.patient.name}
                </td>
                <td className="p-3">
                  {inv.total?.toLocaleString() ?? "-"}
                </td>
                <td className="p-3">{inv.status}</td>
                <td className="p-3">
                  {new Date(inv.issuedAt).toLocaleString("fr-FR")}
                </td>
                <td className="p-3 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleEdit(inv)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded w-full sm:w-auto"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => navigate(`/invoices/${inv._id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded w-full sm:w-auto"
                  >
                    عرض
                  </button>
                  <button
                    onClick={() => handleDelete(inv._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded w-full sm:w-auto"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
          </div>
        </main>
      </div>
    </div>
  );
}
