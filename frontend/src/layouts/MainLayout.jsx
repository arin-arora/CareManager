import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Sun, Moon, Menu, X, LogOut, User, Settings, 
  Calendar, Search, LayoutDashboard, ShieldCheck, FileText, Pill
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

export default function MainLayout({ user, handleLogout, setIsLogin, children }) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const getSidebarLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border ${
      isActive 
        ? 'bg-blue-50 text-blue-600 border-slate-200 dark:bg-blue-955/20 dark:text-blue-400 dark:border-blue-900/40' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/50 border-transparent'
    }`;

  // If user is guest, render standard marketing navbar layout
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans">
        <Navbar user={user} handleLogout={handleLogout} setIsLogin={setIsLogin} />
        
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 font-semibold">
          <p>© 2026 CareManager. Built for healthcare appointment and follow-up management.</p>
        </footer>
      </div>
    );
  }

  // If user is authenticated, render sidebar application layout
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* 1. Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 shrink-0">
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-850 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
            C
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
            CareManager
          </span>
        </div>

        <div className="flex-1 px-4 py-6 flex flex-col justify-between overflow-y-auto">
          {/* Main Navigation Menu */}
          <nav className="space-y-1">
            <span className="px-4 text-[9px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">Clinical Portals</span>
            
            <NavLink to="/dashboard" className={getSidebarLinkClass} end>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </NavLink>

            {user.role === 'PATIENT' && (
              <>
                <NavLink to="/booking" className={getSidebarLinkClass}>
                  <Search className="w-4 h-4 shrink-0" />
                  <span>Find Doctors</span>
                </NavLink>
                <NavLink to="/appointments" className={getSidebarLinkClass}>
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Appointments</span>
                </NavLink>
              </>
            )}

            {user.role === 'DOCTOR' && (
              <NavLink to="/doctor/portal" className={getSidebarLinkClass}>
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Doctor Desk</span>
              </NavLink>
            )}

            {(user.role === 'ADMIN' || user.isAdmin) && (
              <NavLink to="/admin/portal" className={getSidebarLinkClass}>
                <Settings className="w-4 h-4 shrink-0" />
                <span>Admin Console</span>
              </NavLink>
            )}

            <NavLink to="/profile" className={getSidebarLinkClass}>
              <User className="w-4 h-4 shrink-0" />
              <span>Profile</span>
            </NavLink>
          </nav>

          {/* Bottom Settings / Logout Actions */}
          <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-lg text-left cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-650" />}
              <span>Toggle theme</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 text-left border border-transparent hover:border-red-100 dark:hover:border-red-900/40 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Right Workspace Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header Bar (Only visible on screens < md) */}
        <header className="md:hidden h-14 bg-white dark:bg-slate-900 border-b border-slate-205 dark:border-slate-850 px-4 flex items-center justify-between shrink-0">
          <Link to="/dashboard" className="flex items-center gap-1.5">
            <div className="w-6.5 h-6.5 rounded bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
              C
            </div>
            <span className="font-extrabold text-xs text-slate-900 dark:text-white">CareManager</span>
          </Link>
          
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="p-1.5 rounded-lg text-slate-500 cursor-pointer"
          >
            {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Drawer (visible when active) */}
        {showMobileSidebar && (
          <div className="md:hidden fixed inset-0 z-50 overflow-y-auto flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowMobileSidebar(false)} />
            <div className="relative bg-white dark:bg-slate-900 w-64 max-w-xs flex flex-col p-4 space-y-4 border-r border-slate-200 h-full">
              <div className="flex justify-between items-center pb-2 border-b border-slate-105">
                <span className="font-extrabold text-xs">CareManager App</span>
                <button onClick={() => setShowMobileSidebar(false)} className="text-slate-400">&times;</button>
              </div>
              <nav className="flex-1 space-y-1">
                <NavLink to="/dashboard" onClick={() => setShowMobileSidebar(false)} className={getSidebarLinkClass} end>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Overview</span>
                </NavLink>

                {user.role === 'PATIENT' && (
                  <>
                    <NavLink to="/booking" onClick={() => setShowMobileSidebar(false)} className={getSidebarLinkClass}>
                      <Search className="w-4 h-4 shrink-0" />
                      <span>Find Doctors</span>
                    </NavLink>
                    <NavLink to="/appointments" onClick={() => setShowMobileSidebar(false)} className={getSidebarLinkClass}>
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Appointments</span>
                    </NavLink>
                  </>
                )}

                {user.role === 'DOCTOR' && (
                  <NavLink to="/doctor/portal" onClick={() => setShowMobileSidebar(false)} className={getSidebarLinkClass}>
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Doctor Desk</span>
                  </NavLink>
                )}

                {(user.role === 'ADMIN' || user.isAdmin) && (
                  <NavLink to="/admin/portal" onClick={() => setShowMobileSidebar(false)} className={getSidebarLinkClass}>
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Admin Console</span>
                  </NavLink>
                )}

                <NavLink to="/profile" onClick={() => setShowMobileSidebar(false)} className={getSidebarLinkClass}>
                  <User className="w-4 h-4 shrink-0" />
                  <span>Profile</span>
                </NavLink>
              </nav>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-500 rounded-lg"
                >
                  Theme: {theme}
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileSidebar(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Clinical Dashboard workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
