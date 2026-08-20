import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Resend Verification State
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (successParam === 'true') {
      setSuccess(true);
      setLoading(false);
      return;
    }

    if (errorParam) {
      setErrorMsg(errorParam);
      setSuccess(false);
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      setSuccess(false);
      setErrorMsg('No verification token provided.');
      return;
    }

    apiService.verifyEmail(token)
      .then(() => {
        setSuccess(true);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.msg || 'Verification token is invalid or has expired.');
        setSuccess(false);
        setLoading(false);
      });
  }, [token, searchParams]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    setResendSuccess('');
    setResendError('');
    try {
      const res = await apiService.resendVerification(resendEmail.trim());
      setResendSuccess(res.msg || 'Verification email sent successfully.');
      setResendEmail('');
    } catch (err) {
      setResendError(err.response?.data?.msg || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="border border-slate-200 dark:border-slate-900 rounded-3xl bg-white dark:bg-slate-900/20 p-8 text-center shadow-sm dark:shadow-none space-y-6">
        
        {/* Branding header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
            M
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
            CareManager
          </span>
        </div>

        {loading ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Verifying your email address...</p>
          </div>
        ) : success ? (
          <div className="space-y-6 py-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100">Verification Success</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
                Your email address has been successfully verified! You can now log into your clinical triage dashboard.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full btn-primary-themed py-2.5 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-extrabold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              Proceed to Login
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <XCircle className="w-16 h-16 text-rose-500 dark:text-rose-450 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100">Verification Failed</h2>
              <p className="text-xs text-red-650 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 p-3 rounded-lg leading-relaxed">
                {errorMsg}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-900 pt-6 space-y-4 text-left">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Resend Activation Email</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                If the token expired or you didn't receive the email, enter your email address below to receive another verification link.
              </p>
              
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full form-input-themed rounded-lg px-3 py-2 text-xs font-semibold"
                />
                
                {resendSuccess && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-lg text-[10px] font-semibold">
                    {resendSuccess}
                  </div>
                )}
                
                {resendError && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 text-red-650 dark:text-red-400 rounded-lg text-[10px] font-semibold">
                    {resendError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full btn-primary-themed py-2.5 bg-slate-100 dark:bg-slate-905 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      Resend Link
                    </>
                  )}
                </button>
              </form>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-655 dark:text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
