import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, User, Sun, Moon, Laptop, Menu, X, LogOut, ShieldCheck, Stethoscope, Activity, HeartPulse
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user, handleLogout, setIsLogin }) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const themeMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
      isActive 
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
    }`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2.5 ${
      isActive 
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
    }`;

  const handleAuthRedirect = (isSignUp) => {
    if (setIsLogin) {
      setIsLogin(!isSignUp);
    }
    setShowMobileMenu(false);
    navigate('/login');
  };

  const getThemeIcon = (t) => {
    switch (t) {
      case 'light': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'dark': return <Moon className="w-4 h-4 text-emerald-400" />;
      case 'system': return <Laptop className="w-4 h-4 text-slate-400" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-850 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Mark */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
              CareManager <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 -mt-1 font-bold">
              Healthcare Network
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <nav className="flex gap-1 items-center bg-slate-100/50 dark:bg-slate-900/40 p-1.5 rounded-3xl border border-slate-200/50 dark:border-slate-850">
            {user ? (
              <>
                <NavLink to="/dashboard" className={getNavLinkClass}>
                  Dashboard
                </NavLink>
                {(!user.role || user.role === 'PATIENT') && (
                  <>
                    <NavLink to="/booking" className={getNavLinkClass}>
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Find Doctors
                    </NavLink>
                    <NavLink to="/appointments" className={getNavLinkClass}>
                      Appointments
                    </NavLink>
                  </>
                )}
                {user.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" className={getNavLinkClass}>
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                    Doctor Portal
                  </NavLink>
                )}
                {(user.role === 'ADMIN' || user.isAdmin) && (
                  <NavLink to="/admin/portal" className={getNavLinkClass}>
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                    Admin Portal
                  </NavLink>
                )}
                <NavLink to="/profile" className={getNavLinkClass}>
                  <User className="w-3.5 h-3.5" />
                  Account
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/booking" className={getNavLinkClass}>
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Find Doctors
                </NavLink>
                <button 
                  onClick={() => handleAuthRedirect(false)} 
                  className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleAuthRedirect(true)} 
                  className="px-5 py-2 rounded-2xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Register
                </button>
              </>
            )}
          </nav>

          {/* Theme Dropdown Toggle */}
          <div className="relative border-l border-slate-200 dark:border-slate-850 pl-3" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-850 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {getThemeIcon(theme)}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 top-12 w-32 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 p-1.5 shadow-2xl z-50 animate-fade-in">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all text-left capitalize font-extrabold cursor-pointer ${
                      theme === t 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {getThemeIcon(t)}
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logged in User Badge */}
          {user && (
            <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-850 pl-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-none">{user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-extrabold text-slate-400 hover:text-rose-500 text-left mt-0.5 leading-none transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300"
          >
            {getThemeIcon(theme)}
          </button>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-4 space-y-3 shadow-2xl absolute left-0 right-0 z-50">
          <nav className="flex flex-col gap-1">
            {user ? (
              <>
                <NavLink to="/dashboard" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                  Dashboard
                </NavLink>
                {(!user.role || user.role === 'PATIENT') && (
                  <>
                    <NavLink to="/booking" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      Find Doctors
                    </NavLink>
                    <NavLink to="/appointments" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                      Appointments
                    </NavLink>
                  </>
                )}
                {user.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                    <Stethoscope className="w-4 h-4 text-emerald-500" />
                    Doctor Portal
                  </NavLink>
                )}
                {(user.role === 'ADMIN' || user.isAdmin) && (
                  <NavLink to="/admin/portal" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                    <ShieldCheck className="w-4 h-4 text-teal-500" />
                    Admin Portal
                  </NavLink>
                )}
                <NavLink to="/profile" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                  <User className="w-4 h-4" />
                  Account
                </NavLink>

                <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-extrabold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">{user.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/booking" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Find Doctors
                </NavLink>
                <button 
                  onClick={() => handleAuthRedirect(false)} 
                  className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleAuthRedirect(true)} 
                  className="w-full py-3 mt-1 text-center rounded-2xl text-xs font-black bg-emerald-600 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Register Account
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
