import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function useApp() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Health State
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [runDiagnosticsLoading, setRunDiagnosticsLoading] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);

  // Symptom State
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomsList, setSymptomsList] = useState([]);
  const [ageInput, setAgeInput] = useState('');
  const [durationInput, setDurationInput] = useState('1 day');
  const [notesInput, setNotesInput] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  // Symptom Logs History
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [saveSymptomLoading, setSaveSymptomLoading] = useState(false);

  // Medications Tracker State
  const [medicinesList, setMedicinesList] = useState([]);
  const [medsLoading, setMedsLoading] = useState(false);
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning, after food', duration: '7 days' });
  const [addMedLoading, setAddMedLoading] = useState(false);
  const [medError, setMedError] = useState('');
  const [activeInteractions, setActiveInteractions] = useState([]);

  // Lab Reports State
  const [labReportsList, setLabReportsList] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [labTitle, setLabTitle] = useState('');
  const [labRawText, setLabRawText] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [addReportLoading, setAddReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

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

  // Fetch health status
  const fetchHealthStatus = async () => {
    setHealthLoading(true);
    try {
      const res = await apiService.fetchHealthStatus();
      setHealthStatus(res);
    } catch (err) {
      console.error(err);
      setHealthStatus({
        status: 'error',
        services: { api: 'offline', database: 'disconnected', cache: 'disconnected' }
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setRunDiagnosticsLoading(true);
    setDiagnosticsResult(null);
    try {
      const res = await apiService.runFullDiagnostics();
      setDiagnosticsResult(res);
    } catch (err) {
      console.error(err);
      alert('Diagnostics failed: ' + (err.response?.data?.msg || err.message));
    } finally {
      setRunDiagnosticsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  // Fetch data dependent on token
  const fetchSymptomHistory = async () => {
    if (!token) return;
    try {
      const res = await apiService.fetchSymptomHistory(token);
      setSymptomHistory(res);
    } catch (err) {
      console.error('Error fetching symptom history:', err);
    }
  };

  const fetchMedicines = async () => {
    if (!token) return;
    setMedsLoading(true);
    try {
      const res = await apiService.fetchMedicines(token);
      setMedicinesList(res);
      
      // Aggregate interactions from medicines list
      const interactions = [];
      res.forEach(med => {
        if (med.interactions && med.interactions.length > 0) {
          med.interactions.forEach(inter => {
            if (!interactions.includes(inter)) {
              interactions.push(inter);
            }
          });
        }
      });
      setActiveInteractions(interactions);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setMedsLoading(false);
    }
  };

  const fetchLabReports = async () => {
    if (!token) return;
    setReportsLoading(true);
    try {
      const res = await apiService.fetchLabReports(token);
      setLabReportsList(res);
      if (res.length > 0 && !selectedReport) {
        setSelectedReport(res[0]);
      }
    } catch (err) {
      console.error('Error fetching lab reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSymptomHistory();
      fetchMedicines();
      fetchLabReports();
    } else {
      setSymptomHistory([]);
      setMedicinesList([]);
      setActiveInteractions([]);
      setLabReportsList([]);
      setSelectedReport(null);
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
        setAuthForm({ name: '', email: '', password: '' });
      } else {
        if (res.token) {
          // Log in automatically if token is returned
          setToken(res.token);
          setUser(res.user);
          localStorage.setItem('token', res.token);
        } else {
          setAuthSuccess(res.msg || 'Account created successfully. Please log in.');
          setIsLogin(true);
        }
        setAuthForm({ name: '', email: '', password: '' });
      }
    } catch (err) {
      const isUnverifiedErr = err.response?.data?.isNotVerified === true;
      if (isUnverifiedErr) {
        setIsNotVerified(true);
        setUnverifiedEmail(authForm.email);
      }
      const msg = err.response?.data?.msg || err.response?.data?.message || err.message || 'Authentication failed. Please try again.';
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddSymptom = (e) => {
    e.preventDefault();
    if (symptomInput.trim() && !symptomsList.includes(symptomInput.trim())) {
      setSymptomsList([...symptomsList, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (index) => {
    setSymptomsList(symptomsList.filter((_, i) => i !== index));
  };

  const handleSymptomSubmit = async () => {
    if (symptomsList.length === 0) return;
    if (!token) {
      alert('Please sign in or create an account to use the AI Symptom Analyzer.');
      return;
    }
    setPredictLoading(true);
    setPredictionResult(null);

    try {
      const res = await apiService.predictSymptom(token, {
        symptoms: symptomsList,
        duration: durationInput,
        age: ageInput ? parseInt(ageInput) : null,
        notes: notesInput
      });
      setPredictionResult(res);
    } catch (err) {
      console.error(err);
      alert('Failed to contact AI prediction service. Ensure the service is online.');
    } finally {
      setPredictLoading(false);
    }
  };

  const handleSaveSymptom = async () => {
    if (!token || !predictionResult) return;
    setSaveSymptomLoading(true);
    try {
      const payload = {
        symptoms: symptomsList,
        duration: durationInput,
        notes: notesInput,
        modelPrediction: {
          conditions: predictionResult.conditions.map(c => ({ name: c.name, confidence: c.confidence })),
          urgencyLevel: predictionResult.urgency_level,
          suggestedSpecialist: predictionResult.suggested_specialist
        },
        rulesWarning: {
          redFlagsTriggered: predictionResult.red_flags_triggered,
          criticalWarning: predictionResult.critical_warning
        },
        homeCareNotes: predictionResult.home_care_notes
      };

      await apiService.saveSymptom(token, payload);
      
      setSymptomsList([]);
      setSymptomInput('');
      setNotesInput('');
      setPredictionResult(null);
      await fetchSymptomHistory();
      alert('Symptom log saved to history successfully!');
    } catch (err) {
      console.error('Error saving symptom log:', err);
      alert('Failed to save symptom log to history.');
    } finally {
      setSaveSymptomLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!token) return;
    setAddMedLoading(true);
    setMedError('');
    try {
      const res = await apiService.addMedicine(token, medForm);
      setMedicinesList([res, ...medicinesList]);
      await fetchMedicines();
      setMedForm({ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning, after food', duration: '7 days' });
    } catch (err) {
      setMedError(err.response?.data?.msg || 'Failed to add medication.');
    } finally {
      setAddMedLoading(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!token) return;
    if (!confirm('Are you sure you want to remove this medication?')) return;
    try {
      await apiService.deleteMedicine(token, id);
      setMedicinesList(medicinesList.filter(m => m._id !== id));
      await fetchMedicines();
    } catch (err) {
      console.error('Error removing medication:', err);
      alert('Failed to remove medication.');
    }
  };

  const handleParseLabReport = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!labRawText.trim()) return;
    setAddReportLoading(true);
    setReportError('');
    try {
      const res = await apiService.parseLabReport(token, {
        rawText: labRawText,
        title: labTitle
      });
      
      setLabReportsList([res, ...labReportsList]);
      setSelectedReport(res);
      setLabRawText('');
      setLabTitle('');
    } catch (err) {
      setReportError(err.response?.data?.msg || 'Failed to parse lab report. Ensure the Python ML container is running.');
    } finally {
      setAddReportLoading(false);
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
    healthStatus,
    healthLoading,
    fetchHealthStatus,
    runDiagnosticsLoading,
    diagnosticsResult,
    handleRunDiagnostics,
    symptomInput,
    setSymptomInput,
    symptomsList,
    ageInput,
    setAgeInput,
    durationInput,
    setDurationInput,
    notesInput,
    setNotesInput,
    predictionResult,
    setPredictionResult,
    predictLoading,
    symptomHistory,
    saveSymptomLoading,
    medicinesList,
    medsLoading,
    medForm,
    setMedForm,
    addMedLoading,
    medError,
    activeInteractions,
    labReportsList,
    reportsLoading,
    labTitle,
    setLabTitle,
    labRawText,
    setLabRawText,
    selectedReport,
    setSelectedReport,
    addReportLoading,
    reportError,
    authSuccess,
    setAuthSuccess,
    isNotVerified,
    setIsNotVerified,
    unverifiedEmail,
    handleLogout,
    handleAuthSubmit,
    handleAddSymptom,
    removeSymptom,
    handleSymptomSubmit,
    handleSaveSymptom,
    handleAddMedicine,
    handleDeleteMedicine,
    handleParseLabReport
  };
}
