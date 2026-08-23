import React from 'react';
import { Trash2 } from 'lucide-react';

export default function MedicationCard({ med, onDelete }) {
  return (
    <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/60 p-4 rounded-xl flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-sm dark:shadow-none">
      <div>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-base">{med.name}</h4>
            {med.fdaDetails?.genericName && (
              <span className="text-[10px] text-slate-500 italic block">Generic: {med.fdaDetails.genericName}</span>
            )}
          </div>
          <button
            onClick={() => onDelete(med._id)}
            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
            title="Remove Medication"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 my-3 text-xs font-semibold">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-200/60 dark:border-slate-900">
            <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Dosage</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{med.dosage || 'Not specified'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-200/60 dark:border-slate-900">
            <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Frequency</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{med.frequency}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-200/60 dark:border-slate-900">
            <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Timing</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-ellipsis overflow-hidden block whitespace-nowrap" title={med.timing}>{med.timing || 'Anytime'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-200/60 dark:border-slate-900">
            <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Duration</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{med.duration || 'Ongoing'}</span>
          </div>
        </div>

        {med.fdaDetails?.uses && (
          <div className="mt-3 space-y-1.5 border-t border-slate-200 dark:border-slate-900 pt-3 text-xs font-medium">
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-teal-600 dark:text-teal-400 font-bold">FDA Uses:</strong> {med.fdaDetails.uses}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-orange-655 dark:text-orange-400/90 font-bold">Common Side Effects:</strong> {med.fdaDetails.sideEffects}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
