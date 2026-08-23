import React from 'react';
import { Pill, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import LockedState from '../components/LockedState';
import MedicationCard from '../components/MedicationCard';

export default function Medications({
  token,
  medForm,
  setMedForm,
  addMedLoading,
  medError,
  handleAddMedicine,
  activeInteractions,
  medicinesList,
  medsLoading,
  handleDeleteMedicine
}) {
  if (!token) {
    return (
      <LockedState
        Icon={Pill}
        title="Medication Dashboard Locked"
        description="Sign in or create an account to log medications, retrieve FDA summaries, and analyze drug interactions."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form to log medicine */}
      <div className="lg:col-span-1 border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 backdrop-blur-md h-fit space-y-4 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-teal-650 dark:text-teal-400" />
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Log New Medication</h3>
        </div>

        <form onSubmit={handleAddMedicine} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Medication Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aspirin, Metformin"
              value={medForm.name}
              onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
              className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Dosage
              </label>
              <input
                type="text"
                placeholder="e.g. 500mg, 5ml"
                value={medForm.dosage}
                onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 7 days, Ongoing"
                value={medForm.duration}
                onChange={(e) => setMedForm({ ...medForm, duration: e.target.value })}
                className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Frequency
            </label>
            <select
              value={medForm.frequency}
              onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
              className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
            >
              <option>Once daily</option>
              <option>Twice daily</option>
              <option>Three times daily</option>
              <option>Four times daily</option>
              <option>As needed (PRN)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Timing
            </label>
            <input
              type="text"
              placeholder="e.g. Morning, after food"
              value={medForm.timing}
              onChange={(e) => setMedForm({ ...medForm, timing: e.target.value })}
              className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
            />
          </div>

          {medError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 text-red-650 dark:text-red-400 rounded-lg text-xs font-semibold leading-relaxed">
              {medError}
            </div>
          )}

          <button
            type="submit"
            disabled={addMedLoading}
            className="w-full btn-primary-themed py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-955 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/10 cursor-pointer"
          >
            {addMedLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging & Checking...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Log Medication
              </>
            )}
          </button>
        </form>
      </div>

      {/* Dashboard view */}
      <div className="lg:col-span-2 space-y-6">
        {/* Interaction Alerts Box */}
        {activeInteractions.length > 0 && (
          <div className="border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-955/10 rounded-2xl p-5 backdrop-blur-md flex gap-4 items-start animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-extrabold text-sm text-red-800 dark:text-red-300">Active Drug-Drug Interaction Warnings</h4>
              <ul className="list-disc pl-4 mt-2 space-y-1 text-xs text-red-700 dark:text-red-450 leading-relaxed font-semibold">
                {activeInteractions.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* List of active medicines */}
        <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 backdrop-blur-md shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-650 dark:text-teal-400" />
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Logged Medications</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-450 font-bold">
              {medicinesList.length} Active {medicinesList.length === 1 ? 'Medication' : 'Medications'}
            </span>
          </div>

          {medsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="border border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl space-y-3 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-6"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded"></div>
                    <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded"></div>
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : medicinesList.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/40 dark:bg-slate-950/20">
              <Pill className="w-12 h-12 text-teal-500/60 dark:text-teal-400/30 mx-auto mb-3 animate-pulse" />
              <p className="text-slate-800 dark:text-slate-200 text-sm font-bold">No medications logged yet</p>
              <p className="text-xs text-slate-550 dark:text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed font-semibold">
                Log the prescription details on the left. The system will look up FDA details and analyze drug safety automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicinesList.map((med) => (
                <MedicationCard
                  key={med._id}
                  med={med}
                  onDelete={handleDeleteMedicine}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
