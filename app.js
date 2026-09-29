/**
 * SEO Ideas Hub - Application Logic
 * Passcodes:
 *   Dashboard (Team Entry): 7730
 *   Admin Portal: 8967
 */

// Passcode Configuration
const PASSCODES = {
  team: '7730',
  admin: '8967'
};

// Storage Key
const STORAGE_KEY = 'seo_hub_ideas_v1';
const AUTH_KEY = 'seo_hub_auth_role';

// Initial Sample Data (if first time opening)
const INITIAL_IDEAS = [
  {
    id: 'idea-101',
    name: 'Sumit Gupta',
    email: 'sumit@growthseo.com',
    title: 'Programmatic Landing Pages for Top 500 Competitor Comparison Queries',
    category: 'Content & Keywords',
    description: 'Build automated, high-quality comparison templates (e.g., Brand vs Alternative) leveraging structured data and feature matrices to capture high-intent bottom-of-funnel search volume.',
    impact: 9,
    confidence: 8,
    ease: 7,
    status: 'Go ahead',
    createdAt: '2026-09-28T10:30:00Z',
    adminNotes: 'Approved for Q4 sprint. High conversion intent.'
  },
  {
    id: 'idea-102',
    name: 'Priya Sharma',
    email: 'priya.s@company.in',
    title: 'Core Web Vitals LCP Optimization: Next-gen Image Formats (AVIF/WebP)',
    category: 'UX & Core Web Vitals',
    description: 'Convert all hero banners and blog images to modern AVIF/WebP with explicit width/height and responsive srcset to bring 75th percentile LCP below 2.0s.',
    impact: 8,
    confidence: 9,
    ease: 8,
    status: 'Selected',
    createdAt: '2026-09-28T14:15:00Z',
    adminNotes: 'Dev team scheduled for next week.'
  },
  {
    id: 'idea-103',
    name: 'Arun Verma',
    email: 'arun@searchmarketing.io',
    title: 'Digital PR Campaign: Annual Industry Salary & Trends Benchmark Report',
    category: 'Link Building & PR',
    description: 'Conduct proprietary survey and create interactive charts. Pitch exclusive data to tier-1 publications for high-authority editorial backlinks.',
    impact: 9,
    confidence: 7,
    ease: 5,
    status: 'Route for discussion',
    createdAt: '2026-09-29T08:00:00Z',
    adminNotes: 'Need budget quote from PR agency.'
  },
  {
    id: 'idea-104',
    name: 'Neha Kapoor',
    email: 'neha@company.com',
    title: 'Automated Schema Markup for FAQ and How-To Rich Snippets',
    category: 'Technical SEO',
    description: 'Implement JSON-LD structured data dynamically across product help guides to maximize SERP real estate and click-through rates.',
    impact: 7,
    confidence: 8,
    ease: 9,
    status: 'Discussion',
    createdAt: '2026-09-29T09:45:00Z',
    adminNotes: 'Reviewing recent Google schema guidelines.'
  },
  {
    id: 'idea-105',
    name: 'Vikram Mehta',
    email: 'vikram.m@test.com',
    title: 'Translate Top 50 English Articles to Spanish with AI Translation',
    category: 'International SEO',
    description: 'Directly translate pages without localized keyword research or native human review.',
    impact: 5,
    confidence: 3,
    ease: 7,
    status: 'Rejected',
    createdAt: '2026-09-27T11:20:00Z',
    adminNotes: 'Risk of unhelpful content penalty without native localized optimization.'
  }
];

// Application State
let currentRole = null; // 'team' | 'admin' | null
let selectedLoginChoice = 'team'; // 'team' | 'admin'
let ideas = [];
let currentAdminQuickFilter = 'All';

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadIdeas();
  setupLivePreviewListeners();
  updateIcePreview();

  // Check persisted session auth
  const savedRole = sessionStorage.getItem(AUTH_KEY);
  if (savedRole === 'admin' || savedRole === 'team') {
    unlockPortal(savedRole);
  } else {
    showAuthView();
  }
});

function loadIdeas() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      ideas = JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing ideas from storage, resetting', e);
      ideas = [...INITIAL_IDEAS];
      saveIdeas();
    }
  } else {
    ideas = [...INITIAL_IDEAS];
    saveIdeas();
  }
}

