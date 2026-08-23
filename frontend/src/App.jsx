import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useApp from './hooks/useApp';
import MainLayout from './layouts/MainLayout';
import SymptomIntake from './pages/SymptomIntake';
import Medications from './pages/Medications';
import LabAnalyzer from './pages/LabAnalyzer';
import AuthConsole from './pages/AuthConsole';
import HealthConsole from './pages/HealthConsole';
import UserHealthDashboard from './pages/UserHealthDashboard';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';

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
          <Route path="/symptoms" element={<SymptomIntake {...appState} />} />
          <Route path="/medications" element={<Medications {...appState} />} />
          <Route path="/lab-reports" element={<LabAnalyzer {...appState} />} />
          
          {/* User health dashboard and Admin dashboard routes */}
          <Route path="/health" element={<UserHealthDashboard {...appState} />} />
          <Route 
            path="/admin/dashboard" 
            element={appState.user?.isAdmin ? <HealthConsole {...appState} /> : <Navigate to="/symptoms" replace />} 
          />
          
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
