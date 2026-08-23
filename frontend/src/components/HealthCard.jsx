import React from 'react';

export default function HealthCard({ label, title, status, isActive }) {
  return (
    <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-xl flex flex-col justify-between">
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <h3 className="text-lg font-extrabold text-slate-200 mt-1">{title}</h3>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-semibold capitalize text-slate-300">
          {status}
        </span>
      </div>
    </div>
  );
}
