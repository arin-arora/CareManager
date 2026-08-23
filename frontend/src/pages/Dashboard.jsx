import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, ArrowRight, ShieldCheck, 
  Stethoscope, FileText, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';

export default function Dashboard({ user, token }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const lastLoginString = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Load appointments summary for patient or doctor
  useEffect(() => {
    if (!token || !user) return;
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const endpoint = user.role === 'DOCTOR' 
          ? '/api/appointments/doctor' 
          : '/api/appointments/patient';
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token, user]);

  const upcomingCount = appointments.filter(a => a.status === 'BOOKED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  const features = [];

  if (user && (user.role === 'ADMIN' || user.isAdmin)) {
    features.push({
      title: 'Admin Operations Portal',
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      badge: 'Admin Access',
      colorClass: 'bg-indigo-500/10 border-indigo-500/20',
      description: 'Register verified doctor directory, configure schedule slot duration templates, toggle doctor statuses, and manage leave calendars.',
      path: '/admin/portal',
      btnText: 'Open Admin Portal'
    });
  }

  if (user && user.role === 'DOCTOR') {
    features.push({
      title: 'Doctor Portal & Consultations',
      icon: <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      badge: 'Practitioner Access',
      colorClass: 'bg-blue-500/10 border-blue-500/20',
      description: 'Review upcoming patient appointments, inspect AI pre-visit triage summaries, write SOAP clinical notes, and issue digital prescriptions.',
      path: '/doctor/portal',
      btnText: 'Open Doctor Portal'
    });
  }

  if (!user || user.role === 'PATIENT') {
    features.push({
      title: 'Find Doctors & Book Slots',
      icon: <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      badge: 'Patient Access',
      colorClass: 'bg-blue-500/10 border-blue-500/20',
      description: 'Browse verified medical specialists by designation & specialty, view real-time slot availability, lock slot holds, and confirm bookings.',
      path: '/booking',
      btnText: 'Book Appointment'
    });
    features.push({
      title: 'My Appointments & Summaries',
      icon: <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Appointments History',
      colorClass: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Track upcoming consultations, review AI pre-visit chief complaint summaries, inspect doctor post-visit summaries, and view prescriptions.',
      path: '/appointments',
      btnText: 'View Appointments'
    });
  }

  features.push({
    title: 'Account Settings',
    icon: <User className="w-6 h-6 text-slate-500" />,
    badge: 'Profile & Security',
    colorClass: 'bg-slate-500/10 border-slate-500/20',
    description: 'Manage personal profile, update account credentials, and view account security preferences.',
    path: '/profile',
    btnText: 'Manage Profile'
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Welcome Banner */}
      <section className="relative overflow-hidden border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> CareManager Healthcare Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome back, {user?.name || 'Practitioner'} 👋
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold max-w-xl">
              Healthcare appointment scheduling, slot holding, AI pre-visit triage summaries, SOAP clinical documentation, and prescription management.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-right shrink-0">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Current Session</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lastLoginString}</span>
          </div>
        </div>
      </section>

      {/* Appointment Summary Counters for Patients/Doctors */}
      {user && (user.role === 'PATIENT' || user.role === 'DOCTOR') && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Upcoming Slots</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">{upcomingCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Completed Consultations</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{completedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Records</span>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">{appointments.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </section>
      )}

      {/* Feature Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">CareManager Portal Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/30 p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md hover:border-blue-500/30 group h-full"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className={`p-3 rounded-xl border ${feature.colorClass}`}>
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
              
              <button
                onClick={() => navigate(feature.path)}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {feature.btnText}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
