import React, { useState } from 'react';
import { User as UserIcon, LogOut, ArrowLeft, Check, Stethoscope, Calendar, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';

const SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Gynecology',
  'Orthopedics',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology'
];

export default function AuthConsole({
  user,
  token,
  handleLogout,
  isLogin,
  setIsLogin,
  authError,
  setAuthError,
  authLoading,
  authForm,
  setAuthForm,
  handleAuthSubmit,
  authSuccess,
  setAuthSuccess,
  isNotVerified,
  setIsNotVerified,
  unverifiedEmail
}) {
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const password = authForm.password || '';
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const getStrength = () => {
    const passed = Object.values(rules).filter(Boolean).length;
    if (password.length === 0) return { label: 'Empty', color: 'bg-slate-200 dark:bg-slate-800', width: 'w-0' };
    if (passed <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (passed === 3) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/4' };
    if (passed === 4) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-3/4' };
    return { label: 'Excellent', color: 'bg-blue-600', width: 'w-full' };
  };

  const strength = getStrength();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotSuccess('');
    setForgotError('');
    try {
      const res = await apiService.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.msg || 'Instructions sent successfully!');
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.response?.data?.msg || 'Failed to send password reset instructions.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in py-4">
      <div className="border border-slate-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md shadow-sm">
        
        {/* Header */}
        {!showForgot && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-lg border border-blue-500/20">
              C
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {user ? 'My Account Profile' : 'CareManager Sign In'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Healthcare Appointment & Clinical Portal
              </p>
            </div>
          </div>
        )}

        {user ? (
          /* Logged In View */
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-3 pb-6 border-b border-slate-200 dark:border-slate-850">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{user.name}</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    user.role === 'ADMIN' || user.isAdmin
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                      : user.role === 'DOCTOR'
                      ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }`}>
                    {user.role === 'ADMIN' || user.isAdmin ? <ShieldCheck className="w-3 h-3" /> : user.role === 'DOCTOR' ? <Stethoscope className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                    {user.role === 'ADMIN' || user.isAdmin ? 'System Administrator' : user.role === 'DOCTOR' ? 'Medical Doctor' : 'Patient'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Account Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Registered Email</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold">{user.email}</span>
              </div>
              {user.doctorProfile && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">Medical Specialty</span>
                  <span className="text-teal-600 dark:text-teal-400 font-extrabold">{user.doctorProfile.specialisation}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Account
            </button>
          </div>
        ) : showForgot ? (
          /* Forgot Password View */
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setShowForgot(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Reset Password</h3>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-2xl text-xs font-semibold leading-relaxed">
              Enter your account email address below to receive password reset instructions.
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Email
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100"
                  placeholder="user@example.com"
                />
              </div>

              {forgotSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                  {forgotSuccess}
                </div>
              )}

              {forgotError && (
                <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded-xl text-xs font-semibold">
                  {forgotError}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-sm"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          </div>
        ) : (
          /* Login / Signup Auth Form */
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            
            {/* Login / Sign Up Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setAuthForm({ ...authForm, password: '' });
                  if (setAuthSuccess) setAuthSuccess('');
                  if (setAuthError) setAuthError('');
                  if (setIsNotVerified) setIsNotVerified(false);
                }}
                className={`flex-1 pb-3 text-xs font-extrabold text-center cursor-pointer transition-all ${
                  isLogin 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setAuthForm({ ...authForm, password: '' });
                  if (setAuthSuccess) setAuthSuccess('');
                  if (setAuthError) setAuthError('');
                  if (setIsNotVerified) setIsNotVerified(false);
                }}
                className={`flex-1 pb-3 text-xs font-extrabold text-center cursor-pointer transition-all ${
                  !isLogin 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Role Selector Card */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAuthForm({ ...authForm, role: 'PATIENT' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    authForm.role === 'PATIENT' || !authForm.role
                      ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-lg">👤</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      authForm.role === 'PATIENT' || !authForm.role ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      Patient
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Patient Account</div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight font-medium">
                    Book appointments and manage your healthcare
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthForm({ ...authForm, role: 'DOCTOR' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    authForm.role === 'DOCTOR'
                      ? 'bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-400 ring-2 ring-teal-500/20 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-lg">🩺</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      authForm.role === 'DOCTOR' ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      Doctor
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Doctor Account</div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight font-medium">
                    Manage appointments and provide consultations
                  </p>
                </button>
              </div>
            </div>

            {/* Registration specific fields */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100"
                  placeholder={authForm.role === 'DOCTOR' ? 'Dr. Sarah Jenkins' : 'John Doe'}
                />
              </div>
            )}

            {/* Doctor specific specialization selector on registration */}
            {!isLogin && authForm.role === 'DOCTOR' && (
              <div>
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Medical Specialty
                </label>
                <select
                  value={authForm.specialisation || 'General Medicine'}
                  onChange={(e) => setAuthForm({ ...authForm, specialisation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  {SPECIALTIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100"
                placeholder={authForm.role === 'DOCTOR' ? 'doctor@caremanager.com' : 'patient@caremanager.com'}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotEmail(authForm.email);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-extrabold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>

            {/* Password Complexity live validator during registration */}
            {!isLogin && password.length > 0 && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Password Complexity</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.length ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'border-slate-300 dark:border-slate-800'}`}>
                      {rules.length && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>8+ Characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.uppercase ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'border-slate-300 dark:border-slate-800'}`}>
                      {rules.uppercase && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.lowercase ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'border-slate-300 dark:border-slate-800'}`}>
                      {rules.lowercase && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.number ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'border-slate-300 dark:border-slate-800'}`}>
                      {rules.number && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Number (0-9)</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    <span>Strength</span>
                    <span className="text-slate-700 dark:text-slate-300">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                  </div>
                </div>
              </div>
            )}

            {authSuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                {authSuccess}
              </div>
            )}

            {authError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/20"
            >
              {authLoading ? 'Verifying...' : isLogin ? `Sign In as ${authForm.role === 'DOCTOR' ? 'Doctor' : 'Patient'}` : `Create ${authForm.role === 'DOCTOR' ? 'Doctor' : 'Patient'} Account`}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
