import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, User, Sun, Moon, Laptop, Menu, X, ChevronDown, LogOut, Settings, ShieldCheck, Stethoscope
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
    `px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
      isActive 
        ? 'bg-blue-600/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 border-transparent'
    }`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
      isActive 
        ? 'bg-blue-600/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50 border-transparent'
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
      case 'dark': return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'system': return <Laptop className="w-4 h-4 text-slate-500" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: CareManager Branding */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-all duration-200">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all duration-200">
              CareManager
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 -mt-1">
              Appointment Portal
            </span>
          </div>
        </Link>

        {/* Center/Right: Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex gap-1.5 items-center">
            {user ? (
              <>
                <NavLink to="/dashboard" className={getNavLinkClass}>
                  Dashboard
                </NavLink>
                {(!user.role || user.role === 'PATIENT') && (
                  <>
                    <NavLink to="/booking" className={getNavLinkClass}>
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Find Doctors
                    </NavLink>
                    <NavLink to="/appointments" className={getNavLinkClass}>
                      Appointments
                    </NavLink>
                  </>
                )}
                {user.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" className={getNavLinkClass}>
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    Doctor Portal
                  </NavLink>
                )}
                {(user.role === 'ADMIN' || user.isAdmin) && (
                  <NavLink to="/admin/portal" className={getNavLinkClass}>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
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
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Find Doctors
                </NavLink>
                <button 
                  onClick={() => handleAuthRedirect(false)} 
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50 cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleAuthRedirect(true)} 
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  Register
                </button>
              </>
            )}
          </nav>

          {/* Theme Dropdown Toggle */}
          <div className="relative border-l border-slate-200 dark:border-slate-850 pl-4 flex items-center" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center"
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
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold' 
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
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-extrabold text-xs shadow-inner">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] text-slate-400 hover:text-red-500 font-semibold text-left mt-0.5 leading-none transition-all cursor-pointer flex items-center gap-0.5"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Mobile Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {getThemeIcon(theme)}
          </button>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer"
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
                <NavLink to="/dashboard" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                  Dashboard
                </NavLink>
                {(!user.role || user.role === 'PATIENT') && (
                  <>
                    <NavLink to="/booking" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Find Doctors & Book
                    </NavLink>
                    <NavLink to="/appointments" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                      My Appointments
                    </NavLink>
                  </>
                )}
                {user.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    Doctor Portal
                  </NavLink>
                )}
                {(user.role === 'ADMIN' || user.isAdmin) && (
                  <NavLink to="/admin/portal" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Admin Portal
                  </NavLink>
                )}
                <NavLink to="/profile" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                  <User className="w-4 h-4" />
                  Account Profile
                </NavLink>

                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
                <NavLink to="/booking" onClick={() => setShowMobileMenu(false)} className={getMobileNavLinkClass}>
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Find Doctors & Book
                </NavLink>
                <button 
                  onClick={() => handleAuthRedirect(false)} 
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleAuthRedirect(true)} 
                  className="w-full py-3 mt-2 text-center rounded-xl text-sm font-extrabold bg-blue-600 text-white transition-all cursor-pointer shadow-sm shadow-blue-500/20"
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
