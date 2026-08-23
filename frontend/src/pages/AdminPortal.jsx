import React, { useState, useEffect } from 'react';
import { UserPlus, Calendar, Shield, Activity, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function AdminPortal({ token }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states for creating doctor
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialisation, setSpecialisation] = useState('');
  const [designation, setDesignation] = useState('Consultant');
  const [slotDuration, setSlotDuration] = useState('30');
  
  // Selected doctor for schedule / leave updates
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Form states for Leave
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leavesList, setLeavesList] = useState([]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/admin/doctors`, {
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

  // Load Leaves for selected doctor
  const loadLeaves = async (docId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/doctors/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const doc = doctors.find(d => d.id === docId);
      setLeavesList(doc?.leaves || []);
    } catch (err) {
      console.error('Error loading leaves:', err);
    }
  };

  useEffect(() => {
    if (selectedDoc) {
      loadLeaves(selectedDoc.id);
    }
  }, [selectedDoc, doctors]);

  // Create Doctor
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/admin/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, name, specialisation, designation, slotDuration: parseInt(slotDuration) })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Doctor created successfully!');
        setEmail('');
        setPassword('');
        setName('');
        setSpecialisation('');
        setDesignation('Consultant');
        await loadDoctors();
      } else {
        alert(data.msg || 'Creation failed.');
      }
    } catch (err) {
      console.error('Create doctor error:', err);
    }
  };

  // Toggle Doctor Active Status
  const handleToggleActive = async (doc) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/admin/doctors/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !doc.isActive })
      });

      if (response.ok) {
        await loadDoctors();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  // Add Leave
  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!leaveDate) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/admin/doctors/${selectedDoc.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: leaveDate, reason: leaveReason })
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Leave added! ${data.cancelledAppointmentsCount} affected appointments cancelled and patients notified.`);
        setLeaveDate('');
        setLeaveReason('');
        await loadDoctors(); // Refresh doctors to reload leaves
      } else {
        alert(data.msg || 'Failed to add leave.');
      }
    } catch (err) {
      console.error('Add leave error:', err);
    }
  };

  // Remove Leave
  const handleRemoveLeave = async (dateISO) => {
    const dateOnly = dateISO.split('T')[0];
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/admin/doctors/${selectedDoc.id}/leave/${dateOnly}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Leave cancelled successfully.');
        await loadDoctors();
      } else {
        const data = await response.json();
        alert(data.msg || 'Failed to cancel leave.');
      }
    } catch (err) {
      console.error('Remove leave error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Admin Operations Console</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Add new doctors, toggle active directory states, configure schedule structures, and manage leaves.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: List Doctors (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Create Doctor Form */}
          <section className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-500" /> Register New Practitioner
            </h2>
            <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arin Arora"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Consultant, Specialist"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Specialisation</label>
                <input
                  type="text"
                  value={specialisation}
                  onChange={(e) => setSpecialisation(e.target.value)}
                  placeholder="e.g. Cardiology"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. arin.arora@caremanager.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Slot Duration (min)</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                >
                  <option value="15">15 mins</option>
                  <option value="20">20 mins</option>
                  <option value="30">30 mins</option>
                  <option value="45">45 mins</option>
                  <option value="60">60 mins</option>
                </select>
              </div>
              <button
                type="submit"
                className="sm:col-span-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all mt-2"
              >
                Register Doctor
              </button>
            </form>
          </section>

          {/* Doctors Table */}
          <section className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Doctor Directory</h2>
            {loading ? (
              <div className="py-6 text-center text-xs font-semibold text-slate-400">Loading Directory...</div>
            ) : doctors.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">No doctors registered.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {doctors.map((doc) => (
                  <div key={doc.id} className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {doc.user.name.startsWith('Dr.') ? doc.user.name : `Dr. ${doc.user.name}`}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{doc.designation || 'Consultant'}</p>
                      <p className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">{doc.specialisation}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{doc.user.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3 py-1.5 border border-slate-250 dark:border-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
                      >
                        Manage Leaves
                      </button>
                      <button
                        onClick={() => handleToggleActive(doc)}
                        className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all ${
                          doc.isActive
                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                            : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                        }`}
                      >
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Manage Selected Doctor leaves (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl">
          {selectedDoc ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Leave Planner: Dr. {selectedDoc.user.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Add leaves to prevent booking and notify existing patients.</p>
              </div>

              {/* Add Leave Form */}
              <form onSubmit={handleAddLeave} className="space-y-4 border-b border-slate-100 dark:border-slate-850 pb-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Leave Date</label>
                  <input
                    type="date"
                    value={leaveDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Reason / Notes</label>
                  <input
                    type="text"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Conference"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Schedule Leave Day
                </button>
              </form>

              {/* Leaves List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Leave Days</h4>
                {leavesList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No leaves scheduled.</p>
                ) : (
                  <div className="space-y-2">
                    {leavesList.map((leave) => {
                      const formattedLeaveDate = new Date(leave.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });

                      return (
                        <div
                          key={leave.id}
                          className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-900 rounded-xl"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {formattedLeaveDate}
                            </p>
                            {leave.reason && (
                              <p className="text-[10px] text-slate-450 italic mt-0.5">"{leave.reason}"</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveLeave(leave.date)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-all"
                            title="Cancel Leave"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Close Planner
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-12 space-y-3">
              <Calendar className="w-12 h-12 text-slate-350" />
              <p className="text-xs font-semibold text-slate-400">Select "Manage Leaves" for any doctor on the left to add/remove leave days and review schedule blocks.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
