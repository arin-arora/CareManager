import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { 
  Calendar, Clock, User, ArrowRight, ShieldCheck, 
  Stethoscope, FileText, CheckCircle2, AlertCircle, Sparkles, HeartPulse, Activity, ChevronRight
} from 'lucide-react';

export default function Dashboard({ user, token }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentDateStr = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    if (!token || !user) return;
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const endpoint = user.role === 'DOCTOR' 
          ? '/api/appointments/doctor' 
          : '/api/appointments/patient';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  const upcomingApps = appointments.filter(a => a.status === 'BOOKED');
  const nextApp = upcomingApps[0];
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in px-4 sm:px-6">
      
      {/* Personalized Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/80 dark:border-slate-850 pb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            <HeartPulse className="w-3.5 h-3.5" /> CareManager Patient Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            Welcome back, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Real-time consultation schedules, AI pre-visit clinical triage, and prescription management
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100/60 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-850">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{currentDateStr}</span>
        </div>
      </div>

      {/* Asymmetric Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Spotlight Upcoming Appointment & Primary CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Spotlight Hero Section */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-7 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Next Scheduled Consultation
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {upcomingApps.length} Upcoming
              </span>
            </div>

            {nextApp ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
                    {nextApp.doctor?.user?.name ? nextApp.doctor.user.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {nextApp.doctor?.user?.name?.startsWith('Dr.') ? nextApp.doctor.user.name : `Dr. ${nextApp.doctor?.user?.name}`}
                    </h2>
                    <p className="text-xs font-semibold text-slate-300 mt-0.5">
                      {nextApp.doctor?.designation || 'Consultant'} • <span className="text-emerald-400 font-bold">{nextApp.doctor?.specialisation}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 text-xs font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{new Date(nextApp.dateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span>{new Date(nextApp.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => navigate('/appointments')}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    View Appointment Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-4">
                <p className="text-sm font-medium text-slate-300">You have no upcoming consultations scheduled.</p>
                <button
                  onClick={() => navigate('/booking')}
                  className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Find Doctors & Book Slot
                </button>
              </div>
            )}
          </div>

          {/* Inline Action Workflows */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono uppercase tracking-widest font-extrabold text-slate-400">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/booking')}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-950 hover:border-emerald-500/50 transition-all cursor-pointer text-left group shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 block group-hover:text-emerald-600 transition-colors">Book Doctor</span>
                    <span className="text-[10px] font-semibold text-slate-400">15 Verified Specialists</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/appointments')}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-950 hover:border-emerald-500/50 transition-all cursor-pointer text-left group shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 block group-hover:text-emerald-600 transition-colors">My Records</span>
                    <span className="text-[10px] font-semibold text-slate-400">SOAP & AI Summaries</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Activity Feed & Consultation Counters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Status Counter Panel */}
          <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest font-extrabold text-slate-400">Consultation Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 shadow-xs">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{upcomingApps.length}</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 block">Upcoming Slots</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 shadow-xs">
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block">{completedCount}</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 block">Completed Visits</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-widest font-extrabold text-slate-400">Recent Activity</h3>
              <button onClick={() => navigate('/appointments')} className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                View All
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs font-semibold text-slate-400">Loading activity...</div>
            ) : appointments.length === 0 ? (
              <div className="p-6 text-center text-xs font-semibold text-slate-400 italic border border-slate-200/60 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-950">
                No recent activity recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {appointments.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate('/appointments')}
                    className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-950 flex items-center justify-between hover:border-emerald-500/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                        {app.doctor?.user?.name ? app.doctor.user.name.charAt(0) : 'D'}
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                          {app.doctor?.user?.name?.startsWith('Dr.') ? app.doctor.user.name : `Dr. ${app.doctor?.user?.name}`}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(app.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
