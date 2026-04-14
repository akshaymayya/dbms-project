import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Plus, Car, ArrowLeft } from 'lucide-react';
import { format12Hour } from '../utils/timeUtils';

export default function BookingDetails() {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [canExtend, setCanExtend] = useState(false);
  const [extendTime, setExtendTime] = useState('');
  const [isExtending, setIsExtending] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadBooking = () => {
      const allBookings = JSON.parse(localStorage.getItem('bookedSlots')) || {};
      const currentBooking = allBookings[slotId];

      if (!currentBooking || currentBooking.name !== user.name) {
        navigate('/booking'); // Not their booking or doesn't exist
        return;
      }
      setBooking(currentBooking);

      // Check if can extend (must be at least 30 mins before end time)
      const now = new Date();
      // Parse endTime (HH:MM format) for today
      const [endHours, endMinutes] = currentBooking.endTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(endHours, endMinutes, 0, 0);

      // Diff in minutes
      const diffMs = endDate.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins > 30) {
        setCanExtend(true);
      } else {
        setCanExtend(false);
        setIsExtending(false);
      }
    };

    loadBooking();
    const interval = setInterval(loadBooking, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [slotId, navigate]);

  const handleExtend = () => {
    if (!extendTime) {
      setMessage("Please select a new end time.");
      return;
    }
    
    // Simple validation: new end time must be after old end time
    if (extendTime <= booking.endTime) {
      setMessage("Extended time must be later than your current exit time!");
      return;
    }

    const allBookings = JSON.parse(localStorage.getItem('bookedSlots')) || {};
    allBookings[slotId].endTime = extendTime;
    localStorage.setItem('bookedSlots', JSON.stringify(allBookings));

    // Update history
    const history = JSON.parse(localStorage.getItem('history')) || [];
    history.push(`${booking.name} extended slot ${slotId} end time to ${extendTime}`);
    localStorage.setItem('history', JSON.stringify(history));

    setBooking(allBookings[slotId]);
    setIsExtending(false);
    setMessage("Time extended successfully!");
    setExtendTime('');
    setTimeout(() => setMessage(''), 4000);
  };

  if (!booking) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading details...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <div className="flex items-center p-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 gap-4">
        <button onClick={() => navigate('/booking')} className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
          <Car /> Parking Zone
        </h1>
      </div>

      <div className="max-w-2xl mx-auto w-full p-6 mt-8">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <h2 className="text-3xl font-black text-slate-100 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-400 mb-8 border-b border-slate-700/50 pb-6">Your parking spot has been successfully reserved.</p>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium tracking-wide uppercase text-sm">Parking Bay</span>
              <span className="text-2xl font-bold font-mono text-yellow-400 bg-yellow-400/10 px-4 py-1.5 rounded border border-yellow-400/20">{slotId}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium tracking-wide uppercase text-sm">Vehicle Plated</span>
              <span className="text-lg font-mono tracking-widest text-slate-200">{booking.vehicle}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium tracking-wide uppercase text-sm">Reserved Timings</span>
              <div className="text-right flex items-center gap-2 text-emerald-400 font-mono text-lg bg-emerald-400/10 px-3 py-1 rounded">
                <Clock size={16} />
                {format12Hour(booking.startTime)} - {format12Hour(booking.endTime)}
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            {message && (
              <div className={`p-4 rounded-lg font-medium text-center ${message.includes('successfully') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {message}
              </div>
            )}

            {isExtending ? (
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-end gap-3 animate-in fade-in slide-in-from-top-4">
                 <div className="flex-1">
                   <label className="block text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">New Exit Time</label>
                   <input
                     type="time"
                     value={extendTime}
                     onChange={(e) => setExtendTime(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 focus:outline-none focus:border-yellow-400 focus:ring-1 text-sm [&::-webkit-calendar-picker-indicator]:invert transition-all"
                   />
                 </div>
                 <button onClick={handleExtend} className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase rounded-lg transition-colors">Confirm</button>
                 <button onClick={() => setIsExtending(false)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase rounded-lg transition-colors">Cancel</button>
               </div>
            ) : (
               <div className="flex flex-col sm:flex-row gap-4 justify-between">
                 <button
                   onClick={() => setIsExtending(true)}
                   disabled={!canExtend}
                   className={`flex-1 py-3 px-4 font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                     canExtend 
                     ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg'
                     : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                   }`}
                   title={!canExtend ? "You can only extend the slot 30 mins before it ends." : "Extend time"}
                 >
                   <Clock size={18} /> Manage Extension
                 </button>

                 <button
                   onClick={() => navigate('/booking')}
                   className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold uppercase tracking-widest rounded-xl hover:shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                 >
                   <Plus size={18} /> Book Another
                 </button>
               </div>
            )}
            
            {!canExtend && !isExtending && (
              <p className="text-center text-xs text-red-400/80 mt-2">
                Time extension is unavailable (must be requested at least 30 mins before exit time).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
