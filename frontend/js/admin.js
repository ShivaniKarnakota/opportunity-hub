/**
 * admin.js — Admin Dashboard page logic.
 * Loads all opportunities, shows stats, and allows approve/reject/delete.
 */

let allOpps = [];       // All opportunities (cached)
let currentTab = 'all'; // Active tab filter

// ── Initialization ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (requireAdmin()) return;

  initNavbar('admin');
  await loadAll();
});

// ── Load All Opportunities ───────────────────────────────────────────────────
async function loadAll() {
  try {
    const res = await fetch(`${API_BASE}/opportunities/all`);
    if (!res.ok) throw new Error('Failed to fetch');
    allOpps = await res.json();
    updateStats();
    renderAdmin(getFiltered());
  } catch (err) {
    console.error(err);
    showToast('Failed to load opportunities. Is the backend running?', 'error');
    document.getElementById('adminGrid').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">⚠️</div>
        <h3>Could not connect to backend</h3>
        <p>Make sure the Spring Boot server is running on port 8080.</p>
      </div>
    `;
  }
}

// ── Update Stats Cards ───────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('statTotal').textContent    = allOpps.length;
  document.getElementById('statPending').textContent  = allOpps.filter(o => o.status === 'PENDING').length;
  document.getElementById('statApproved').textContent = allOpps.filter(o => o.status === 'APPROVED').length;
  document.getElementById('statRejected').textContent = allOpps.filter(o => o.status === 'REJECTED').length;
}

// ── Switch Tabs ──────────────────────────────────────────────────────────────
function switchTab(tab, btn) {
  currentTab = tab;

  // Update active button style
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  renderAdmin(getFiltered());
}

// ── Get Filtered List ────────────────────────────────────────────────────────
function getFiltered() {
  const query = (document.getElementById('adminSearch').value || '').toLowerCase().trim();
  let list = allOpps;

  // Tab filter
  if (currentTab !== 'all') {
    list = list.filter(o => o.status === currentTab);
  }

  // Search filter
  if (query) {
    list = list.filter(o =>
      (o.title   || '').toLowerCase().includes(query) ||
      (o.company || '').toLowerCase().includes(query) ||
      (o.postedBy|| '').toLowerCase().includes(query)
    );
  }

  return list;
}

// ── Filter on Search Input ───────────────────────────────────────────────────
function filterAdmin() {
  renderAdmin(getFiltered());
}

// ── Render Admin Grid ────────────────────────────────────────────────────────
function renderAdmin(opps) {
  const grid  = document.getElementById('adminGrid');
  const count = document.getElementById('adminCount');
  count.textContent = opps.length;

  if (opps.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">📋</div>
        <h3>No opportunities found</h3>
        <p>Nothing matches the current filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = opps.map(opp => `
    <div class="card opp-card" id="admincard-${opp.id}">
      <div class="opp-card-header">
        <div class="opp-card-info">
          <h3>${opp.title}</h3>
          <div class="company">🏢 ${opp.company}</div>
          ${opp.postedBy ? `<div style="font-size:0.75rem;color:var(--text-dim);margin-top:3px;">by ${opp.postedBy}</div>` : ''}
        </div>
        <span class="status-badge status-${opp.status.toLowerCase()}">${opp.status}</span>
      </div>

      <div class="opp-card-badges">
        ${opp.location  ? `<span class="badge badge-location">📍 ${opp.location}</span>` : ''}
        ${opp.category  ? `<span class="badge badge-category">${opp.category}</span>` : ''}
        ${opp.stipend   ? `<span class="badge badge-stipend">💰 ${opp.stipend}</span>` : ''}
        ${opp.duration  ? `<span class="badge badge-duration">⏱ ${opp.duration}</span>` : ''}
      </div>

      ${opp.description ? `<p style="font-size:0.875rem;color:var(--text-muted);line-height:1.55;">${truncate(opp.description, 120)}</p>` : ''}

      <div class="opp-card-footer">
        <span class="date">${formatDate(opp.createdAt)}</span>
        <div class="actions">
          ${opp.link ? `<a href="${opp.link}" target="_blank" class="btn btn-ghost btn-sm">View ↗</a>` : ''}
          ${opp.status !== 'APPROVED'  ? `<button class="btn btn-success btn-sm" onclick="updateStatus('${opp.id}', 'APPROVED')">✓ Approve</button>` : ''}
          ${opp.status !== 'REJECTED'  ? `<button class="btn btn-danger btn-sm"  onclick="updateStatus('${opp.id}', 'REJECTED')">✕ Reject</button>`  : ''}
          <button class="btn btn-ghost btn-sm" onclick="deleteOpportunity('${opp.id}')">🗑</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Update Status (Approve / Reject) ─────────────────────────────────────────
async function updateStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/opportunities/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error('Failed to update status');

    // Update local cache
    const opp = allOpps.find(o => o.id === id);
    if (opp) opp.status = status;

    updateStats();
    renderAdmin(getFiltered());

    const label = status === 'APPROVED' ? 'approved' : 'rejected';
    showToast(`Opportunity ${label}!`, status === 'APPROVED' ? 'success' : 'error');
  } catch (err) {
    console.error(err);
    showToast('Failed to update status', 'error');
  }
}

// ── Delete Opportunity ───────────────────────────────────────────────────────
async function deleteOpportunity(id) {
  if (!confirm('Are you sure you want to delete this opportunity?')) return;

  try {
    const res = await fetch(`${API_BASE}/opportunities/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete');

    // Remove from local cache
    allOpps = allOpps.filter(o => o.id !== id);

    // Animate card out
    const card = document.getElementById(`admincard-${id}`);
    if (card) {
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        updateStats();
        renderAdmin(getFiltered());
      }, 300);
    } else {
      updateStats();
      renderAdmin(getFiltered());
    }

    showToast('Opportunity deleted', 'info');
  } catch (err) {
    console.error(err);
    showToast('Failed to delete', 'error');
  }
}
