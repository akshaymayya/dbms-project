import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      navigate('/admin');
    } else {
      alert('Invalid admin password');
      setPassword('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} /> Back to Customer Login
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center">
              Admin Portal
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Admin Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-slate-100 placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/25 transition-all text-center"
            >
              Access Admin Board
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
