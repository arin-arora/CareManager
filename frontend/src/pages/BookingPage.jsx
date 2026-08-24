import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { 
  Calendar, Clock, User, Activity, AlertCircle, CheckCircle, 
  Search, ArrowLeft, Filter, Sparkles, ShieldCheck, Stethoscope 
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

export default function BookingPage({ token, user }) {
  const [doctors, setDoctors] = useState([]);
  const [specialisation, setSpecialisation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

  // Client-side filtering by doctor name or specialty search query
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
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-[11px] font-extrabold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> CareManager Doctor Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Find Doctors & Book Appointments
          </h1>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
            Reserve consultation slots with verified medical specialists across all healthcare departments
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
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
        )}
      </div>

      {bookingStatus === 'success' ? (
        <div className="bg-white dark:bg-slate-900/40 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Appointment Booked Successfully!</h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-350 max-w-lg mx-auto">{statusMessage}</p>
          <div className="pt-2">
            <button
              onClick={() => {
                setBookingStatus(null);
                setSelectedDoctor(null);
                setSymptoms('');
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      ) : (
        <>
          {bookingStatus === 'error' && (
            <div className="flex gap-2.5 items-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-4 text-xs font-bold text-rose-600 dark:text-rose-450">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {!selectedDoctor ? (
            // Search Doctor View
            <div className="space-y-6">
              {/* Search & Filter Bar */}
              <div className="bg-white dark:bg-slate-900/40 p-5 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search doctor by name, designation, or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3.5 py-3 rounded-2xl shrink-0">
                      {filteredDoctors.length} Doctors Available
                    </span>
                  </div>
                </div>

                {/* Specialty Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Specialties:
                  </span>
                  {specialtyCategories.map((spec) => {
                    const isActive = (spec === 'All' && !specialisation) || specialisation.toLowerCase() === spec.toLowerCase();
                    return (
                      <button
                        key={spec}
                        onClick={() => handleSpecialtyClick(spec)}
                        className={`px-3.5 py-1.5 rounded-xl font-extrabold shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center text-xs font-extrabold text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Stethoscope className="w-8 h-8 animate-bounce text-blue-500" />
                  <span>Loading verified doctor directory...</span>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-500 italic bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-3xl p-8">
                  No medical specialists found matching your search criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map((doc) => {
                    const rawName = doc.user?.name || 'Doctor';
                    const docName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;
                    const initials = getInitials(doc.user?.name);
                    const designation = doc.designation || 'Consultant';

                    return (
                      <div
                        key={doc.id}
                        className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/30 p-6 rounded-3xl hover:border-blue-500/50 hover:-translate-y-0.5 transition-all duration-200 space-y-5 shadow-sm flex flex-col justify-between group"
                      >
                        <div className="space-y-4">
                          {/* Doctor Avatar Header */}
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-extrabold text-lg flex items-center justify-center shrink-0 border border-blue-500/20 shadow-inner group-hover:scale-105 transition-transform">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {docName}
                              </h3>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {designation}
                              </p>
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 text-[10px] font-extrabold mt-1.5">
                                <Stethoscope className="w-3 h-3" /> {doc.specialisation}
                              </div>
                            </div>
                          </div>

                          {/* Verification & Status Badges */}
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified Practitioner
                              </span>
                              <span className="text-[11px] font-medium text-slate-400">
                                {doc.slotDuration || 30} min slots
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-3 py-1 rounded-xl">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                              Available for online booking
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-2xl transition-all cursor-pointer text-center"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-sm cursor-pointer transition-all text-center"
                          >
                            Book Slot
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Availability and Booking View
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Slots Column */}
              <div className="lg:col-span-7 space-y-5 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-extrabold text-lg flex items-center justify-center shrink-0 border border-blue-500/20 shadow-inner">
                    {getInitials(selectedDoctor.user?.name)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {selectedDoctor.user?.name?.startsWith('Dr.') ? selectedDoctor.user.name : `Dr. ${selectedDoctor.user?.name}`}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedDoctor.designation || 'Consultant'} • <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedDoctor.specialisation}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Select Consultation Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setHeldSlot(null);
                        setHoldTimer(0);
                        setSelectedDate(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                      Available Time Slots
                    </label>

                    {loading ? (
                      <div className="py-10 text-center text-xs font-semibold text-slate-400">Loading available slots...</div>
                    ) : slots.length === 0 ? (
                      <div className="py-10 text-center text-xs font-semibold text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
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
                              className={`p-3 text-xs font-extrabold rounded-2xl border text-center transition-all cursor-pointer ${
                                isHeld
                                  ? 'bg-blue-600 text-white border-transparent shadow-md'
                                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'
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

              {/* Booking Form Column */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
                    Confirm Appointment Details
                  </h3>
                  <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2 mb-4 bg-slate-50/50 dark:bg-slate-950/30">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Doctor: <span className="text-blue-600 dark:text-blue-400">{selectedDoctor.user?.name?.startsWith('Dr.') ? selectedDoctor.user.name : `Dr. ${selectedDoctor.user?.name}`}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Designation: <span className="text-slate-600 dark:text-slate-400">{selectedDoctor.designation || 'Consultant'}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Specialty: <span className="text-slate-600 dark:text-slate-400">{selectedDoctor.specialisation}</span>
                    </p>
                    {heldSlot ? (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3.5 rounded-xl mt-3">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                          Selected Slot: {new Date(heldSlot).toLocaleString()}
                        </p>
                        <p className="text-[11px] font-extrabold text-rose-500 mt-1">
                          Slot held for: {formatTimer(holdTimer)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400 italic pt-1">Please select an available time slot on the left to lock it.</p>
                    )}
                  </div>
                </div>

                {heldSlot && (
                  <form onSubmit={handleBookAppointment} className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-500" /> Share symptoms in advance (required)
                      </label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe main symptoms, duration, severity..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer transition-all disabled:opacity-50"
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
