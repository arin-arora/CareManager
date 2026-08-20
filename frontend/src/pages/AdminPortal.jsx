import React, { useState, useEffect } from 'react';
import { UserPlus, Calendar, Shield, Activity, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button, Card, Input, Select, Badge, EmptyState, LoadingState } from '../components/UI';

export default function AdminPortal({ token }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states for creating doctor
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialisation, setSpecialisation] = useState('');
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/admin/doctors`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/doctors/${docId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/admin/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, name, specialisation, slotDuration: parseInt(slotDuration) })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Doctor created successfully!');
        setEmail('');
        setPassword('');
        setName('');
        setSpecialisation('');
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/admin/doctors/${doc.id}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/admin/doctors/${selectedDoc.id}/leave`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5051'}/api/admin/doctors/${selectedDoc.id}/leave/${dateOnly}`, {
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
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* Title Header */}
      <div className="border-b border-slate-205 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Admin Operations Console</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Register practitioner profiles, toggle directory states, configure slot intervals, and plan leaves.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Register Practitioner & Directory Table (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Register Form Card */}
          <Card className="space-y-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <UserPlus className="w-4 h-4 text-blue-600" /> Register Practitioner
            </h2>
            
            <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Full Name"
                placeholder="e.g. Dr. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Specialisation"
                placeholder="e.g. Cardiology"
                value={specialisation}
                onChange={(e) => setSpecialisation(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. physician@caremanager.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Select
                label="Slot Duration"
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
              >
                <option value="15">15 mins</option>
                <option value="20">20 mins</option>
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">60 mins</option>
              </Select>
              
              <div className="sm:col-span-2 pt-2.5">
                <Button type="submit" className="w-full py-2.5 font-bold">
                  Register Practitioner Account
                </Button>
              </div>
            </form>
          </Card>

          {/* Directory Table */}
          <Card className="space-y-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-2.5">Doctor Directory</h2>
            
            {loading ? (
              <LoadingState message="Syncing directory table..." />
            ) : doctors.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No doctors registered in directory.</p>
            ) : (
              <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-205 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Specialisation</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-bold text-slate-700 dark:text-slate-350">
                    {doctors.map((doc) => (
                      <tr 
                        key={doc.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 cursor-pointer ${
                          selectedDoc?.id === doc.id ? 'bg-blue-500/5' : ''
                        }`}
                      >
                        <td className="p-3 font-extrabold text-slate-850 dark:text-white">
                          Dr. {doc.user?.name}
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">{doc.user?.email}</span>
                        </td>
                        <td className="p-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{doc.specialisation}</td>
                        <td className="p-3">
                          <Badge variant={doc.isActive ? 'success' : 'danger'}>
                            {doc.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Button
                            onClick={() => setSelectedDoc(doc)}
                            variant="secondary"
                            className="px-2.5 py-1 text-[9px] inline-flex"
                          >
                            Leaves
                          </Button>
                          <button
                            onClick={() => handleToggleActive(doc)}
                            className={`px-2.5 py-1 text-[9px] font-bold rounded transition-all cursor-pointer inline-flex border ${
                              doc.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                            }`}
                          >
                            {doc.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>

        {/* Right Column: Manage Selected Doctor leaves (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 p-6 rounded-xl shadow-xs">
          {selectedDoc ? (
            <div className="space-y-6 animate-fade-in text-xs font-semibold leading-relaxed">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Leave Planner: Dr. {selectedDoc.user?.name}
                </h3>
                <p className="text-[10px] text-slate-455 mt-1 leading-normal font-semibold">Schedule unavailable dates to block patient bookings. Existing slot bookings will be automatically cancelled with patients notified.</p>
              </div>

              {/* Add Leave Form */}
              <form onSubmit={handleAddLeave} className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <Input
                  label="Leave Date"
                  type="date"
                  value={leaveDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  required
                />
                <Input
                  label="Reason / Note"
                  placeholder="e.g. Medical Conference"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="danger"
                  className="w-full py-2 font-bold"
                >
                  Schedule Leave Day
                </Button>
              </form>

              {/* Leaves List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Leave Dates</h4>
                {leavesList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No leave dates scheduled.</p>
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
                          className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-lg"
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
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded cursor-pointer transition-all"
                            title="Cancel Leave"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button
                onClick={() => setSelectedDoc(null)}
                variant="secondary"
                className="w-full py-2 border border-slate-200"
              >
                Close Planner
              </Button>
            </div>
          ) : (
            <div className="h-full py-16 text-center flex flex-col items-center justify-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-350" />
              <p className="text-xs font-bold text-slate-455">Select "Leaves" next to any doctor on the left to schedule blocked days or cancel leaves.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
