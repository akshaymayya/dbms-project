let slots = JSON.parse(localStorage.getItem("slots")) || [];
let bookedSlots = JSON.parse(localStorage.getItem("bookedSlots")) || {}; 
let history = JSON.parse(localStorage.getItem("history")) || [];

function checkSlotStatus() {
    const slot = document.getElementById("slot").value.trim();
    const statusEl = document.getElementById("slotStatus");
    if (!statusEl) return;

    if (slot === "") {
        statusEl.textContent = "";
        return;
    }

    if (!slots.includes(slot)) {
        statusEl.style.color = "orange";
        statusEl.textContent = ` Slot "${slot}" does not exist. Add it via Admin.`;
    } else if (bookedSlots[slot]) {
        statusEl.style.color = "red";
        statusEl.textContent = ` Slot "${slot}" is already booked by ${bookedSlots[slot].name}.`;
    } else {
        statusEl.style.color = "green";
        statusEl.textContent = ` Slot "${slot}" is available!`;
    }
}

function bookSlot() {
    const name = document.getElementById("name").value.trim();
    const vehicle = document.getElementById("vehicle").value.trim();
    const slot = document.getElementById("slot").value.trim();

    if (name === "" || vehicle === "" || slot === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (!slots.includes(slot)) {
        alert(`Slot "${slot}" does not exist. Please ask Admin to add it first.`);
        return;
    }

    if (bookedSlots[slot]) {
        alert(`Slot "${slot}" is already booked by ${bookedSlots[slot].name}!`);
        return;
    }

    bookedSlots[slot] = { name, vehicle, time: new Date().toLocaleString() };
    localStorage.setItem("bookedSlots", JSON.stringify(bookedSlots));

    const entry = `${name} (${vehicle}) booked slot ${slot} on ${new Date().toLocaleString()}`;
    history.push(entry);
    localStorage.setItem("history", JSON.stringify(history));

    alert(`Slot ${slot} booked successfully for ${name}!`);

    document.getElementById("name").value = "";
    document.getElementById("vehicle").value = "";
    document.getElementById("slot").value = "";
    const statusEl = document.getElementById("slotStatus");
    if (statusEl) statusEl.textContent = "";

    displaySlots();
}

function addSlot() {
    const slot = document.getElementById("newSlot").value.trim();

    if (slot === "") {
        alert("Enter a slot number");
        return;
    }

    if (slots.includes(slot)) {
        alert("Slot already exists!");
        return;
    }

    slots.push(slot);
    localStorage.setItem("slots", JSON.stringify(slots));
    document.getElementById("newSlot").value = "";
    displaySlots();
}

function removeSlot() {
    const slotInput = document.getElementById("removeSlot").value.trim();

    if (slotInput === "") {
        alert("Enter a slot number to remove");
        return;
    }

    const index = slots.indexOf(slotInput);
    if (index === -1) {
        alert("Slot not found!");
        return;
    }

    if (bookedSlots[slotInput]) {
        if (!confirm(`Slot "${slotInput}" is currently booked by ${bookedSlots[slotInput].name}. Remove anyway?`)) return;
        delete bookedSlots[slotInput];
        localStorage.setItem("bookedSlots", JSON.stringify(bookedSlots));
    }

    slots.splice(index, 1);
    localStorage.setItem("slots", JSON.stringify(slots));
    document.getElementById("removeSlot").value = "";
    alert(`Slot ${slotInput} removed!`);
    displaySlots();
}

function displaySlots() {
    const list = document.getElementById("slotList");
    if (!list) return;

    list.innerHTML = "";

    if (slots.length === 0) {
        list.innerHTML = "<li>No slots added yet.</li>";
        return;
    }

    slots.forEach((s) => {
        const li = document.createElement("li");
        const isBooked = bookedSlots[s];
        li.style.color = isBooked ? "red" : "green";
        li.innerText = isBooked
            ? `${s} — Booked by ${isBooked.name} (${isBooked.vehicle})`
            : `${s} — Available`;
        list.appendChild(li);
    });
}

function displayHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;

    list.innerHTML = "";

    if (history.length === 0) {
        list.innerHTML = "<li>No bookings yet.</li>";
        return;
    }

    [...history].reverse().forEach((h) => {
        const li = document.createElement("li");
        li.innerText = h;
        list.appendChild(li);
    });
}

function clearHistory() {
    if (confirm("Clear all booking history?")) {
        history = [];
        localStorage.setItem("history", JSON.stringify(history));
        displayHistory();
    }
}

window.onload = function () {
    displaySlots();
    displayHistory();

    const slotInput = document.getElementById("slot");
    if (slotInput) {
        slotInput.addEventListener("input", checkSlotStatus);
    }
};