function saveIdeas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  renderAllViews();
}

// Reset to Sample Data
function resetToSampleData() {
  if (confirm('Do you want to restore default sample ideas? This will reset your current list.')) {
    ideas = JSON.parse(JSON.stringify(INITIAL_IDEAS));
    saveIdeas();
    showToast('Reset to sample SEO ideas!', 'success');
  }
}

// ==========================================================================
// Authentication & Portal Switching
// ==========================================================================
function selectLoginRole(role) {
  selectedLoginChoice = role;
  document.getElementById('choiceTeam').classList.toggle('active', role === 'team');
  document.getElementById('choiceAdmin').classList.toggle('active', role === 'admin');

  const label = document.getElementById('loginLabel');
  const hint = document.getElementById('loginHint');
  const input = document.getElementById('passcodeInput');

  if (role === 'team') {
    label.innerText = 'Dashboard Access Password';
    hint.innerHTML = 'Team Entry Passcode: <strong>7730</strong>';
    input.placeholder = 'Enter password (e.g. 7730)';
  } else {
    label.innerText = 'Admin Portal Password';
    hint.innerHTML = 'Admin Passcode: <strong>8967</strong>';
    input.placeholder = 'Enter password (e.g. 8967)';
  }

  document.getElementById('loginError').style.display = 'none';
  input.value = '';
  input.focus();
}

function togglePassVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

function handleLogin(event) {
  event.preventDefault();
  const inputVal = document.getElementById('passcodeInput').value.trim();
  const errorEl = document.getElementById('loginError');

  if (selectedLoginChoice === 'team') {
    if (inputVal === PASSCODES.team) {
      unlockPortal('team');
      showToast('Welcome to SEO Ideas Dashboard!', 'success');
    } else {
      errorEl.innerText = 'Incorrect Dashboard Password. Please use 7730.';
      errorEl.style.display = 'block';
    }
  } else {
    if (inputVal === PASSCODES.admin) {
      unlockPortal('admin');
      showToast('Admin Console Unlocked!', 'success');
    } else {
      errorEl.innerText = 'Incorrect Admin Password. Please use 8967.';
      errorEl.style.display = 'block';
    }
  }
}

function unlockPortal(role) {
  currentRole = role;
  sessionStorage.setItem(AUTH_KEY, role);

  // Update UI Elements
  document.getElementById('authSection').classList.remove('active');
  document.getElementById('portalNav').style.display = 'flex';
  document.getElementById('logoutBtn').style.display = 'inline-flex';

  const adminBadge = document.getElementById('adminBadge');
  if (role === 'admin') {
    adminBadge.innerText = 'Active';
    adminBadge.classList.add('unlocked');
    switchView('admin');
  } else {
    adminBadge.innerText = 'Locked';
    adminBadge.classList.remove('unlocked');
    switchView('team');
  }

  renderAllViews();
}

function logout() {
  currentRole = null;
  sessionStorage.removeItem(AUTH_KEY);
  document.getElementById('portalNav').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
  showAuthView();
  showToast('Logged out successfully.');
}

function showAuthView() {
  hideAllSections();
  document.getElementById('authSection').classList.add('active');
  selectLoginRole(selectedLoginChoice);
}

function switchView(viewName) {
  hideAllSections();
  
  // Navigation Tabs state
  document.getElementById('tabTeam').classList.toggle('active', viewName === 'team');
  document.getElementById('tabFeed').classList.toggle('active', viewName === 'feed');
  document.getElementById('tabAdmin').classList.toggle('active', viewName === 'admin');

  if (viewName === 'team') {
    document.getElementById('teamSection').classList.add('active');
  } else if (viewName === 'feed') {
    document.getElementById('feedSection').classList.add('active');
    renderTeamFeed();
  } else if (viewName === 'admin') {
    document.getElementById('adminSection').classList.add('active');
    renderAdminPortal();
  }
}

function hideAllSections() {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
}

// Admin Modal Gate for direct tab click
function openAdminGate() {
  if (currentRole === 'admin') {
    switchView('admin');
  } else {
    document.getElementById('adminModal').style.display = 'flex';
    document.getElementById('adminModalPass').value = '';
    document.getElementById('adminModalError').style.display = 'none';
    setTimeout(() => document.getElementById('adminModalPass').focus(), 50);
  }
}

