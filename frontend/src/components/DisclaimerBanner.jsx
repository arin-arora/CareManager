import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="sticky top-0 z-50 bg-amber-50/80 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 backdrop-blur-md px-4 py-2 text-center text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500 animate-pulse" />
      <span>Informational only — not a diagnosis, consult a doctor for medical emergencies or symptoms.</span>
    </div>
  );
}
