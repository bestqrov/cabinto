import { API_URL } from '../../config';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSettings } from "../../contexts/SettingsContext";
import {
  FaSave,
  FaUserMd,
  FaTimes,
  FaBars,
  FaHome,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaFilePrescription,
  FaNotesMedical,
  FaUsers,
  FaCog,
  FaBoxes,
  FaTruck,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaDatabase,
  FaDownload,
  FaUpload,
  FaFileArchive,
  FaCamera,
  FaGlobe,
  FaUserCircle,
  FaIdCard,
  FaCheckCircle,
  FaLock,
} from "react-icons/fa";
import logo from "../../images/logo.avif";
import Sidebar from "../../Components/Sidebar";

export default function Settings() {
  const navigate = useNavigate();
  const { refreshSettings } = useSettings();
  const token = localStorage.getItem("token");
  // Use shared Sidebar component; keep menu fixed
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "admin" | "backup" | "personnel">("profile");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const [cabinetData, setCabinetData] = useState({
    name: "Cabinet Dentaire",
    targetLine: "Votre santé, notre priorité",
    email: "contact@cabinet-medical.ma",
    phone: "+212 5XX XXX XXX",
    website: "",
    address: "Casablanca, Maroc",
    country: "Maroc",
    if: "",
    ice: "",
    cnss: "",
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    role: "Admin",
  });

  const [adminPhotoPreview, setAdminPhotoPreview] = useState<string>("");
  const [adminPhotoFile, setAdminPhotoFile] = useState<File | null>(null);

  // Personnel Management States
  const [personnelData, setPersonnelData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "Receptionist", // Receptionist or Dentist
    specialization: "", // For doctors
    approved: false,
    permissions: {
      patients: true,
      appointments: true,
      invoices: true,
      medicalFiles: true,
      prescriptions: true,
      inventory: true,
      suppliers: true,
      statistics: true,
    }
  });
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [existingPersonnel, setExistingPersonnel] = useState<any[]>([]);
  const [isNewPersonnel, setIsNewPersonnel] = useState(true);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const handleCabinetChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCabinetData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdminPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", cabinetData.name);
      formData.append("targetLine", cabinetData.targetLine);
      formData.append("email", cabinetData.email);
      formData.append("phone", cabinetData.phone);
      formData.append("website", cabinetData.website);
      formData.append("address", cabinetData.address);
      formData.append("country", cabinetData.country);
      formData.append("if", cabinetData.if);
      formData.append("ice", cabinetData.ice);
      formData.append("cnss", cabinetData.cnss);
      
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      // You'll need to create this API endpoint
      const res = await fetch("${API_URL}/settings/cabinet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        toast.success("Profil du cabinet mis à jour avec succès");
        await refreshSettings(); // Refresh settings globally
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", adminData.name);
      formData.append("email", adminData.email);
      formData.append("role", adminData.role);
      
      if (adminPhotoFile) {
        formData.append("photo", adminPhotoFile);
      }

      // You'll need to create this API endpoint
      const res = await fetch("${API_URL}/settings/admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        await refreshSettings(); // Refresh settings globally
        toast.success("Informations admin mises à jour avec succès");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch("${API_URL}/backup/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${new Date().toISOString().split("T")[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Sauvegarde créée avec succès");
      } else {
        toast.error("Erreur lors de la création de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("backup", file);

    try {
      const res = await fetch("${API_URL}/backup/restore", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Restauration effectuée avec succès");
      } else {
        toast.error(data.message || "Erreur lors de la restauration");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  // Personnel Management Functions
  const handlePersonnelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonnelData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonnelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    
    if (userId) {
      setIsNewPersonnel(false);
      setSelectedUserId(userId);
      const selected = personnelList.find(p => p._id === userId);
      const matchingPersonnel = existingPersonnel.find(ep => {
        try {
          if (!ep.userId) return false;
          if (typeof ep.userId === 'string') return ep.userId === userId;
          if (ep.userId._id) return ep.userId._id === userId;
          return ep.userId.toString() === userId;
        } catch (err) {
          return false;
        }
      });
      if (selected) {
        setPersonnelData({
          fullname: selected.fullname,
          email: selected.email || "",
          password: "",
          role: selected.role,
          specialization: selected.specialization || "",
          approved: matchingPersonnel?.approved || false,
          permissions: matchingPersonnel?.permissions || selected.permissions || {
            patients: true,
            appointments: true,
            invoices: true,
            medicalFiles: true,
            prescriptions: true,
            inventory: true,
            suppliers: true,
            statistics: true,
          }
        });
      }
    } else {
      setIsNewPersonnel(true);
      setSelectedUserId("");
      setPersonnelData({
        fullname: "",
        email: "",
        password: "",
        role: "Receptionist",
        specialization: "",
        permissions: {
          patients: true,
          appointments: true,
          invoices: true,
          medicalFiles: true,
          prescriptions: true,
          inventory: true,
          suppliers: true,
          statistics: true,
        }
      });
    }
  };

  const handleCreatePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check limits before creating
    const receptionistCount = personnelList.filter(p => p.role === "Receptionist").length;
    const dentistCount = personnelList.filter(p => p.role === "Dentist").length;
    
    if (personnelData.role === "Receptionist" && receptionistCount >= 1) {
      toast.error("⚠️ Limite atteinte: Un seul secrétaire est autorisé, veuillez contacter Dentissra");
      setLoading(false);
      return;
    }
    
    if (personnelData.role === "Dentist" && dentistCount >= 10) {
      toast.error("⚠️ Limite atteinte: Maximum 10 docteurs autorisés, veuillez contacter Dentissra");
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      console.log('Sending personnel data:', personnelData);
      const res = await fetch("${API_URL}/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(personnelData),
      });

      const data = await res.json();
      console.log('Response:', data);

      if (res.ok) {
        toast.success(`${personnelData.role === "Receptionist" ? "Secrétaire" : "Docteur"} créé(e) avec succès`);
        
        // Save credentials to show to admin
        setCreatedCredentials({
          email: personnelData.email,
          password: personnelData.password,
        });
        
        setPersonnelData({
          fullname: "",
          email: "",
          password: "",
          role: "Receptionist",
          specialization: "",
          permissions: {
            patients: true,
            appointments: true,
            invoices: true,
            medicalFiles: true,
            prescriptions: true,
            inventory: true,
            suppliers: true,
            statistics: true,
          }
        });
        fetchPersonnelList();
      } else {
        toast.error(data.error || data.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonnelList = async () => {
    try {
      const res = await fetch("${API_URL}/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter(
          (user: any) => user.role === "Receptionist" || user.role === "Dentist"
        );
        setPersonnelList(filtered);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const fetchExistingPersonnel = async () => {
    try {
      const res = await fetch("${API_URL}/personnel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setExistingPersonnel(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUserId) {
      toast.error("Aucun personnel sélectionné");
      return;
    }

    setLoading(true);
    try {
      // First update the User permissions
      const res = await fetch(`${API_URL}/auth/user/${selectedUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permissions: personnelData.permissions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const currentUser = localStorage.getItem("user");
        let isCurrentUser = false;
        
        if (currentUser) {
          const parsedUser = JSON.parse(currentUser);
          isCurrentUser = parsedUser._id === selectedUserId;
        }
        
        if (isCurrentUser) {
          // If updating current user's permissions
          toast.success("Autorisations mises à jour. Redirection pour appliquer les modifications...");
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }, 2000);
        } else {
          // If updating another user
          const selectedUser = personnelList.find(p => p._id === selectedUserId);
          toast.success(
            `✅ Autorisations mises à jour avec succès!\n\n` +
            `⚠️ IMPORTANT: ${selectedUser?.fullname || 'L\'utilisateur'} doit se déconnecter et se reconnecter pour que les nouvelles autorisations prennent effet.`,
            {
              duration: 8000,
              style: {
                background: '#FFF3CD',
                color: '#856404',
                border: '2px solid #FFEAA7',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              }
            }
          );
        }
        
        fetchPersonnelList();
        // Also update Personnel document if exists (to set approved and personnel-level permissions)
        try {
          const personnelDoc = existingPersonnel.find((ep: any) => {
            try {
              if (!ep.userId) return false;
              if (typeof ep.userId === 'string') return ep.userId === selectedUserId;
              if (ep.userId._id) return ep.userId._id === selectedUserId;
              return ep.userId.toString() === selectedUserId;
            } catch (err) {
              return false;
            }
          });

          if (personnelDoc) {
            await fetch(`${API_URL}/personnel/${personnelDoc._id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                permissions: personnelData.permissions,
                approved: personnelData.approved,
              }),
            });

            // refresh personnel list from server
            fetchExistingPersonnel();
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour du personnel:", err);
        }
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePersonnel = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce personnel ?")) return;

    try {
      const res = await fetch(`${API_URL}/auth/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Personnel supprimé avec succès");
        fetchPersonnelList();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    }
  };

  const handleEditPersonnel = (person: any) => {
    setEditingPersonnel({
      _id: person._id,
      fullname: person.fullname,
      email: person.email,
      role: person.role,
      specialization: person.specialization || "",
      permissions: person.permissions || {
        patients: true,
        appointments: true,
        invoices: true,
        medicalFiles: true,
        prescriptions: true,
        inventory: true,
        suppliers: true,
        statistics: true,
      }
    });
    setShowEditModal(true);
  };

  const handleUpdatePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/user/${editingPersonnel._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname: editingPersonnel.fullname,
          role: editingPersonnel.role,
          specialization: editingPersonnel.specialization,
          permissions: editingPersonnel.permissions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Personnel mis à jour avec succès");
        setShowEditModal(false);
        setEditingPersonnel(null);
        fetchPersonnelList();
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingPersonnel(null);
  };

  // Load personnel list on component mount
  useEffect(() => {
    if (token) {
      fetchPersonnelList();
      fetchExistingPersonnel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const menuItems = [
    { title: "Dashboard", icon: <FaHome />, link: "/dashboard", color: "text-blue-400" },
    { title: "Patients", icon: <FaUsers />, link: "/patients", color: "text-green-400" },
    {
      title: "Rendez-vous",
      icon: <FaCalendarAlt />,
      link: "/appointments",
      color: "text-purple-400",
    },
    {
      title: "Factures",
      icon: <FaFileInvoiceDollar />,
      link: "/factures",
      color: "text-cyan-400",
    },
    {
      title: "Ordonnances",
      icon: <FaFilePrescription />,
      link: "/ordonnances",
      color: "text-pink-400",
    },
    {
      title: "Feuilles de Soin",
      icon: <FaNotesMedical />,
      link: "/feuilles",
      color: "text-yellow-400",
    },
    {
      title: "Inventaire",
      icon: <FaBoxes />,
      link: "/inventory",
      color: "text-orange-400",
    },
    {
      title: "Fournisseurs",
      icon: <FaTruck />,
      link: "/supplier",
      color: "text-indigo-400",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      {/* Shared Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <FaCog className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
                <p className="text-sm text-gray-500">
                  Gérez le profil du cabinet et les sauvegardes
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                <FaBuilding />
                Profil du Cabinet
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === "admin"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                <FaUserCircle />
                Admin Profile
              </button>
              {currentUser?.role === "Admin" && (
                <button
                  onClick={() => {
                    setActiveTab("personnel");
                    fetchPersonnelList();
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === "personnel"
                      ? "bg-white text-blue-600 shadow-lg"
                      : "bg-white/50 text-gray-600 hover:bg-white"
                  }`}
                >
                  <FaUsers />
                  Personnel
                </button>
              )}
              <button
                onClick={() => setActiveTab("backup")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === "backup"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }`}
              >
                <FaDatabase />
                Sauvegarde & Restauration
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Mise à jour du Profil</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="text-blue-600 font-semibold">● Requis*</span>
                    <span className="text-gray-400 ml-4">● Optionnel</span>
                  </p>
                </div>

                <form onSubmit={handleSaveCabinet}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Logo & Basic Info */}
                    <div className="space-y-6">
                      {/* Logo Upload */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <label className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Logo Cabinet*
                        </label>
                        <div className="flex flex-col items-center justify-center py-4">
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 overflow-hidden">
                            {logoPreview ? (
                              <img
                                src={logoPreview}
                                alt="Logo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-white">
                                <FaBuilding className="text-4xl mx-auto mb-2" />
                                <p className="text-xs font-bold">VOTRE LOGO</p>
                                <p className="text-xs font-bold">ICI</p>
                              </div>
                            )}
                          </div>
                          <label
                            htmlFor="logo-upload"
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                          >
                            <FaCamera />
                            Changer Logo
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Cabinet Name */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Nom du Cabinet*
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={cabinetData.name}
                          onChange={handleCabinetChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Nom du Cabinet"
                        />
                      </div>

                      {/* Target Line */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Slogan*
                        </label>
                        <input
                          type="text"
                          name="targetLine"
                          value={cabinetData.targetLine}
                          onChange={handleCabinetChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Slogan du cabinet"
                        />
                      </div>
                    </div>

                    {/* Right Column - Contact Info */}
                    <div className="space-y-6">
                      {/* Phone */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Numéro de Téléphone*
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={cabinetData.phone}
                          onChange={handleCabinetChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Numéro de téléphone"
                        />
                      </div>

                      {/* Website */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-gray-400 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Site Web
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={cabinetData.website}
                          onChange={handleCabinetChange}
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
                          placeholder="URL du site web"
                        />
                      </div>

                      {/* Address */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Adresse*
                        </label>
                        <textarea
                          name="address"
                          value={cabinetData.address}
                          onChange={handleCabinetChange}
                          required
                          rows={3}
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                          placeholder="Adresse"
                        />
                      </div>

                      {/* Country */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Pays*
                        </label>
                        <select
                          name="country"
                          value={cabinetData.country}
                          onChange={handleCabinetChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                        >
                          <option value="">Sélectionner un pays</option>
                          <option value="Maroc">Maroc</option>
                          <option value="France">France</option>
                          <option value="Tunisie">Tunisie</option>
                          <option value="Algérie">Algérie</option>
                          <option value="Belgique">Belgique</option>
                          <option value="Suisse">Suisse</option>
                          <option value="Canada">Canada</option>
                        </select>
                      </div>
                    </div>

                    {/* Legal Information Section */}
                    <div className="col-span-2 mt-8 pt-8 border-t-2 border-gray-100">
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
                        <div className="flex items-start gap-3">
                          <FaInfoCircle className="text-orange-600 text-xl mt-1" />
                          <div>
                            <h3 className="font-semibold text-orange-900 mb-2">
                              Informations Légales pour Facturation
                            </h3>
                            <p className="text-sm text-orange-800">
                              Ces informations apparaîtront sur vos factures et documents officiels
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* IF (Identifiant Fiscal) */}
                        <div className="relative">
                          <label className="absolute -top-2 left-3 bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                            IF (Identifiant Fiscal)
                          </label>
                          <input
                            type="text"
                            name="if"
                            value={cabinetData.if}
                            onChange={handleCabinetChange}
                            className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="12345678"
                          />
                        </div>

                        {/* ICE */}
                        <div className="relative">
                          <label className="absolute -top-2 left-3 bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                            ICE
                          </label>
                          <input
                            type="text"
                            name="ice"
                            value={cabinetData.ice}
                            onChange={handleCabinetChange}
                            className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="001234567890123"
                          />
                        </div>

                        {/* CNSS */}
                        <div className="relative">
                          <label className="absolute -top-2 left-3 bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                            CNSS
                          </label>
                          <input
                            type="text"
                            name="cnss"
                            value={cabinetData.cnss}
                            onChange={handleCabinetChange}
                            className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="9876543210"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Preview Card */}
                  <div className="mt-8 pt-8 border-t-2 border-gray-100">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Aperçu du Profil</h3>
                        <span className="px-4 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">
                          Vue du Profil
                        </span>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex flex-col items-center text-center">
                          {/* Logo Preview */}
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 overflow-hidden">
                            {logoPreview ? (
                              <img
                                src={logoPreview}
                                alt="Logo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-white">
                                <FaBuilding className="text-3xl mx-auto mb-1" />
                                <p className="text-xs font-bold">VOTRE LOGO</p>
                                <p className="text-xs font-bold">ICI</p>
                              </div>
                            )}
                          </div>

                          {/* Cabinet Info Preview */}
                          <h4 className="text-xl font-bold text-gray-800 mb-1">
                            {cabinetData.name || "Nom du Cabinet"}
                          </h4>
                          <p className="text-sm text-orange-500 font-medium mb-4">
                            {cabinetData.targetLine || "Slogan du cabinet"}
                          </p>

                          <div className="w-full space-y-2 text-sm text-left">
                            <div className="flex items-center gap-2">
                              <FaPhone className="text-gray-400" />
                              <span className="text-gray-600">Téléphone</span>
                              <span className="ml-auto text-gray-800 font-medium">
                                {cabinetData.phone || "XXXXXXXXXXX"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="text-gray-400" />
                              <span className="text-gray-600">Email</span>
                              <span className="ml-auto text-blue-600 font-medium truncate">
                                {cabinetData.email || "email@example.com"}
                              </span>
                            </div>
                            {cabinetData.website && (
                              <div className="flex items-center gap-2">
                                <FaGlobe className="text-gray-400" />
                                <span className="text-gray-600">Site Web</span>
                                <span className="ml-auto text-gray-800 font-medium truncate">
                                  {cabinetData.website}
                                </span>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <FaMapMarkerAlt className="text-gray-400 mt-1" />
                              <span className="text-gray-600">Adresse</span>
                              <span className="ml-auto text-gray-800 font-medium text-right max-w-xs">
                                {cabinetData.address || "----------"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaInfoCircle className="text-gray-400" />
                              <span className="text-gray-600">Pays</span>
                              <span className="ml-auto text-gray-800 font-medium">
                                {cabinetData.country || "---------"}
                              </span>
                            </div>

                            {/* Legal Info in Preview */}
                            {(cabinetData.if || cabinetData.ice || cabinetData.cnss) && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 font-semibold mb-2">
                                  Informations Légales:
                                </p>
                                <div className="space-y-1 text-xs text-gray-600">
                                  {cabinetData.if && (
                                    <div>
                                      <span className="font-medium">IF:</span> {cabinetData.if}
                                    </div>
                                  )}
                                  {cabinetData.ice && (
                                    <div>
                                      <span className="font-medium">ICE:</span> {cabinetData.ice}
                                    </div>
                                  )}
                                  {cabinetData.cnss && (
                                    <div>
                                      <span className="font-medium">CNSS:</span> {cabinetData.cnss}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-center mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      <FaSave className="text-xl" />
                      {loading ? "Mise à jour..." : "Mettre à jour le Profil"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admin Profile Tab */}
            {activeTab === "admin" && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Mise à jour Admin</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="text-blue-600 font-semibold">● Requis*</span>
                    <span className="text-gray-400 ml-4">● Optionnel</span>
                  </p>
                </div>

                <form onSubmit={handleSaveAdmin}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Photo */}
                    <div className="space-y-6">
                      {/* Admin Photo Upload */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <label className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Photo Admin
                        </label>
                        <div className="flex flex-col items-center justify-center py-4">
                          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-lg">
                            {adminPhotoPreview ? (
                              <img
                                src={adminPhotoPreview}
                                alt="Admin"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUserCircle className="text-white text-8xl" />
                            )}
                          </div>
                          <label
                            htmlFor="admin-photo-upload"
                            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                          >
                            <FaCamera />
                            Changer Photo
                            <input
                              id="admin-photo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleAdminPhotoChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Info */}
                    <div className="space-y-6">
                      {/* Admin Name */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Nom Complet*
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={adminData.name}
                          onChange={handleAdminChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          placeholder="Nom de l'administrateur"
                        />
                      </div>

                      {/* Admin Email */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Email*
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={adminData.email}
                          onChange={handleAdminChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          placeholder="admin@cabinet.com"
                        />
                      </div>

                      {/* Role */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Rôle*
                        </label>
                        <select
                          name="role"
                          value={adminData.role}
                          onChange={handleAdminChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none bg-white"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Receptionist">Réceptionniste</option>
                          <option value="Doctor">Docteur</option>
                        </select>
                      </div>

                      {/* Info Card */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg">
                        <div className="flex items-start gap-3">
                          <FaIdCard className="text-purple-600 text-xl mt-1" />
                          <div>
                            <h3 className="font-semibold text-purple-900 mb-2">
                              Informations Admin
                            </h3>
                            <p className="text-sm text-purple-800">
                              Ces informations seront utilisées pour identifier l'administrateur dans le système. Assurez-vous que l'email est correct pour la connexion.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Preview */}
                  <div className="mt-8 pt-8 border-t-2 border-gray-100">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Aperçu du Profil Admin</h3>
                        <span className="px-4 py-1 bg-purple-500 text-white text-xs rounded-full font-semibold">
                          Vue Admin
                        </span>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-6">
                          {/* Admin Photo Preview */}
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center overflow-hidden border-4 border-purple-200 flex-shrink-0">
                            {adminPhotoPreview ? (
                              <img
                                src={adminPhotoPreview}
                                alt="Admin"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUserCircle className="text-white text-6xl" />
                            )}
                          </div>

                          {/* Admin Info Preview */}
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-800 mb-1">
                              {adminData.name || "Nom de l'Admin"}
                            </h4>
                            <p className="text-sm text-purple-600 font-semibold mb-3">
                              {adminData.role || "Admin"}
                            </p>

                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" />
                                <span className="text-gray-600">Email:</span>
                                <span className="text-blue-600 font-medium">
                                  {adminData.email || "admin@example.com"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-center mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      <FaSave className="text-xl" />
                      {loading ? "Mise à jour..." : "Mettre à jour Admin"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Backup Tab */}
            {activeTab === "backup" && (
              <div className="space-y-6">
                {/* Create Backup Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FaDownload className="text-green-500" />
                      Créer une Sauvegarde
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Téléchargez une copie complète de vos données
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-green-600 text-xl mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-2">
                          Sauvegarde automatique
                        </h3>
                        <p className="text-sm text-green-800">
                          La sauvegarde inclura tous les patients, rendez-vous, factures,
                          ordonnances, feuilles de soin, inventaire et fournisseurs.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 w-full justify-center"
                  >
                    <FaFileArchive className="text-xl" />
                    {loading ? "Création en cours..." : "Télécharger la Sauvegarde"}
                  </button>
                </div>

                {/* Restore Backup Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FaUpload className="text-orange-500" />
                      Restaurer une Sauvegarde
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Importez une sauvegarde précédente
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-orange-600 text-xl mt-1" />
                      <div>
                        <h3 className="font-semibold text-orange-900 mb-2">
                          ⚠️ Attention
                        </h3>
                        <p className="text-sm text-orange-800">
                          La restauration remplacera toutes les données actuelles par celles
                          du fichier de sauvegarde. Cette action est irréversible.
                        </p>
                      </div>
                    </div>
                  </div>

                  <label
                    htmlFor="restore-input"
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold cursor-pointer transform hover:scale-105 w-full justify-center"
                  >
                    <FaUpload className="text-xl" />
                    {loading ? "Restauration en cours..." : "Sélectionner un Fichier"}
                    <input
                      id="restore-input"
                      type="file"
                      accept=".zip"
                      onChange={handleRestore}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Personnel Tab */}
            {activeTab === "personnel" && (
              <div className="space-y-6">
                {/* Limits Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <FaUsers className="text-2xl text-blue-600" />
                      <div>
                        <h3 className="font-bold text-gray-800">Limites du Système</h3>
                        <p className="text-sm text-gray-600">Personnel autorisé dans le cabinet</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Secrétaires</div>
                        <div className="text-lg font-bold text-pink-600">
                          {personnelList.filter(p => p.role === "Receptionist").length} / 1
                        </div>
                      </div>
                      <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Docteurs</div>
                        <div className="text-lg font-bold text-purple-600">
                          {personnelList.filter(p => p.role === "Dentist").length} / 10
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Personnel Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <FaUsers className="text-pink-500" />
                      Ajouter du Personnel
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Créez des comptes pour les secrétaires et les docteurs
                    </p>
                  </div>

                  <form onSubmit={handleCreatePersonnel}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personnel Selection */}
                      <div className="relative md:col-span-2">
                        <label className="absolute -top-2 left-3 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Sélectionner Personnel Existant
                        </label>
                        <select
                          onChange={handlePersonnelSelect}
                          value={selectedUserId}
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                          <option value="">-- Nouveau personnel --</option>
                          {personnelList.filter(p => p.role === "Receptionist").map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.fullname} - Secrétaire ({p.email})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">💡 Sélectionnez un secrétaire existant pour gérer ses autorisations</p>
                      </div>

                      {/* Full Name */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Nom complet*
                        </label>
                        <input
                          type="text"
                          name="fullname"
                          value={personnelData.fullname}
                          onChange={handlePersonnelChange}
                          required
                          readOnly={!isNewPersonnel}
                          className={`w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all ${
                            !isNewPersonnel ? 'bg-gray-100' : ''
                          }`}
                          placeholder="Ex: Dr. Ahmed Bennani"
                        />
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Email*
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={personnelData.email}
                          onChange={handlePersonnelChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="Ex: ahmed@clinic.com"
                        />
                      </div>

                      {/* Password */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Mot de passe*
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={personnelData.password}
                          onChange={handlePersonnelChange}
                          required
                          minLength={8}
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="Min. 8 caractères"
                        />
                      </div>

                      {/* Role */}
                      <div className="relative">
                        <label className="absolute -top-2 left-3 bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                          Rôle*
                        </label>
                        <select
                          name="role"
                          value={personnelData.role}
                          onChange={handlePersonnelChange}
                          required
                          className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        >
                          <option value="Receptionist">Secrétaire</option>
                          <option value="Dentist">Docteur</option>
                        </select>
                      </div>

                      {/* Specialization (only for doctors) */}
                      {personnelData.role === "Dentist" && (
                        <div className="relative md:col-span-2">
                          <label className="absolute -top-2 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                            Spécialisation
                          </label>
                          <input
                            type="text"
                            name="specialization"
                            value={personnelData.specialization}
                            onChange={handlePersonnelChange}
                            className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            placeholder="Ex: Orthodontie, Chirurgie, etc."
                          />
                        </div>
                      )}

                      {/* Permissions Section (only for Receptionist) */}
                      {personnelData.role === "Receptionist" && (
                        <div className="md:col-span-2 border-2 border-indigo-200 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
                          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaLock className="text-indigo-600" />
                            Autorisations d'accès
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Sélectionnez les sections auxquelles ce secrétaire aura accès
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={personnelData.permissions?.patients !== false}
                                onChange={(e) => setPersonnelData({
                                  ...personnelData,
                                  permissions: {
                                    ...personnelData.permissions,
                                    patients: e.target.checked
                                  }
                                })}
                                className="w-5 h-5 text-indigo-600 rounded"
                              />
                              <span className="font-medium text-gray-700">Patients</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={personnelData.permissions?.appointments !== false}
                                onChange={(e) => setPersonnelData({
                                  ...personnelData,
                                  permissions: {
                                    ...personnelData.permissions,
                                    appointments: e.target.checked
                                  }
                                })}
                                className="w-5 h-5 text-indigo-600 rounded"
                              />
                              <span className="font-medium text-gray-700">Rendez-vous</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={personnelData.permissions?.invoices !== false}
                                onChange={(e) => setPersonnelData({
                                  ...personnelData,
                                  permissions: {
                                    ...personnelData.permissions,
                                    invoices: e.target.checked
                                  }
                                })}
                                className="w-5 h-5 text-indigo-600 rounded"
                              />
                              <span className="font-medium text-gray-700">Factures</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={personnelData.permissions?.medicalFiles !== false}
                                onChange={(e) => setPersonnelData({
                                  ...personnelData,
                                  permissions: {
                                    ...personnelData.permissions,
                                    medicalFiles: e.target.checked
                                  }
                                })}
                                className="w-5 h-5 text-indigo-600 rounded"
                              />
                              <span className="font-medium text-gray-700">Dossiers médicaux</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={personnelData.permissions?.prescriptions !== false}
                                onChange={(e) => setPersonnelData({
                                  ...personnelData,
                                  permissions: {
                                    ...personnelData.permissions,
                                    prescriptions: e.target.checked
                                  }
                                })}
                                className="w-5 h-5 text-indigo-600 rounded"
                              />
                              <span className="font-medium text-gray-700">Ordonnances</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={personnelData.permissions?.inventory !== false}
                                onChange={(e) => setPersonnelData({
                                  ...personnelData,
                                  permissions: {
                                    ...personnelData.permissions,
                                    inventory: e.target.checked
                                  }
                                })}
                                className="w-5 h-5 text-indigo-600 rounded"
                              />
                              <span className="font-medium text-gray-700">Inventaire</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={personnelData.permissions?.suppliers !== false}
                                onChange={(e) => setPersonnelData({
                                  ...personnelData,
                                  permissions: {
                                    ...personnelData.permissions,
                                    suppliers: e.target.checked
                                  }
                                })}
                                className="w-5 h-5 text-indigo-600 rounded"
                              />
                              <span className="font-medium text-gray-700">Fournisseurs</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                              <input
                                type="checkbox"
                                checked={personnelData.permissions?.statistics !== false}
                                onChange={(e) => setPersonnelData({
                                  ...personnelData,
                                  permissions: {
                                    ...personnelData.permissions,
                                    statistics: e.target.checked
                                  }
                                })}
                                className="w-5 h-5 text-indigo-600 rounded"
                              />
                              <span className="font-medium text-gray-700">Statistiques</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Approval toggle for Dentists */}
                    {!isNewPersonnel && personnelData.role === "Dentist" && (
                      <div className="mt-6">
                        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200">
                          <input
                            type="checkbox"
                            checked={personnelData.approved === true}
                            onChange={(e) => setPersonnelData({ ...personnelData, approved: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded"
                          />
                          <span className="font-medium text-gray-700">Approuver le personnel (accès au dashboard)</span>
                        </label>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                      {/* Save Permissions Button (for existing personnel with Receptionist role) */}
                      {!isNewPersonnel && (
                        <button
                          type="button"
                          onClick={handleUpdatePermissions}
                          disabled={loading}
                          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                          <FaSave className="text-xl" />
                          {loading ? "Enregistrement..." : "Enregistrer les Autorisations"}
                        </button>
                      )}

                      {/* Create Personnel Button (only for new personnel) */}
                      {isNewPersonnel && (
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-2 px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                          <FaUsers className="text-xl" />
                          {loading ? "Création en cours..." : "Créer le Personnel"}
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Show Created Credentials */}
                  {createdCredentials && (
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <FaCheckCircle className="text-green-600 text-2xl mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-green-900 text-lg mb-3">✅ Compte créé avec succès!</h3>
                          <p className="text-green-800 mb-4">Voici les identifiants de connexion (notez-les bien):</p>
                          <div className="bg-white rounded-lg p-4 space-y-3">
                            <div>
                              <span className="font-semibold text-gray-700">Email:</span>
                              <p className="text-lg font-mono bg-gray-100 p-2 rounded mt-1">{createdCredentials.email}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Mot de passe:</span>
                              <p className="text-lg font-mono bg-gray-100 p-2 rounded mt-1">{createdCredentials.password}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setCreatedCredentials(null)}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            J'ai noté les identifiants
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personnel List Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <FaUsers className="text-indigo-500" />
                      Liste du Personnel
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Gérez les comptes des secrétaires et docteurs
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="pb-4 text-left text-gray-700 font-bold">Nom</th>
                          <th className="pb-4 text-left text-gray-700 font-bold">Email</th>
                          <th className="pb-4 text-left text-gray-700 font-bold">Rôle</th>
                          <th className="pb-4 text-left text-gray-700 font-bold">Spécialisation</th>
                          <th className="pb-4 text-center text-gray-700 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personnelList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500">
                              Aucun personnel enregistré
                            </td>
                          </tr>
                        ) : (
                          personnelList.map((person) => (
                            <tr key={person._id} className="border-b border-gray-100 hover:bg-pink-50 transition-colors">
                              <td className="py-4 font-semibold text-gray-800">{person.fullname}</td>
                              <td className="py-4 text-gray-600">{person.email}</td>
                              <td className="py-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  person.role === "Dentist" 
                                    ? "bg-blue-100 text-blue-700" 
                                    : "bg-pink-100 text-pink-700"
                                }`}>
                                  {person.role === "Dentist" ? "Docteur" : "Secrétaire"}
                                </span>
                              </td>
                              <td className="py-4 text-gray-600">
                                {person.specialization || "-"}
                              </td>
                              <td className="py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEditPersonnel(person)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDeletePersonnel(person._id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Edit Personnel Modal */}
                {showEditModal && editingPersonnel && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <FaUsers />
                          Modifier le Personnel
                        </h2>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <FaTimes className="text-2xl" />
                        </button>
                      </div>

                      <form onSubmit={handleUpdatePersonnel} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Full Name */}
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                              Nom complet*
                            </label>
                            <input
                              type="text"
                              value={editingPersonnel.fullname}
                              onChange={(e) => setEditingPersonnel({
                                ...editingPersonnel,
                                fullname: e.target.value
                              })}
                              required
                              className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Ex: Dr. Ahmed Bennani"
                            />
                          </div>

                          {/* Email (read-only) */}
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-gray-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                              Email (non modifiable)
                            </label>
                            <input
                              type="email"
                              value={editingPersonnel.email}
                              readOnly
                              className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                            />
                          </div>

                          {/* Role */}
                          <div className="relative">
                            <label className="absolute -top-2 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                              Rôle*
                            </label>
                            <select
                              value={editingPersonnel.role}
                              onChange={(e) => setEditingPersonnel({
                                ...editingPersonnel,
                                role: e.target.value
                              })}
                              required
                              className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="Receptionist">Secrétaire</option>
                              <option value="Dentist">Docteur</option>
                            </select>
                          </div>

                          {/* Specialization (only for doctors) */}
                          {editingPersonnel.role === "Dentist" && (
                            <div className="relative">
                              <label className="absolute -top-2 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                                Spécialisation
                              </label>
                              <input
                                type="text"
                                value={editingPersonnel.specialization}
                                onChange={(e) => setEditingPersonnel({
                                  ...editingPersonnel,
                                  specialization: e.target.value
                                })}
                                className="w-full px-4 py-3 pt-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                placeholder="Ex: Orthodontie, Chirurgie, etc."
                              />
                            </div>
                          )}

                          {/* Permissions Section (only for Receptionist) */}
                          {editingPersonnel.role === "Receptionist" && (
                            <div className="md:col-span-2 border-2 border-indigo-200 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaLock className="text-indigo-600" />
                                Autorisations d'accès
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                                  <input
                                    type="checkbox"
                                    checked={editingPersonnel.permissions?.patients !== false}
                                    onChange={(e) => setEditingPersonnel({
                                      ...editingPersonnel,
                                      permissions: {
                                        ...editingPersonnel.permissions,
                                        patients: e.target.checked
                                      }
                                    })}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="font-medium text-gray-700">Patients</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                                  <input
                                    type="checkbox"
                                    checked={editingPersonnel.permissions?.appointments !== false}
                                    onChange={(e) => setEditingPersonnel({
                                      ...editingPersonnel,
                                      permissions: {
                                        ...editingPersonnel.permissions,
                                        appointments: e.target.checked
                                      }
                                    })}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="font-medium text-gray-700">Rendez-vous</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                                  <input
                                    type="checkbox"
                                    checked={editingPersonnel.permissions?.invoices !== false}
                                    onChange={(e) => setEditingPersonnel({
                                      ...editingPersonnel,
                                      permissions: {
                                        ...editingPersonnel.permissions,
                                        invoices: e.target.checked
                                      }
                                    })}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="font-medium text-gray-700">Factures</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                                  <input
                                    type="checkbox"
                                    checked={editingPersonnel.permissions?.medicalFiles !== false}
                                    onChange={(e) => setEditingPersonnel({
                                      ...editingPersonnel,
                                      permissions: {
                                        ...editingPersonnel.permissions,
                                        medicalFiles: e.target.checked
                                      }
                                    })}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="font-medium text-gray-700">Dossiers médicaux</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                                  <input
                                    type="checkbox"
                                    checked={editingPersonnel.permissions?.prescriptions !== false}
                                    onChange={(e) => setEditingPersonnel({
                                      ...editingPersonnel,
                                      permissions: {
                                        ...editingPersonnel.permissions,
                                        prescriptions: e.target.checked
                                      }
                                    })}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="font-medium text-gray-700">Ordonnances</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                                  <input
                                    type="checkbox"
                                    checked={editingPersonnel.permissions?.inventory !== false}
                                    onChange={(e) => setEditingPersonnel({
                                      ...editingPersonnel,
                                      permissions: {
                                        ...editingPersonnel.permissions,
                                        inventory: e.target.checked
                                      }
                                    })}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="font-medium text-gray-700">Inventaire</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                                  <input
                                    type="checkbox"
                                    checked={editingPersonnel.permissions?.suppliers !== false}
                                    onChange={(e) => setEditingPersonnel({
                                      ...editingPersonnel,
                                      permissions: {
                                        ...editingPersonnel.permissions,
                                        suppliers: e.target.checked
                                      }
                                    })}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="font-medium text-gray-700">Fournisseurs</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all">
                                  <input
                                    type="checkbox"
                                    checked={editingPersonnel.permissions?.statistics !== false}
                                    onChange={(e) => setEditingPersonnel({
                                      ...editingPersonnel,
                                      permissions: {
                                        ...editingPersonnel.permissions,
                                        statistics: e.target.checked
                                      }
                                    })}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                  />
                                  <span className="font-medium text-gray-700">Statistiques</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-100">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaSave className="text-xl" />
                            {loading ? "Mise à jour..." : "Enregistrer les modifications"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
