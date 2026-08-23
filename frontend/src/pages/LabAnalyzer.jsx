import React from 'react';
import { FileText, Sparkles, Loader2, Check } from 'lucide-react';
import LockedState from '../components/LockedState';
import LabReportTable from '../components/LabReportTable';

export default function LabAnalyzer({
  token,
  handleParseLabReport,
  labTitle,
  setLabTitle,
  labRawText,
  setLabRawText,
  reportError,
  addReportLoading,
  reportsLoading,
  labReportsList,
  selectedReport,
  setSelectedReport
}) {
  if (!token) {
    return (
      <LockedState
        Icon={FileText}
        title="Lab Analyzer Locked"
        description="Sign in or create an account to process, extract, and visually track blood panels and clinical lab reports."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Reports Sidebar List */}
      <div className="lg:col-span-4 border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-5 backdrop-blur-md space-y-4 h-fit max-h-[750px] overflow-y-auto shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-900">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-650 dark:text-teal-400" />
            <h3 className="font-bold text-slate-850 dark:text-slate-100">Lab Reports</h3>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
            {labReportsList.length}
          </span>
        </div>

        {/* Parse Form */}
        <form onSubmit={handleParseLabReport} className="space-y-3.5 pt-1">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Analyze Raw Report</h4>
          
          <div>
            <input
              type="text"
              placeholder="Report Title (e.g. Routine CBC)"
              value={labTitle}
              onChange={(e) => setLabTitle(e.target.value)}
              className="w-full form-input-themed rounded-lg px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div>
            <textarea
              required
              placeholder="Paste lab report raw text or copy-pasted details here (e.g. Hemoglobin 11.5 g/dL Normal: 12.0 - 16.0)..."
              value={labRawText}
              onChange={(e) => setLabRawText(e.target.value)}
              rows={5}
              className="w-full form-input-themed rounded-lg px-3 py-2 text-xs resize-none font-mono font-medium"
            />
          </div>

          {reportError && (
            <div className="p-3 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-500/20 text-red-650 dark:text-red-400 rounded-lg text-[10px] font-semibold leading-relaxed animate-pulse">
              {reportError}
            </div>
          )}

          <button
            type="submit"
            disabled={addReportLoading || !labRawText.trim()}
            className="w-full btn-primary-themed py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-955 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/10 cursor-pointer"
          >
            {addReportLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing report...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Parse & Analyze Report
              </>
            )}
          </button>
        </form>

        {/* List of previously parsed reports */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-900 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">History</h4>
          {reportsLoading ? (
            <div className="space-y-1.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[46px] bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : labReportsList.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-2 font-medium">No reports parsed yet.</p>
          ) : (
            <div className="space-y-1.5">
              {labReportsList.map((rep) => (
                <button
                  type="button"
                  key={rep._id}
                  onClick={() => setSelectedReport(rep)}
                  className={`w-full text-left p-3 rounded-lg text-xs font-semibold border transition-all flex justify-between items-center cursor-pointer ${
                    selectedReport?._id === rep._id
                      ? 'bg-teal-505/10 border-teal-500/20 text-teal-650 dark:text-teal-400'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-150 dark:border-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <span className="truncate pr-2 font-bold">{rep.rawText.substring(0, 25)}...</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-505 shrink-0 font-bold">{new Date(rep.createdAt).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Report Dashboard details */}
      <div className="lg:col-span-8 space-y-6">
        {selectedReport ? (
          <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 backdrop-blur-md space-y-6 shadow-sm dark:shadow-none">
            
            {/* Dashboard Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-900 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100">Lab Analysis Dashboard</h3>
                  <span className="text-[10px] font-bold bg-teal-500/10 border border-teal-500/30 text-teal-655 dark:text-teal-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Verified
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-450 mt-1 block font-semibold">
                  Logged on {new Date(selectedReport.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Structured tests data table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Extracted Blood Panel Findings</h4>
              <div className="border border-slate-200 dark:border-slate-900 rounded-xl overflow-hidden bg-white dark:bg-slate-955/60 shadow-inner">
                <LabReportTable parsedData={selectedReport.parsedData} />
              </div>
            </div>

            {/* AI Medical Explanation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clinical Insight & Summary</h4>
              <div className="bg-slate-50 dark:bg-slate-955/80 border border-slate-150 dark:border-slate-900 p-4 rounded-xl leading-relaxed text-xs text-slate-655 dark:text-slate-300 space-y-3 font-semibold shadow-sm">
                <p>{selectedReport.explanation}</p>
              </div>
            </div>

            {/* Citations references */}
            {selectedReport.citations && selectedReport.citations.length > 0 && (
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-900 pt-4">
                <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Scientific Citations & Medical Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.citations.map((cite, index) => (
                    <span
                      key={index}
                      className="text-[10px] font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 px-3 py-1.5 rounded text-slate-600 dark:text-slate-400 flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      {cite}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="border border-dashed border-slate-200 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-955/20 rounded-2xl p-12 text-center h-[400px] flex flex-col justify-center items-center shadow-inner">
            <FileText className="w-12 h-12 text-teal-500/60 dark:text-teal-400/30 mb-3 animate-pulse" />
            <p className="text-slate-800 dark:text-slate-200 text-sm font-bold">Select a lab report or parse a new one</p>
            <p className="text-xs text-slate-550 dark:text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed font-semibold">
              Use the parser panel on the left to extract structured blood tests from raw clinician reports instantly.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
