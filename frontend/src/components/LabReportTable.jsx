import React from 'react';

export default function LabReportTable({ parsedData }) {
  return (
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/40 text-slate-505 dark:text-slate-400 font-bold uppercase tracking-wider">
          <th className="p-3">Marker / Test</th>
          <th className="p-3">Result</th>
          <th className="p-3">Unit</th>
          <th className="p-3">Reference Interval</th>
          <th className="p-3 text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        {parsedData && parsedData.map((item, index) => (
          <tr key={index} className="border-b border-slate-100 dark:border-slate-900/50 hover:bg-slate-50/60 dark:hover:bg-slate-905/20 transition-all font-medium text-slate-800 dark:text-slate-200">
            <td className="p-3 font-bold text-slate-850 dark:text-slate-100">{item.testName}</td>
            <td className="p-3 font-semibold">{item.value}</td>
            <td className="p-3 text-slate-500 dark:text-slate-400">{item.unit || '—'}</td>
            <td className="p-3 text-slate-500 dark:text-slate-400">{item.referenceRange || '—'}</td>
            <td className="p-3 text-right">
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block ${
                item.status === 'low'
                  ? 'bg-red-500/10 text-red-655 dark:text-red-400 border border-red-500/20'
                  : item.status === 'high'
                  ? 'bg-orange-500/10 text-orange-655 dark:text-orange-400 border border-orange-500/20'
                  : item.status === 'abnormal'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-green-500/10 text-green-655 dark:text-green-400 border border-green-500/20'
              }`}>
                {item.status.toUpperCase()}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
