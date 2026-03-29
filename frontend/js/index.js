/**
 * index.js — Home page logic.
 * Fetches and displays approved opportunities, handles search/filter and save.
 */

let allOpportunities = []; // Cache for client-side filtering
let savedIds = [];         // IDs of opportunities saved by current user

// ── Initialization ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar('home');
  await loadOpportunities();
  await loadSavedIds();
  renderGrid(allOpportunities);
});

// ── Load Opportunities from API ──────────────────────────────────────────────
async function loadOpportunities() {
  try {
    const res = await fetch(`${API_BASE}/opportunities`);
    if (!res.ok) throw new Error('Failed to fetch opportunities');
    allOpportunities = await res.json();
  } catch (err) {
    console.error(err);
    showToast('Could not load opportunities. Is the backend running?', 'error');
    allOpportunities = [];
  }
}

// ── Load Saved IDs for current user ─────────────────────────────────────────
async function loadSavedIds() {
  const user = getCurrentUser();
  if (!user) return;
  try {
    const res = await fetch(`${API_BASE}/saved?username=${user.username}`);
    if (res.ok) {
      const saved = await res.json();
      savedIds = saved.map(o => o.id);
    }
  } catch (err) {
    console.error('Could not load saved IDs', err);
  }
}

// ── Render Opportunities Grid ────────────────────────────────────────────────
function renderGrid(opps) {
  const grid = document.getElementById('opportunitiesGrid');
  const countLabel = document.getElementById('countLabel');

  countLabel.textContent = opps.length;

  if (opps.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">📭</div>
        <h3>No opportunities found</h3>
        <p>Try adjusting your search filters or check back later.</p>
      </div>
    `;
    return;
  }

  // Render each card with save button
  grid.innerHTML = opps.map(opp =>
    renderOpportunityCard(opp, {
      showSaveBtn: true,
      savedIds: savedIds,
    })
  ).join('');
}

// ── Filter Opportunities (client-side) ───────────────────────────────────────
function filterOpportunities() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const category = document.getElementById('categoryFilter').value;
  const location = document.getElementById('locationFilter').value.toLowerCase();

  let filtered = allOpportunities;

  if (query) {
    filtered = filtered.filter(o =>
      (o.title || '').toLowerCase().includes(query) ||
      (o.company || '').toLowerCase().includes(query) ||
      (o.location || '').toLowerCase().includes(query) ||
      (o.description || '').toLowerCase().includes(query)
    );
  }

  if (category) {
    filtered = filtered.filter(o => o.category === category);
  }

  if (location) {
    filtered = filtered.filter(o =>
      (o.location || '').toLowerCase().includes(location)
    );
  }

  renderGrid(filtered);
}

// ── Toggle Save / Unsave ─────────────────────────────────────────────────────
async function toggleSave(oppId, btn) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to save opportunities', 'error');
    setTimeout(() => window.location.href = 'login.html', 1200);
    return;
  }

  const isSaved = savedIds.includes(oppId);

  try {
    if (isSaved) {
      // Unsave: DELETE /save
      const res = await fetch(`${API_BASE}/save`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, opportunityId: oppId }),
      });
      if (!res.ok) throw new Error('Failed to unsave');
      savedIds = savedIds.filter(id => id !== oppId);
      btn.className = 'btn btn-primary btn-sm';
      btn.textContent = '+ Save';
      showToast('Removed from saved', 'info');
    } else {
      // Save: POST /save
      const res = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, opportunityId: oppId }),
      });
      if (!res.ok) throw new Error('Failed to save');
      savedIds.push(oppId);
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = '🔖 Saved';
      showToast('Opportunity saved!', 'success');
    }
  } catch (err) {
    console.error(err);
    showToast('Something went wrong', 'error');
  }
}
