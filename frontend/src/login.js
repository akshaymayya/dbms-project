import './style.css';
const form = document.getElementById('login-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  // Simply mock login for now. 
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('username', username);
  window.location.href = '/';
});
