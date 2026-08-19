import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  User, Sun, Moon, Laptop, Menu, X, LogOut, Settings, Calendar
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user, handleLogout, setIsLogin }) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const themeMenuRef = useRef(null);

  // Close theme menu on click outside
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
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
      isActive 
        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/25' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 border-transparent'
    }`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
      isActive 
        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/25' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 border-transparent'
    }`;

  const handleGuestNav = (targetId) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

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
      case 'dark': return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'system': return <Laptop className="w-4 h-4 text-slate-500" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-[37px] z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Branding */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 cursor-pointer group hover:opacity-90 transition-all duration-200">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
            C
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all duration-200">
            CareManager
          </span>
        </Link>

        {/* Center/Right: Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex gap-1 items-center">
            {user ? (
              <>
                <NavLink to="/dashboard" className={getNavLinkClass} end>
                  Dashboard
                </NavLink>
                {user?.role === 'PATIENT' && (
                  <>
                    <NavLink to="/booking" className={getNavLinkClass}>
                      <Calendar className="w-3.5 h-3.5" />
                      Book Appointment
                    </NavLink>
                    <NavLink to="/appointments" className={getNavLinkClass}>
                      My Appointments
                    </NavLink>
                  </>
                )}
                {user?.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" className={getNavLinkClass}>
                    Doctor Portal
                  </NavLink>
                )}
                {(user?.role === 'ADMIN' || user?.isAdmin) && (
                  <NavLink to="/admin/portal" className={getNavLinkClass}>
                    <Settings className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
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
                <button 
                  onClick={() => handleGuestNav('features')} 
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 cursor-pointer"
                >
                  Features
                </button>
                <button 
                  onClick={() => handleGuestNav('how-it-works')} 
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 cursor-pointer"
                >
                  About
                </button>
                <button 
                  onClick={() => handleAuthRedirect(false)} 
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleAuthRedirect(true)} 
                  className="ml-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all cursor-pointer shadow-sm shadow-teal-500/10"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>

          {/* Theme Dropdown Toggle */}
          <div className="relative border-l border-slate-200 dark:border-slate-850 pl-4 flex items-center" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center"
              title="Change theme"
            >
              {getThemeIcon(theme)}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 top-12 w-32 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 p-1.5 shadow-xl z-50">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-all text-left capitalize font-semibold cursor-pointer ${
                      theme === t 
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100' 
                        : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    {getThemeIcon(t)}
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logged in User Badge (Desktop) */}
          {user && (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-850 pl-4 h-8">
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner">
                <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-none">{user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[9px] text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-semibold text-left mt-0.5 leading-none transition-all cursor-pointer flex items-center gap-0.5"
                >
                  <LogOut className="w-2 h-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Hamburger / Toggle (Mobile) */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Theme Toggle Trigger */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {getThemeIcon(theme)}
          </button>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-4 space-y-4 shadow-lg absolute left-0 right-0 z-50">
          <nav className="flex flex-col gap-1.5">
            {user ? (
              <>
                <NavLink to="/dashboard" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass} end>
                  Dashboard
                </NavLink>
                {user?.role === 'PATIENT' && (
                  <>
                    <NavLink to="/booking" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                      <Calendar className="w-4 h-4" />
                      Book Appointment
                    </NavLink>
                    <NavLink to="/appointments" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                      My Appointments
                    </NavLink>
                  </>
                )}
                {user?.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                    Doctor Portal
                  </NavLink>
                )}
                {(user?.role === 'ADMIN' || user?.isAdmin) && (
                  <NavLink to="/admin/portal" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                    <Settings className="w-4 h-4" />
                    Admin Portal
                  </NavLink>
                )}
                <NavLink to="/profile" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                  <User className="w-4 h-4" />
                  Account
                </NavLink>

                {/* Profile info block */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/15 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleGuestNav('features')} 
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
                >
                  Features
                </button>
                <button 
                  onClick={() => handleGuestNav('how-it-works')} 
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
                >
                  About
                </button>
                <button 
                  onClick={() => handleAuthRedirect(false)} 
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleAuthRedirect(true)} 
                  className="w-full py-3 mt-2 text-center rounded-xl text-sm font-extrabold bg-teal-500 text-slate-950 transition-all cursor-pointer shadow-sm shadow-teal-500/10"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
