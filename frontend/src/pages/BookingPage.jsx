import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Calendar, Clock, User, Activity, AlertCircle, CheckCircle, Search, ArrowLeft } from 'lucide-react';

export default function BookingPage({ token, user }) {
  const [doctors, setDoctors] = useState([]);
  const [specialisation, setSpecialisation] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [heldSlot, setHeldSlot] = useState(null);
  const [holdTimer, setHoldTimer] = useState(0);
  const [symptoms, setSymptoms] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load doctors
  const loadDoctors = async () => {
    try {
      setLoading(true);
      // We need to fetch from our doctor endpoint
      // We can use a direct axios call if apiService doesn't have it, or implement it
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/doctors?specialisation=${specialisation}`, {
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
  }, [token, specialisation]);

  // Load slots when doctor or date changes
  const loadSlots = async () => {
    if (!selectedDoctor) return;
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/doctors/${selectedDoctor.id}/slots?date=${selectedDate}`, {
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
      setStatusMessage('Your temporary slot hold has expired. Please select a slot again.');
      setBookingStatus('error');
    }
  }, [holdTimer, heldSlot]);

  // Handle Slot Hold
  const handleHoldSlot = async (slotTime) => {
    try {
      setLoading(true);
      setBookingStatus(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/appointments/hold`, {
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
        setHoldTimer(300); // 5 minutes in seconds
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
      alert('Please describe your symptoms.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/appointments`, {
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
        setStatusMessage(`Appointment successfully confirmed on ${new Date(data.appointment.dateTime).toLocaleString()}!`);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Book an Appointment</h1>
        {selectedDoctor && (
          <button
            onClick={() => {
              setSelectedDoctor(null);
              setHeldSlot(null);
              setHoldTimer(0);
              setBookingStatus(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
        )}
      </div>

      {bookingStatus === 'success' ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 rounded-2xl p-6 text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-emerald-400">Appointment Booked!</h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-350">{statusMessage}</p>
          <button
            onClick={() => {
              setBookingStatus(null);
              setSelectedDoctor(null);
              setSymptoms('');
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Book Another Appointment
          </button>
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
              <div className="flex gap-3 bg-white dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by specialisation (e.g. Cardiology, Pediatrics)..."
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={loadDoctors}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Search
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading doctor directory...</div>
              ) : doctors.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400 italic">
                  No active doctors match the criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/30 p-5 rounded-2xl hover:border-blue-500/30 transition-all space-y-4"
                    >
                      <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <User className="w-5 h-5 text-blue-500" /> Dr. {doc.user.name}
                        </h3>
                        <p className="text-xs text-blue-600 dark:text-cyan-400 font-bold mt-1">
                          {doc.specialisation}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                        <span>Slots: {doc.slotDuration} min</span>
                        <span>Hours: {doc.workingHoursStart} - {doc.workingHoursEnd}</span>
                      </div>
                      <button
                        onClick={() => setSelectedDoctor(doc)}
                        className="w-full py-2 bg-slate-50 hover:bg-blue-500 hover:text-white border border-slate-200 dark:border-slate-800 hover:border-transparent text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl cursor-pointer transition-all"
                      >
                        Check Availability
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Availability and Booking View
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Slots Column */}
              <div className="lg:col-span-7 space-y-4 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Select Date & Time
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setHeldSlot(null);
                        setHoldTimer(0);
                        setSelectedDate(e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                    />
                  </div>

                  {loading ? (
                    <div className="py-8 text-center text-xs font-semibold text-slate-400">Loading slots...</div>
                  ) : slots.length === 0 ? (
                    <div className="py-8 text-center text-xs font-semibold text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                      No available slots on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((slotStr) => {
                        const slotTime = new Date(slotStr);
                        const displayTime = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const isHeld = heldSlot === slotStr;

                        return (
                          <button
                            key={slotStr}
                            onClick={() => handleHoldSlot(slotStr)}
                            disabled={heldSlot && !isHeld}
                            className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                              isHeld
                                ? 'bg-blue-500 text-white border-transparent shadow-md'
                                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-cyan-500/5 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'
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

              {/* Booking Column */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                    Confirm Details
                  </h3>
                  <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-2 mb-4">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      Doctor: <span className="text-blue-500">Dr. {selectedDoctor.user.name}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      Specialisation: <span className="text-slate-500">{selectedDoctor.specialisation}</span>
                    </p>
                    {heldSlot ? (
                      <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg mt-2">
                        <p className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                          Selected Slot: {new Date(heldSlot).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-semibold text-rose-500 mt-1">
                          Held for: {formatTimer(holdTimer)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400 italic">Please select a time slot on the left to lock it.</p>
                    )}
                  </div>
                </div>

                {heldSlot && (
                  <form onSubmit={handleBookAppointment} className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-rose-500" /> Share symptoms in advance (required)
                      </label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe what you are experiencing, how long you've had it, etc."
                        rows={4}
                        className="w-full mt-1.5 p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      {loading ? 'Confirming...' : 'Book Appointment'}
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
