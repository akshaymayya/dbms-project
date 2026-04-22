import './style.css';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const parkingGrid = document.getElementById('parking-grid');
const bookBtn = document.getElementById('book-btn');
const plateInput = document.getElementById('plate-input');

// Layout Definition
const rows = ['A', 'B', 'C'];
const columns = 12;

let occupiedSlots = new Set();
let selectedSlot = null;

const carSvg = `<svg class="w-6 h-6 text-red-500 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10h1.28a3.001 3.001 0 005.44 0h2.56a3.001 3.001 0 005.44 0H18V9l-3-4H3zM4 6h9l2.25 3H4V6z"/></svg>`;

async function loadBookings() {
  const { data, error } = await supabase.from('bookings').select('slot_id');
  if (error) {
    console.error("Error fetching bookings:", error);
    return;
  }
  if (data) {
    data.forEach(booking => occupiedSlots.add(booking.slot_id));
  }
  initGrid();
}

function initGrid() {
  parkingGrid.innerHTML = '';
  
  rows.forEach((rowLetter, index) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'flex gap-3 items-center';
    
    for (let c = 1; c <= columns; c++) {
      const slotId = `${rowLetter}${c}`;
      const btn = document.createElement('button');
      btn.className = 'w-[60px] h-[80px] rounded border-2 text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center hover:-translate-y-1 relative';
      
      if (occupiedSlots.has(slotId)) {
        btn.classList.add('border-dashed', 'border-red-500/40', 'bg-red-900/10', 'cursor-not-allowed');
        btn.innerHTML = `<span class="text-red-400 absolute top-2">${slotId}</span><div class="mt-4">${carSvg}</div>`;
        btn.disabled = true;
      } else {
        btn.classList.add('border-dashed', 'border-slate-600', 'text-slate-400', 'hover:border-slate-400', 'hover:text-slate-200', 'bg-transparent');
        btn.innerHTML = `<span>${slotId}</span>`;
        btn.addEventListener('click', () => selectSlot(slotId, btn));
      }
      
      btn.dataset.slotId = slotId;
      rowEl.appendChild(btn);
    }
    
    parkingGrid.appendChild(rowEl);
    
    if (index < rows.length - 1) {
      const divider = document.createElement('div');
      divider.className = 'w-full h-0 my-2 border-b-2 border-dashed border-yellow-700/30';
      parkingGrid.appendChild(divider);
    }
  });
}

function selectSlot(slotId, btnElement) {
  if (selectedSlot) {
    const prevBtn = document.querySelector(`button[data-slot-id="${selectedSlot}"]`);
    if (prevBtn) {
      prevBtn.classList.remove('border-yellow-500', 'text-yellow-500', 'border-solid');
      prevBtn.classList.add('border-dashed', 'border-slate-600', 'text-slate-400');
    }
  }

  if (selectedSlot === slotId) {
    selectedSlot = null;
  } else {
    selectedSlot = slotId;
    btnElement.classList.remove('border-dashed', 'border-slate-600', 'text-slate-400');
    btnElement.classList.add('border-solid', 'border-yellow-500', 'text-yellow-500');
  }
}

function convertTo24Hour(hh, mm, ampm) {
  let hours = parseInt(hh, 10);
  if (ampm.toLowerCase() === 'pm' && hours < 12) hours += 12;
  if (ampm.toLowerCase() === 'am' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${mm.padStart(2, '0')}:00`;
}

bookBtn.addEventListener('click', async () => {
  if (!selectedSlot) {
    alert("Please select a slot from the grid first!");
    return;
  }
  if (!plateInput.value.trim()) {
    alert("Please enter your Vehicle Plate number.");
    return;
  }
  
  bookBtn.disabled = true;
  bookBtn.innerHTML = 'Booking...';

  const startTime = convertTo24Hour(
    document.getElementById('entry-hh').value,
    document.getElementById('entry-mm').value,
    document.getElementById('entry-ampm').value
  );
  
  const endTime = convertTo24Hour(
    document.getElementById('exit-hh').value,
    document.getElementById('exit-mm').value,
    document.getElementById('exit-ampm').value
  );

  const loggedInUsername = localStorage.getItem('username') || 'Logged In User';

  const newBooking = {
    slot_id: selectedSlot,
    customer_name: loggedInUsername,
    vehicle_number: plateInput.value.trim(),
    start_time: startTime,
    end_time: endTime
  };

  const { error } = await supabase.from('bookings').insert([newBooking]);

  if (error) {
    console.error(error);
    alert("Failed to book slot! See console for details.");
  } else {
    alert(`Successfully booked Slot ${selectedSlot} for vehicle ${newBooking.vehicle_number}`);
    occupiedSlots.add(selectedSlot);
    selectedSlot = null;
    plateInput.value = '';
    initGrid();
  }

  bookBtn.disabled = false;
  bookBtn.innerHTML = 'Book Selected';
});

// Logout logic
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
  });
}

// Start up
loadBookings();
