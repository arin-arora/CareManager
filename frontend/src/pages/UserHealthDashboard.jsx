import React from 'react';
import { Activity, Layers, ShieldCheck, Heart, Award } from 'lucide-react';

export default function UserHealthDashboard({
  symptomHistory = [],
  medicinesList = [],
  labReportsList = []
}) {
  // Compile counts
  const totalSymptoms = symptomHistory.length;
  const totalMeds = medicinesList.length;
  const totalReports = labReportsList.length;

  // Compile timeline events chronologically
  const timelineEvents = [];
  symptomHistory.forEach(log => {
    timelineEvents.push({
      type: 'symptom',
      date: new Date(log.createdAt),
      title: 'Symptom Logged',
      desc: `${log.symptoms.join(', ')} (${log.duration})`,
      detail: log.notes
    });
  });
  medicinesList.forEach(med => {
    timelineEvents.push({
      type: 'medication',
      date: new Date(med.createdAt),
      title: 'Medication Logged',
      desc: `${med.name} - ${med.dosage || 'N/A'} (${med.frequency})`,
      detail: med.duration ? `Duration: ${med.duration}` : ''
    });
  });
  labReportsList.forEach(rep => {
    timelineEvents.push({
      type: 'lab',
      date: new Date(rep.createdAt),
      title: 'Lab Report Extracted',
      desc: rep.rawText.length > 40 ? rep.rawText.substring(0, 40) + '...' : rep.rawText,
      detail: rep.explanation ? (rep.explanation.length > 90 ? rep.explanation.substring(0, 90) + '...' : rep.explanation) : ''
    });
  });

  // Sort timeline chronologically (newest first)
  timelineEvents.sort((a, b) => b.date - a.date);

  // Generate automated wellness recommendations based on logged states
  const recommendations = [];
  if (totalMeds > 0) {
    recommendations.push("Ensure you strictly follow the medication frequency timings, and record any side effects if they arise.");
  }
  if (symptomHistory.some(log => log.modelPrediction?.urgencyLevel === 'Urgent')) {
    recommendations.push("You have logged some urgent symptoms recently. Make sure to schedule a visit with your primary care provider or specialist soon.");
  }
  if (totalReports > 0) {
    const lowHb = labReportsList.some(rep => rep.parsedData?.some(p => p.testName.toLowerCase().includes('hemoglobin') && p.status === 'low'));
    if (lowHb) {
      recommendations.push("Your hemoglobin was flagged as low. Consider increasing dietary iron or consulting your doctor regarding iron supplementation.");
    }
  }
  if (recommendations.length === 0) {
    recommendations.push("All logged systems look stable. Keep monitoring your symptoms and stay hydrated!");
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header Card */}
      <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2.5">
          <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-850 dark:text-slate-100">Personal Health Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">Visualize your personal wellness history, clinical logs, and AI wellness recommendations.</p>
          </div>
        </div>
      </div>

      {/* Wellness Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/10 p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
          <div className="p-3.5 bg-rose-500/10 text-rose-550 dark:text-rose-400 rounded-xl border border-rose-500/15">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Symptom Analyses</span>
            <div className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{totalSymptoms}</div>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/10 p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
          <div className="p-3.5 bg-teal-500/10 text-teal-650 dark:text-teal-400 rounded-xl border border-teal-500/15">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Medications</span>
            <div className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{totalMeds}</div>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/10 p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
          <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/15">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Analyzed Lab Reports</span>
            <div className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{totalReports}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline (Left Column) */}
        <div className="lg:col-span-2 border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-4 shadow-sm dark:shadow-none">
          <h2 className="text-sm font-bold text-slate-550 dark:text-slate-200 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-900">Health Timeline</h2>
          {timelineEvents.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-8 text-center font-medium">No wellness logs entered yet. Enter symptoms, log medications, or upload reports to build your timeline.</p>
          ) : (
            <div className="space-y-6 pt-2">
              {timelineEvents.slice(0, 10).map((event, idx) => (
                <div key={idx} className="relative pl-6 border-l border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 flex items-center justify-center">
                    <span className={`w-1.5 h-1.5 rounded-full ${event.type === 'symptom' ? 'bg-rose-500' : event.type === 'medication' ? 'bg-teal-500' : 'bg-indigo-500'}`} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <span className="uppercase tracking-wider font-extrabold">{event.title}</span>
                    <span>{event.date.toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{event.desc}</h3>
                  {event.detail && <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-0.5 leading-relaxed font-semibold">{event.detail}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations & Reports (Right Column) */}
        <div className="space-y-6">
          <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-slate-555 dark:text-slate-200 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              AI Wellness Tips
            </h2>
            <div className="space-y-3.5 pt-1">
              {recommendations.map((tip, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs leading-relaxed text-slate-655 dark:text-slate-300 font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">✦</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-slate-555 dark:text-slate-200 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-900">Saved Health Reports</h2>
            <div className="space-y-2 pt-1">
              {labReportsList.slice(0, 3).map((rep) => (
                <div key={rep._id} className="p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-150 dark:border-slate-900 rounded-xl flex flex-col gap-1 text-[11px] shadow-sm">
                  <span className="text-slate-700 dark:text-slate-400 font-bold truncate">{rep.rawText.length > 40 ? rep.rawText.substring(0, 40) + '...' : rep.rawText}</span>
                  <span className="text-slate-450 dark:text-slate-500 font-medium">Verified on {new Date(rep.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {labReportsList.length === 0 && (
                <p className="text-[11px] text-slate-450 dark:text-slate-500 italic py-2 text-center font-medium">No reports saved.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
