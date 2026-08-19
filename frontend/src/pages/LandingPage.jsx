import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Calendar, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, FileText, Pill
} from 'lucide-react';

export default function LandingPage({ setIsLogin }) {
  const navigate = useNavigate();

  const handleCTA = (isSignUp) => {
    setIsLogin(!isSignUp);
    navigate('/login');
  };

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 overflow-hidden flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 rounded-full blur-[80px] -z-10 animate-pulse duration-[8000ms]"></div>
        
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            Healthcare Appointment & Follow-up Suite
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-slate-50">
            Intelligent Booking & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 bg-clip-text text-transparent">
              Clinical Triage
            </span>
            {' '}With AI
          </h1>
          
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CareManager streamlines slot holds, automates pre-visit triage, creates Google Calendar events, and converts clinical notes into structured patient plans.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => handleCTA(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/10 cursor-pointer flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => handleCTA(false)}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      </section>

      {/* Product Features Showcase */}
      <section id="features" className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Core Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Integrated workflows for patients, doctors, and clinic administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Slot Hold & Booking */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit border border-rose-500/15 dark:border-rose-500/10">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Slot Holds & Booking</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Patients can reserve appointment slots for up to 5 minutes before payment or intake submission, preventing double-bookings and race conditions.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Book an Appointment <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: AI Pre-Visit Triage */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl w-fit border border-indigo-500/15 dark:border-indigo-500/10">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">AI Pre-Visit Triage</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Analyze submitted patient symptoms prior to the appointment. The AI classifies urgency levels (Low/Medium/High) and suggests critical diagnostic questions for the doctor.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Check Symptoms <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Post-Visit summary */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl w-fit border border-teal-500/15 dark:border-teal-500/10">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Post-Visit Summarizer</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Convert messy clinical doctor notes and handwritten prescriptions into a clear, patient-friendly medical summary, follow-up timeline, and dosage schedules.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Try Summary Generation <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Google Calendar Sync */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit border border-emerald-500/15 dark:border-emerald-500/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Google Calendar Sync</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Automatic OAuth-based calendar event syncing for patients and doctors. Instantly reflects new, rescheduled, or cancelled bookings on external devices.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Connect Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: Smart Reminders */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit border border-amber-500/15 dark:border-amber-500/10">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Dosage Email Reminders</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Background workers calculate next reminder timestamps and deliver automated email notifications with instructions and timing info directly to the patient's inbox.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Configure Reminders <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6: Doctor Schedule Admin */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-fit border border-blue-500/15 dark:border-blue-500/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Doctor Profile Control</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Clinic administrators manage specialties, slot durations, working hours, and register leaves (instantly notifying affected patients with existing slots).
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Access Admin Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="space-y-12 max-w-5xl mx-auto">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A secure workflow to coordinate clinics, practitioners, and patient follow-ups.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[68px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-teal-500/30 via-indigo-500/30 to-teal-500/30 -z-10"></div>

          {/* Step 1 */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-teal-500 text-teal-600 dark:text-teal-400 flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
              1
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Patient Slot Reservation</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed px-4">
              Search specialties, temporarily hold a free slot, submit symptom intake questions, and finalize the appointment.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
              2
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Clinician Consultation</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed px-4">
              Doctors review AI-generated symptom summaries beforehand and submit prescriptions and notes in the consultation portal.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
              3
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Automated Outbox Follow-up</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed px-4">
              Patients receive post-visit summaries on their dashboard, Google Calendar logs, and automated medication dosage reminders.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="border border-slate-200 dark:border-slate-900 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10 p-8 sm:p-12 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-teal-500/5 rounded-full blur-[50px] -z-10"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              CareManager Benefits
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Structured and Safe Clinical Communication
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Engineered with transactional holds to eliminate scheduling conflicts and powered by validated LLM extraction templates.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleCTA(true)}
                className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Create Account Now
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-3.5 items-start">
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Strict Hold Lockouts</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Prevents double-booking by enforcing a strict Redis TTL hold on active slot selections.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-205 text-sm">Outbox Event Safety</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Uses transactional outbox patterns to guarantee email delivery and Google Calendar sync even during network hiccups.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Resilient AI Pipeline</h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mt-1">
                  Handles third-party LLM failures gracefully by saving error states and offering manual clinician retries.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Role-Based Gateways</h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mt-1">
                  Separate views and administrative operations customized for patients, doctors, and clinic admins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