function closeAdminGate() {
  document.getElementById('adminModal').style.display = 'none';
}

function handleAdminModalUnlock(event) {
  event.preventDefault();
  const pass = document.getElementById('adminModalPass').value.trim();
  const err = document.getElementById('adminModalError');

  if (pass === PASSCODES.admin) {
    closeAdminGate();
    unlockPortal('admin');
    showToast('Admin Mode Activated!', 'success');
  } else {
    err.innerText = 'Invalid Admin Passcode. Please enter 8967.';
    err.style.display = 'block';
  }
}

// ==========================================================================
// Form Handling & ICE Live Calculations
// ==========================================================================
function updateIcePreview() {
  const imp = parseInt(document.getElementById('impactInput').value, 10) || 1;
  const conf = parseInt(document.getElementById('confidenceInput').value, 10) || 1;
  const ease = parseInt(document.getElementById('easeInput').value, 10) || 1;

  document.getElementById('impactValBadge').innerText = imp;
  document.getElementById('confidenceValBadge').innerText = conf;
  document.getElementById('easeValBadge').innerText = ease;

  document.getElementById('prevImp').innerText = `${imp}/10`;
  document.getElementById('prevConf').innerText = `${conf}/10`;
  document.getElementById('prevEase').innerText = `${ease}/10`;
}

function setupLivePreviewListeners() {
  const titleInput = document.getElementById('ideaTitle');
  const authorInput = document.getElementById('authorName');
  const catSelect = document.getElementById('ideaCategory');
  const descInput = document.getElementById('ideaDesc');

  titleInput.addEventListener('input', (e) => {
    document.getElementById('previewTitle').innerText = e.target.value.trim() || 'Your Idea Title will appear here';
  });

  authorInput.addEventListener('input', (e) => {
    document.getElementById('previewAuthor').innerText = e.target.value.trim() ? `By ${e.target.value.trim()}` : 'By Submitter';
  });

  catSelect.addEventListener('change', (e) => {
    document.getElementById('previewCategory').innerText = e.target.value;
  });

  descInput.addEventListener('input', (e) => {
    document.getElementById('previewDesc').innerText = e.target.value.trim() || 'Description summary will be displayed here as you type...';
  });
}

function handleIdeaSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('authorName').value.trim();
  const email = document.getElementById('authorEmail').value.trim();
  const title = document.getElementById('ideaTitle').value.trim();
  const category = document.getElementById('ideaCategory').value;
  const description = document.getElementById('ideaDesc').value.trim();
  const impact = parseInt(document.getElementById('impactInput').value, 10);
  const confidence = parseInt(document.getElementById('confidenceInput').value, 10);
  const ease = parseInt(document.getElementById('easeInput').value, 10);

  if (!name || !email || !title || !description) {
    showToast('Please fill all required fields.', 'error');
    return;
  }

  const newIdea = {
    id: 'idea-' + Date.now(),
    name,
    email,
    title,
    category,
    description,
    impact,
    confidence,
    ease,
    status: 'Route for discussion', // Default stage status
    createdAt: new Date().toISOString(),
    adminNotes: ''
  };

  ideas.unshift(newIdea);
  saveIdeas();

  // Reset form
  document.getElementById('ideaForm').reset();
  document.getElementById('impactInput').value = 7;
  document.getElementById('confidenceInput').value = 8;
  document.getElementById('easeInput').value = 6;
  updateIcePreview();

  // Reset live preview
  document.getElementById('previewTitle').innerText = 'Your Idea Title will appear here';
  document.getElementById('previewAuthor').innerText = 'By Submitter';
  document.getElementById('previewCategory').innerText = 'Content & Keywords';
  document.getElementById('previewDesc').innerText = 'Description summary will be displayed here as you type...';

  showToast('🎉 SEO Idea submitted successfully! Added to review pipeline.', 'success');
}

// Calculate ICE Score: (Impact + Confidence + Ease) / 3
function calculateIceScore(idea) {
  const sum = (Number(idea.impact) || 0) + (Number(idea.confidence) || 0) + (Number(idea.ease) || 0);
  return (sum / 3).toFixed(1);
}

