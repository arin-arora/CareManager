import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Pill, FileText, Calendar, User, 
  ArrowRight, ShieldCheck, Heart, Sparkles, 
  Clock, Plus, ShieldAlert 
} from 'lucide-react';

export default function Dashboard({
  user,
  symptomHistory = [],
  medicinesList = [],
  labReportsList = []
}) {
  const navigate = useNavigate();

  // Stats
  const totalSymptoms = symptomHistory.length;
  const totalReports = labReportsList.length;
  const totalMeds = medicinesList.length;
  const lastLoginString = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Recent Items
  const lastSymptom = symptomHistory[0];
  const lastReport = labReportsList[0];
  const lastMed = medicinesList[0];

  const hasActivity = lastSymptom || lastReport || lastMed;

  // Feature Card data
  const features = [];

  // Admin features
  if (user && (user.role === 'ADMIN' || user.isAdmin)) {
    features.push({
      title: 'Admin Operations Console',
      icon: <ShieldCheck className="w-6 h-6" />,
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'Register doctor directory, configure schedule templates, toggle statuses, and schedule leave dates.',
      path: '/admin/portal'
    });
  }

  // Doctor features
  if (user && user.role === 'DOCTOR') {
    features.push({
      title: 'Doctor Portal',
      icon: <Calendar className="w-6 h-6" />,
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Review upcoming schedules, patient symptom lists, and submit clinical consultation notes and prescriptions.',
      path: '/doctor/portal'
    });
  }

  // Patient features
  if (!user || user.role === 'PATIENT') {
    features.push({
      title: 'Book Appointment',
      icon: <Calendar className="w-6 h-6 animate-pulse" />,
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Search active doctor directories, query slot availability, temporarily hold slots, and book appointments.',
      path: '/booking'
    });
    features.push({
      title: 'AI Symptom Checker',
      icon: <Activity className="w-6 h-6" />,
      colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      description: 'Describe your symptoms and receive AI-assisted triage with urgency level, likely conditions, and care guidance.',
      path: '/symptoms'
    });
    features.push({
      title: 'Medication Interaction Checker',
      icon: <Pill className="w-6 h-6" />,
      colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
      description: 'Check medicine interactions, safety warnings, dosage conflicts and recommendations.',
      path: '/medications'
    });
    features.push({
      title: 'Lab Report Analyzer',
      icon: <FileText className="w-6 h-6" />,
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Upload laboratory reports and receive AI-powered explanations, abnormal value detection and health insights.',
      path: '/lab-reports'
    });
    features.push({
      title: 'My Health Records',
      icon: <Calendar className="w-6 h-6" />,
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'View previous symptom analyses, medications, lab reports and AI recommendations.',
      path: '/health'
    });
  }

  // Account settings for all roles
  features.push({
    title: 'Account',
    icon: <User className="w-6 h-6" />,
    colorClass: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    description: 'Manage your profile, preferences and account settings.',
    path: '/profile'
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Welcome Banner */}
      <section className="relative overflow-hidden border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 p-6 sm:p-8 shadow-sm dark:shadow-none">
        {/* Glow behind greeting */}
        <div className="absolute right-0 top-0 w-60 h-60 bg-blue-500/5 dark:bg-cyan-500/5 rounded-full blur-[80px] -z-10"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-850 dark:text-slate-50 flex items-center gap-2">
              Welcome back, {user?.name || 'Healthcare Practitioner'} 👋
            </h1>
            <p className="text-sm font-semibold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Your AI Healthcare Assistant
            </p>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
              Manage your health using intelligent tools. triage symptoms, inspect active prescriptions, and analyze blood labs instantly.
            </p>
          </div>
          <div className="bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-right shrink-0">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Current Session</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lastLoginString}</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Intelligent Clinical Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/20 p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-350 shadow-sm hover:shadow-md dark:shadow-none hover:border-blue-500/30 dark:hover:border-cyan-500/20 group h-full"
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-xl w-fit border ${feature.colorClass}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                  {feature.description}
                </p>
              </div>
              
              <button
                onClick={() => navigate(feature.path)}
                className="mt-6 w-full py-2.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-blue-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 border border-slate-200 dark:border-slate-850 hover:border-transparent dark:hover:border-transparent text-slate-700 dark:text-slate-350 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn shadow-inner"
              >
                Open Module
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions & Recent Activity / Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Actions & Recent Activity (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Actions */}
          <section className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
              <button
                onClick={() => navigate('/symptoms')}
                className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-blue-500 dark:hover:border-cyan-500/40 text-slate-750 dark:text-slate-300 text-xs font-bold rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-cyan-500/5 text-center cursor-pointer shadow-sm"
              >
                Triage Symptoms
              </button>
              <button
                onClick={() => navigate('/lab-reports')}
                className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 hover:border-blue-500 dark:hover:border-cyan-500/40 text-slate-750 dark:text-slate-300 text-xs font-bold rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-cyan-500/5 text-center cursor-pointer shadow-sm"
              >
                Upload Lab Report
              </button>
              <button
                onClick={() => navigate('/medications')}
                className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 hover:border-blue-500 dark:hover:border-cyan-500/40 text-slate-750 dark:text-slate-300 text-xs font-bold rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-cyan-500/5 text-center cursor-pointer shadow-sm"
              >
                Check Medicine
              </button>
              <button
                onClick={() => navigate('/health')}
                className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 hover:border-blue-500 dark:hover:border-cyan-500/40 text-slate-750 dark:text-slate-300 text-xs font-bold rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-cyan-500/5 text-center cursor-pointer shadow-sm"
              >
                View History
              </button>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Recent Activity</h2>
            
            {!hasActivity ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-505 italic font-medium">
                No recent analyses yet.
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {/* Last Symptom Analysis */}
                {lastSymptom && (
                  <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-150 dark:border-slate-900 rounded-xl shadow-sm">
                    <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        <span className="uppercase tracking-wider">Last Symptom Analysis</span>
                        <span>{new Date(lastSymptom.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                        {lastSymptom.symptoms.join(', ')}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                        Urgency Status: <span className="text-rose-500 font-extrabold">{lastSymptom.modelPrediction?.urgencyLevel || 'Routine'}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Uploaded Report */}
                {lastReport && (
                  <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-150 dark:border-slate-900 rounded-xl shadow-sm">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        <span className="uppercase tracking-wider">Last Uploaded Lab Report</span>
                        <span>{new Date(lastReport.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                        {lastReport.rawText.substring(0, 45)}...
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                        Findings extracted successfully
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Medication */}
                {lastMed && (
                  <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-150 dark:border-slate-900 rounded-xl shadow-sm">
                    <div className="p-2 bg-teal-500/10 text-teal-650 dark:text-teal-400 rounded-lg shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        <span className="uppercase tracking-wider">Last Medication Logged</span>
                        <span>{new Date(lastMed.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                        {lastMed.name} - {lastMed.dosage || 'N/A'}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                        Frequency: <span className="font-bold text-slate-655 dark:text-slate-400">{lastMed.frequency}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Health Overview (4 cols) */}
        <div className="lg:col-span-4">
          <section className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-6 shadow-sm dark:shadow-none h-full">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Health Overview</h2>
            
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                <span className="text-xs text-slate-500 dark:text-slate-450 font-bold">Symptom Analyses</span>
                <span className="text-sm font-extrabold text-rose-500 bg-rose-500/5 px-2.5 py-1.5 rounded-lg border border-rose-500/10">
                  {totalSymptoms}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-855">
                <span className="text-xs text-slate-500 dark:text-slate-455 font-bold">Lab Reports</span>
                <span className="text-sm font-extrabold text-blue-600 dark:text-cyan-400 bg-blue-500/5 dark:bg-cyan-500/5 px-2.5 py-1.5 rounded-lg border border-blue-500/10 dark:border-cyan-500/10">
                  {totalReports}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-855">
                <span className="text-xs text-slate-550 dark:text-slate-455 font-bold">Medication Checks</span>
                <span className="text-sm font-extrabold text-teal-650 dark:text-teal-400 bg-teal-500/5 px-2.5 py-1.5 rounded-lg border border-teal-500/10">
                  {totalMeds}
                </span>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Diagnostics Check</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                    Services Operational
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}
