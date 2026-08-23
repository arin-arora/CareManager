import React from 'react';
import { 
  Loader2, Activity, Database, Cpu, Zap, CheckCircle2, 
  XCircle, AlertCircle, Server, Clock, Key, RefreshCw, Layers 
} from 'lucide-react';

export default function HealthConsole({
  healthStatus,
  healthLoading,
  fetchHealthStatus,
  runDiagnosticsLoading,
  diagnosticsResult,
  handleRunDiagnostics
}) {

  // Helper for rendering green/yellow/red status dots
  const renderStatusDot = (status) => {
    if (status === 'connected' || status === 'running' || status === 'Running' || status === 'Connected' || status === 'pass') {
      return <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>;
    } else if (status === 'offline' || status === 'down' || status === 'disconnected' || status === 'Failed' || status === 'fail') {
      return <span className="flex h-2.5 w-2.5 relative"><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span></span>;
    }
    return <span className="flex h-2.5 w-2.5 relative"><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span></span>;
  };

  // Helper for status badge styling
  const getStatusClass = (status) => {
    if (status === 'connected' || status === 'running' || status === 'Running' || status === 'Connected' || status === 'pass' || status === 'Configured') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (status === 'offline' || status === 'down' || status === 'disconnected' || status === 'Failed' || status === 'fail' || status === 'Missing') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const py = healthStatus?.pyDiagnostics || {};
  const mongo = healthStatus?.mongoStats || { users: 0, symptomAnalyses: 0, labReports: 0, medicationAnalyses: 0 };
  const system = py.system_metrics || { memory_usage_mb: 0.0, cpu_usage: 0.0, uptime_seconds: 0 };

  // Convert uptime seconds to readable string
  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">Admin System Dashboard</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Infrastructure telemetry, database health, cache hits, and AI model latency metrics.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchHealthStatus}
            disabled={healthLoading}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          
          <button
            type="button"
            onClick={handleRunDiagnostics}
            disabled={runDiagnosticsLoading}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-650 dark:hover:bg-indigo-600 border border-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-950/20"
          >
            {runDiagnosticsLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Diagnosing...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Run Full Diagnostics
              </>
            )}
          </button>
        </div>
      </div>

      {healthStatus ? (
        <>
          {/* Section: Docker Telemetry */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Docker Telemetry Grid</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(healthStatus.containers || {}).map(([name, status]) => (
                <div key={name} className="border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900/20 p-4 flex flex-col justify-between min-h-[90px] shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Container</span>
                    {renderStatusDot(status)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-2 truncate">{name}</h3>
                    <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 mt-1 rounded border ${getStatusClass(status)}`}>
                      {status === 'running' ? 'Active' : status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: AI Backend Details & Telemetry */}
            <div className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-6 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-850">
                <Server className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">AI Intelligence Layer</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">FastAPI Endpoint</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${getStatusClass(py.fastapi_status)}`}>
                      {py.fastapi_status || 'Down'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Active Provider</span>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{py.ai_provider || 'Groq'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Key Status</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <Key className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550" />
                    <span className={py.api_key_status === 'Configured' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                      {py.api_key_status === 'Configured' ? '✓ Configured' : '✗ Missing'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Authentication Check</span>
                  <div className="text-sm font-semibold text-slate-850 dark:text-slate-100 truncate">{py.groq_auth_status || 'Not Connected'}</div>
                </div>

                <div className="col-span-2 space-y-1 pt-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Primary Text Model</span>
                  <div className="text-xs font-mono text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/10 truncate font-semibold">
                    {py.ai_model_name || 'N/A'}
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Primary Vision Model</span>
                  <div className="text-xs font-mono text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/10 truncate font-semibold">
                    {py.ai_vision_model_name || 'N/A'}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Last AI Latency</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{py.last_latency_seconds ? `${py.last_latency_seconds}s` : '0.00s'}</div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Last Request Time</span>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550" />
                    <span className="text-xs truncate font-bold">{py.last_successful_request_time || 'Never'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Memory/CPU & Caching Metrics */}
            <div className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20 p-6 space-y-6 backdrop-blur-sm shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-850">
                <Cpu className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">System Telemetry & Cache</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Python Memory RSS</span>
                  <div className="text-xl font-extrabold text-slate-850 dark:text-slate-100">{system.memory_usage_mb ? `${system.memory_usage_mb} MB` : 'N/A'}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">FastAPI Uptime</span>
                  <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">{formatUptime(system.uptime_seconds)}</div>
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-200 dark:border-slate-850 shadow-inner">
                  <div className="text-center space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Cache Hits</span>
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{py.cache_hits || 0}</div>
                  </div>
                  <div className="text-center space-y-0.5 border-x border-slate-200 dark:border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Cache Misses</span>
                    <div className="text-sm font-extrabold text-amber-600 dark:text-amber-500">{py.cache_misses || 0}</div>
                  </div>
                  <div className="text-center space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Keys Stored</span>
                    <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{py.cache_keys_stored || 0}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Redis connection</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${getStatusClass(py.cache_connected ? 'connected' : 'disconnected')}`}>
                      {py.cache_connected ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">CPU Average Load</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{system.cpu_usage !== undefined ? `${system.cpu_usage}` : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: MongoDB Statistics */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider">MongoDB Collection Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20 p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/15">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Users</span>
                  <div className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{mongo.users || 0}</div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20 p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/15">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Symptom Analyses</span>
                  <div className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{mongo.symptomAnalyses || 0}</div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20 p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
                <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-500/15">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Lab Reports</span>
                  <div className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{mongo.labReports || 0}</div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/20 p-5 flex items-center gap-4 shadow-sm dark:shadow-none">
                <div className="p-3 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 rounded-xl border border-indigo-500/15">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Medications Logged</span>
                  <div className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{mongo.medicationAnalyses || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Live Diagnostic Log Executions */}
          {diagnosticsResult && (
            <div className="border border-indigo-100 dark:border-indigo-500/10 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/5 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-500/15">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Live Diagnostic Test Executions</h3>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${diagnosticsResult.overall_status === 'pass' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25'}`}>
                  Overall Result: {diagnosticsResult.overall_status === 'pass' ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(diagnosticsResult.tests || {}).map(([testKey, test]) => (
                  <div key={testKey} className="flex items-start gap-3 bg-white dark:bg-slate-955/40 p-4 rounded-xl border border-slate-150 dark:border-slate-900 shadow-sm">
                    <div className="mt-0.5">
                      {test.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-450" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 capitalize">{testKey.replace('_', ' ')}</h4>
                      <p className="text-slate-550 dark:text-slate-400 text-[11px] mt-1 leading-relaxed font-semibold">{test.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 dark:text-indigo-400 mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-bold tracking-wide">Fetching environment telemetry...</p>
        </div>
      )}
    </div>
  );
}
