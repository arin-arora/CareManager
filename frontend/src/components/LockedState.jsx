import React from 'react';
import { Link } from 'react-router-dom';

export default function LockedState({ Icon, title, description }) {
  return (
    <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-8 text-center max-w-md mx-auto backdrop-blur-md shadow-sm dark:shadow-none">
      <Icon className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6 leading-relaxed">{description}</p>
      <Link
        to="/login"
        className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-sm transition-all cursor-pointer inline-block"
      >
        Open Auth Dev Console
      </Link>
    </div>
  );
}
