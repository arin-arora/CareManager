import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function useApp() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  
  // Auth Form State with explicit Role Selection ('PATIENT' | 'DOCTOR')
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'PATIENT', 
    specialisation: 'General Medicine' 
  });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Fetch current user details if token exists
  useEffect(() => {
    if (token) {
      apiService.fetchUser(token)
      .then(res => {
        setUser(res);
      })
      .catch(err => {
        console.error('Failed to fetch user details:', err);
        handleLogout();
      });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    setIsNotVerified(false);
    setUnverifiedEmail('');
    const endpointAction = isLogin ? apiService.login : apiService.signup;
    
    try {
      const res = await endpointAction(authForm);
      if (isLogin) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
        setAuthForm({ name: '', email: '', password: '', role: 'PATIENT', specialisation: 'General Medicine' });
      } else {
        if (res.token) {
          setToken(res.token);
          setUser(res.user);
          localStorage.setItem('token', res.token);
        } else {
          setAuthSuccess(res.msg || 'Account created successfully. Please log in.');
          setIsLogin(true);
        }
        setAuthForm({ name: '', email: '', password: '', role: 'PATIENT', specialisation: 'General Medicine' });
      }
    } catch (err) {
      const isUnverifiedErr = err.response?.data?.isNotVerified === true;
      if (isUnverifiedErr) {
        setIsNotVerified(true);
        setUnverifiedEmail(authForm.email);
      }
      const msg = err.response?.data?.msg || err.response?.data?.message || err.message || 'Authentication failed. Please check network connection or credentials.';
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    token,
    setToken,
    user,
    setUser,
    isLogin,
    setIsLogin,
    authForm,
    setAuthForm,
    authError,
    setAuthError,
    authLoading,
    authSuccess,
    setAuthSuccess,
    isNotVerified,
    setIsNotVerified,
    unverifiedEmail,
    handleLogout,
    handleAuthSubmit
  };
}
