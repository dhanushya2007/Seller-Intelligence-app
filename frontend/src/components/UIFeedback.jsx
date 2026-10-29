import React from 'react';
import { AlertTriangle, RefreshCw, ServerOff } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading analytics data...' }) => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
    <div className="relative w-12 h-12 mb-4">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="text-sm font-medium text-slate-300 animate-pulse">{label}</p>
    <p className="text-xs text-slate-500 mt-1">Processing Olist e-commerce datasets</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 border border-rose-500/30 rounded-2xl text-center max-w-lg mx-auto my-8 shadow-xl">
    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full mb-4">
      <ServerOff className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">Backend Connection Error</h3>
    <p className="text-sm text-slate-300 mb-6">
      {message || 'Unable to communicate with FastAPI backend server (http://127.0.0.1:8000). Please ensure Python server is running.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry Connection
      </button>
    )}
  </div>
);

export const PerformanceBadge = ({ score }) => {
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = 'N/A';

  if (score >= 80) {
    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    label = 'Top Tier';
  } else if (score >= 60) {
    badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    label = 'Good';
  } else if (score >= 40) {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    label = 'Average';
  } else {
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    label = 'At Risk';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
      {score.toFixed(1)} <span className="opacity-70 ml-1">({label})</span>
    </span>
  );
};
