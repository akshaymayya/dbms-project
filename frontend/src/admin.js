import './style.css';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tableBody = document.getElementById('bookings-table-body');
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem("adminLoggedIn");
    window.location.href = "/login.html";
  });
}

async function loadAllBookings() {
  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error loading bookings:", error);
    if(tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-red-400">Failed to load: ${error.message}</td></tr>`;
    return;
  }
  
  if (!data || data.length === 0) {
    if(tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500">No active bookings found. The parking lot is completely open!</td></tr>`;
    return;
  }
  
  renderTable(data);
}

function renderTable(bookings) {
  if(!tableBody) return;
  tableBody.innerHTML = '';
  
  bookings.forEach(b => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/50 transition-colors duration-150';
    
    const tdSlot = document.createElement('td');
    tdSlot.className = 'px-4 py-3 font-bold text-blue-400';
    tdSlot.textContent = b.slot_id;
    
    const tdVehicle = document.createElement('td');
    tdVehicle.className = 'px-4 py-3 font-mono text-slate-300';
    tdVehicle.textContent = b.vehicle_number;
    
    const tdStart = document.createElement('td');
    tdStart.className = 'px-4 py-3 text-slate-400 font-mono text-xs';
    tdStart.textContent = b.start_time;
    
    const tdEnd = document.createElement('td');
    tdEnd.className = 'px-4 py-3 text-slate-400 font-mono text-xs';
    tdEnd.textContent = b.end_time;
    
    const tdAction = document.createElement('td');
    tdAction.className = 'px-4 py-3 text-right';
    const delBtn = document.createElement('button');
    delBtn.className = 'bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 py-1 px-3 rounded shadow-sm transition-colors text-xs font-bold tracking-wide uppercase';
    delBtn.textContent = 'Remove';
    delBtn.addEventListener('click', () => deleteBooking(b.id));
    tdAction.appendChild(delBtn);
    
    tr.appendChild(tdSlot);
    tr.appendChild(tdVehicle);
    tr.appendChild(tdStart);
    tr.appendChild(tdEnd);
    tr.appendChild(tdAction);
    
    tableBody.appendChild(tr);
  });
}

async function deleteBooking(bookingId) {
  if (!confirm("Are you sure you want to release this parking slot? It will be permanently removed from the database.")) return;
  
  const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
  if (error) {
    alert("Could not remove booking!");
    console.error(error);
  } else {
    loadAllBookings();
  }
}

loadAllBookings();
