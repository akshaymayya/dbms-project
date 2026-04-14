import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Car, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function Booking() {
  const [bookedSlots, setBookedSlots] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [vehicle, setVehicle] = useState('');
  const [startHour, setStartHour] = useState('12');
  const [startMin, setStartMin] = useState('00');
  const [startAmPm, setStartAmPm] = useState('PM');
  const [endHour, setEndHour] = useState('01');
  const [endMin, setEndMin] = useState('00');
  const [endAmPm, setEndAmPm] = useState('PM');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingMessage, setBookingMessage] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const navigate = useNavigate();

  const format12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const get24HourString = (hour12, min, ampm) => {
    let h = parseInt(hour12, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${min}`;
  };

  const hoursList = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minsList = ['00', '15', '30', '45'];

  // 4 rows, 12 columns = 48 slots. Layout: 2 parking areas separated by an aisle.
  const slots = Array.from({ length: 48 }, (_, i) => {
    const row = String.fromCharCode(65 + Math.floor(i / 12)); // A, B, C, D
    const col = (i % 12) + 1;
    return `${row}${col}`;
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUser(user);

    const loadData = async () => {
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) {
        console.error("Error fetching bookings:", error);
      } else if (data) {
        const slotsObj = {};
        data.forEach(booking => {
          slotsObj[booking.slot_id] = {
            name: booking.customer_name,
            vehicle: booking.vehicle_number,
            startTime: booking.start_time,
            endTime: booking.end_time,
            time: booking.created_at
          };
        });
        setBookedSlots(slotsObj);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleBook = async () => {
    if (!selectedSlot) return alert("Please select a parking space.");
    if (!vehicle) return alert("Please enter your vehicle number.");

    const startTime = get24HourString(startHour, startMin, startAmPm);
    const endTime = get24HourString(endHour, endMin, endAmPm);
    
    if (bookedSlots[selectedSlot]) return alert(`Slot ${selectedSlot} is already booked!`);

    setBookingMessage("Processing...");

    const { error: bookingError } = await supabase.from('bookings').insert([{
      slot_id: selectedSlot,
      customer_name: currentUser.name,
      vehicle_number: vehicle,
      start_time: startTime,
      end_time: endTime
    }]);

    if (bookingError) {
      console.error(bookingError);
      alert("Failed to book slot. Check console.");
      setBookingMessage(null);
      return;
    }

    await supabase.from('activity_log').insert([{
      action_description: `${currentUser.name} (${vehicle}) booked slot ${selectedSlot} from ${startTime} to ${endTime}`
    }]);

    setBookingMessage(null);
    setShowTicket(true);
  };

  const handleSeatClick = (slot) => {
    if (bookedSlots[slot]) return;
    setSelectedSlot(slot === selectedSlot ? '' : slot);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <div className="flex justify-between items-center p-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-yellow-400">
            <Car /> Parking Zone
          </h1>
          {currentUser && <p className="text-sm text-slate-400">Driver: {currentUser.name}</p>}
        </div>
        <button onClick={() => { localStorage.removeItem('currentUser'); navigate('/auth'); }} className="text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full p-6 flex-1 flex flex-col items-center">
        
        {/* Reservation Form */}
        <div className="w-full bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 mb-8 shadow-xl shadow-black/20 flex flex-col md:flex-row gap-4 items-end justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex-1 w-full relative z-10">
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">Vehicle Plate</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm font-mono tracking-widest uppercase transition-all"
              placeholder="MH 12 AB 1234"
            />
          </div>
          <div className="flex-[1.5] w-full relative z-10">
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">Entry Time</label>
            <div className="flex gap-1 items-center">
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="w-[4.5rem] bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-2 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm transition-all appearance-none text-center">
                {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-slate-400 font-bold">:</span>
              <select value={startMin} onChange={(e) => setStartMin(e.target.value)} className="w-[4.5rem] bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-2 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm transition-all appearance-none text-center">
                {minsList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)} className="w-[4.5rem] bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-2 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm transition-all appearance-none text-center text-yellow-400 font-bold">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div className="flex-[1.5] w-full relative z-10">
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">Exit Time</label>
            <div className="flex gap-1 items-center">
              <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="w-[4.5rem] bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-2 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm transition-all appearance-none text-center">
                {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-slate-400 font-bold">:</span>
              <select value={endMin} onChange={(e) => setEndMin(e.target.value)} className="w-[4.5rem] bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-2 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm transition-all appearance-none text-center">
                {minsList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)} className="w-[4.5rem] bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-2 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm transition-all appearance-none text-center text-yellow-400 font-bold">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 bg-slate-800/60 px-6 py-3 rounded-full border border-slate-700/50 mb-8 shadow-sm text-sm font-medium">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-6 h-4 border-2 border-dashed border-slate-500 bg-slate-800/50 rounded-sm"></div> Open
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-6 h-4 border-2 border-yellow-400 bg-yellow-400/20 rounded-sm"></div> Selected
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-6 h-4 border-2 border-red-500/50 bg-red-500/20 rounded-sm relative flex items-center justify-center">
               <Car size={10} className="text-red-400/70" />
            </div> Occupied
          </div>
        </div>

        {/* Parking Lot Diagram */}
        <div className="bg-[#2a2c38] p-8 rounded-2xl border-4 border-slate-600/30 shadow-2xl relative w-full overflow-x-auto">
          {/* Driveway markings */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center gap-[120px]">
             <div className="w-full border-t-4 border-yellow-500/30 border-dashed h-0 translate-y-[-2rem]"></div>
             <div className="w-full border-t-4 border-yellow-500/30 border-dashed h-0 translate-y-[1rem]"></div>
          </div>
          
          <div className="min-w-fit flex flex-col gap-12 relative z-10">
            
            {/* Top Parking Row (A & B) */}
            <div className="flex justify-center gap-2">
               {slots.slice(0, 12).map((slot) => {
                 const isBooked = bookedSlots[slot];
                 const isSelected = selectedSlot === slot;
                 return (
                   <button
                     key={slot}
                     title={isBooked ? `Booked by ${isBooked.name}` : slot}
                     onClick={() => handleSeatClick(slot)}
                     className={`w-16 h-28 border-2 border-dashed relative flex flex-col justify-end items-center p-2 transition-all group ${
                       isBooked 
                         ? 'border-red-500/30 bg-red-500/10 cursor-not-allowed' 
                         : isSelected 
                           ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                           : 'border-slate-500 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-400 cursor-pointer'
                     }`}
                     style={{ borderBottomStyle: 'solid', borderBottomWidth: '4px', borderBottomColor: isSelected ? '#facc15' : isBooked ? '#ef4444' : '#64748b' }} // Solid parking block
                   >
                     <span className={`font-mono font-bold text-lg mb-auto ${isSelected ? 'text-yellow-400' : isBooked ? 'text-red-400/50' : 'text-slate-500 group-hover:text-slate-300'}`}>
                       {slot}
                     </span>
                     {isBooked && (
                       <div className="absolute inset-0 flex items-center justify-center text-red-500/60 transition-transform transform scale-125">
                         <Car size={36} className="rotate-180" />
                       </div>
                     )}
                   </button>
                 )
               })}
            </div>

            {/* Middle Parking Row (C & D facing up and down) */}
            <div className="flex flex-col gap-0 justify-center">
              <div className="flex gap-2 justify-center">
                 {slots.slice(12, 24).map((slot) => {
                   const isBooked = bookedSlots[slot];
                   const isSelected = selectedSlot === slot;
                   return (
                     <button
                       key={slot}
                       onClick={() => handleSeatClick(slot)}
                       className={`w-16 h-28 border-2 border-dashed relative flex flex-col justify-start items-center p-2 transition-all group ${
                         isBooked 
                           ? 'border-red-500/30 bg-red-500/10 cursor-not-allowed' 
                           : isSelected 
                             ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                             : 'border-slate-500 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-400 cursor-pointer'
                       }`}
                       style={{ borderTopStyle: 'solid', borderTopWidth: '4px', borderTopColor: isSelected ? '#facc15' : isBooked ? '#ef4444' : '#64748b' }}
                     >
                       {isBooked && (
                         <div className="absolute inset-0 flex items-center justify-center text-red-500/60 transition-transform transform scale-125">
                           <Car size={36} />
                         </div>
                       )}
                       <span className={`font-mono font-bold text-lg mt-auto ${isSelected ? 'text-yellow-400' : isBooked ? 'text-red-400/50' : 'text-slate-500 group-hover:text-slate-300'}`}>
                         {slot}
                       </span>
                     </button>
                   )
                 })}
              </div>
              
              <div className="w-full h-2 bg-slate-700/50 my-1"></div>

              <div className="flex gap-2 justify-center">
                 {slots.slice(24, 36).map((slot) => {
                   const isBooked = bookedSlots[slot];
                   const isSelected = selectedSlot === slot;
                   return (
                     <button
                       key={slot}
                       onClick={() => handleSeatClick(slot)}
                       className={`w-16 h-28 border-2 border-dashed relative flex flex-col justify-end items-center p-2 transition-all group ${
                         isBooked 
                           ? 'border-red-500/30 bg-red-500/10 cursor-not-allowed' 
                           : isSelected 
                             ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                             : 'border-slate-500 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-400 cursor-pointer'
                       }`}
                       style={{ borderBottomStyle: 'solid', borderBottomWidth: '4px', borderBottomColor: isSelected ? '#facc15' : isBooked ? '#ef4444' : '#64748b' }}
                     >
                       <span className={`font-mono font-bold text-lg mb-auto ${isSelected ? 'text-yellow-400' : isBooked ? 'text-red-400/50' : 'text-slate-500 group-hover:text-slate-300'}`}>
                         {slot}
                       </span>
                       {isBooked && (
                         <div className="absolute inset-0 flex items-center justify-center text-red-500/60 transition-transform transform scale-125">
                           <Car size={36} className="rotate-180" />
                         </div>
                       )}
                     </button>
                   )
                 })}
              </div>
            </div>

            {/* Bottom Parking Row (E & F) */}
            <div className="flex justify-center gap-2">
               {slots.slice(36, 48).map((slot) => {
                 const isBooked = bookedSlots[slot];
                 const isSelected = selectedSlot === slot;
                 return (
                   <button
                     key={slot}
                     onClick={() => handleSeatClick(slot)}
                     className={`w-16 h-28 border-2 border-dashed relative flex flex-col justify-start items-center p-2 transition-all group ${
                       isBooked 
                         ? 'border-red-500/30 bg-red-500/10 cursor-not-allowed' 
                         : isSelected 
                           ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                           : 'border-slate-500 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-400 cursor-pointer'
                     }`}
                     style={{ borderTopStyle: 'solid', borderTopWidth: '4px', borderTopColor: isSelected ? '#facc15' : isBooked ? '#ef4444' : '#64748b' }}
                   >
                     {isBooked && (
                       <div className="absolute inset-0 flex items-center justify-center text-red-500/60 transition-transform transform scale-125">
                         <Car size={36} />
                       </div>
                     )}
                     <span className={`font-mono font-bold text-lg mt-auto ${isSelected ? 'text-yellow-400' : isBooked ? 'text-red-400/50' : 'text-slate-500 group-hover:text-slate-300'}`}>
                       {slot}
                     </span>
                   </button>
                 )
               })}
            </div>

          </div>
        </div>

        {/* Selected state and Book Button */}
        <div className="mt-8 text-center flex flex-col items-center gap-5 w-full max-w-md">
          <div className="min-h-8">
            {selectedSlot ? (
              <p className="text-slate-300 text-lg">
                Parking Bay <span className="text-yellow-400 font-bold px-2 py-1 bg-yellow-400/10 rounded">{selectedSlot}</span> selected.
              </p>
            ) : (
              <p className="text-slate-500">Click an open parking bay to select it.</p>
            )}
          </div>
          
          <button 
            onClick={handleBook}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold uppercase tracking-widest rounded-xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_10px_40px_rgba(245,158,11,0.5)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:shadow-none disabled:-translate-y-0 disabled:cursor-not-allowed"
            disabled={!selectedSlot || !vehicle}
          >
            Confirm Reservation
          </button>
        </div>

        {bookingMessage && (
          <div className="fixed bottom-6 right-6 p-4 rounded-xl bg-emerald-500 border border-emerald-400 text-white shadow-2xl flex items-center justify-center gap-3 w-80 animate-in slide-in-from-right fade-in zoom-in duration-300 z-50">
            <CheckCircle2 size={24} className="text-emerald-100" />
            <div className="font-medium text-sm">{bookingMessage}</div>
          </div>
        )}

      </div>

      {showTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-amber-100 w-80 rounded-xl overflow-hidden animate-in slide-in-from-top-10 zoom-in-95 duration-500 relative flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Ticket Header */}
            <div className="bg-slate-900 p-4 border-b-[3px] border-dashed border-slate-500 flex justify-between items-center text-white relative z-10">
              <h3 className="font-black tracking-widest uppercase">Parking Ticket</h3>
              <Car className="text-yellow-400" />
            </div>
            
            {/* Ticket Body */}
            <div className="p-6 pb-2 flex flex-col gap-5 text-slate-800 relative z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg backdrop-blur-sm border border-slate-200">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Bay</span>
                <span className="text-4xl font-mono font-black text-slate-900">{selectedSlot}</span>
              </div>
              
              <div className="w-full h-px bg-slate-300 shadow-sm"></div>
              
              <div className="px-2">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Vehicle Plate</span>
                <span className="text-xl font-mono font-bold tracking-wider">{vehicle}</span>
              </div>
              
              <div className="flex justify-between px-2">
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Entry</span>
                  <span className="font-mono font-bold text-lg">{`${parseInt(startHour, 10)}:${startMin} ${startAmPm}`}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Exit</span>
                  <span className="font-mono font-bold text-lg text-emerald-700">{`${parseInt(endHour, 10)}:${endMin} ${endAmPm}`}</span>
                </div>
              </div>
              
              {/* Barcode line mock */}
              <div className="mt-4 flex flex-col items-center">
                <div className="w-full h-12 flex space-x-[2px] justify-center opacity-80 mix-blend-multiply px-4">
                  <div className="w-2 bg-slate-900 h-full"></div>
                  <div className="w-1 bg-slate-900 h-full"></div>
                  <div className="w-3 bg-slate-900 h-full"></div>
                  <div className="w-1 bg-slate-900 h-full"></div>
                  <div className="w-1 bg-slate-900 h-full"></div>
                  <div className="w-4 bg-slate-900 h-full"></div>
                  <div className="w-2 bg-slate-900 h-full"></div>
                  <div className="w-1 bg-slate-900 h-full"></div>
                  <div className="w-2 bg-slate-900 h-full"></div>
                  <div className="w-3 bg-slate-900 h-full"></div>
                  <div className="w-1 bg-slate-900 h-full"></div>
                  <div className="w-2 bg-slate-900 h-full"></div>
                  <div className="w-1 bg-slate-900 h-full"></div>
                  <div className="w-3 bg-slate-900 h-full"></div>
                  <div className="w-2 bg-slate-900 h-full"></div>
                </div>
                <span className="text-[11px] tracking-[0.3em] font-mono mt-2 opacity-60 font-bold">TK-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>

            {/* Ticket Footer / Action */}
            <div className="p-5 pt-4 relative z-10 bg-amber-100/90 backdrop-blur-sm">
              <button 
                onClick={() => navigate(`/details/${selectedSlot}`)}
                className="w-full bg-slate-900 text-yellow-400 font-extrabold py-3.5 mt-2 rounded-lg uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border border-slate-700 flex justify-center items-center gap-2"
              >
                <span>Done</span>
              </button>
            </div>
            
            {/* Cutouts for the ticket look */}
            <div className="absolute top-[52px] -left-4 w-8 h-8 bg-black/60 rounded-full z-[101] backdrop-blur-sm shadow-inner hidden"></div>
            <div className="absolute top-[52px] -right-4 w-8 h-8 bg-black/60 rounded-full z-[101] backdrop-blur-sm shadow-inner hidden"></div>
          </div>
        </div>
      )}

    </div>
  );
}
