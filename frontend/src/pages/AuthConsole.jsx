import React, { useState } from 'react';
import { User as UserIcon, LogOut, ArrowLeft, Check, Key } from 'lucide-react';
import { apiService } from '../services/api';

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
  
  // Resend verification functionality disabled

  // Password complexity rules evaluation
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
    return { label: 'Excellent', color: 'bg-teal-500', width: 'w-full' };
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
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900/20 p-6 backdrop-blur-md shadow-sm dark:shadow-none">
        
        {/* Page title */}
        {!showForgot && (
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-5 h-5 text-teal-655 dark:text-teal-400" />
            <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100">My Account</h2>
          </div>
        )}

        {user ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4 pb-4 border-b border-slate-100 dark:border-slate-900">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-xl uppercase shadow-md shadow-teal-500/10">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-semibold">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-block mt-1.5 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 rounded-full">
                    System Administrator
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-955/40 rounded-xl border border-slate-150 dark:border-slate-900 text-left space-y-2.5 text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 font-bold">Account Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 font-bold">Member Since</span>
                <span className="text-slate-700 dark:text-slate-350 font-bold">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 font-bold">Last Login</span>
                <span className="text-slate-700 dark:text-slate-350 font-bold">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-955/60 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : showForgot ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-900">
              <button 
                type="button" 
                onClick={() => {
                  setShowForgot(false);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Forgot Password</h3>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-500/20 text-amber-655 dark:text-amber-400 rounded-xl text-xs font-semibold leading-relaxed text-left">
              Password reset is currently unavailable. Please contact system support or register a new account.
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="flex border-b border-slate-100 dark:border-slate-900 mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setAuthForm({ ...authForm, password: '' });
                  if (setAuthSuccess) setAuthSuccess('');
                  if (setAuthError) setAuthError('');
                  if (setIsNotVerified) setIsNotVerified(false);
                }}
                className={`flex-1 pb-2 text-sm font-bold text-center cursor-pointer ${isLogin ? 'text-teal-655 dark:text-teal-400 border-b-2 border-teal-500' : 'text-slate-400 dark:text-slate-500'}`}
              >
                Login
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
                className={`flex-1 pb-2 text-sm font-bold text-center cursor-pointer ${!isLogin ? 'text-teal-655 dark:text-teal-400 border-b-2 border-teal-500' : 'text-slate-400 dark:text-slate-500'}`}
              >
                Sign Up
              </button>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotEmail(authForm.email);
                    }}
                    className="text-xs text-teal-655 dark:text-teal-400 hover:underline font-bold cursor-pointer"
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
                className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
                placeholder="••••••••"
              />
            </div>

            {/* Password rules live validator during Sign Up */}
            {!isLogin && password.length > 0 && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-900 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Complexity Rules</span>
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
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.special ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'border-slate-300 dark:border-slate-800'}`}>
                      {rules.special && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Special Char (@,$,#)</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-900">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    <span>Strength</span>
                    <span className="text-slate-655 dark:text-slate-300">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-350`}></div>
                  </div>
                </div>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-250 dark:border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-lg text-xs font-semibold leading-relaxed">
                {authSuccess}
              </div>
            )}

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 text-red-655 dark:text-red-400 rounded-lg text-xs font-semibold leading-relaxed animate-pulse flex flex-col items-start gap-1.5">
                <p className="flex-1">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full btn-primary-themed py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-955 rounded-lg font-extrabold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-teal-500/10"
            >
              {authLoading ? 'Verifying...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
