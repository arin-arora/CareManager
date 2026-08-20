import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { ShieldCheck, XCircle, Loader2, Key, Check } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password Rules Checklist
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('No password reset token provided.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const passedAll = Object.values(rules).every(Boolean);
    if (!passedAll) {
      setErrorMsg('Password does not satisfy all complexity requirements.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccess('');

    try {
      const res = await apiService.resetPassword(token, password);
      setSuccess(res.msg || 'Password updated successfully! Redirecting...');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.msg || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="border border-slate-200 dark:border-slate-900 rounded-3xl bg-white dark:bg-slate-900/20 p-8 shadow-sm dark:shadow-none space-y-6">
        
        {/* Branding header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
            M
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
            CareManager
          </span>
        </div>

        <div className="space-y-1 text-center">
          <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100">Reset Your Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
            Enter your new credentials below to restore access to your account.
          </p>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <p>{success}</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full form-input-themed rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            {/* Live rules checks */}
            {password.length > 0 && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-900 rounded-xl">
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

                {/* Strength Meter bar */}
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

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 text-red-655 dark:text-red-400 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2 animate-pulse">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length === 0}
              className="w-full btn-primary-themed py-2.5 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-extrabold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
