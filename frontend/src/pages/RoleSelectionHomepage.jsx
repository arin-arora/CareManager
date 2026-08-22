import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, ArrowRight } from 'lucide-react';

export default function RoleSelectionHomepage({ setIsLogin }) {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (setIsLogin) {
      setIsLogin(false);
    }
    navigate(`/login?role=${role}&mode=signup`);
  };

  const handleSignIn = () => {
    if (setIsLogin) {
      setIsLogin(true);
    }
    navigate('/login?mode=login');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 bg-slate-50/50">
      <div className="max-w-4xl w-full space-y-12 text-center">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold tracking-wide">
            CareManager
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Healthcare, coordinated around you.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Book appointments, prepare for consultations, and stay connected with your care journey.
          </p>
        </div>

        {/* Section Heading */}
        <div className="pt-2 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            How would you like to continue?
          </h2>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
          
          {/* Patient Card */}
          <div className="bg-white border border-slate-200 hover:border-blue-500/50 rounded-2xl p-7 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Patient
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  Patient
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Find doctors, book appointments, manage your visits, and view prescriptions and follow-up information.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => handleRoleSelect('PATIENT')}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer"
                aria-label="Continue as Patient"
              >
                Continue as Patient
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-white border border-slate-200 hover:border-indigo-500/50 rounded-2xl p-7 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  Doctor
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  Doctor
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Manage your schedule, review assigned patients, conduct consultations, and manage prescriptions.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => handleRoleSelect('DOCTOR')}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer"
                aria-label="Continue as Doctor"
              >
                Continue as Doctor
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer / Existing Sign In Link */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSignIn}
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 underline-offset-4 hover:underline transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
          >
            Already have an account? Sign in
          </button>
        </div>

      </div>
    </div>
  );
}
