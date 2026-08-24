import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { 
  Calendar, Clock, User, Activity, FileText, 
  AlertCircle, CheckCircle2, RefreshCw, AlertTriangle, Pill, ChevronRight, Sparkles, Stethoscope 
} from 'lucide-react';

export default function PatientAppointments({ token }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await fetch(`${API_BASE_URL}/api/appointments/patient`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setErrorMsg('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAppointments();
    }
  }, [token]);

  useEffect(() => {
    if (selectedApp) {
      const refreshed = appointments.find(a => a.id === selectedApp.id);
      if (refreshed) {
        setSelectedApp(refreshed);
      }
    }
  }, [appointments]);

  const handleRetryPreVisit = async (appId) => {
    try {
      setRetrying(true);
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appId}/pre-visit-summary/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        await loadAppointments();
      } else {
        const data = await response.json();
        alert(data.msg || 'Regeneration failed.');
      }
    } catch (err) {
      console.error('Error retrying pre-visit summary:', err);
      alert('Network error during retry.');
    } finally {
      setRetrying(false);
    }
  };

  const handleRetryPostVisit = async (appId) => {
    try {
      setRetrying(true);
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appId}/post-visit-summary/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        await loadAppointments();
      } else {
        const data = await response.json();
        alert(data.msg || 'Regeneration failed.');
      }
    } catch (err) {
      console.error('Error retrying post-visit summary:', err);
      alert('Network error during retry.');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in px-4 sm:px-6">
      
      {/* Editorial Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-850 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
          <FileText className="w-3.5 h-3.5" /> CareManager Clinical History
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          My Appointments & Summaries
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review consultation timeline, inspect AI pre-visit chief complaint analyses, and view digital prescriptions
        </p>
      </div>

      {errorMsg && (
        <div className="flex gap-3 items-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 text-xs font-extrabold text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Asymmetric Split Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Timeline List Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest font-black text-slate-400">
            Consultation Timeline ({appointments.length})
          </h2>
          
          {loading && appointments.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6">
              No appointments recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60 dark:divide-slate-850 border border-slate-200/80 dark:border-slate-850 rounded-3xl bg-white dark:bg-slate-950 overflow-hidden">
              {appointments.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const formattedTime = new Date(app.dateTime).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const isCompleted = app.status === 'COMPLETED';
                const isCancelled = app.status === 'CANCELLED';

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/30 font-black border-l-4 border-emerald-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300 shrink-0">
                        {app.doctor.user.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block truncate">
                          {app.doctor.user.name.startsWith('Dr.') ? app.doctor.user.name : `Dr. ${app.doctor.user.name}`}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formattedTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                        isCompleted 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isCancelled
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      }`}>
                        {app.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Appointment Detail Pane (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedApp ? (
            <div className="bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-850 p-6 sm:p-7 rounded-3xl space-y-6">
              
              {/* Doctor & Status Banner */}
              <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-slate-850 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-50">
                    {selectedApp.doctor.user.name.startsWith('Dr.') ? selectedApp.doctor.user.name : `Dr. ${selectedApp.doctor.user.name}`}
                  </h2>
                  <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedApp.doctor.designation || 'Consultant'} • <span className="text-emerald-600 dark:text-emerald-400">{selectedApp.doctor.specialisation}</span>
                  </p>
                </div>
                <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {selectedApp.status}
                </span>
              </div>

              {/* Date & Symptoms Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block mb-1">Date & Time</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">{new Date(selectedApp.dateTime).toLocaleString()}</span>
                </div>
                <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block mb-1">Reported Symptoms</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedApp.symptoms || 'None recorded'}</span>
                </div>
              </div>

              {/* AI Pre-Visit Triage Summary Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Pre-Visit Triage Summary
                  </span>
                  {selectedApp.preVisitSummary?.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetryPreVisit(selectedApp.id)}
                      disabled={retrying}
                      className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer transition-all flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} /> Retry Analysis
                    </button>
                  )}
                </div>

                {!selectedApp.preVisitSummary || selectedApp.preVisitSummary.status === 'PENDING' ? (
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                    <span>AI clinical pre-visit summary is generating...</span>
                  </div>
                ) : selectedApp.preVisitSummary.status === 'FAILED' ? (
                  <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Summary generation failed. Click Retry above to re-trigger.</span>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 space-y-3 text-xs">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Chief Complaint</span>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{selectedApp.preVisitSummary.chiefComplaint}</p>
                    </div>
                    {selectedApp.preVisitSummary.suggestedQuestions && (
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">Suggested Questions for Doctor</span>
                        <ul className="list-disc pl-4 space-y-1 font-semibold text-slate-700 dark:text-slate-300">
                          {Array.isArray(selectedApp.preVisitSummary.suggestedQuestions) &&
                            selectedApp.preVisitSummary.suggestedQuestions.map((q, idx) => <li key={idx}>{q}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Consultation Notes & Digital Prescription (If Completed) */}
              {selectedApp.consultation && (
                <div className="space-y-4 border-t border-slate-200/80 dark:border-slate-850 pt-5">
                  <span className="text-xs font-mono uppercase tracking-widest font-black text-slate-900 dark:text-slate-100 block">
                    Doctor Consultation Notes & Prescription
                  </span>
                  
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 space-y-3 text-xs">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Clinical Notes</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedApp.consultation.notes}</p>
                    </div>
                    {selectedApp.consultation.prescription?.items?.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 mb-2">
                          <Pill className="w-3.5 h-3.5" /> Digital Prescription Items
                        </span>
                        <div className="space-y-2">
                          {selectedApp.consultation.prescription.items.map((item) => (
                            <div key={item.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-black text-slate-800 dark:text-slate-100 block">{item.medicineName}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{item.dosage} • {item.frequency} • {item.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-20 text-center text-xs font-extrabold text-slate-400 italic bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-8">
              Select an appointment from the left timeline to view clinical details and summaries.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
