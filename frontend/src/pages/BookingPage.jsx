import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Activity, AlertCircle, CheckCircle, 
  Search, ArrowLeft, Heart, Sparkles, Check
} from 'lucide-react';
import { Button, Card, Input, Textarea, Badge } from '../components/UI';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/doctors?specialisation=${specialisation}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/doctors/${selectedDoctor.id}/slots?date=${selectedDate}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/appointments/hold`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/appointments`, {
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

  // Generate dynamic list of next 7 days for calendar selector
  const getNext7Days = () => {
    const days = [];
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      const dayNum = d.getDate();
      days.push({ dateStr, dayName, dayNum });
    }
    return days;
  };

  const next7Days = getNext7Days();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Directory Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Book an Appointment</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Select a practitioner, schedule slots, and describe symptoms.</p>
        </div>
        {selectedDoctor && (
          <button
            onClick={() => {
              setSelectedDoctor(null);
              setHeldSlot(null);
              setHoldTimer(0);
              setBookingStatus(null);
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
        )}
      </div>

      {bookingStatus === 'success' ? (
        /* Success Screen */
        <div className="bg-emerald-50 text-slate-850 border border-emerald-100 rounded-xl p-8 text-center space-y-4 max-w-xl mx-auto dark:bg-emerald-950/20 dark:border-emerald-900">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-extrabold dark:text-emerald-400">Appointment Booked!</h2>
          <p className="text-xs font-semibold text-slate-655 dark:text-slate-350">{statusMessage}</p>
          <div className="pt-2">
            <Button
              onClick={() => {
                setBookingStatus(null);
                setSelectedDoctor(null);
                setSymptoms('');
              }}
              className="mx-auto"
            >
              Book Another Appointment
            </Button>
          </div>
        </div>
      ) : (
        <>
          {bookingStatus === 'error' && (
            <div className="flex gap-2.5 items-center bg-red-50 border border-red-100 rounded-xl p-4 text-xs font-bold text-red-600 dark:bg-red-955/20 dark:border-red-900 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {!selectedDoctor ? (
            /* Step 1: Doctor Search and Listing */
            <div className="space-y-6">
              <div className="flex gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl shadow-xs">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by specialization (e.g. Cardiology, General Practitioner)..."
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <Button onClick={loadDoctors}>Search</Button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs font-bold text-slate-455 animate-pulse">Syncing doctor records...</div>
              ) : doctors.length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-slate-400 italic">No doctors match your search.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {doctors.map((doc) => (
                    <Card key={doc.id} className="flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Dr. {doc.user?.name}</h3>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mt-0.5">{doc.specialisation}</p>
                        
                        <div className="text-[10px] text-slate-500 font-semibold space-y-1 mt-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/50 dark:border-slate-800">
                          <p>⏱️ Consult interval: {doc.slotDuration} mins</p>
                          <p>📅 Working hours: {doc.workingHoursStart} - {doc.workingHoursEnd}</p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedDoctor(doc)}
                        variant="secondary"
                        className="w-full py-2 border border-slate-200"
                      >
                        Check Availability &rarr;
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Slot Selection & Checkout Summary Panel */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Calendar Slider & Hour Grids (7 cols) */}
              <div className="lg:col-span-7 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-xl shadow-xs">
                
                {/* Practitioner Info Header */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Dr. {selectedDoctor.user?.name}</h2>
                  <p className="text-xs text-blue-650 dark:text-blue-400 font-bold uppercase">{selectedDoctor.specialisation}</p>
                </div>

                {/* Horizontal Calendar Date Slider */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Choose Date</span>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {next7Days.map((d) => {
                      const isSelected = selectedDate === d.dateStr;
                      return (
                        <button
                          key={d.dateStr}
                          type="button"
                          onClick={() => {
                            setHeldSlot(null);
                            setHoldTimer(0);
                            setSelectedDate(d.dateStr);
                          }}
                          className={`px-4 py-3 rounded-lg text-center shrink-0 border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-transparent text-white shadow-xs font-bold'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-350 hover:bg-slate-100/50'
                          }`}
                        >
                          <span className="text-[9px] uppercase tracking-wider block font-bold opacity-80">{d.dayName}</span>
                          <span className="text-sm font-extrabold block mt-0.5">{d.dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Hours Slots Selector */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Select Hour</span>
                  
                  {loading ? (
                    <div className="py-8 text-center text-xs font-bold text-slate-455 animate-pulse">Syncing practice hours...</div>
                  ) : slots.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-200/50">
                      No slots available on this date.
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
                            className={`p-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              isHeld
                                ? 'bg-blue-600 text-white border-transparent shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 text-slate-700 dark:text-slate-350 disabled:opacity-40 disabled:cursor-not-allowed'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{displayTime}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Checkout Summary Card (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-xl flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 mb-4">
                    Booking Summary
                  </h3>
                  
                  <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 bg-slate-50 dark:bg-slate-955 text-xs font-bold">
                    <p className="text-slate-700 dark:text-slate-300">
                      Doctor: <span className="text-blue-650 dark:text-blue-400">Dr. {selectedDoctor.user?.name}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Specialisation: <span>{selectedDoctor.specialisation}</span>
                    </p>
                    
                    {heldSlot ? (
                      <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg mt-3 space-y-1.5">
                        <p className="text-blue-650 dark:text-blue-400 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Slot Locked: {new Date(heldSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                        <p className="text-[10px] text-rose-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                          Hold expires in: {formatTimer(holdTimer)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-450 dark:text-slate-550 italic font-semibold pt-1">Please select an hourly slot on the left to lock it.</p>
                    )}
                  </div>
                </div>

                {heldSlot && (
                  <form onSubmit={handleBookAppointment} className="space-y-4 pt-4">
                    <Textarea
                      label="Reason for visit / symptoms intake"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Enter symptoms or details to prepare the practitioner..."
                      required
                    />
                    
                    <div className="flex gap-1.5 bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900 p-3 rounded-lg text-[10px] text-blue-750 dark:text-blue-400 font-semibold leading-normal">
                      <Sparkles className="w-4 h-4 shrink-0 text-blue-650 mt-0.5" />
                      <span>Note: Shared symptoms are triaged by AI to compile a pre-visit overview checklist for your doctor.</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 font-bold"
                    >
                      {loading ? 'Confirming booking...' : 'Confirm appointment'}
                    </Button>
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
