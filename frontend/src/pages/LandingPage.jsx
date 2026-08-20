import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Search, Clock, ArrowRight, ShieldCheck, 
  CheckCircle, AlertTriangle, Pill, BrainCircuit, Heart
} from 'lucide-react';
import { Button, Card, Badge, StatusBadge } from '../components/UI';

export default function LandingPage({ setIsLogin }) {
  const navigate = useNavigate();

  const handleCTA = (isSignUp) => {
    setIsLogin(!isSignUp);
    navigate('/login');
  };

  return (
    <div className="space-y-24 pb-16 font-sans">
      {/* 1. Left-Aligned Hero Section */}
      <section className="pt-8 pb-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-slate-200/50 pb-16">
        
        {/* Left column: Text Content (7 cols) */}
        <div className="md:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            🩺 Clinical Scheduler
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
            CareManager <br />
            <span className="text-blue-600 dark:text-blue-400">Healthcare scheduling made simple.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-semibold max-w-xl">
            Find doctors, book appointments, prepare for consultations, and manage your follow-up care from one place.
          </p>
          <div className="flex gap-3.5 pt-2">
            <Button onClick={() => handleCTA(true)} className="px-6 py-2.5">
              Find a Doctor
            </Button>
            <Button onClick={() => handleCTA(false)} variant="secondary" className="px-6 py-2.5">
              View Appointments
            </Button>
          </div>
        </div>

        {/* Right column: Product UI Visual (5 cols) */}
        <div className="md:col-span-5">
          <div className="border border-slate-205 dark:border-slate-850 p-5.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm max-w-sm mx-auto space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming appointment</span>
              <Badge variant="success">✓ Confirmed</Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Dr. Ananya Sharma</h4>
              <p className="text-xs text-slate-500 font-bold">Cardiology Specialist</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-655 dark:text-slate-400">
              <span className="flex items-center gap-1.5">📅 Tomorrow</span>
              <span className="flex items-center gap-1.5">🕒 10:30 AM</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800 text-[10px] font-semibold text-slate-500 leading-normal">
              💬 Reason: "Checking chest tightness over the past two days."
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Cards Grid */}
      <section className="space-y-8">
        <div className="text-left space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Everything you need for a better visit</h2>
          <p className="text-xs text-slate-500 font-semibold max-w-md">Four primary modules connecting scheduling with clinical documentation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="space-y-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg w-fit border border-blue-100">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Find the right doctor</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Filter practitioners by specialization, practice duration, and working hours.</p>
          </Card>

          <Card className="space-y-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg w-fit border border-emerald-100">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Book an available time</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Lock a 5-minute temporary slot hold immediately while finalizing intake details.</p>
          </Card>

          <Card className="space-y-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-lg w-fit border border-indigo-100">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Prepare before your visit</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Share symptoms to compile an AI pre-visit summary with questions to ask your physician.</p>
          </Card>

          <Card className="space-y-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg w-fit border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Stay on track after visit</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Access plain post-visit summaries, structured medications, and follow-up checklists.</p>
          </Card>
        </div>
      </section>

      {/* 3. Appointment Stepper Workflow */}
      <section className="space-y-8 max-w-5xl mx-auto border-t border-slate-200/50 pt-12">
        <div className="text-left space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Care Journey Workflow</h2>
          <p className="text-xs text-slate-500 font-semibold">The complete step-by-step cycle of care coordination.</p>
        </div>

        {/* Stepper Grid Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 text-center">
          {[
            { step: '1', title: 'Find Doctor', desc: 'Search practitioner index' },
            { step: '2', title: 'Choose Time', desc: 'Select available hour' },
            { step: '3', title: 'Book Slot', desc: 'Acquire 5-min temporary lock' },
            { step: '4', title: 'Prepare Visit', desc: 'Symptom AI triage check' },
            { step: '5', title: 'Consultation', desc: 'Practitioner consult notes' },
            { step: '6', title: 'Follow Up', desc: 'Friendly summary directions' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-950 border-2 border-blue-600 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-xs mx-auto shadow-xs">
                {item.step}
              </div>
              <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{item.title}</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AI Triage Summary Mockup Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-t border-slate-200/50 pt-12">
        {/* Left Content (6 cols) */}
        <div className="md:col-span-6 space-y-4 text-left">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Prepare before you meet your doctor</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            By sharing symptom details in advance, our AI clinical module generates a summary triage dashboard. This helps doctors prioritize chief complaints and suggests relevant questions for patients to ask during their slot.
          </p>
          <div className="flex gap-2 items-start bg-blue-50 dark:bg-blue-955/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900 text-[10px] text-blue-750 dark:text-blue-400 font-semibold max-w-md">
            <AlertTriangle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <span>AI summaries serve as pre-visit guidelines for the consultation desk and do not substitute clinical judgments.</span>
          </div>
        </div>

        {/* Right Preview Card Mockup (6 cols) */}
        <div className="md:col-span-6">
          <div className="border border-slate-200 dark:border-slate-850 p-5 rounded-xl bg-white dark:bg-slate-900 shadow-xs text-xs text-left space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <span className="text-[9px] uppercase font-bold text-slate-400">Pre-Visit AI Summary Mock</span>
              <Badge variant="danger">HIGH URGENCY</Badge>
            </div>
            
            <div>
              <span className="font-extrabold text-[10px] text-slate-400 block mb-0.5">Chief Complaint:</span>
              <p className="text-slate-700 dark:text-slate-300 font-bold">Acute chest tightness and shortness of breath during light exertion.</p>
            </div>

            <div>
              <span className="font-extrabold text-[10px] text-slate-400 block mb-1">Suggested questions for the consultation:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-655 dark:text-slate-400 font-medium">
                <li>Does this chest tightness correlate with blood pressure?</li>
                <li>Is immediate cardiovascular monitoring required?</li>
                <li>Are there diagnostic blood panels you recommend today?</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Post-Visit Prescription & Summary Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-t border-slate-200/50 pt-12">
        {/* Left Preview Prescription Mockup (6 cols) */}
        <div className="md:col-span-6">
          <div className="border border-slate-200 dark:border-slate-850 p-5 rounded-xl bg-white dark:bg-slate-900 shadow-xs text-xs text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <span className="text-[9px] uppercase font-bold text-slate-400">Post-Visit Prescription Cabinet Mock</span>
              <Badge variant="success">Active Plan</Badge>
            </div>
            
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg space-y-1 flex justify-between items-center">
              <div>
                <span className="font-extrabold text-blue-650 dark:text-blue-400">Amlodipine (5mg)</span>
                <p className="text-[10px] text-slate-450 mt-0.5 font-bold">Once daily for 30 days</p>
              </div>
              <span className="text-[10px] font-extrabold text-teal-650">🕒 Morning, after food</span>
            </div>

            <div>
              <span className="font-extrabold text-[10px] text-slate-400 block mb-0.5">Instructions Checklist:</span>
              <p className="text-slate-655 dark:text-slate-400 leading-relaxed font-semibold">
                Monitor morning blood pressure daily. Check in with the cardiology desk if systolic exceeds 140 mmHg. Avoid salt-heavy meals.
              </p>
            </div>
          </div>
        </div>

        {/* Right Content (6 cols) */}
        <div className="md:col-span-6 space-y-4 text-left">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Stay on track after your visit</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Following a consultation, Dr. notes are converted into plain patient-friendly summaries. Active prescriptions are structured inside your medicine tracker, and scheduled workers issue alerts to keep you aligned.
          </p>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="text-center py-12 border-t border-slate-205/50 max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Ready to manage your next appointment?</h2>
        <p className="text-xs text-slate-500 font-semibold">Join CareManager to coordinate schedules, consults, and clinical plans seamlessly.</p>
        <div className="pt-2">
          <Button onClick={() => handleCTA(true)} className="mx-auto px-8 py-3">
            Find a doctor
          </Button>
        </div>
      </section>

    </div>
  );
}
