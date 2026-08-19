import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, User, ArrowRight, ShieldCheck, Sparkles, Settings
} from 'lucide-react';

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  const lastLoginString = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const features = [];

  // Admin features
  if (user && (user.role === 'ADMIN' || user.isAdmin)) {
    features.push({
      title: 'Admin Operations Console',
      icon: <ShieldCheck className="w-6 h-6" />,
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'Register doctor directory, configure schedule templates, toggle statuses, and schedule leave dates.',
      path: '/admin/portal'
    });
  }

  // Doctor features
  if (user && user.role === 'DOCTOR') {
    features.push({
      title: 'Doctor Portal',
      icon: <Calendar className="w-6 h-6" />,
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Review upcoming schedules, patient symptom lists, and submit clinical consultation notes and prescriptions.',
      path: '/doctor/portal'
    });
  }

  // Patient features
  if (!user || user.role === 'PATIENT') {
    features.push({
      title: 'Book Appointment',
      icon: <Calendar className="w-6 h-6 animate-pulse" />,
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Search active doctor directories, query slot availability, temporarily hold slots, and book appointments.',
      path: '/booking'
    });
    features.push({
      title: 'My Appointments',
      icon: <Calendar className="w-6 h-6" />,
      colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
      description: 'View your upcoming appointments, pre-visit summaries, prescriptions, and follow-up clinical instructions.',
      path: '/appointments'
    });
  }

  // Account settings for all roles
  features.push({
    title: 'Account Settings',
    icon: <User className="w-6 h-6" />,
    colorClass: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    description: 'Manage your profile, preferences, and account settings.',
    path: '/profile'
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Welcome Banner */}
      <section className="relative overflow-hidden border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 p-6 sm:p-8 shadow-sm dark:shadow-none">
        {/* Glow behind greeting */}
        <div className="absolute right-0 top-0 w-60 h-60 bg-blue-500/5 dark:bg-cyan-500/5 rounded-full blur-[80px] -z-10"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-850 dark:text-slate-550 flex items-center gap-2">
              Welcome back, {user?.name || 'Practitioner'} 👋
            </h1>
            <p className="text-sm font-semibold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Healthcare Appointment & Follow-up Manager
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Access the clinical portal to manage appointments, configure working hours templates, view pre-visit summaries, and write prescriptions.
            </p>
          </div>
          <div className="bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-right shrink-0">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Current Session</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lastLoginString}</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Portal Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-350 shadow-sm hover:shadow-md dark:shadow-none hover:border-blue-500/30 dark:hover:border-cyan-500/20 group h-full"
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-xl w-fit border ${feature.colorClass}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                  {feature.description}
                </p>
              </div>
              
              <button
                onClick={() => navigate(feature.path)}
                className="mt-6 w-full py-2.5 bg-slate-50 dark:bg-slate-955/60 hover:bg-blue-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-955 border border-slate-200 dark:border-slate-850 hover:border-transparent dark:hover:border-transparent text-slate-700 dark:text-slate-350 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn shadow-inner"
              >
                Open Module
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Diagnostics Check */}
      <section className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-3 shadow-sm dark:shadow-none">
        <span className="text-[10px] uppercase font-bold text-slate-400 block">System Telemetry</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
            Appointment engine and notification services operational
          </span>
        </div>
      </section>

    </div>
  );
}
