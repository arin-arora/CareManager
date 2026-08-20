import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Laptop, Menu, X, LogOut, User, Calendar, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './UI';

export default function Navbar({ user, handleLogout, setIsLogin }) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const getNavLinkClass = ({ isActive }) =>
    `px-3 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
      isActive 
        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' 
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
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

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Brand logo (Not glowing, clean clinical text) */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
            C
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
            CareManager
          </span>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-2 items-center h-16">
            {!user ? (
              <>
                <button 
                  onClick={() => handleGuestNav('features')} 
                  className="px-3 py-2 text-xs font-bold text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  Features
                </button>
                <button 
                  onClick={() => handleGuestNav('how-it-works')} 
                  className="px-3 py-2 text-xs font-bold text-slate-555 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  How it works
                </button>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className={getNavLinkClass} end>
                  Dashboard
                </NavLink>
                {user.role === 'PATIENT' && (
                  <>
                    <NavLink to="/booking" className={getNavLinkClass}>
                      Find Doctors
                    </NavLink>
                    <NavLink to="/appointments" className={getNavLinkClass}>
                      Appointments
                    </NavLink>
                  </>
                )}
                {user.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" className={getNavLinkClass}>
                    Workspace
                  </NavLink>
                )}
                {(user.role === 'ADMIN' || user.isAdmin) && (
                  <NavLink to="/admin/portal" className={getNavLinkClass}>
                    Admin Console
                  </NavLink>
                )}
                <NavLink to="/profile" className={getNavLinkClass}>
                  Account
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Right side: Session / Theme (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">{user.name}</span>
              <Button 
                variant="secondary"
                onClick={handleLogout}
                className="py-1.5 px-3 font-bold border border-slate-200"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleAuthRedirect(false)} 
                className="text-xs font-bold text-slate-655 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                Sign In
              </button>
              <Button 
                onClick={() => handleAuthRedirect(true)}
                className="py-1.5 px-4"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Hamburger (Mobile) */}
        <div className="flex items-center gap-2.5 md:hidden">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg text-slate-550 dark:text-slate-400 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1.5 rounded-lg text-slate-550 dark:text-slate-400 cursor-pointer"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-md absolute left-0 right-0 z-50">
          <nav className="flex flex-col gap-2">
            {!user ? (
              <>
                <button 
                  onClick={() => handleGuestNav('features')} 
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Features
                </button>
                <button 
                  onClick={() => handleGuestNav('how-it-works')} 
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  How it works
                </button>
                <button 
                  onClick={() => handleAuthRedirect(false)} 
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Sign In
                </button>
                <Button 
                  onClick={() => handleAuthRedirect(true)}
                  className="w-full py-2"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg block">
                  Dashboard
                </NavLink>
                {user.role === 'PATIENT' && (
                  <>
                    <NavLink to="/booking" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg block">
                      Find Doctors
                    </NavLink>
                    <NavLink to="/appointments" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg block">
                      Appointments
                    </NavLink>
                  </>
                )}
                {user.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg block">
                    Doctor Workspace
                  </NavLink>
                )}
                {(user.role === 'ADMIN' || user.isAdmin) && (
                  <NavLink to="/admin/portal" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg block">
                    Admin Portal
                  </NavLink>
                )}
                <NavLink to="/profile" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg block">
                  Account
                </NavLink>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">{user.name}</span>
                  <Button variant="secondary" onClick={handleLogout} className="py-1 px-3">
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
