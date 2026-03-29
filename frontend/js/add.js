/**
 * add.js — Add Opportunity page logic.
 * Handles form validation and POST to /opportunities API.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (requireLogin()) return;

  initNavbar('add');

  const form = document.getElementById('addForm');
  form.addEventListener('submit', handleSubmit);
});
// ── Form Submission ──────────────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();

  // Validate form first
  if (!validateForm()) return;

  const user = getCurrentUser();
  const submitBtn = document.getElementById('submitBtn');

  // Gather form values
  const opportunity = {
    title:       document.getElementById('title').value.trim(),
    company:     document.getElementById('company').value.trim(),
    location:    document.getElementById('location').value.trim(),
    link:        document.getElementById('link').value.trim(),
    category:    document.getElementById('category').value,
    stipend:     document.getElementById('stipend').value.trim(),
    duration:    document.getElementById('duration').value.trim(),
    description: document.getElementById('description').value.trim(),
    postedBy: user.username,
  };

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  try {
    const res = await fetch(`${API_BASE}/opportunities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity),
    });

    if (!res.ok) throw new Error('Server error');

    // Success feedback
    showFormMessage('✓ Opportunity submitted! It will appear after admin approval.', 'success');
    document.getElementById('addForm').reset();
    showToast('Opportunity submitted for review!', 'success');

  } catch (err) {
    console.error(err);
    showFormMessage('Failed to submit. Please make sure the backend server is running.', 'error');
    showToast('Submission failed', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '🚀 Submit Opportunity';
  }
}

// ── Form Validation ──────────────────────────────────────────────────────────
function validateForm() {
  let valid = true;

  // Title
  const title = document.getElementById('title').value.trim();
  setError('titleError', !title);
  if (!title) valid = false;

  // Company
  const company = document.getElementById('company').value.trim();
  setError('companyError', !company);
  if (!company) valid = false;

  // Location
  const location = document.getElementById('location').value.trim();
  setError('locationError', !location);
  if (!location) valid = false;

  // Link — must be a valid URL
  const link = document.getElementById('link').value.trim();
  const linkValid = link && isValidUrl(link);
  setError('linkError', !linkValid);
  if (!linkValid) valid = false;

  return valid;
}

/**
 * Show or hide a validation error element.
 */
function setError(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show', show);
}

/**
 * Simple URL validation.
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Display a form-level message (success or error).
 */
function showFormMessage(msg, type) {
  const el = document.getElementById('formMessage');
  el.style.display = 'block';
  el.style.padding = '12px 16px';
  el.style.borderRadius = 'var(--radius-sm)';
  el.style.fontSize = '0.875rem';
  el.style.fontWeight = '500';
  if (type === 'success') {
    el.style.background = 'rgba(52,211,153,0.1)';
    el.style.color = 'var(--green)';
    el.style.border = '1px solid rgba(52,211,153,0.3)';
  } else {
    el.style.background = 'rgba(248,113,113,0.1)';
    el.style.color = 'var(--red)';
    el.style.border = '1px solid rgba(248,113,113,0.3)';
  }
  el.textContent = msg;
}
