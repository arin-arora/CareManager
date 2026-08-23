import React from 'react';
import { ShieldAlert, AlertTriangle, Send, Loader2, Plus, Activity } from 'lucide-react';
import SymptomHistoryCard from '../components/SymptomHistoryCard';

export default function SymptomIntake({
  symptomInput,
  setSymptomInput,
  symptomsList,
  handleAddSymptom,
  removeSymptom,
  durationInput,
  setDurationInput,
  ageInput,
  setAgeInput,
  notesInput,
  setNotesInput,
  predictLoading,
  handleSymptomSubmit,
  predictionResult,
  token,
  saveSymptomLoading,
  handleSaveSymptom,
  symptomHistory
}) {
  return (
    <div className="space-y-6">
      <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 backdrop-blur-md shadow-sm dark:shadow-none">
        <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 mb-2">Phase 1 AI/ML Sandbox: Symptom Intake</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Test the ingestion parser and Python rule-based triage classifier. Add symptoms below (try adding "chest pain" or "numbness" to verify critical emergency triggers).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Intake Form */}
          <div className="space-y-4">
            <form onSubmit={handleAddSymptom} className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Add Symptom
                </label>
                <input
                  type="text"
                  placeholder="e.g. cough, fever, nausea..."
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  className="w-full form-input-themed rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 rounded-lg text-sm font-bold self-end h-[38px] transition-all cursor-pointer"
              >
                Add
              </button>
            </form>

            {/* Symptom Tags */}
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50/50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-900">
              {symptomsList.length === 0 ? (
                <span className="text-xs text-slate-400 dark:text-slate-600 self-center px-1 font-medium">No symptoms added yet.</span>
              ) : (
                symptomsList.map((sym, idx) => (
                  <span 
                    key={idx} 
                    className="bg-teal-500/10 border border-teal-500/30 text-teal-650 dark:text-teal-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold"
                  >
                    {sym}
                    <button 
                      type="button"
                      onClick={() => removeSymptom(idx)} 
                      className="text-teal-600 hover:text-teal-400 font-extrabold focus:outline-none cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Duration
                </label>
                <select
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <option>1 day</option>
                  <option>2-3 days</option>
                  <option>1 week</option>
                  <option>More than 2 weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  className="w-full form-input-themed rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <textarea
                placeholder="Add any extra notes..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={2}
                className="w-full form-input-themed rounded-lg px-3 py-2 text-sm resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSymptomSubmit}
              disabled={symptomsList.length === 0 || predictLoading}
              className="w-full btn-primary-themed py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-955 rounded-lg font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/10 cursor-pointer"
            >
              {predictLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </div>

          {/* Response / Report Display */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 rounded-xl p-6 flex flex-col justify-center min-h-[300px] shadow-sm dark:shadow-none">
            {predictionResult ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Urgency Status
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                        predictionResult.urgency_level === 'Emergency'
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-655 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                          : predictionResult.urgency_level === 'Urgent'
                          ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-655 dark:text-orange-400 border border-orange-250 dark:border-orange-500/20'
                          : 'bg-green-50 dark:bg-green-500/10 text-green-655 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                      }`}>
                        {predictionResult.urgency_level}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-right">
                      Suggested Specialist
                    </span>
                    <span className="text-sm font-extrabold text-teal-650 dark:text-teal-400 block text-right mt-1">
                      {predictionResult.suggested_specialist}
                    </span>
                  </div>
                </div>

                {/* Rule-based emergency warning display */}
                {predictionResult.critical_warning && (
                  <div className="bg-red-50 dark:bg-red-955/40 border border-red-200 dark:border-red-955 text-red-650 dark:text-red-400 p-4 rounded-xl flex gap-3 items-start animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-red-800 dark:text-red-300">Emergency Red Flag Triggered</h4>
                      <p className="text-xs mt-1 leading-relaxed text-red-700 dark:text-red-400/90 font-medium">{predictionResult.critical_warning}</p>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Potential Conditions
                  </span>
                  <div className="space-y-2">
                    {predictionResult.conditions.map((c, i) => {
                      const pct = Math.round(c.confidence * 100);
                      let badgeStyle = '';
                      let label = '';
                      if (c.confidence >= 0.7) {
                        badgeStyle = 'bg-emerald-55/70 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
                        label = `High Confidence • ${pct}%`;
                      } else if (c.confidence >= 0.4) {
                        badgeStyle = 'bg-amber-55/70 dark:bg-amber-500/10 text-amber-655 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
                        label = `Moderate Confidence • ${pct}%`;
                      } else {
                        badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
                        label = `Low Confidence • ${pct}%`;
                      }
                      return (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-900 p-3.5 rounded-xl shadow-sm dark:shadow-none">
                          <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{c.name}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border w-fit shrink-0 ${badgeStyle}`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Home Care Notes
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200 dark:border-slate-900/80 font-medium shadow-sm dark:shadow-none">
                    {predictionResult.home_care_notes}
                  </p>
                </div>

                {token ? (
                  <button
                    type="button"
                    onClick={handleSaveSymptom}
                    disabled={saveSymptomLoading}
                    className="w-full mt-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-655 dark:text-teal-400 border border-teal-500/25 dark:border-teal-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {saveSymptomLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving to History...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Save to Health History
                      </>
                    )}
                  </button>
                ) : (
                  <div className="mt-4 p-3 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-900 rounded-lg text-center">
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Sign in to save this report to your medical history.
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center space-y-3 py-10 px-4">
                <ShieldAlert className="w-12 h-12 text-slate-350 dark:text-slate-800 mx-auto animate-pulse" />
                <p className="text-slate-800 dark:text-slate-200 text-sm font-bold">Await Analysis Report</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Add symptoms and hit <strong>"Analyze Symptoms"</strong> to trigger rules checking and ML classification.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Symptom History Timeline (Visible when logged in) */}
      {token && (
        <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/10 p-6 backdrop-blur-md mt-6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Saved Symptom Log History</h3>
          </div>

          {symptomHistory.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-4 font-semibold">No saved symptoms found. Analyze and save your first log above.</p>
          ) : (
            <div className="space-y-4">
              {symptomHistory.map((log) => (
                <SymptomHistoryCard key={log._id} log={log} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
