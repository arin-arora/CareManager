import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Activity, FileText, 
  AlertCircle, CheckCircle, RefreshCw, AlertTriangle, Pill, ArrowRight
} from 'lucide-react';
import { Button, Card, Badge, StatusBadge, EmptyState, LoadingState } from '../components/UI';

export default function PatientAppointments({ token }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/appointments/patient`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setErrorMsg('Failed to load appointments registry.');
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/appointments/${appId}/pre-visit-summary/retry`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/appointments/${appId}/post-visit-summary/retry`, {
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

  // Filter appointments by tab
  const filteredApps = appointments.filter(app => {
    const status = app.status.toUpperCase();
    if (activeTab === 'upcoming') {
      return status === 'BOOKED' || status === 'PENDING';
    }
    if (activeTab === 'past') {
      return status === 'COMPLETED';
    }
    if (activeTab === 'cancelled') {
      return status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      {/* Title Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Appointments Registry</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Filter clinical schedules, track pre-visit AI diagnostics, and inspect prescriptions.</p>
      </div>

      {errorMsg && (
        <div className="flex gap-2.5 items-center bg-red-50 border border-red-100 rounded-xl p-4 text-xs font-bold text-red-600 dark:bg-red-955/20 dark:border-red-905">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main double column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Table/List Registry (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Tab buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 max-w-sm">
            {['upcoming', 'past', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedApp(null);
                }}
                className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading && appointments.length === 0 ? (
            <LoadingState message="Syncing appointment registry..." />
          ) : filteredApps.length === 0 ? (
            <EmptyState 
              title={`No ${activeTab} visits`}
              description={`There are no appointments currently scheduled under ${activeTab}.`}
              icon={Calendar}
            />
          ) : (
            <div className="overflow-hidden border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-205 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Specialty</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-bold text-slate-700 dark:text-slate-300">
                  {filteredApps.map((app) => {
                    const isSelected = selectedApp?.id === app.id;
                    const displayTime = new Date(app.dateTime).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr 
                        key={app.id} 
                        onClick={() => setSelectedApp(app)}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 cursor-pointer transition-all ${
                          isSelected ? 'bg-blue-500/5 dark:bg-blue-500/5' : ''
                        }`}
                      >
                        <td className="p-3 text-slate-900 dark:text-white font-extrabold">Dr. {app.doctor?.user?.name}</td>
                        <td className="p-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{app.doctor?.specialisation}</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{displayTime}</td>
                        <td className="p-3"><StatusBadge status={app.status} /></td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-end gap-0.5 hover:underline">
                            View details <ArrowRight className="w-3 h-3" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Digital Care Record details (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 p-6 rounded-xl shadow-xs">
          {selectedApp ? (
            <div className="space-y-6 animate-fade-in">
              {/* Header Title */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Record File</span>
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Dr. {selectedApp.doctor?.user?.name}</h3>
                    <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">{selectedApp.doctor?.specialisation}</p>
                  </div>
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>

              {/* Consultation timing and symptoms */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Time: {new Date(selectedApp.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="flex items-start gap-1.5 leading-relaxed pt-0.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" /> Symptoms: <span className="italic font-medium">"{selectedApp.symptoms}"</span>
                </p>
              </div>

              {/* Pre-visit AI Triage summary card */}
              <div className="border border-blue-500/10 dark:border-blue-500/15 rounded-lg p-4 bg-blue-500/5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-650 dark:text-blue-400">Pre-Visit AI Summary</h4>
                  <Badge variant={selectedApp.preVisitSummary?.status === 'SUCCESS' ? 'success' : selectedApp.preVisitSummary?.status === 'FAILED' ? 'danger' : 'warning'}>
                    {selectedApp.preVisitSummary?.status || 'Processing'}
                  </Badge>
                </div>

                {selectedApp.preVisitSummary?.status === 'SUCCESS' ? (
                  <div className="space-y-3.5 text-xs leading-relaxed font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold">Triage urgency status:</span>
                      <StatusBadge status={selectedApp.preVisitSummary.urgency} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block mb-0.5">Chief Complaint:</span>
                      <p className="text-slate-750 dark:text-slate-200 font-bold">{selectedApp.preVisitSummary.chiefComplaint}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Suggested questions to ask:</span>
                      <ul className="list-disc pl-4.5 space-y-1 text-slate-750 dark:text-slate-300 font-medium">
                        {selectedApp.preVisitSummary.suggestedQuestions?.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-1.5 items-start bg-blue-500/10 p-2.5 rounded-lg text-[10px] text-blue-800 dark:text-blue-400 font-semibold border border-blue-500/10">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                      <span>AI-generated clinical guidance. This is not a medical diagnosis.</span>
                    </div>
                  </div>
                ) : selectedApp.preVisitSummary?.status === 'FAILED' ? (
                  <div className="space-y-2">
                    <p className="text-xs text-rose-500 font-semibold">AI pre-visit summary generation failed due to a LLM provider exception.</p>
                    <Button
                      onClick={() => handleRetryPreVisit(selectedApp.id)}
                      disabled={retrying}
                      className="px-3 py-1.5 text-[10px]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                      Retry Generation
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic font-bold animate-pulse">Pre-visit summary is currently processing...</p>
                )}
              </div>

              {/* Consultation Details (only if completed) */}
              {selectedApp.status === 'COMPLETED' && selectedApp.consultation && (
                <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455">Doctor Notes & Consultation</h3>
                    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-950/20 text-xs font-semibold leading-relaxed">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Clinical Notes</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedApp.consultation.notes}</p>
                      </div>
                      {selectedApp.consultation.followUpInfo && (
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Follow-up Info</span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedApp.consultation.followUpInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prescription Table */}
                  {selectedApp.consultation.prescription && selectedApp.consultation.prescription.items?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-blue-600" /> Prescribed Medications
                      </h4>
                      <div className="overflow-hidden border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                              <th className="p-2.5">Medicine</th>
                              <th className="p-2.5">Dosage</th>
                              <th className="p-2.5">Frequency</th>
                              <th className="p-2.5">Duration</th>
                              <th className="p-2.5">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-850 font-bold text-slate-700 dark:text-slate-350">
                            {selectedApp.consultation.prescription.items.map((item) => (
                              <tr key={item.id}>
                                <td className="p-2.5 text-blue-650 dark:text-blue-400 font-extrabold">{item.medicineName}</td>
                                <td className="p-2.5">{item.dosage}</td>
                                <td className="p-2.5">{item.frequency}</td>
                                <td className="p-2.5">{item.duration}</td>
                                <td className="p-2.5 text-slate-550 font-semibold">{item.instructions || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Post-visit AI Patient-friendly Summary */}
                  <div className="border border-blue-500/10 dark:border-blue-500/15 rounded-lg p-4 bg-blue-500/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-650 dark:text-blue-400">AI Post-Visit Summary</h4>
                      <Badge variant={selectedApp.consultation.postVisitSummary?.status === 'SUCCESS' ? 'success' : selectedApp.consultation.postVisitSummary?.status === 'FAILED' ? 'danger' : 'warning'}>
                        {selectedApp.consultation.postVisitSummary?.status || 'Processing'}
                      </Badge>
                    </div>

                    {selectedApp.consultation.postVisitSummary?.status === 'SUCCESS' ? (
                      <div className="space-y-4 text-xs leading-relaxed font-semibold">
                        <div>
                          <span className="font-bold text-slate-400 block mb-0.5">Patient Summary Explanation:</span>
                          <p className="text-slate-755 dark:text-slate-300">{selectedApp.consultation.postVisitSummary.patientFriendlySummary}</p>
                        </div>
                        
                        {Array.isArray(selectedApp.consultation.postVisitSummary.medicationSchedule) && selectedApp.consultation.postVisitSummary.medicationSchedule.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-400 block mb-2">Medication Dosage Timeline:</span>
                            <div className="space-y-2">
                              {selectedApp.consultation.postVisitSummary.medicationSchedule.map((med, idx) => (
                                <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                                  <div>
                                    <span className="font-extrabold text-blue-655 dark:text-blue-400">{med.medicineName}</span> <span className="text-[10px] text-slate-400">({med.dosage})</span>
                                    <div className="text-[10px] text-slate-500 mt-0.5 font-bold">{med.frequency} for {med.duration}</div>
                                  </div>
                                  <div className="text-right text-[10px] font-extrabold text-blue-650 dark:text-blue-400">
                                    🕒 {med.timing}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-bold text-slate-400 block mb-0.5">Actionable Follow-up Steps:</span>
                          <p className="text-slate-755 dark:text-slate-300">{selectedApp.consultation.postVisitSummary.followUpSteps}</p>
                        </div>

                        <div className="flex gap-1.5 items-start bg-blue-500/10 p-2.5 rounded-lg text-[10px] text-blue-800 dark:text-blue-400 font-semibold border border-blue-500/10">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-blue-650 mt-0.5" />
                          <span>This is an AI-assisted friendly care guide. It is not a replacement for official clinical notes.</span>
                        </div>
                      </div>
                    ) : selectedApp.consultation.postVisitSummary?.status === 'FAILED' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-rose-500 font-semibold">AI post-visit summary generation failed due to a provider exception.</p>
                        <Button
                          onClick={() => handleRetryPostVisit(selectedApp.id)}
                          disabled={retrying}
                          className="px-3.5 py-1.5 text-[10px]"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                          Retry Generation
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic font-bold animate-pulse">Post-visit summary is currently processing in the background...</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full py-16 text-center flex flex-col items-center justify-center space-y-3">
              <FileText className="w-12 h-12 text-slate-350" />
              <p className="text-xs font-bold text-slate-455">Select a clinical file on the left to inspect its timeline, triage warnings, and doctor notes.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
