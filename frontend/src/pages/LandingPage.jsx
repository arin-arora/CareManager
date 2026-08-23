import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, ShieldCheck, Stethoscope, 
  ArrowRight, Sparkles, CheckCircle2, FileText, Lock, Activity
} from 'lucide-react';

export default function LandingPage({ setIsLogin, setAuthForm, authForm }) {
  const navigate = useNavigate();

  const handleRoleCTA = (role, isSignUp = false) => {
    if (setIsLogin) setIsLogin(!isSignUp);
    if (setAuthForm) {
      setAuthForm(prev => ({ ...prev, role }));
    }
    navigate('/login');
  };

  return (
    <div className="space-y-20 pb-16 animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 overflow-hidden flex flex-col items-center text-center">
        {/* Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tr from-blue-500/15 to-indigo-500/15 rounded-full blur-[80px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Healthcare Appointment & Triage Platform
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-slate-50">
            Streamlined Healthcare <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Appointments & Triage
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            CareManager connects patients with verified medical specialists. Experience real-time slot holding, automated AI pre-visit triage summaries, structured SOAP clinical notes, and digital prescriptions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => handleRoleCTA('PATIENT', true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 group"
            >
              Get Started as Patient
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => handleRoleCTA('DOCTOR', false)}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Doctor Portal Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Role Selection Portals */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            How will you use CareManager?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Choose your account role below to enter the tailored healthcare appointment and clinical portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Portal Card */}
          <div className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/30 p-6 rounded-2xl flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-sm group">
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl w-fit border border-blue-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>👤 Patient</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Book appointments and manage your healthcare. Search verified specialists, lock time slots in real-time, view AI pre-visit summaries, and access prescriptions.
              </p>
            </div>
            <button
              onClick={() => handleRoleCTA('PATIENT', false)}
              className="mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              Patient Sign In / Register
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Doctor Portal Card */}
          <div className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/30 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 transition-all shadow-sm group">
            <div className="space-y-4">
              <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl w-fit border border-teal-500/20">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🩺 Doctor</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Manage appointments and provide consultations. Review assigned patient schedules, inspect AI pre-visit triage summaries, write SOAP notes, and issue digital prescriptions.
              </p>
            </div>
            <button
              onClick={() => handleRoleCTA('DOCTOR', false)}
              className="mt-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              Doctor Sign In / Register
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Portal Card */}
          <div className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/30 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-sm group">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit border border-indigo-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🛡️ Administrator</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Protected system console. Onboard verified medical practitioners, configure weekly schedule templates, set slot duration rules, and manage doctor leave calendars.
              </p>
            </div>
            <button
              onClick={() => handleRoleCTA('PATIENT', false)}
              className="mt-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              Admin Portal Access
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* How CareManager Works */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            How CareManager Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A seamless three-stage workflow connecting patients and clinicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="text-center space-y-3 p-6 border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-extrabold text-base flex items-center justify-center mx-auto border border-blue-500/20">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Select Specialist & Lock Slot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Filter doctor directory by specialty & designation. Hold available slots in real-time with temporary locking.
            </p>
          </div>

          <div className="text-center space-y-3 p-6 border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 font-extrabold text-base flex items-center justify-center mx-auto border border-teal-500/20">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">AI Pre-Visit Triage Summary</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Automated AI engine evaluates patient-submitted symptoms, assigns urgency levels (Low/Medium/High), and prepares doctor summary notes.
            </p>
          </div>

          <div className="text-center space-y-3 p-6 border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-base flex items-center justify-center mx-auto border border-indigo-500/20">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Consultation & Prescriptions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Assigned doctor completes consultation using SOAP clinical notes, diagnoses, structured prescriptions, and follow-up guidance.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
