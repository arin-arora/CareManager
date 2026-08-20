import React from 'react';
import { AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';

// Button Component
export function Button({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  disabled = false, 
  onClick, 
  className = '', 
  ...props 
}) {
  const baseStyle = 'px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-550 text-white shadow-sm hover:shadow border border-transparent btn-primary-themed',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800 shadow-xs',
    outline: 'bg-transparent border border-blue-600 hover:bg-blue-50 text-blue-600 dark:border-blue-500 dark:hover:bg-blue-950/20 dark:text-blue-400',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-955/20 dark:text-red-400 dark:border-red-900 shadow-xs',
    text: 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-0 rounded-none'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Card Component
export function Card({ children, className = '', onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850/70 rounded-xl shadow-xs p-5 transition-all duration-150 ${onClick ? 'hover:border-blue-500/50 cursor-pointer hover:shadow-sm' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Input Component
export function Input({ label, error, className = '', type = 'text', ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-3.5 py-2 text-xs rounded-lg form-input-themed ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-red-650 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

// Textarea Component
export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full p-3 text-xs rounded-lg form-input-themed ${error ? 'border-red-550 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

// Select Component
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3.5 py-2 text-xs rounded-lg form-input-themed ${error ? 'border-red-550 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-[10px] font-bold text-red-655 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

// Badge Component
export function Badge({ children, variant = 'info', className = '' }) {
  const styles = {
    info: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-955/30 dark:text-blue-400 dark:border-blue-900',
    success: 'bg-emerald-50 text-emerald-705 border border-emerald-100 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-900',
    warning: 'bg-amber-50 text-amber-750 border border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/40',
    danger: 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-955/20 dark:text-red-400 dark:border-red-900/50',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wide uppercase ${styles[variant] || styles.info} ${className}`}>
      {children}
    </span>
  );
}

// StatusBadge Component mapping DB values
export function StatusBadge({ status, className = '' }) {
  const normalized = (status || '').toUpperCase();
  
  if (normalized === 'PENDING' || normalized === 'MEDIUM') {
    return <Badge variant="warning" className={className}>{status}</Badge>;
  }
  if (normalized === 'BOOKED' || normalized === 'COMPLETED' || normalized === 'SUCCESS' || normalized === 'LOW') {
    return <Badge variant="success" className={className}>{status}</Badge>;
  }
  if (normalized === 'CANCELLED' || normalized === 'FAILED' || normalized === 'HIGH') {
    return <Badge variant="danger" className={className}>{status}</Badge>;
  }
  
  return <Badge variant="info" className={className}>{status}</Badge>;
}

// Modal Component
export function Modal({ isOpen, onClose, title, children, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/65 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl shadow-lg max-w-md w-full p-5 space-y-4 animate-scale-up ${className}`}>
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold leading-none">&times;</button>
        </div>
        <div className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
          {children}
        </div>
      </div>
    </div>
  );
}

// EmptyState Component
export function EmptyState({ title, description, icon: Icon, children, className = '' }) {
  return (
    <div className={`py-12 px-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900/10 ${className}`}>
      {Icon && <Icon className="w-10 h-10 text-slate-300 dark:text-slate-700" />}
      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{title}</h3>
      <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 max-w-sm">{description}</p>
      {children}
    </div>
  );
}

// LoadingState Component
export function LoadingState({ message = 'Loading details...' }) {
  return (
    <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
      <p className="text-xs font-bold text-slate-455 dark:text-slate-500 animate-pulse">{message}</p>
    </div>
  );
}
