import React, { useState } from 'react';
import { User as UserIcon, LogOut, ArrowLeft, Check, Lock, Mail } from 'lucide-react';
import { apiService } from '../services/api';
import { Button, Card, Input, Badge } from '../components/UI';

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

  // Password rules validation
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
    if (passed === 4) return { label: 'Strong', color: 'bg-blue-500', width: 'w-3/4' };
    return { label: 'Excellent', color: 'bg-blue-600', width: 'w-full' };
  };

  const strength = getStrength();

  return (
    <div className="max-w-md mx-auto py-8 font-sans">
      <Card className="p-8 shadow-xs bg-white">
        
        {/* Profile Mode */}
        {user ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl uppercase shadow-xs">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="text-center">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{user.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">{user.email}</p>
                
                <div className="flex justify-center gap-1.5 mt-2">
                  <Badge variant="success">
                    {user.role} Account
                  </Badge>
                  {(user.isAdmin || user.role === 'ADMIN') && (
                    <Badge variant="info">
                      System Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850 text-left space-y-2.5 text-xs font-bold shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-505">Account Status</span>
                <span className="text-emerald-600 dark:text-emerald-400">Verified & Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-505">Member Since</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-550">Last Login</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="danger"
              className="w-full py-2.5 flex items-center justify-center gap-1.5 font-bold"
            >
              <LogOut className="w-4 h-4" />
              Logout from Account
            </Button>
          </div>
        ) : showForgot ? (
          /* Forgot Password Mode */
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setShowForgot(false)}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-550 dark:text-slate-400 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Forgot Password</h3>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg text-xs font-semibold leading-relaxed text-left">
              Password reset requests are currently handled by system administration. Please contact your clinician or create a new testing account.
            </div>
          </div>
        ) : (
          /* Auth Form Mode */
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div className="flex border-b border-slate-150 dark:border-slate-800 mb-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setAuthForm({ ...authForm, password: '' });
                  if (setAuthSuccess) setAuthSuccess('');
                  if (setAuthError) setAuthError('');
                  if (setIsNotVerified) setIsNotVerified(false);
                }}
                className={`flex-1 pb-3 text-xs font-extrabold uppercase tracking-wider text-center cursor-pointer ${isLogin ? 'text-blue-650 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-400'}`}
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
                className={`flex-1 pb-3 text-xs font-extrabold uppercase tracking-wider text-center cursor-pointer ${!isLogin ? 'text-blue-655 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-400'}`}
              >
                Register
              </button>
            </div>

            {!isLogin && (
              <Input
                label="Full Name"
                required
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                placeholder="e.g. John Smith"
              />
            )}

            <Input
              label="Email Address"
              type="email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              placeholder="e.g. user@caremanager.com"
            />

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotEmail(authForm.email);
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg form-input-themed"
                placeholder="••••••••"
              />
            </div>

            {/* Password rules (Signup only) */}
            {!isLogin && password.length > 0 && (
              <div className="space-y-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Complexity Strength</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.length ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'border-slate-350 dark:border-slate-800'}`}>
                      {rules.length && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>8+ Characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.uppercase ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'border-slate-350 dark:border-slate-800'}`}>
                      {rules.uppercase && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.lowercase ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'border-slate-355 dark:border-slate-800'}`}>
                      {rules.lowercase && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.number ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'border-slate-355 dark:border-slate-800'}`}>
                      {rules.number && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Number (0-9)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rules.special ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'border-slate-355 dark:border-slate-800'}`}>
                      {rules.special && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>Special Character</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    <span>Level</span>
                    <span className="text-blue-600 dark:text-blue-450">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                  </div>
                </div>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-xs font-bold leading-relaxed text-center">
                {authSuccess}
              </div>
            )}

            {authError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold leading-relaxed text-center">
                {authError}
              </div>
            )}

            <Button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 font-bold"
            >
              {authLoading ? 'Signing processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
