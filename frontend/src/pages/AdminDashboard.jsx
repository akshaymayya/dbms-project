import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, History, ShieldAlert } from 'lucide-react';
import { supabase } from '../supabase';

export default function AdminDashboard() {
  const [bookedSlots, setBookedSlots] = useState({});
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const columns = [1, 2, 3, 4, 5, 6, 7, 8];
  
  // Auto-generate slots
  const slots = rows.flatMap(row => columns.map(col => `${row}${col}`));

  useEffect(() => {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
      navigate('/admin-login');
      return;
    }
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadData = async () => {
    const { data: bData, error: bError } = await supabase.from('bookings').select('*');
    if (!bError && bData) {
      const slotsObj = {};
      bData.forEach(booking => {
        slotsObj[booking.slot_id] = {
           name: booking.customer_name,
           startTime: booking.start_time,
           endTime: booking.end_time
        };
      });
      setBookedSlots(slotsObj);
    }
    
    const { data: hData, error: hError } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false });
    if (!hError && hData) {
      setHistory(hData.map(log => log.action_description));
    }
  };

  const handleRemoveBooking = async (slot) => {
    if (bookedSlots[slot]) {
      if (!confirm(`Cancel booking for ${bookedSlots[slot].name} on slot ${slot}?`)) return;
      
      const newBooked = { ...bookedSlots };
      delete newBooked[slot];
      setBookedSlots(newBooked);
      
      await supabase.from('bookings').delete().match({ slot_id: slot });
      await supabase.from('activity_log').insert([{
         action_description: `Admin cancelled booking for slot ${slot}`
      }]);
      loadData();
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      await supabase.from('activity_log').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      loadData();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen p-6 bg-[#1a1924] text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-4 flex items-center justify-between bg-purple-900/20 border-purple-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Control Panel</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Slot Management */}
            <div className="glass-panel p-6 bg-black/20 border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-200">Parking Slots Live View</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {slots.map(slot => {
                  const isBooked = bookedSlots[slot];
                  return (
                    <div key={slot} className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col justify-between group h-24 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-lg text-slate-200">{slot}</span>
                        {isBooked && (
                          <button onClick={() => handleRemoveBooking(slot)} className="text-red-400 hover:text-red-300 transition-all p-1 bg-red-400/10 rounded" title="Cancel Booking">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      {isBooked ? (
                        <div className="text-xs text-[#6feaf6] bg-[#6feaf6]/10 px-2 py-1 rounded w-full flex flex-col gap-1 z-10">
                          <span className="block truncate font-semibold" title={isBooked.name}>
                            {isBooked.name}
                          </span>
                          <span className="block truncate text-[10px] text-gray-400" title={`${isBooked.startTime} - ${isBooked.endTime}`}>
                            {isBooked.startTime} - {isBooked.endTime}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 z-10">
                          Available
                        </div>
                      )}
                      {/* Background indicator for booked */}
                      {isBooked && <div className="absolute top-0 right-0 w-8 h-8 bg-[#6feaf6]/10 rounded-bl-full pointer-events-none"></div>}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            {/* History Panel */}
            <div className="glass-panel flex flex-col h-[600px] bg-black/20 border-white/5">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <History size={18} className="text-slate-400" /> Activity Log
                </h2>
                {history.length > 0 && (
                  <button onClick={handleClearHistory} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
                    Clear All
                  </button>
                )}
              </div>
              <div className="p-4 flex-1 overflow-y-auto w-full">
                {history.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 mt-4">No recent activity.</p>
                ) : (
                  <ul className="space-y-4">
                    {[...history].reverse().map((h, i) => (
                      <li key={i} className="text-sm border-l-2 border-purple-500/50 pl-3 py-1 relative">
                        <div className="absolute w-2 h-2 bg-purple-400 rounded-full -left-[5px] top-2"></div>
                        <p className="text-slate-300 leading-snug">{h}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
