/**
 * login.js — Login & Register page logic.
 * Handles form switching, validation, and API calls for auth.
 */

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (user) {
    window.location.href = user.role === 'ADMIN' ? 'admin.html' : 'index.html';
    return;
  }

  const clearLoginFields = () => {
    const u = document.getElementById('loginUsername');
    const p = document.getElementById('loginPassword');
    if (u) u.value = '';
    if (p) p.value = '';
  };

  clearLoginFields();
  setTimeout(clearLoginFields, 100);
  setTimeout(clearLoginFields, 300);

  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('loginUsername').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('regConfirm').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister();
  });
});
// ── Show/Hide Sections ────────────────────────────────────────────────────────
function showRegister() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'block';
}

function showLogin() {
  document.getElementById('registerSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function handleLogin() {
  // Clear previous errors
  clearErrors(['loginUsernameError', 'loginPasswordError']);
  hideMsg('loginError');

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Validate inputs
  let valid = true;
  if (!username) { showFieldError('loginUsernameError'); valid = false; }
  if (!password) { showFieldError('loginPasswordError'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Show error from server
      showMsg('loginError', data.error || 'Login failed');
      return;
    }

    // Success — store user and redirect
    setCurrentUser(data);
    showToast(`Welcome back, ${data.username}!`, 'success');

    // Redirect admin to admin dashboard, others to home
    setTimeout(() => {
      window.location.href = data.role === 'ADMIN' ? 'admin.html' : 'index.html';
    }, 700);

  } catch (err) {
    console.error(err);
    showMsg('loginError', 'Cannot connect to server. Is the backend running?');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In →';
  }
}

// ── Register ──────────────────────────────────────────────────────────────────
async function handleRegister() {
  clearErrors(['regUsernameError', 'regEmailError', 'regPasswordError', 'regConfirmError']);
  hideMsg('regError');
  hideMsg('regSuccess');

  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;

  // Validation
  let valid = true;
  if (!username) { showFieldError('regUsernameError'); valid = false; }
  if (!email || !isValidEmail(email)) { showFieldError('regEmailError'); valid = false; }
  if (!password || password.length < 6) { showFieldError('regPasswordError'); valid = false; }
  if (password !== confirm) { showFieldError('regConfirmError'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('regBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account…';

  try {
    // Assign ADMIN role if username is "admin" (for demo purposes)
    const role = username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER';

    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      showMsg('regError', data.error || 'Registration failed');
      return;
    }

    // Show success, switch to login after a moment
    showMsg('regSuccess', '✓ Account created! You can now sign in.');
    showToast('Account created successfully!', 'success');
    setTimeout(() => showLogin(), 1800);

  } catch (err) {
    console.error(err);
    showMsg('regError', 'Cannot connect to server. Is the backend running?');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account →';
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function showFieldError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function clearErrors(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
}

function showMsg(id, text) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'block'; el.textContent = text; }
}

function hideMsg(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
