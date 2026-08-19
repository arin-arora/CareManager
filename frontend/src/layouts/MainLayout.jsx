import React from 'react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import Navbar from '../components/Navbar';

export default function MainLayout({ user, handleLogout, setIsLogin, children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Navbar */}
      <Navbar
        user={user}
        handleLogout={handleLogout}
        setIsLogin={setIsLogin}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-100/50 dark:bg-slate-950 py-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <p>© 2026 MedGuide AI. Built for clinical triage and documentation workflow validation.</p>
      </footer>
    </div>
  );
}
