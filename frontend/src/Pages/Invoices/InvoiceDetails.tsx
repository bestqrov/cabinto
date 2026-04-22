import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { useSettings } from "../../contexts/SettingsContext";
import logo from "../../images/logo.avif";
import { FaFileInvoiceDollar } from "react-icons/fa";

interface Patient {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Invoice {
  _id: string;
  patient: Patient;
  items: { description: string; price: number; qty: number }[];
  total: number;
  status: string;
  issuedAt: string;
  paidAt?: string;
}

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const token = localStorage.getItem("token");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`${API_URL}/invoice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "خطأ أثناء جلب الفاتورة");
      setInvoice(data);
    } catch {
      toast.error("خطأ في الاتصال بالسيرفر");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  if (loading) return <p className="text-center p-10">جاري التحميل...</p>;
  if (!invoice) return <p className="text-center p-10">الفاتورة غير موجودة</p>;

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
              <h1 className="text-2xl font-bold text-gray-800">Détails Facture</h1>
              <p className="text-sm text-gray-500">Informations de la facture</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-3xl mx-auto" dir="ltr">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-700">فاتورة</h1>
              <p className="text-gray-600">مريض: {invoice.patient.name}</p>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <p className="text-sm text-gray-500">تاريخ الإصدار</p>
              <p>{new Date(invoice.issuedAt).toLocaleString("fr-FR")}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">العناصر</h3>
            <div className="border rounded overflow-x-auto">
              <table className="w-full text-right min-w-[500px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">الوصف</th>
                    <th className="p-2">السعر</th>
                    <th className="p-2">الكمية</th>
                    <th className="p-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{it.description}</td>
                      <td className="p-2">{it.price.toLocaleString()}</td>
                      <td className="p-2">{it.qty}</td>
                      <td className="p-2">
                        {(it.price * it.qty).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p>
                الحالة: <span className="font-semibold">{invoice.status}</span>
              </p>
              <p>
                تاريخ الدفع:{" "}
                {invoice.paidAt
                  ? new Date(invoice.paidAt).toLocaleString("fr-FR")
                  : "-"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-500">المجموع الكلي</p>
              <p className="text-2xl font-bold">
                {invoice.total.toLocaleString()} ج.م
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-300 px-4 py-2 rounded w-full sm:w-auto"
            >
              العودة
            </button>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
