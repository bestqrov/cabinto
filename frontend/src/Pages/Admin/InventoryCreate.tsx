import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../../Components/Sidebar";
import { FaBoxes } from "react-icons/fa";

export default function InventoryCreate() {
  const token = localStorage.getItem("token");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || user.role !== "Admin") {
      toast.error("غير مصرح لك بدخول هذه الصفحة");
      window.location.href = "/";
      return;
    }
  }, []);

  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [threshold, setThreshold] = useState("");
  const [supplier, setSupplier] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchInventory() {
    try {
      const res = await fetch("${API_URL}/inventory", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await res.json();
      if (data.error || data.message) {
        toast(data.error || data.message);
      } else {
        setItems(data);
      }
    } catch {
      toast.error("فشل في جلب المخزون");
    }
  }

  async function fetchSuppliers() {
    const res = await fetch("${API_URL}/supplier", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    const data = await res.json();
    if (data.error || data.message) {
      toast(data.error || data.message);
    } else {
      setSuppliers(data);
    }
  }

  useEffect(() => {
    fetchInventory();
    fetchSuppliers();
  }, []);

  // CREATE & UPDATE
  async function handleSubmit(e: any) {
    e.preventDefault();

    const body = {
      name,
      qty: Number(qty) || 0,
      threshold: Number(threshold) || 5,
      supplier,
    };

    try {
      const res = await fetch(
        editId
          ? `${API_URL}/inventory/${editId}`
          : "${API_URL}/inventory",
        {
          method: editId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (data.error || data.message) {
        toast(data.error || data.message);
      } else {
        toast.success(editId ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح");

        setName("");
        setQty("");
        setThreshold("");
        setSupplier("");
        setEditId(null);
      }

      fetchInventory();
    } catch {
      toast.error("حدث خطأ");
    }
  }

  // DELETE
  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذا العنصر؟")) return;

    try {
      const res = await fetch(`${API_URL}/inventory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await res.json();

      if (data.error || data.message) {
        toast(data.error || data.message);
      } else {
        toast.success("تم الحذف بنجاح");
      }
      fetchInventory();
    } catch {
      toast.error("فشل الحذف");
    }
  }

  // LOAD TO EDIT
  function fillForm(item: any) {
    setEditId(item._id);
    setName(item.name);
    setQty(item.qty.toString());
    setThreshold(item.threshold.toString());
    setSupplier(item.supplier?._id || "");
  }

  return (
    <div dir="ltr" className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <FaBoxes className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gérer Stock</h1>
              <p className="text-sm text-gray-500">Gestion de l'inventaire médical</p>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-5xl mx-auto">
      <div className="p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-semibold mb-4">
          {editId ? "تعديل عنصر مخزون طبي" : "إضافة عنصر جديد للمخزون الطبي"}
        </h1>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="اسم العنصر"
            className="border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="الكمية (افتراضي 0)"
            className="border p-2 rounded"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="الحد الأدنى (افتراضي 5)"
            className="border p-2 rounded"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          >
            <option value="">بدون مورّد</option>
            {suppliers.map((s: any) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <button className="md:col-span-2 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">
            {editId ? "حفظ التعديل" : "إضافة"}
          </button>
        </form>

        {/* INVENTORY LIST */}
        <h2 className="text-xl font-semibold mt-8 mb-2">جميع عناصر المخزون</h2>

        <div className="space-y-3">
          {items.map((item: any) => (
            <div
              key={item._id}
              className="p-4 border rounded flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">الكمية: {item.qty}</p>
                <p className="text-gray-600">الحد الأدنى: {item.threshold}</p>
                {item.supplier && (
                  <p className="text-blue-600">المورد: {item.supplier.name}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => fillForm(item)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  تعديل
                </button>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  حذف
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