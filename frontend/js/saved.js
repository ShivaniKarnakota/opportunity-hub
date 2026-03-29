/**
 * saved.js — Saved Opportunities page logic.
 * Loads bookmarked opportunities for the current user and allows removal.
 */

let allSaved = []; // Cache of saved opportunities

// ── Initialization ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (requireLogin()) return;

  initNavbar('saved');
  await loadSaved();
});
// ── Load Saved Opportunities from API ────────────────────────────────────────
async function loadSaved() {
  const user = getCurrentUser();
  const grid = document.getElementById('savedGrid');

  try {
    const res = await fetch(`${API_BASE}/saved?username=${encodeURIComponent(user.username)}`);
    if (!res.ok) throw new Error('Failed to fetch saved');
    allSaved = await res.json();
    renderSaved(allSaved);
  } catch (err) {
    console.error(err);
    showToast('Could not load saved opportunities', 'error');
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load</h3>
        <p>Make sure the backend server is running on port 8080.</p>
      </div>
    `;
  }
}

// ── Render Saved Grid ────────────────────────────────────────────────────────
function renderSaved(opps) {
  const grid = document.getElementById('savedGrid');
  const countLabel = document.getElementById('countLabel');

  countLabel.textContent = opps.length;

  if (opps.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">🔖</div>
        <h3>No saved opportunities yet</h3>
        <p>Browse the <a href="index.html">home page</a> and save opportunities you're interested in.</p>
      </div>
    `;
    return;
  }

  // Render with unsave button instead of save button
  grid.innerHTML = opps.map(opp => `
    <div class="card opp-card" data-id="${opp.id}" id="card-${opp.id}">
      <div class="opp-card-header">
        <div class="opp-card-info">
          <h3>${opp.title}</h3>
          <div class="company">🏢 ${opp.company}</div>
        </div>
        <span class="status-badge status-${(opp.status || 'approved').toLowerCase()}">${opp.status || 'APPROVED'}</span>
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
          ${opp.link ? `<a href="${opp.link}" target="_blank" class="btn btn-ghost btn-sm">Apply ↗</a>` : ''}
          <button class="btn btn-danger btn-sm" onclick="unsave('${opp.id}')">
            🗑 Remove
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Filter Saved (client-side) ───────────────────────────────────────────────
function filterSaved() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  if (!query) {
    renderSaved(allSaved);
    return;
  }
  const filtered = allSaved.filter(o =>
    (o.title    || '').toLowerCase().includes(query) ||
    (o.company  || '').toLowerCase().includes(query) ||
    (o.location || '').toLowerCase().includes(query)
  );
  renderSaved(filtered);
}

// ── Unsave (Remove Bookmark) ─────────────────────────────────────────────────
async function unsave(oppId) {
  const user = getCurrentUser();

  try {
    const res = await fetch(`${API_BASE}/save`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, opportunityId: oppId }),
    });

    if (!res.ok) throw new Error('Failed to unsave');

    // Remove from local cache and re-render
    allSaved = allSaved.filter(o => o.id !== oppId);

    // Animate removal
    const card = document.getElementById(`card-${oppId}`);
    if (card) {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => renderSaved(allSaved), 300);
    } else {
      renderSaved(allSaved);
    }

    showToast('Removed from saved', 'info');
  } catch (err) {
    console.error(err);
    showToast('Failed to remove', 'error');
  }
}
