import React from 'react';
import { Car } from 'lucide-react';

export default function TicketModal({
  showTicket,
  selectedSlot,
  vehicle,
  startHour,
  startMin,
  startAmPm,
  endHour,
  endMin,
  endAmPm,
  onDone
}) {
  if (!showTicket) return null;

  return (
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
            onClick={onDone}
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
  );
}
