import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { 
  Calendar, Clock, User, FileText, Activity, 
  CheckCircle, ArrowRight, Plus, Trash2, RefreshCw, AlertTriangle, Pill 
} from 'lucide-react';

export default function DoctorPortal({ token }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [notes, setNotes] = useState('');
  const [followUpInfo, setFollowUpInfo] = useState('');
  const [prescriptionList, setPrescriptionList] = useState([
    { medicineName: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAppointments();
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

  const handleAddMedication = () => {
    setPrescriptionList([
      ...prescriptionList,
      { medicineName: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' }
    ]);
  };

  const handleRemoveMedication = (index) => {
    setPrescriptionList(prescriptionList.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index, field, value) => {
    const updated = [...prescriptionList];
    updated[index][field] = value;
    setPrescriptionList(updated);
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Please fill out consultation notes.');
      return;
    }

    // Filter out empty medications
    const validMeds = prescriptionList.filter(m => m.medicineName.trim() !== '');

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/doctors/appointments/${selectedApp.id}/consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          notes, 
          prescription: validMeds, 
          followUpInfo 
        })
      });

      if (response.ok) {
        alert('Consultation details submitted successfully!');
        setSelectedApp(null);
        setNotes('');
        setFollowUpInfo('');
        setPrescriptionList([
          { medicineName: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' }
        ]);
        await loadAppointments();
      } else {
        const data = await response.json();
        alert(data.msg || 'Submission failed.');
      }
    } catch (err) {
      console.error('Error submitting consultation:', err);
      alert('Network error. Unable to submit notes.');
    } finally {
      setSubmitting(false);
    }
  };

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
      alert('Network error.');
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
      alert('Network error.');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-slate-100">Doctor Portal</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Review schedules, view patient symptoms, check pre-visit AI analyses, and log structured prescriptions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Appointments List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Scheduled Consultations</h2>
          {loading && appointments.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading schedule...</div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 rounded-2xl">
              No appointments scheduled.
            </div>
          ) : (
            <div className="space-y-3.5">
              {appointments.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const formattedTime = new Date(app.dateTime).toLocaleString();
                const isCompleted = app.status === 'COMPLETED';

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      if (!isCompleted) {
                        setNotes('');
                        setFollowUpInfo('');
                        setPrescriptionList([
                          { medicineName: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' }
                        ]);
                      }
                    }}
                    className={`border p-5 rounded-2xl bg-white dark:bg-slate-900/30 transition-all cursor-pointer flex justify-between items-start ${
                      isSelected
                        ? 'border-blue-500 shadow-md translate-x-1'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {app.patient.name}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md ${
                          isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-550 dark:text-slate-450 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" /> {formattedTime}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-500 line-clamp-1 italic font-semibold">
                        Symptom intake: "{app.symptoms}"
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-450 self-center" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Consultation / Action Console (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl">
          {selectedApp ? (
            <div className="space-y-6">
              {/* Patient Basic Info */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-550">Consultation Console</h3>
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-500" /> Patient: {selectedApp.patient.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate">Email: {selectedApp.patient.email}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-350 font-bold flex items-start gap-1 pt-1.5 leading-relaxed">
                    <Activity className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" /> Symptoms: "{selectedApp.symptoms}"
                  </p>
                </div>
              </div>

              {/* AI Pre-visit Summary Block */}
              <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-4 bg-blue-500/5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-cyan-400">AI Pre-Visit Summary</h4>
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
                      <span>Urgency triage:</span>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded font-extrabold ${
                        selectedApp.preVisitSummary.urgency === 'HIGH' ? 'bg-rose-500/15 text-rose-500' :
                        selectedApp.preVisitSummary.urgency === 'MEDIUM' ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
                      }`}>
                        {selectedApp.preVisitSummary.urgency}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold block">Chief Complaint:</span>
                      <p className="text-slate-650 dark:text-slate-350">{selectedApp.preVisitSummary.chiefComplaint}</p>
                    </div>
                    <div>
                      <span className="font-bold block mb-1">Suggested questions for the consultation:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-350 font-medium">
                        {selectedApp.preVisitSummary.suggestedQuestions?.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-1 items-start bg-blue-500/10 p-2 rounded text-[10px] text-blue-750 dark:text-cyan-400 font-semibold border border-blue-500/10">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>AI Assistance disclaimer: This triage report does not replace clinical verification. Urgency level is a guideline.</span>
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

              {/* Consultation Input Form (for BOOKED status) */}
              {selectedApp.status === 'BOOKED' ? (
                <form onSubmit={handleCompleteConsultation} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Clinical Notes (required)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter diagnostic assessments, observations, and recommendations..."
                        rows={5}
                        className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Prescription Builder */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Pill className="w-4 h-4 text-teal-500" /> Prescribe Medications
                        </label>
                        <button
                          type="button"
                          onClick={handleAddMedication}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-250 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-0.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-800"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Medicine
                        </button>
                      </div>

                      <div className="space-y-3">
                        {prescriptionList.map((med, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Medicine Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Paracetamol"
                                  value={med.medicineName}
                                  onChange={(e) => handleMedicationChange(idx, 'medicineName', e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Dosage</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 500mg"
                                  value={med.dosage}
                                  onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Frequency</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Twice daily"
                                  value={med.frequency}
                                  onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Duration</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 7 days"
                                  value={med.duration}
                                  onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Instructions</label>
                                <input
                                  type="text"
                                  placeholder="e.g. After food"
                                  value={med.instructions}
                                  onChange={(e) => handleMedicationChange(idx, 'instructions', e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                                />
                              </div>
                            </div>

                            {prescriptionList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMedication(idx)}
                                className="w-full py-1 text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Medication
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Follow-up Information (optional)
                      </label>
                      <input
                        type="text"
                        value={followUpInfo}
                        onChange={(e) => setFollowUpInfo(e.target.value)}
                        placeholder="e.g. Follow up in 1 week if symptoms persist"
                        className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(null)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      {submitting ? 'Submitting...' : 'Complete Consultation'}
                    </button>
                  </div>
                </form>
              ) : (
                // Consultation Summary and Post-visit AI summary (for COMPLETED status)
                <div className="space-y-6">
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-550 mb-3">Completed Consultation Details</h3>
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-xl space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Notes</span>
                          <p className="text-xs text-slate-850 dark:text-slate-350 mt-1 font-semibold leading-relaxed">{selectedApp.consultation?.notes}</p>
                        </div>
                        {selectedApp.consultation?.followUpInfo && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Follow-up Instructions</span>
                            <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 font-semibold">{selectedApp.consultation.followUpInfo}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Persisted Prescription Table */}
                    {selectedApp.consultation?.prescription?.items?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Prescribed Medication</span>
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

                    {/* AI Post-visit Summary */}
                    <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-4 bg-teal-500/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-cyan-400">AI Post-Visit Summary</h4>
                        <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded ${
                          selectedApp.consultation?.postVisitSummary?.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                          selectedApp.consultation?.postVisitSummary?.status === 'FAILED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {selectedApp.consultation?.postVisitSummary?.status || 'PENDING'}
                        </span>
                      </div>

                      {selectedApp.consultation?.postVisitSummary?.status === 'SUCCESS' ? (
                        <div className="space-y-4 text-xs leading-relaxed">
                          <div>
                            <span className="font-bold block">Patient-Friendly Summary:</span>
                            <p className="text-slate-655 dark:text-slate-350 mt-1 font-semibold">{selectedApp.consultation.postVisitSummary.patientFriendlySummary}</p>
                          </div>
                          
                          {Array.isArray(selectedApp.consultation.postVisitSummary.medicationSchedule) && selectedApp.consultation.postVisitSummary.medicationSchedule.length > 0 && (
                            <div>
                              <span className="font-bold block mb-1">Suggested medication schedule:</span>
                              <div className="space-y-2">
                                {selectedApp.consultation.postVisitSummary.medicationSchedule.map((med, idx) => (
                                  <div key={idx} className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg flex justify-between items-center text-[11px]">
                                    <div>
                                      <span className="font-bold text-teal-600 dark:text-cyan-400">{med.medicineName}</span> ({med.dosage})
                                      <div className="text-[10px] text-slate-500 font-semibold">{med.frequency} for {med.duration}</div>
                                    </div>
                                    <div className="text-right text-[10px] font-bold text-blue-500">
                                      Timing: {med.timing}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="font-bold block">Actionable Follow-up Steps:</span>
                            <p className="text-slate-655 dark:text-slate-350 mt-1 font-semibold">{selectedApp.consultation.postVisitSummary.followUpSteps}</p>
                          </div>
                        </div>
                      ) : selectedApp.consultation?.postVisitSummary?.status === 'FAILED' ? (
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
                        <p className="text-xs text-slate-400 italic font-semibold">Post-visit summary is currently processing...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-12 space-y-3">
              <FileText className="w-12 h-12 text-slate-350" />
              <p className="text-xs font-semibold text-slate-400">Select an appointment on the left to write clinical notes or view consultation timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
