import React from 'react';
import { Calendar } from 'lucide-react';

export default function SymptomHistoryCard({ log }) {
  return (
    <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/40 p-4 rounded-xl relative hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-sm dark:shadow-none">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
            log.modelPrediction?.urgencyLevel === 'Emergency'
              ? 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20'
              : log.modelPrediction?.urgencyLevel === 'Urgent'
              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
              : 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
          }`}>
            {log.modelPrediction?.urgencyLevel || 'Routine'}
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
        <span className="text-xs font-bold text-teal-650 dark:text-teal-400">
          Spec: {log.modelPrediction?.suggestedSpecialist || 'General Practitioner'}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3 animate-fade-in">
        {log.symptoms.map((s, idx) => (
          <span key={idx} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold">
            {s}
          </span>
        ))}
        <span className="text-[10px] text-slate-500 ml-1 self-center font-medium">
          • Duration: {log.duration}
        </span>
      </div>

      {log.notes && (
        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded border border-slate-100 dark:border-slate-900/80 mb-3 italic font-medium">
          &ldquo;{log.notes}&rdquo;
        </p>
      )}

      {log.rulesWarning?.criticalWarning && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 rounded text-[11px] font-semibold leading-relaxed">
          <strong className="text-red-800 dark:text-red-300">Critical Warning:</strong> {log.rulesWarning.criticalWarning}
        </div>
      )}

      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
        <strong className="text-slate-800 dark:text-slate-350">Home Care Notes:</strong> {log.homeCareNotes}
      </div>
    </div>
  );
}
