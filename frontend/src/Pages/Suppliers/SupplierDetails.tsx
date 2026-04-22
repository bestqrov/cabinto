import { API_URL } from '../../config';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Supplier {
  _id: string;
  name: string;
  phone?: number;
  email: string;
  address: string;
}

export default function SupplierDetails() {
  const token = localStorage.getItem("token");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("${API_URL}/supplier", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setSuppliers(data);
    } catch {
      toast.error("Erreur lors du chargement des fournisseurs");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const deleteSupplier = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer?")) return;

    try {
      const res = await fetch(`${API_URL}/supplier/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Supprimé avec succès");
      fetchSuppliers();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Liste des fournisseurs</h1>

      <Link
        to="/supplier/create"
        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
      >
        + Ajouter un fournisseur
      </Link>

      <div className="overflow-x-auto mt-6">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Nom</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Adresse</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.phone || "-"}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.address}</td>

                <td className="p-3 flex gap-3">
                  <Link
                    to={`/suppliers/edit/${s._id}`}
                    className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500"
                  >
                    Modifier
                  </Link>

                  <button
                    onClick={() => deleteSupplier(s._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