// ==========================================================================
// Views Rendering
// ==========================================================================
function renderAllViews() {
  document.getElementById('teamTotalCount').innerText = ideas.length;
  renderTeamFeed();
  if (currentRole === 'admin') {
    renderAdminPortal();
  }
}

// Render Team Feed
function renderTeamFeed() {
  const container = document.getElementById('teamFeedContainer');
  if (!container) return;

  if (ideas.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>No ideas submitted yet</h3>
        <p>Be the first one to propose an SEO growth experiment!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = ideas.map(idea => {
    const formattedDate = new Date(idea.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const statusTagClass = getStatusTagClass(idea.status);

    return `
      <div class="feed-card">
        <div>
          <div class="feed-top">
            <span class="badge-tag">${escapeHtml(idea.category)}</span>
            <span class="status-tag ${statusTagClass}">${escapeHtml(idea.status)}</span>
          </div>
          <h3 class="feed-title">${escapeHtml(idea.title)}</h3>
          <p class="feed-desc">${escapeHtml(idea.description)}</p>
        </div>
        <div class="feed-bottom">
          <span>By <strong>${escapeHtml(idea.name)}</strong></span>
          <span>${formattedDate}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Render Admin Portal
function renderAdminPortal() {
  updateAdminKPIs();
  filterAdminIdeas();
}

function updateAdminKPIs() {
  const total = ideas.length;
  const selectedCount = ideas.filter(i => i.status === 'Selected' || i.status === 'Go ahead').length;
  const discussionCount = ideas.filter(i => i.status === 'Discussion' || i.status === 'Route for discussion').length;
  
  let avgIce = 0;
  if (total > 0) {
    const totalScore = ideas.reduce((acc, i) => acc + parseFloat(calculateIceScore(i)), 0);
    avgIce = (totalScore / total).toFixed(1);
  }

  document.getElementById('kpiTotal').innerText = total;
  document.getElementById('kpiSelected').innerText = selectedCount;
  document.getElementById('kpiDiscussion').innerText = discussionCount;
  document.getElementById('kpiAvgIce').innerText = avgIce;

  // Update quick filter pill counts
  document.getElementById('countAll').innerText = total;
  document.getElementById('countGoAhead').innerText = ideas.filter(i => i.status === 'Go ahead').length;
  document.getElementById('countSelected').innerText = ideas.filter(i => i.status === 'Selected').length;
  document.getElementById('countRoute').innerText = ideas.filter(i => i.status === 'Route for discussion').length;
  document.getElementById('countDiscussion').innerText = ideas.filter(i => i.status === 'Discussion').length;
  document.getElementById('countRejected').innerText = ideas.filter(i => i.status === 'Rejected').length;
}

function setQuickStatus(status, buttonEl) {
  currentAdminQuickFilter = status;
  document.getElementById('adminStatusFilter').value = status;
  
  document.querySelectorAll('.stage-pill').forEach(btn => btn.classList.remove('active'));
  buttonEl.classList.add('active');
  
  filterAdminIdeas();
}

function filterAdminIdeas() {
  const search = (document.getElementById('adminSearch').value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('adminStatusFilter').value;
  const sort = document.getElementById('adminSort').value;

  let filtered = [...ideas];

  // Status Filter
  if (statusFilter !== 'All') {
    filtered = filtered.filter(i => i.status === statusFilter);
  }

  // Keyword Search
  if (search) {
    filtered = filtered.filter(i => 
      i.title.toLowerCase().includes(search) ||
      i.description.toLowerCase().includes(search) ||
      i.name.toLowerCase().includes(search) ||
      i.email.toLowerCase().includes(search) ||
      i.category.toLowerCase().includes(search)
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    const scoreA = parseFloat(calculateIceScore(a));
    const scoreB = parseFloat(calculateIceScore(b));

    switch (sort) {
      case 'ice-desc':
        return scoreB - scoreA;
      case 'ice-asc':
        return scoreA - scoreB;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'impact-desc':
        return b.impact - a.impact;
      case 'confidence-desc':
        return b.confidence - a.confidence;
      case 'ease-desc':
        return b.ease - a.ease;
      default:
        return scoreB - scoreA;
    }
  });

  renderAdminTableRows(filtered);
}

function renderAdminTableRows(filteredIdeas) {
  const tbody = document.getElementById('adminTableBody');
  const emptyState = document.getElementById('noResultsState');

  if (filteredIdeas.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  tbody.innerHTML = filteredIdeas.map(idea => {
    const totalScore = calculateIceScore(idea);
    const scoreClass = getIceScoreBadgeClass(totalScore);
    const statusClass = getStatusDropdownClass(idea.status);

    return `
      <tr>
        <td>
          <div class="cell-idea">
            <span class="cell-idea-title" onclick="openDetailModal('${idea.id}')">${escapeHtml(idea.title)}</span>
            <div class="cell-idea-meta">
              <span>👤 ${escapeHtml(idea.name)}</span>
              <span>•</span>
              <span>✉️ ${escapeHtml(idea.email)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-tag">${escapeHtml(idea.category)}</span>
        </td>
        <td>
          <div class="ice-breakdown-row">
            <span class="mini-ice-chip chip-i" title="Impact (1-10)"><strong>I:</strong> ${idea.impact}</span>
            <span class="mini-ice-chip chip-c" title="Confidence (1-10)"><strong>C:</strong> ${idea.confidence}</span>
            <span class="mini-ice-chip chip-e" title="Ease (1-10)"><strong>E:</strong> ${idea.ease}</span>
          </div>
        </td>
        <td style="text-align: center;">
          <div class="total-ice-badge ${scoreClass}">
            ${totalScore}
            <span>ICE</span>
          </div>
        </td>
        <td>
          <div class="status-select-wrap">
            <select class="status-dropdown ${statusClass}" onchange="updateIdeaStatus('${idea.id}', this.value, this)">
              <option value="Selected" ${idea.status === 'Selected' ? 'selected' : ''}>Selected</option>
              <option value="Rejected" ${idea.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
              <option value="Route for discussion" ${idea.status === 'Route for discussion' ? 'selected' : ''}>Route for discussion</option>
              <option value="Discussion" ${idea.status === 'Discussion' ? 'selected' : ''}>Discussion</option>
              <option value="Go ahead" ${idea.status === 'Go ahead' ? 'selected' : ''}>Go ahead</option>
            </select>
          </div>
        </td>
        <td style="text-align: right;">
          <div class="table-actions">
            <button class="btn-icon" title="View details" onclick="openDetailModal('${idea.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon btn-icon-delete" title="Delete idea" onclick="deleteIdea('${idea.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updateIdeaStatus(id, newStatus, selectElement) {
  const idea = ideas.find(i => i.id === id);
  if (idea) {
    idea.status = newStatus;
    saveIdeas();
    
    // Update select element styling class
    selectElement.className = `status-dropdown ${getStatusDropdownClass(newStatus)}`;
    showToast(`Status updated to "${newStatus}"`, 'success');
  }
}

function deleteIdea(id) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;

  if (confirm(`Are you sure you want to delete "${idea.title}"?`)) {
    ideas = ideas.filter(i => i.id !== id);
    saveIdeas();
    showToast('Idea deleted.', 'success');
  }
}

// ==========================================================================
// Detail & Edit Modal
// ==========================================================================
function openDetailModal(id) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;

  const totalScore = calculateIceScore(idea);
  const scoreClass = getIceScoreBadgeClass(totalScore);

  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailModalContent');

  content.innerHTML = `
    <div class="modal-header">
      <span class="badge-tag">${escapeHtml(idea.category)}</span>
      <button class="modal-close" onclick="closeDetailModal()">&times;</button>
    </div>

    <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-main);">${escapeHtml(idea.title)}</h2>
    
    <div style="display: flex; gap: 1rem; font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.25rem; flex-wrap: wrap;">
      <span><strong>Submitted by:</strong> ${escapeHtml(idea.name)} (${escapeHtml(idea.email)})</span>
      <span><strong>Date:</strong> ${new Date(idea.createdAt).toLocaleString()}</span>
    </div>

    <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.8125rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem;">Description & Hypothesis</h4>
      <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary); white-space: pre-line;">${escapeHtml(idea.description)}</p>
    </div>

    <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 1rem; align-items: center; background: #ffffff; border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
      <div style="display: flex; gap: 1.5rem;">
        <div>
          <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Impact</span>
          <strong style="font-size: 1.25rem; color: #2563eb;">${idea.impact} / 10</strong>
        </div>
        <div>
          <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Confidence</span>
          <strong style="font-size: 1.25rem; color: #7c3aed;">${idea.confidence} / 10</strong>
        </div>
        <div>
          <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">Ease</span>
          <strong style="font-size: 1.25rem; color: #059669;">${idea.ease} / 10</strong>
        </div>
      </div>
      <div style="text-align: right;">
        <div class="total-ice-badge ${scoreClass}" style="margin-left: auto;">
          ${totalScore}
          <span>ICE</span>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="modalStatus">Selection Stage Status</label>
      <select id="modalStatus" class="form-control" style="font-weight: 700;">
        <option value="Selected" ${idea.status === 'Selected' ? 'selected' : ''}>Selected</option>
        <option value="Rejected" ${idea.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
        <option value="Route for discussion" ${idea.status === 'Route for discussion' ? 'selected' : ''}>Route for discussion</option>
        <option value="Discussion" ${idea.status === 'Discussion' ? 'selected' : ''}>Discussion</option>
        <option value="Go ahead" ${idea.status === 'Go ahead' ? 'selected' : ''}>Go ahead</option>
      </select>
    </div>

    <div class="form-group">
      <label for="modalAdminNotes">Admin Evaluation Notes</label>
      <textarea id="modalAdminNotes" class="form-control" rows="3" placeholder="Add decision rationale, budget considerations, or next steps...">${escapeHtml(idea.adminNotes || '')}</textarea>
    </div>

    <div class="modal-actions">
      <button type="button" class="btn btn-outline" onclick="closeDetailModal()">Cancel</button>
      <button type="button" class="btn btn-primary" onclick="saveDetailModalChanges('${idea.id}')">Save Changes</button>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function saveDetailModalChanges(id) {
  const idea = ideas.find(i => i.id === id);
  if (idea) {
    idea.status = document.getElementById('modalStatus').value;
    idea.adminNotes = document.getElementById('modalAdminNotes').value.trim();
    saveIdeas();
    closeDetailModal();
    showToast('Idea details updated!', 'success');
  }
}

// ==========================================================================
// Export Data to CSV
// ==========================================================================
function exportDataToCSV() {
  if (ideas.length === 0) {
    showToast('No ideas available to export.');
    return;
  }

  const headers = ['ID', 'Title', 'Category', 'Author Name', 'Author Email', 'Impact (1-10)', 'Confidence (1-10)', 'Ease (1-10)', 'Total ICE Score', 'Status', 'Admin Notes', 'Date Submitted'];
  
  const rows = ideas.map(i => [
    `"${i.id}"`,
    `"${(i.title || '').replace(/"/g, '""')}"`,
    `"${(i.category || '').replace(/"/g, '""')}"`,
    `"${(i.name || '').replace(/"/g, '""')}"`,
    `"${(i.email || '').replace(/"/g, '""')}"`,
    i.impact,
    i.confidence,
    i.ease,
    calculateIceScore(i),
    `"${i.status}"`,
    `"${(i.adminNotes || '').replace(/"/g, '""')}"`,
    `"${new Date(i.createdAt).toLocaleString()}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `seo_ideas_ice_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exported CSV successfully!', 'success');
}

// ==========================================================================
// Helper Utilities
// ==========================================================================
function getIceScoreBadgeClass(score) {
  const num = parseFloat(score);
  if (num >= 8.0) return 'score-high';
  if (num >= 6.0) return 'score-medium';
  return 'score-low';
}

function getStatusDropdownClass(status) {
  return `st-${status.replace(/\s+/g, '-')}`;
}

function getStatusTagClass(status) {
  switch (status) {
    case 'Selected': return 'st-Selected-tag';
    case 'Rejected': return 'st-Rejected-tag';
    case 'Route for discussion': return 'st-Route-tag';
    case 'Discussion': return 'st-Disc-tag';
    case 'Go ahead': return 'st-Go-tag';
    default: return 'st-Disc-tag';
  }
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
