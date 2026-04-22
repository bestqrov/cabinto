import { API_URL } from '../config';
import React, { useEffect, useState } from "react";
import DoctorHeader from "../Components/DoctorHeader";
import DoctorStats from "../Components/DoctorStats";
import DoctorAppointments from "../Components/DoctorAppointments";
import DoctorPatients from "../Components/DoctorPatients";
import DoctorCareSheets from "../Components/DoctorCareSheets";
import DoctorNotifications from "../Components/DoctorNotifications";
import DoctorQuickRecord from "../Components/DoctorQuickRecord";
import DoctorRadiology from "../Components/DoctorRadiology";
import DoctorAIAssistant from "../Components/DoctorAIAssistant";

export default function DoctorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const res = await fetch("${API_URL}/doctor/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Fetch error");
      }
      const json = await res.json();
      setData(json);
      // fetch notifications for current user
      try {
        const r2 = await fetch("${API_URL}/notification", { headers: { Authorization: `Bearer ${token}` } });
        if (r2.ok) {
          const njson = await r2.json();
          setNotifications(njson);
        }
      } catch (e) {
        // ignore notification errors
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notification/${id}/read`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const sexe = data?.doctor?.sexe || '';
  const themeClass = sexe === 'Homme' ? 'theme-homme' : sexe === 'Femme' ? 'theme-femme' : 'theme-neutral';

  return (
    <div className={`p-6 space-y-6 page-with-watermark page-watermark ${themeClass}`}>
      <DoctorHeader doctor={data?.doctor} onLogout={handleLogout} notificationsCount={notifications.length} />

      <DoctorStats stats={{...data.stats, appointmentsToday: data.appointmentsToday?.length}} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DoctorQuickRecord patient={data?.recentPatients?.[0]} />
          <DoctorAppointments appointments={data.appointmentsToday} />
          <DoctorCareSheets careSheets={data.recentCareSheets} />
        </div>
        <div className="space-y-6">
          <DoctorPatients patients={data.recentPatients} />
          <DoctorNotifications notifications={notifications} onMarkRead={markAsRead} />
          <DoctorRadiology patient={data?.recentPatients?.[0]} />
          <DoctorAIAssistant patient={data?.recentPatients?.[0]} />
        </div>
      </div>
    </div>
  );
}
