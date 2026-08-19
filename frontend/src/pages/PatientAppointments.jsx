import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Activity, FileText, 
  AlertCircle, CheckCircle, RefreshCw, AlertTriangle, Pill 
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/appointments/patient`, {
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

  // Sync selectedApp with refreshed data when appointments changes
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/appointments/${appId}/pre-visit-summary/retry`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/appointments/${appId}/post-visit-summary/retry`, {
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
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-slate-100">My Appointments</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Review your scheduled slots, track pre-visit AI analyses, and inspect clinical follow-ups.</p>
      </div>

      {errorMsg && (
        <div className="flex gap-2.5 items-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-4 text-xs font-bold text-rose-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Appointments List Column */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Appointment History</h2>
          
          {loading && appointments.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 rounded-2xl">
              No appointments booked yet.
            </div>
          ) : (
            <div className="space-y-3.5">
              {appointments.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const formattedTime = new Date(app.dateTime).toLocaleString();
                const isCompleted = app.status === 'COMPLETED';
                const isCancelled = app.status === 'CANCELLED';

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`border p-5 rounded-2xl bg-white dark:bg-slate-900/30 transition-all cursor-pointer flex justify-between items-start ${
                      isSelected
                        ? 'border-blue-500 shadow-md translate-x-1'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Dr. {app.doctor.user.name}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md ${
                          isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : isCancelled
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-550 dark:text-slate-450 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" /> {formattedTime}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-500 line-clamp-1 italic font-semibold">
                        Symptoms: "{app.symptoms}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Appointment Details Column */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl">
          {selectedApp ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-550 mb-3">Appointment Details</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-500" /> Doctor: Dr. {selectedApp.doctor.user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">Specialisation: {selectedApp.doctor.specialisation}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-350 font-bold flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> Date & Time: {new Date(selectedApp.dateTime).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-750 dark:text-slate-300 font-semibold pt-1">
                    Symptoms Shared: <span className="italic">"{selectedApp.symptoms}"</span>
                  </p>
                </div>
              </div>

              {/* Pre-visit AI Summary Section */}
              <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-4 bg-blue-500/5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-cyan-400">Pre-Visit AI Summary</h4>
                  <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded ${
                    selectedApp.preVisitSummary?.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                    selectedApp.preVisitSummary?.status === 'FAILED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {selectedApp.preVisitSummary?.status || 'PENDING'}
                  </span>
                </div>

                {selectedApp.preVisitSummary?.status === 'SUCCESS' ? (
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>Urgency level:</span>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded font-extrabold ${
                        selectedApp.preVisitSummary.urgency === 'HIGH' ? 'bg-rose-500/15 text-rose-500' :
                        selectedApp.preVisitSummary.urgency === 'MEDIUM' ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
                      }`}>
                        {selectedApp.preVisitSummary.urgency}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold block">Chief Complaint:</span>
                      <p className="text-slate-600 dark:text-slate-350">{selectedApp.preVisitSummary.chiefComplaint}</p>
                    </div>
                    <div>
                      <span className="font-bold block mb-1">Suggested questions for your doctor:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-350 font-medium">
                        {selectedApp.preVisitSummary.suggestedQuestions?.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-1 items-start bg-blue-500/10 p-2 rounded text-[10px] text-blue-750 dark:text-cyan-400 font-semibold border border-blue-500/10">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>This summary is AI-generated for clinical assistance. It is NOT a medical diagnosis and should only serve to assist your doctor.</span>
                    </div>
                  </div>
                ) : selectedApp.preVisitSummary?.status === 'FAILED' ? (
                  <div className="space-y-2">
                    <p className="text-xs text-rose-500 font-semibold">AI pre-visit summary generation failed due to a LLM provider exception.</p>
                    <button
                      onClick={() => handleRetryPreVisit(selectedApp.id)}
                      disabled={retrying}
                      className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[10px] rounded-lg shadow flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                      Retry AI Generation
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic font-semibold">Pre-visit summary is currently processing...</p>
                )}
              </div>

              {/* Consultation Details & Post-visit AI summary (only if completed) */}
              {selectedApp.status === 'COMPLETED' && selectedApp.consultation && (
                <div className="space-y-6 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-550 mb-3">Doctor Notes & Instructions</h3>
                    <div className="p-4 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 bg-white dark:bg-slate-950/20">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Notes</span>
                        <p className="text-xs text-slate-750 dark:text-slate-300 mt-1 leading-relaxed font-semibold">{selectedApp.consultation.notes}</p>
                      </div>
                      
                      {selectedApp.consultation.followUpInfo && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Follow-up Info</span>
                          <p className="text-xs text-slate-700 dark:text-slate-350 mt-1 font-semibold">{selectedApp.consultation.followUpInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prescribed Medications */}
                  {selectedApp.consultation.prescription && selectedApp.consultation.prescription.items?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Pill className="w-4 h-4 text-teal-500" /> Prescribed Medications
                      </h4>
                      <div className="overflow-hidden border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-950/20">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                              <th className="p-2.5">Medicine</th>
                              <th className="p-2.5">Dosage</th>
                              <th className="p-2.5">Frequency</th>
                              <th className="p-2.5">Duration</th>
                              <th className="p-2.5">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-700 dark:text-slate-300">
                            {selectedApp.consultation.prescription.items.map((item) => (
                              <tr key={item.id}>
                                <td className="p-2.5 font-bold text-teal-650 dark:text-teal-400">{item.medicineName}</td>
                                <td className="p-2.5">{item.dosage}</td>
                                <td className="p-2.5">{item.frequency}</td>
                                <td className="p-2.5">{item.duration}</td>
                                <td className="p-2.5 text-slate-500">{item.instructions || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Post-visit AI Patient-friendly Summary Section */}
                  <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-4 bg-teal-500/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-cyan-400">AI Post-Visit Summary</h4>
                      <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded ${
                        selectedApp.consultation.postVisitSummary?.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                        selectedApp.consultation.postVisitSummary?.status === 'FAILED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {selectedApp.consultation.postVisitSummary?.status || 'PENDING'}
                      </span>
                    </div>

                    {selectedApp.consultation.postVisitSummary?.status === 'SUCCESS' ? (
                      <div className="space-y-4 text-xs leading-relaxed">
                        <div>
                          <span className="font-bold block">Patient-Friendly Summary:</span>
                          <p className="text-slate-650 dark:text-slate-300 mt-1 font-semibold">{selectedApp.consultation.postVisitSummary.patientFriendlySummary}</p>
                        </div>
                        
                        {Array.isArray(selectedApp.consultation.postVisitSummary.medicationSchedule) && selectedApp.consultation.postVisitSummary.medicationSchedule.length > 0 && (
                          <div>
                            <span className="font-bold block mb-1">Medication Schedule:</span>
                            <div className="space-y-2">
                              {selectedApp.consultation.postVisitSummary.medicationSchedule.map((med, idx) => (
                                <div key={idx} className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center text-[11px]">
                                  <div>
                                    <span className="font-bold text-teal-600 dark:text-cyan-400">{med.medicineName}</span> ({med.dosage})
                                    <div className="text-[10px] text-slate-500 font-semibold">{med.frequency} for {med.duration}</div>
                                  </div>
                                  <div className="text-right text-[10px] font-bold text-blue-500 sm:self-center mt-1 sm:mt-0">
                                    Timing: {med.timing}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-bold block">Actionable Follow-up Steps:</span>
                          <p className="text-slate-655 dark:text-slate-300 mt-1 font-semibold">{selectedApp.consultation.postVisitSummary.followUpSteps}</p>
                        </div>

                        <div className="flex gap-1 items-start bg-teal-500/10 p-2 rounded text-[10px] text-teal-800 dark:text-cyan-400 font-semibold border border-teal-500/10">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>This is an AI-assisted friendly explanation summary. It is not a direct replacement for your doctor's official clinical directions.</span>
                        </div>
                      </div>
                    ) : selectedApp.consultation.postVisitSummary?.status === 'FAILED' ? (
                      <div className="space-y-2">
                        <p className="text-xs text-rose-500 font-semibold">AI post-visit summary generation failed due to a LLM provider exception.</p>
                        <button
                          onClick={() => handleRetryPostVisit(selectedApp.id)}
                          disabled={retrying}
                          className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[10px] rounded-lg shadow flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                          Retry AI Generation
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic font-semibold">Post-visit summary is processing...</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-12 space-y-3">
              <FileText className="w-12 h-12 text-slate-300" />
              <p className="text-xs font-semibold text-slate-400">Select an appointment on the left to inspect its timeline, AI diagnosis guidance, and prescription schedules.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
