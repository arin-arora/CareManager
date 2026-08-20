import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, FileText, Activity, 
  CheckCircle, ArrowRight, Plus, Trash2, RefreshCw, AlertTriangle, Pill 
} from 'lucide-react';
import { Button, Card, Input, Textarea, Badge, StatusBadge, EmptyState, LoadingState } from '../components/UI';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/appointments/doctor`, {
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

    const validMeds = prescriptionList.filter(m => m.medicineName.trim() !== '');

    try {
      setSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/doctors/appointments/${selectedApp.id}/consultation`, {
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
        alert('Consultation saved successfully!');
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
      alert('Network error.');
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
      alert('Network error.');
    } finally {
      setRetrying(false);
    }
  };

  // Metrics calculation
  const totalApps = appointments.length;
  const completedApps = appointments.filter(a => a.status === 'COMPLETED').length;
  const pendingApps = appointments.filter(a => a.status === 'BOOKED').length;
  const cancelledApps = appointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Workspace Header */}
      <div className="border-b border-slate-205 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Clinical Workspace</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage daily schedules, consult pre-visit histories, write prescriptions, and log reports.</p>
      </div>

      {/* Grid: 3 columns (Timeline List, Workspace desk, Stats panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Patient timeline schedule (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Today's Schedule</h2>
          {loading && appointments.length === 0 ? (
            <LoadingState message="Syncing workspace calendar..." />
          ) : appointments.length === 0 ? (
            <EmptyState 
              title="No patients scheduled"
              description="There are no consultations scheduled for today."
              icon={Calendar}
            />
          ) : (
            <div className="space-y-2.5">
              {appointments.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const slotHour = new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      if (app.status !== 'COMPLETED') {
                        setNotes('');
                        setFollowUpInfo('');
                        setPrescriptionList([
                          { medicineName: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' }
                        ]);
                      }
                    }}
                    className={`border p-4.5 rounded-xl bg-white dark:bg-slate-900 transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/10'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-450/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-blue-650 bg-blue-50 px-2 py-0.5 rounded">
                          {slotHour}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                          {app.patient?.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 italic font-semibold line-clamp-1">Intake: "{app.symptoms}"</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: Clinical Workspace details desk (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-xl shadow-xs space-y-6">
          {selectedApp ? (
            <div className="space-y-6 animate-fade-in text-xs font-semibold leading-relaxed">
              
              {/* Patient Details Section */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Patient details</span>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-850 dark:text-white">{selectedApp.patient?.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Contact: {selectedApp.patient?.email}</p>
                  </div>
                  <StatusBadge status={selectedApp.status} />
                </div>
                <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-bold bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200/50">
                  ⚠️ Symptoms: "{selectedApp.symptoms}"
                </p>
              </div>

              {/* AI Clinical Summary Section */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Clinical summary</span>
                <div className="border border-blue-500/10 rounded-lg p-4 bg-blue-500/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-blue-650">Pre-Visit AI Triage</span>
                    <Badge variant={selectedApp.preVisitSummary?.status === 'SUCCESS' ? 'success' : selectedApp.preVisitSummary?.status === 'FAILED' ? 'danger' : 'warning'}>
                      {selectedApp.preVisitSummary?.status || 'Processing'}
                    </Badge>
                  </div>

                  {selectedApp.preVisitSummary?.status === 'SUCCESS' ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400">Chief Complaint</span>
                        <p className="text-slate-800 dark:text-slate-250 font-bold mt-0.5">{selectedApp.preVisitSummary.chiefComplaint}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400">Suggested Questions</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-655 font-medium mt-0.5">
                          {selectedApp.preVisitSummary.suggestedQuestions?.map((q, idx) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : selectedApp.preVisitSummary?.status === 'FAILED' ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-rose-500 font-semibold">Triage compilation failed.</p>
                      <Button onClick={() => handleRetryPreVisit(selectedApp.id)} disabled={retrying} className="py-1 px-2.5 text-[9px]">
                        Retry AI
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic animate-pulse">Triage summaries processing...</p>
                  )}
                </div>
              </div>

              {/* Consultation Editor Section */}
              {selectedApp.status === 'BOOKED' ? (
                <form onSubmit={handleCompleteConsultation} className="space-y-4">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Consultation</span>
                  
                  <Textarea
                    label="Clinical Notes / Diagnoses"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter doctor diagnoses, medical notes, observations..."
                    required
                  />

                  {/* Prescription builder */}
                  <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Medications</span>
                      <button
                        type="button"
                        onClick={handleAddMedication}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-extrabold rounded border border-slate-205 transition-all cursor-pointer"
                      >
                        + Add Row
                      </button>
                    </div>

                    <div className="space-y-3">
                      {prescriptionList.map((med, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg space-y-3">
                          <div className="grid grid-cols-2 gap-2.5">
                            <Input
                              label="Medicine Name"
                              value={med.medicineName}
                              onChange={(e) => handleMedicationChange(idx, 'medicineName', e.target.value)}
                              placeholder="e.g. Aspirin"
                            />
                            <Input
                              label="Dosage Strength"
                              value={med.dosage}
                              onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                              placeholder="e.g. 75mg"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              label="Frequency"
                              value={med.frequency}
                              onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                              placeholder="e.g. Daily"
                            />
                            <Input
                              label="Duration"
                              value={med.duration}
                              onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                              placeholder="e.g. 30 days"
                            />
                            <Input
                              label="Instructions"
                              value={med.instructions}
                              onChange={(e) => handleMedicationChange(idx, 'instructions', e.target.value)}
                              placeholder="e.g. Night"
                            />
                          </div>

                          {prescriptionList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(idx)}
                              className="w-full py-1 text-[9px] font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 text-rose-500 rounded cursor-pointer"
                            >
                              Remove Row
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Follow-up / Recall Info"
                    value={followUpInfo}
                    onChange={(e) => setFollowUpInfo(e.target.value)}
                    placeholder="e.g. Schedule review in 1 month"
                  />

                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setSelectedApp(null)} className="flex-1 py-2 border border-slate-200">
                      Close File
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1 py-2 font-extrabold">
                      {submitting ? 'Saving notes...' : 'Complete Visit'}
                    </Button>
                  </div>
                </form>
              ) : (
                /* Completed Consultation Details View */
                <div className="space-y-4 pt-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Completed Consultation Notes</span>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 rounded-lg space-y-3 font-semibold text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-[9px] font-bold text-slate-450 block uppercase tracking-wider">Clinical Notes</span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{selectedApp.consultation?.notes}</p>
                    </div>
                    {selectedApp.consultation?.followUpInfo && (
                      <div>
                        <span className="text-[9px] font-bold text-slate-450 block uppercase tracking-wider">Follow-up instructions</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{selectedApp.consultation.followUpInfo}</p>
                      </div>
                    )}
                  </div>

                  {selectedApp.consultation?.prescription?.items?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Prescribed Medicine Cabinet</span>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                              <th className="p-2">Name</th>
                              <th className="p-2">Dosage</th>
                              <th className="p-2">Duration</th>
                              <th className="p-2">Timing</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedApp.consultation.prescription.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 font-extrabold text-blue-600">{item.medicineName}</td>
                                <td className="p-2">{item.dosage}</td>
                                <td className="p-2">{item.duration}</td>
                                <td className="p-2 text-slate-550 font-semibold">{item.frequency}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full py-16 text-center flex flex-col items-center justify-center space-y-3">
              <FileText className="w-12 h-12 text-slate-350" />
              <p className="text-xs font-bold text-slate-455">Select a patient on the left to write clinical notes, compile diagnostics, and prescribe medications.</p>
            </div>
          )}
        </div>

        {/* Column 3: Today's Stats Overview (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Today's Overview</h2>
          
          <div className="grid grid-cols-1 gap-3.5">
            <Card className="p-4 space-y-1 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total appointments</span>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 block">{totalApps}</span>
            </Card>

            <Card className="p-4 space-y-1 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed visits</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{completedApps}</span>
            </Card>

            <Card className="p-4 space-y-1 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending notes</span>
              <span className="text-2xl font-extrabold text-amber-500 mt-1 block">{pendingApps}</span>
            </Card>

            <Card className="p-4 space-y-1 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cancellations</span>
              <span className="text-2xl font-extrabold text-red-500 mt-1 block">{cancelledApps}</span>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
