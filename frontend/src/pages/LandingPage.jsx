import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, FileText, Pill, Calendar, ShieldCheck, 
  ArrowRight, ShieldAlert, Sparkles, PlusCircle, CheckCircle2 
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
            Clinical Triage & Analysis Sandbox
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-slate-50">
            Intelligent Triage & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 bg-clip-text text-transparent">
              Health Insights
            </span>
            {' '}With AI
          </h1>
          
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CareManager integrates intelligent clinical filters with real-time doctor slot booking, lab report analysis, and symptom triage.
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
            Feature Triage Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Five interactive pillars designed to assist clinicians and patients with automated documentation, drug conflicts, and triage logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Symptom Checker */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl w-fit border border-rose-500/15 dark:border-rose-500/10">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">AI Symptom Checker</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Describe your symptoms using natural language. The system runs diagnostic heuristics and AI models to predict potential conditions, suggest matching medical specialists, and prompt critical warnings.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Try Triage Sandbox <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Lab Report Analyzer */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl w-fit border border-indigo-500/15 dark:border-indigo-500/10">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Lab Report Analyzer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Paste raw clinician logs or blood panel reports. The layout uses regex and LLM structures to isolate diagnostic markers, flag out-of-range thresholds, and provide citations for anomalous findings.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Parse Lab Panel <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Medication Interactions */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl w-fit border border-teal-500/15 dark:border-teal-500/10">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Medication Interaction</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Add prescription drugs to your active drawer. The system retrieves direct FDA drug summaries, highlights indications/side-effects, and analyzes safety alerts against drug-drug conflicts.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Manage Medications <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Health Timeline */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit border border-emerald-500/15 dark:border-emerald-500/10">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Unified Health Timeline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                View your logged history sequentially. Track the timeline of symptom logs, parsed blood markers, and prescriptions inside a centralized workspace showing logs chronologically.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              View My Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: AI Health Assistant */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit border border-amber-500/15 dark:border-amber-500/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">AI Health Assistant</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unlock personalized wellness recommendations based on your logs. The system analyzes your active medications and flags potential care tips like iron supplementation suggestions or critical physician scheduling.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Analyze Wellness <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6: Clinician & System Telemetry */}
          <div className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all group">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl w-fit border border-indigo-500/15 dark:border-indigo-500/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Clinician Telemetry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Admin dashboard displays detailed telemetry including DB connection indicators, container uptime records, API latency tracking, cache misses, and live diagnostic pipeline testing.
              </p>
            </div>
            <button
              onClick={() => handleCTA(true)}
              className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:underline cursor-pointer"
            >
              Access System Console <ArrowRight className="w-3.5 h-3.5" />
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
            A secure three-stage pipeline to analyze clinical symptoms and extract actionable data.
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
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Input Clinical Data</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
              Log symptoms in plain text, enter prescription names, or paste raw lab panels to feed the local model schemas.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
              2
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">AI Engine Classification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
              Python models trigger triage red flags, perform FDA checks, and analyze drug-drug safety patterns.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
              3
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Access Dashboard Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
              Review parsed panels, warnings, and recommendations structured inside your interactive dashboard.
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
              Why CareManager
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Engineered for Clinical Triage Validation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Designed as a sandbox deployment to evaluate accuracy of LLM structured extractions, validation speed, and rule-based safety controls.
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
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">24/7 Sandbox Testing</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Deploy triage simulations at any time to verify system responses to minor or critical symptom logs.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">FDA Drug Database Lookup</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Query real-time specifications automatically to compare active ingredients and check interactions.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Structured LLM Extraction</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Turns messy, unstructured blood panels into organized tables mapping status flags automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Secure Local Analytics</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Verify pipeline isolation. Telemetry dashboard lets you verify API request latency and Docker status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
