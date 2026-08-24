import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { 
  Calendar, Clock, User, Activity, AlertCircle, CheckCircle2, 
  Search, ArrowLeft, Filter, Sparkles, ShieldCheck, Stethoscope, ChevronRight 
} from 'lucide-react';

const getInitials = (name) => {
  if (!name) return 'DR';
  const cleanName = name.replace(/^Dr\.\s*/i, '').trim();
  const parts = cleanName.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0] ? parts[0].slice(0, 2).toUpperCase() : 'DR';
};

const specialtyCategories = [
  'All',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology',
  'General Medicine',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology'
];

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookingPage({ token, user }) {
  const [doctors, setDoctors] = useState([]);
  const [specialisation, setSpecialisation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [slots, setSlots] = useState([]);
  const [heldSlot, setHeldSlot] = useState(null);
  const [holdTimer, setHoldTimer] = useState(0);
  const [symptoms, setSymptoms] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load doctors
  const loadDoctors = async (specQuery = specialisation) => {
    try {
      setLoading(true);
      const query = specQuery === 'All' ? '' : specQuery;
      const response = await fetch(`${API_BASE_URL}/api/doctors?specialisation=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadDoctors();
  }, [token]);

  // Load slots when doctor or date changes
  const loadSlots = async () => {
    if (!selectedDoctor) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/doctors/${selectedDoctor.id}/slots?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadSlots();
    }
  }, [selectedDoctor, selectedDate]);

  // Hold Countdown Timer
  useEffect(() => {
    if (holdTimer > 0) {
      const interval = setInterval(() => {
        setHoldTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (holdTimer === 0 && heldSlot) {
      setHeldSlot(null);
      setStatusMessage('Your temporary slot hold has expired. Please select a time slot again.');
      setBookingStatus('error');
    }
  }, [holdTimer, heldSlot]);

  // Handle Slot Hold
  const handleHoldSlot = async (slotTime) => {
    try {
      setLoading(true);
      setBookingStatus(null);
      const response = await fetch(`${API_BASE_URL}/api/appointments/hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ doctorId: selectedDoctor.id, slotTime })
      });
      
      const data = await response.json();
      if (response.ok) {
        setHeldSlot(slotTime);
        setHoldTimer(300);
        setStatusMessage('');
      } else {
        setBookingStatus('error');
        setStatusMessage(data.msg || 'Failed to hold slot.');
      }
    } catch (err) {
      setBookingStatus('error');
      setStatusMessage('Network error. Unable to hold slot.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      alert('Please describe your main symptoms.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          slotTime: heldSlot,
          symptoms
        })
      });

      const data = await response.json();
      if (response.ok) {
        setBookingStatus('success');
        setHeldSlot(null);
        setHoldTimer(0);
        setStatusMessage(`Appointment confirmed for ${new Date(data.appointment.dateTime).toLocaleString()}!`);
        loadSlots();
      } else {
        setBookingStatus('error');
        setStatusMessage(data.msg || 'Booking failed.');
      }
    } catch (err) {
      setBookingStatus('error');
      setStatusMessage('Network error. Unable to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSpecialtyClick = (spec) => {
    const newSpec = spec === 'All' ? '' : spec;
    setSpecialisation(newSpec);
    loadDoctors(newSpec);
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const nameStr = doc.user?.name || '';
    const specStr = doc.specialisation || '';
    const desigStr = doc.designation || '';
    const q = searchQuery.toLowerCase();
    return (
      nameStr.toLowerCase().includes(q) ||
      specStr.toLowerCase().includes(q) ||
      desigStr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in px-4 sm:px-6">
      
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/80 dark:border-slate-850 pb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> CareManager Specialist Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            Medical Practitioners
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Browse verified healthcare specialists, check live calendar availability, and reserve consultation slots
          </p>
        </div>

        {selectedDoctor && (
          <button
            onClick={() => {
              setSelectedDoctor(null);
              setHeldSlot(null);
              setHoldTimer(0);
              setBookingStatus(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-black rounded-2xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500" /> Return to Directory
          </button>
        )}
      </div>

      {bookingStatus === 'success' ? (
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 rounded-3xl p-10 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">Appointment Confirmed!</h2>
          <p className="text-sm font-semibold text-slate-300 max-w-lg mx-auto leading-relaxed">{statusMessage}</p>
          <div className="pt-2">
            <button
              onClick={() => {
                setBookingStatus(null);
                setSelectedDoctor(null);
                setSymptoms('');
              }}
              className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              Book Another Consultation
            </button>
          </div>
        </div>
      ) : (
        <>
          {bookingStatus === 'error' && (
            <div className="flex gap-3 items-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 text-xs font-extrabold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {!selectedDoctor ? (
            /* Directory Search & List View */
            <div className="space-y-6">
              
              {/* Filter Controls Bar */}
              <div className="bg-slate-50/70 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-850 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search doctor by name, designation, or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-xs font-bold bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-2xl shrink-0 border border-emerald-500/20">
                      {filteredDoctors.length} Practitioners
                    </span>
                  </div>
                </div>

                {/* Specialty Pill Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mr-1 shrink-0 flex items-center gap-1 font-bold">
                    <Filter className="w-3.5 h-3.5 text-emerald-500" /> Filter:
                  </span>
                  {specialtyCategories.map((spec) => {
                    const isActive = (spec === 'All' && !specialisation) || specialisation.toLowerCase() === spec.toLowerCase();
                    return (
                      <button
                        key={spec}
                        onClick={() => handleSpecialtyClick(spec)}
                        className={`px-4 py-2 rounded-2xl font-black shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-850'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Distinctive Asymmetric Doctor List (No Repeated Cards) */}
              {loading ? (
                <div className="py-20 text-center text-xs font-extrabold text-slate-400 flex flex-col items-center justify-center gap-3">
                  <Stethoscope className="w-8 h-8 animate-bounce text-emerald-500" />
                  <span>Loading medical practitioner index...</span>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-500 italic bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-8">
                  No medical specialists found matching your search query.
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 dark:divide-slate-850 border-y border-slate-200/80 dark:border-slate-850">
                  {filteredDoctors.map((doc) => {
                    const rawName = doc.user?.name || 'Doctor';
                    const docName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;
                    const initials = getInitials(doc.user?.name);
                    const designation = doc.designation || 'Consultant';

                    return (
                      <div
                        key={doc.id}
                        className="py-5 px-3 sm:px-5 hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        {/* Doctor Monogram & Info */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600/20 via-teal-600/20 to-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform shadow-inner">
                            {initials}
                          </div>
                          <div className="space-y-1 truncate">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-slate-900 dark:text-slate-50 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {docName}
                              </h3>
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                                <ShieldCheck className="w-3 h-3" /> Verified
                              </span>
                            </div>
                            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                              {designation} • <span className="text-emerald-600 dark:text-emerald-400">{doc.specialisation}</span>
                            </p>
                          </div>
                        </div>

                        {/* Availability Tag & Action Button */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0">
                          <div className="text-right hidden sm:block">
                            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1.5 justify-end">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Available Today
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">{doc.slotDuration || 30} min slots</span>
                          </div>

                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="px-6 py-3 bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 group-hover:shadow-emerald-600/20"
                          >
                            Select & Book <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Dedicated Booking Workflow Pane */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Doctor Details & Date Selector (7 cols) */}
              <div className="lg:col-span-7 space-y-6 bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-850 p-6 sm:p-7 rounded-3xl">
                
                {/* Doctor Banner Strip */}
                <div className="flex items-center gap-4 border-b border-slate-200/80 dark:border-slate-850 pb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xl flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
                    {getInitials(selectedDoctor.user?.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-50">
                      {selectedDoctor.user?.name?.startsWith('Dr.') ? selectedDoctor.user.name : `Dr. ${selectedDoctor.user?.name}`}
                    </h3>
                    <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedDoctor.designation || 'Consultant'} • <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedDoctor.specialisation}</span>
                    </p>
                  </div>
                </div>

                {/* Interactive Date Timeline Picker */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest font-extrabold text-slate-400 block mb-2">
                      1. Select Consultation Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={getLocalDateString()}
                      onChange={(e) => {
                        setHeldSlot(null);
                        setHoldTimer(0);
                        setSelectedDate(e.target.value);
                      }}
                      className="w-full px-4 py-3 text-xs font-black bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl focus:outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Slot Selection Grid */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-mono uppercase tracking-widest font-extrabold text-slate-400 block">
                      2. Available Time Slots ({slots.length})
                    </label>

                    {loading ? (
                      <div className="py-10 text-center text-xs font-bold text-slate-400">Loading slots for {selectedDate}...</div>
                    ) : slots.length === 0 ? (
                      <div className="py-10 text-center text-xs font-semibold text-slate-400 italic bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-850">
                        No available consultation slots on this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {slots.map((slotStr) => {
                          const slotTime = new Date(slotStr);
                          const displayTime = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const isHeld = heldSlot === slotStr;

                          return (
                            <button
                              key={slotStr}
                              onClick={() => handleHoldSlot(slotStr)}
                              disabled={heldSlot && !isHeld}
                              className={`p-3 text-xs font-black rounded-2xl border text-center transition-all cursor-pointer ${
                                isHeld
                                  ? 'bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-600/20'
                                  : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-850 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-800 dark:text-slate-200 disabled:opacity-50'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                              {displayTime}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Confirmation Side Drawer (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-slate-800 p-6 sm:p-7 rounded-3xl space-y-6 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-black text-emerald-400 block mb-3">
                    3. Confirm Booking
                  </span>
                  
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                    <p className="text-xs font-bold text-slate-300">
                      Practitioner: <span className="text-white font-black">{selectedDoctor.user?.name?.startsWith('Dr.') ? selectedDoctor.user.name : `Dr. ${selectedDoctor.user?.name}`}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-300">
                      Specialty: <span className="text-emerald-400 font-extrabold">{selectedDoctor.specialisation}</span>
                    </p>
                    
                    {heldSlot ? (
                      <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl mt-3 space-y-1">
                        <p className="text-xs font-black text-emerald-400">
                          Selected Slot: {new Date(heldSlot).toLocaleString()}
                        </p>
                        <p className="text-[11px] font-extrabold text-rose-400">
                          Slot held for: {formatTimer(holdTimer)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400 italic pt-1">Please select an available time slot on the left to hold it.</p>
                    )}
                  </div>
                </div>

                {heldSlot && (
                  <form onSubmit={handleBookAppointment} className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-slate-300 flex items-center gap-1.5 mb-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" /> Share symptoms in advance (required)
                      </label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe your primary symptoms, duration, severity..."
                        rows={4}
                        className="w-full px-4 py-3 text-xs font-bold bg-slate-950 border border-slate-800 rounded-2xl focus:border-emerald-500 focus:outline-none text-white"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Confirm & Book Appointment'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
}
