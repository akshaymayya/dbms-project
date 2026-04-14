import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './supabase';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AdminLogin from './pages/AdminLogin';
import Booking from './pages/Booking';
import BookingDetails from './pages/BookingDetails';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ Supabase connection error:", error.message);
        } else {
          console.log("✅ Supabase is connected successfully!", data);
        }
      } catch (err) {
        console.error("❌ Failed to connect to Supabase:", err);
      }
    };
    testConnection();
  }, []);
  return (
    <Router>
      <div className="min-h-screen text-slate-100 selection:bg-teal-500/30">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/details/:slotId" element={<BookingDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
