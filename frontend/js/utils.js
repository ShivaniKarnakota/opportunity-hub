/**
 * utils.js — Shared utility functions used across all pages.
 * Includes: API base URL, toast notifications, auth helpers, navbar setup.
 */

// ── Config ──────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8080';

// ── Toast Notifications ──────────────────────────────────────────────────────
/**
 * Show a toast message at the bottom-right of the screen.
 * @param {string} message - Text to display
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => toast.remove(), 3100);
}

// ── Auth Helpers ─────────────────────────────────────────────────────────────
/**
 * Get current logged-in user object from localStorage.
 * Returns null if not logged in.
 */
function getCurrentUser() {
  const user = localStorage.getItem('ohUser');
  return user ? JSON.parse(user) : null;
}

/**
 * Store user in localStorage after login.
 */
function setCurrentUser(user) {
  localStorage.setItem('ohUser', JSON.stringify(user));
}

/**
 * Clear user from localStorage (logout).
 */
function clearCurrentUser() {
  localStorage.removeItem('ohUser');
}

/**
 * Redirect to login page if user is not logged in.
 */
function requireLogin() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

/**
 * Redirect to login if user is not an admin.
 */
function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    showToast('Admin access required', 'error');
    setTimeout(() => window.location.href = 'login.html', 1200);
    return true;
  }
  return false;
}

// ── Navbar ───────────────────────────────────────────────────────────────────
/**
 * Inject the navbar HTML and set the active link.
 * @param {string} activePage - e.g. 'home', 'add', 'saved', 'admin'
 */
function initNavbar(activePage) {
  const user = getCurrentUser();

  const navHtml = `
    <nav class="navbar">
      <a href="index.html" class="nav-brand">
        <div class="logo-icon">⚡</div>
        OpportunityHub
      </a>
      <div class="nav-links">
        <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">
          🏠 Home
        </a>
        <a href="add.html" class="${activePage === 'add' ? 'active' : ''}">
          ➕ Add Opportunity
        </a>
        <a href="saved.html" class="${activePage === 'saved' ? 'active' : ''}">
          🔖 Saved
        </a>
        ${user && user.role === 'ADMIN' ? `
          <a href="admin.html" class="${activePage === 'admin' ? 'active' : ''}">
            🛡 Admin
          </a>
        ` : ''}
      </div>
      <div class="nav-actions">
        ${user ? `
          <div class="nav-user">
            <div class="avatar">${user.username.charAt(0).toUpperCase()}</div>
            <span>${user.username}</span>
            ${user.role === 'ADMIN' ? '<span style="color:var(--yellow);font-size:0.7rem;font-weight:700;">ADMIN</span>' : ''}
          </div>
          <button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>
        ` : `
          <a href="login.html" class="btn btn-primary btn-sm">Sign In</a>
        `}
      </div>
    </nav>
  `;

  // Insert navbar at the top of body (before page-content)
  const existing = document.querySelector('.navbar');
  if (!existing) {
    document.body.insertAdjacentHTML('afterbegin', navHtml);
  }
}

/**
 * Logout the current user and redirect to login.
 */
function logout() {
  clearCurrentUser();
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = 'login.html', 800);
}

// ── Formatting Helpers ───────────────────────────────────────────────────────
/**
 * Format a date string nicely.
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Truncate text to a max number of characters.
 */
function truncate(text, maxLen = 100) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/**
 * Generate the HTML for an opportunity card.
 * @param {Object} opp - Opportunity object
 * @param {Object} options - { showStatus, showSaveBtn, showAdminBtns, savedIds }
 */
function renderOpportunityCard(opp, options = {}) {
  const { showStatus = false, showSaveBtn = true, showAdminBtns = false, savedIds = [] } = options;
  const isSaved = savedIds.includes(opp.id);

  return `
    <div class="card opp-card" data-id="${opp.id}">
      <div class="opp-card-header">
        <div class="opp-card-info">
          <h3>${opp.title}</h3>
          <div class="company">🏢 ${opp.company}</div>
        </div>
        ${showStatus ? `<span class="status-badge status-${opp.status.toLowerCase()}">${opp.status}</span>` : ''}
      </div>

      <div class="opp-card-badges">
        ${opp.location ? `<span class="badge badge-location">📍 ${opp.location}</span>` : ''}
        ${opp.category ? `<span class="badge badge-category">${opp.category}</span>` : ''}
        ${opp.stipend ? `<span class="badge badge-stipend">💰 ${opp.stipend}</span>` : ''}
        ${opp.duration ? `<span class="badge badge-duration">⏱ ${opp.duration}</span>` : ''}
      </div>

      ${opp.description ? `<p style="font-size:0.875rem;color:var(--text-muted);line-height:1.55;">${truncate(opp.description, 120)}</p>` : ''}

      <div class="opp-card-footer">
        <span class="date">${formatDate(opp.createdAt)}</span>
        <div class="actions">
          ${opp.link ? `<a href="${opp.link}" target="_blank" class="btn btn-ghost btn-sm">Apply ↗</a>` : ''}
          ${showSaveBtn && !showAdminBtns ? `
            <button class="btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-primary'}"
                    onclick="toggleSave('${opp.id}', this)">
              ${isSaved ? '🔖 Saved' : '+ Save'}
            </button>
          ` : ''}
          ${showAdminBtns ? `
            <button class="btn btn-success btn-sm" onclick="updateStatus('${opp.id}', 'APPROVED')">✓ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="updateStatus('${opp.id}', 'REJECTED')">✕ Reject</button>
            <button class="btn btn-ghost btn-sm" onclick="deleteOpportunity('${opp.id}')">🗑</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
