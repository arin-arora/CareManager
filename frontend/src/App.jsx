import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useApp from './hooks/useApp';
import MainLayout from './layouts/MainLayout';
import AuthConsole from './pages/AuthConsole';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import BookingPage from './pages/BookingPage';
import DoctorPortal from './pages/DoctorPortal';
import AdminPortal from './pages/AdminPortal';
import PatientAppointments from './pages/PatientAppointments';

export default function App() {
  const appState = useApp();

  return (
    <Router>
      <MainLayout
        user={appState.user}
        handleLogout={appState.handleLogout}
        setIsLogin={appState.setIsLogin}
      >
        <Routes>
          {/* Landing Page or Dashboard Redirect */}
          <Route 
            path="/" 
            element={appState.token ? <Navigate to="/dashboard" replace /> : <LandingPage {...appState} />} 
          />
          
          {/* New Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={appState.token ? <Dashboard {...appState} /> : <Navigate to="/login" replace />} 
          />
          
          {/* Defined App Routes */}
          <Route path="/booking" element={appState.token ? <BookingPage {...appState} /> : <Navigate to="/login" replace />} />
          <Route path="/appointments" element={appState.token ? <PatientAppointments {...appState} /> : <Navigate to="/login" replace />} />
          <Route path="/doctor/portal" element={appState.token && appState.user?.role === 'DOCTOR' ? <DoctorPortal {...appState} /> : <Navigate to="/login" replace />} />
          <Route path="/admin/portal" element={appState.token && (appState.user?.role === 'ADMIN' || appState.user?.isAdmin) ? <AdminPortal {...appState} /> : <Navigate to="/login" replace />} />
          
          {/* Auth routes */}
          <Route 
            path="/login" 
            element={appState.token ? <Navigate to="/dashboard" replace /> : <AuthConsole {...appState} />} 
          />
          <Route 
            path="/profile" 
            element={appState.token ? <AuthConsole {...appState} /> : <Navigate to="/login" replace />} 
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Fallback wildcard redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
