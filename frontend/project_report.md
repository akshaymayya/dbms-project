# Parking Management System - Final Project Report

## 1. Project Overview
The Parking Management System is a modern, responsive web application designed to streamline the process of reserving and managing parking slots. The application provides a seamless experience for end-users to book available parking spots, while granting administrators a dedicated dashboard to overview and manage the entirely of the parking grid's activity. The system uses a dynamic, movie-seat-style selection interface set in a sleek, dark-themed UI to enhance user engagement and visual appeal.

## 2. Technology Stack
The project is built on a lightweight, highly efficient modern web architecture. It does not rely on heavy frontend frameworks like React or Angular, resulting in incredibly fast load times and straightforward DOM manipulation.

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+).
- **Styling**: Tailwind CSS (used dynamically via class utilities to enforce a uniform design system, particularly for the dark-mode aesthetic).
- **Build Tool / Dev Server**: Vite (provides fast hot-module replacement and bundles the JavaScript modules).
- **Backend / Database**: Supabase (an open-source Firebase alternative utilizing PostgreSQL). Supabase is used primarily for persistent storage of booking records.

## 3. System Architecture & Flow
The application operates on a client-server architecture where the frontend directly communicates with the Supabase backend via the `@supabase/supabase-js` client library.

1. **Authentication Flow**:
    - **User**: Navigation to the system initially redirects the user to the `login.html` page. Upon entering credentials, the system mocks a login by storing the username in the browser's `localStorage` and flagging the session as logged in.
    - **Admin**: The admin portal (`admin.html`) is protected by a session-based password prompt (`sessionStorage`). Logging in as an admin provides privileged access to system-wide data.
2. **Booking Flow**: 
    - The main parking page initializes by fetching all active bookings from the `bookings` table via Supabase.
    - It populates a grid (Rows A, B, C with 12 columns each). Slots matching the `slot_id` from the database are marked as "Occupied" and visually distinct (red border with a car icon), making them unselectable.
    - The user selects an open slot, inputs vehicle details, entry and exit times, and submits the form.
    - The application converts the times to a 24-hour format and inserts a new JSON record into the Supabase database.
    - On success, the UI refreshes the grid, preventing double booking.
3. **Administration Flow**:
    - The admin dashboard retrieves the entire list of bookings from the database, ordered chronologically.
    - Admin users can visually trace the `slot_id`, `vehicle_number`, `start_time`, and `end_time` of every active session.
    - A "Remove" action is provided to delete a specific booking via its ID, effectively releasing the parking slot for future use.

## 4. Features & Functionality
- **Dynamic Slot Grid**: Visual representation of the parking lot. Differentiates states by color: Open (slate/dashed), Selected (yellow), Occupied (red with icon).
- **Client-side Session Integrity**: Basic login persistence utilizing `localStorage` and `sessionStorage` preventing unauthenticated access to the booking grid and admin dash.
- **Time Parsing Logic**: Custom logic to convert 12-hour AM/PM user input into standardized 24-hour time arrays for the database.
- **Real-Time Data Access**: Booking statuses reflect the absolute truth of the Supabase PostgreSQL instance upon page load.
- **Responsive Design**: Designed with Tailwind's utility classes to gracefully handle scaling and alignment.

## 5. File Structure
The project is organized efficiently using Vite's standardized structure:

- `index.html`: The main entry point for the user-facing booking system. Includes grid and booking form logic.
- `login.html`: The user login page.
- `admin.html`: The admin-facing dashboard for monitoring and removing active records.
- `/src/main.js`: Main logic for the user application. Handles database initialization, dynamic grid rendering, time conversion, and insertion of new bookings into Supabase.
- `/src/login.js`: Handles caching the user's session variables.
- `/src/admin.js`: Dedicated logic for fetching and rendering all bookings in a table and processing delete requests.
- `/src/style.css`: Base CSS imports for Tailwind.
- `vite.config.js` & `tailwind.config.js`: Configuration files dictating the bundling process and CSS design rules.

## 6. Database Schema (Supabase)
The application relies on a `bookings` table within the Supabase PostgreSQL database. The schema structure inferred is:
- `id`: Primary Key, unique identifier for the booking.
- `slot_id`: String (e.g., 'A1', 'B5'). The specific parking slot being reserved.
- `customer_name`: String. Inherited from the username entered during login.
- `vehicle_number`: String. License plate of the car parking.
- `start_time`: Time (24h format).
- `end_time`: Time (24h format).
- `created_at`: Timestamp. Automatically injected when the record is created. Used to order the admin table.
