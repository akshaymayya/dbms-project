import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ShieldCheck, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
      const bookedSlots = JSON.parse(localStorage.getItem('bookedSlots')) || {};
      const myBookings = Object.entries(bookedSlots).filter(([slot, data]) => data.name === user.name).map(([slot]) => slot);
      setUserBookings(myBookings);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl tracking-wider">
          <Car size={28} /> PARKING PRO
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/admin-login')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Admin</button>
          {currentUser ? (
            <button onClick={() => navigate('/booking')} className="text-slate-200 hover:text-yellow-400 font-medium transition-colors text-sm">Dashboard</button>
          ) : (
            <button onClick={() => navigate('/auth')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700">Sign In</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 z-10 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
          Smart Parking,<br/>Made Simple.
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 z-10 leading-relaxed">
          Reserve your parking spot securely in seconds. Stop circling the lot and arrive with peace of mind knowing your bay is waiting for you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 z-10 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/booking')}
            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold uppercase tracking-widest rounded-xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            Book a Slot <ArrowRight size={20} />
          </button>
          
          {userBookings.length > 0 && (
            <button 
              onClick={() => navigate(`/details/${userBookings[0]}`)}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest rounded-xl border border-slate-700 transition-all shadow-lg hover:-translate-y-1"
            >
              View My Booking
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 border-t border-slate-700/50 py-24 px-6 z-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">Everything You Need</h2>
            <p className="text-slate-400">Streamlined features tailored for a perfect parking experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700/50 hover:border-yellow-500/30 transition-colors shadow-xl group">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Lot View</h3>
              <p className="text-slate-400 leading-relaxed">See the entire parking complex in real-time. Choose your exact bay from our interactive top-down diagram.</p>
            </div>

            <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors shadow-xl group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Timings</h3>
              <p className="text-slate-400 leading-relaxed">State exactly when you'll arrive and leave. Running late? Easily request an extension from your digital receipt.</p>
            </div>

            <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-colors shadow-xl group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Reservations</h3>
              <p className="text-slate-400 leading-relaxed">Your bay is completely locked in. Only the assigned administrator can clear or override verified parking assets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 text-center text-sm text-slate-500 border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} Parking Pro Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
