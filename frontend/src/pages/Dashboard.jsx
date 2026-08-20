import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Search, Clock, ArrowRight, User, Pill, 
  Activity, ShieldCheck, CheckCircle, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Button, Card, Badge, StatusBadge, LoadingState, EmptyState } from '../components/UI';

export default function Dashboard({ user, token }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    if (!token || user?.role !== 'PATIENT') return;
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/appointments/patient`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      loadAppointments();
    }
  }, [token, user]);

  // If doctor or admin: redirect to their respective portals or render a custom link dashboard
  useEffect(() => {
    if (user?.role === 'DOCTOR') {
      navigate('/doctor/portal');
    } else if (user?.role === 'ADMIN' || user?.isAdmin) {
      navigate('/admin/portal');
    }
  }, [user]);

  if (user?.role !== 'PATIENT') {
    return <LoadingState message="Redirecting to practitioner workspace..." />;
  }

  // Derive Patient metrics
  const upcomingAppointments = appointments.filter(a => a.status === 'BOOKED');
  const pastAppointments = appointments.filter(a => a.status === 'COMPLETED');
  const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED');
  
  // Sort upcoming chronologically
  const sortedUpcoming = [...upcomingAppointments].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const nextApp = sortedUpcoming[0]; // Nearest upcoming appointment
  const otherUpcoming = sortedUpcoming.slice(1);

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      
      {/* 1. Greeting Banner */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Good morning, {user.name}</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage your care from one place.</p>
      </div>

      {loading && appointments.length === 0 ? (
        <LoadingState message="Syncing medical chart..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Appointments & Care (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Highlighted Next Appointment */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your next appointment</h3>
              {nextApp ? (
                <div className="border-2 border-blue-500/20 bg-white dark:bg-slate-900 p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-blue-650 dark:text-blue-400 uppercase tracking-wider">Scheduled Consultation</span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Dr. {nextApp.doctor?.user?.name}</h4>
                      <p className="text-xs text-slate-500 font-bold">{nextApp.doctor?.specialisation} Specialist</p>
                    </div>
                    <Badge variant="success">Confirmed</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">📅 {new Date(nextApp.dateTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    <span className="flex items-center gap-1.5">🕒 {new Date(nextApp.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1.5">
                    <p className="text-[10px] text-slate-400 italic max-w-sm font-semibold">Reason: "{nextApp.symptoms}"</p>
                    <Button onClick={() => navigate('/appointments')} className="px-4 py-1.5 font-bold">
                      View appointment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-xl bg-white dark:bg-slate-900/10 text-center py-8 space-y-3">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No scheduled visits</p>
                  <p className="text-[10px] text-slate-450 font-semibold">You don't have any medical slot reservations confirmed.</p>
                  <Button onClick={() => navigate('/booking')} className="mx-auto py-1.5 px-4 font-bold">
                    Schedule a Consultation
                  </Button>
                </div>
              )}
            </section>

            {/* Other Upcoming Appointments list */}
            {otherUpcoming.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming appointments</h3>
                <div className="space-y-2">
                  {otherUpcoming.map(app => (
                    <div key={app.id} className="border border-slate-200 dark:border-slate-850 p-4 rounded-xl bg-white dark:bg-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Dr. {app.doctor?.user?.name}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5 font-bold">{app.doctor?.specialisation} · {new Date(app.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      <button onClick={() => navigate('/appointments')} className="text-[10px] font-bold text-blue-600 hover:underline">ViewDetails &rarr;</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Visits list */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recent visits</h3>
              {pastAppointments.length > 0 ? (
                <div className="space-y-2">
                  {pastAppointments.slice(0, 3).map(app => (
                    <div key={app.id} className="border border-slate-205 dark:border-slate-850 p-4 rounded-xl bg-white dark:bg-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-extrabold text-slate-850 dark:text-slate-200">Dr. {app.doctor?.user?.name}</h4>
                        <p className="text-[10px] text-slate-455 mt-0.5 font-bold">Completed on {new Date(app.dateTime).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => navigate('/appointments')} className="text-[10px] font-bold text-blue-600 hover:underline">Review Care Summary &rarr;</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-450 italic py-3 font-semibold">No recent clinical visits recorded.</p>
              )}
            </section>

          </div>

          {/* Right sidebar: Follow-up Tasks / Reminders (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions Panel */}
            <section className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 rounded-xl space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intake Actions</h3>
              <div className="space-y-2.5">
                <Button onClick={() => navigate('/booking')} className="w-full py-2 flex items-center justify-center gap-1">
                  <Search className="w-3.5 h-3.5" /> Book New Visit
                </Button>
                <Button onClick={() => navigate('/appointments')} variant="secondary" className="w-full py-2 border border-slate-200">
                  View Medical History
                </Button>
              </div>
            </section>

            {/* Follow-up tasks checklist compiled from completed prescriptions */}
            <section className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 rounded-xl space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Follow-up tasks</h3>
              
              <div className="space-y-3">
                {pastAppointments.some(a => a.consultation?.prescription?.items?.length > 0) ? (
                  pastAppointments.flatMap(a => a.consultation.prescription.items).slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span>ACTIVE PRESCRIPTION</span>
                        <span>Dosage: {item.dosage}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-teal-600" /> {item.medicineName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{item.frequency} · Duration: {item.duration}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400 font-semibold italic">
                    No active prescriptions or follow-up timelines scheduled.
                  </div>
                )}
              </div>
            </section>
          </div>

        </div>
      )}

    </div>
  );
}
