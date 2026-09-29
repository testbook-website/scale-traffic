/**
 * SEO Ideas Hub - Application Logic
 * Passcodes:
 *   Dashboard (Team Entry): 7730
 *   Admin Portal: 8967
 */

const PASSCODES = {
  team: '7730',
  admin: '8967'
};

const STORAGE_KEY = 'seo_hub_ideas_v2';
const AUTH_KEY = 'seo_hub_auth_role';

// Initial Sample Data
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
    adminNotes: 'Approved for Q4 sprint.'
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
    adminNotes: 'Dev team scheduled.'
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
    adminNotes: 'Reviewing PR agency budget.'
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
    adminNotes: 'Checking schema templates.'
  },
  {
    id: 'idea-105',
    name: 'Vikram Mehta',
    email: 'vikram.m@test.com',
    title: 'Direct AI Translation of 50 Articles without Local Keyword Optimization',
    category: 'Other',
    description: 'Directly translate pages without localized keyword research or native review.',
    impact: 5,
    confidence: 3,
    ease: 7,
    status: 'Rejected',
    createdAt: '2026-09-27T11:20:00Z',
    adminNotes: 'Quality risk.'
  }
];

// State
let currentRole = null; // 'team' | 'admin' | null
let ideas = [];
let currentAdminQuickFilter = 'All';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadIdeas();
  setupLivePreviewListeners();
  updateIcePreview();

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

// Universal Login
function handleUniversalLogin(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const inputEl = document.getElementById('passcodeInput');
  const inputVal = (inputEl ? inputEl.value : '').trim();
  const errorEl = document.getElementById('loginError');

  if (inputVal === PASSCODES.team) {
    if (errorEl) errorEl.style.display = 'none';
    unlockPortal('team');
    showToast('Welcome to SEO Ideas Dashboard!', 'success');
    return false;
  } else if (inputVal === PASSCODES.admin) {
    if (errorEl) errorEl.style.display = 'none';
    unlockPortal('admin');
    showToast('Admin Portal Unlocked!', 'success');
    return false;
  } else {
    if (errorEl) {
      errorEl.innerText = 'Incorrect passcode. Please enter 7730 for Team or 8967 for Admin.';
      errorEl.style.display = 'block';
    }
    if (inputEl) inputEl.select();
    return false;
  }
}

// Compatibility alias
function handleLogin(event) {
  return handleUniversalLogin(event);
}

function togglePassVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function unlockPortal(role) {
  currentRole = role;
  sessionStorage.setItem(AUTH_KEY, role);

  const authSec = document.getElementById('authSection');
  const portalNav = document.getElementById('portalNav');
  const headerRight = document.getElementById('headerRight');

  if (authSec) authSec.classList.remove('active');
  if (portalNav) portalNav.style.display = 'flex';
  if (headerRight) headerRight.style.display = 'flex';

  const tabAdmin = document.getElementById('tabAdmin');
  const discreetAdminBtn = document.getElementById('discreetAdminBtn');

  if (role === 'admin') {
    if (tabAdmin) tabAdmin.style.display = 'inline-flex';
    if (discreetAdminBtn) discreetAdminBtn.style.display = 'none';
    switchView('admin');
  } else {
    if (tabAdmin) tabAdmin.style.display = 'none';
    if (discreetAdminBtn) discreetAdminBtn.style.display = 'inline-flex';
    switchView('team');
  }

  renderAllViews();
}

function logout() {
  currentRole = null;
  sessionStorage.removeItem(AUTH_KEY);
  const portalNav = document.getElementById('portalNav');
  const headerRight = document.getElementById('headerRight');
  if (portalNav) portalNav.style.display = 'none';
  if (headerRight) headerRight.style.display = 'none';
  showAuthView();
  showToast('Logged out.');
}

function showAuthView() {
  hideAllSections();
  const authSec = document.getElementById('authSection');
  if (authSec) authSec.classList.add('active');
  const passInput = document.getElementById('passcodeInput');
  if (passInput) {
    passInput.value = '';
    setTimeout(() => passInput.focus(), 100);
  }
  const errorEl = document.getElementById('loginError');
  if (errorEl) errorEl.style.display = 'none';
}

function switchView(viewName) {
  hideAllSections();

  const tabTeam = document.getElementById('tabTeam');
  const tabFeed = document.getElementById('tabFeed');
  const tabAdmin = document.getElementById('tabAdmin');

  if (tabTeam) tabTeam.classList.toggle('active', viewName === 'team');
  if (tabFeed) tabFeed.classList.toggle('active', viewName === 'feed');
  if (tabAdmin) tabAdmin.classList.toggle('active', viewName === 'admin');

  if (viewName === 'team') {
    const teamSec = document.getElementById('teamSection');
    if (teamSec) teamSec.classList.add('active');
  } else if (viewName === 'feed') {
    const feedSec = document.getElementById('feedSection');
    if (feedSec) feedSec.classList.add('active');
    renderTeamFeed();
  } else if (viewName === 'admin') {
    const adminSec = document.getElementById('adminSection');
    if (adminSec) adminSec.classList.add('active');
    renderAdminPortal();
  }
}

function hideAllSections() {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
}

// Admin Gate Modal for team users
function openAdminGateModal() {
  const modal = document.getElementById('adminModal');
  const input = document.getElementById('adminModalPass');
  const err = document.getElementById('adminModalError');
  if (input) input.value = '';
  if (err) err.style.display = 'none';
  if (modal) modal.style.display = 'flex';
  if (input) setTimeout(() => input.focus(), 50);
}

function closeAdminGateModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'none';
}

function handleAdminModalUnlock(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('adminModalPass');
  const val = (input ? input.value : '').trim();
  const err = document.getElementById('adminModalError');

  if (val === PASSCODES.admin) {
    closeAdminGateModal();
    unlockPortal('admin');
    showToast('Admin Mode Enabled!', 'success');
  } else {
    if (err) {
      err.innerText = 'Incorrect Admin Password (8967).';
      err.style.display = 'block';
    }
    if (input) input.select();
  }
}

function handleAdminTabClick() {
  if (currentRole === 'admin') {
    switchView('admin');
  } else {
    openAdminGateModal();
  }
}

// Form & ICE Calculations
function updateIcePreview() {
  const impEl = document.getElementById('impactInput');
  const confEl = document.getElementById('confidenceInput');
  const easeEl = document.getElementById('easeInput');

  const imp = impEl ? parseInt(impEl.value, 10) || 1 : 7;
  const conf = confEl ? parseInt(confEl.value, 10) || 1 : 8;
  const ease = easeEl ? parseInt(easeEl.value, 10) || 1 : 6;

  const impB = document.getElementById('impactValBadge');
  const confB = document.getElementById('confidenceValBadge');
  const easeB = document.getElementById('easeValBadge');

  if (impB) impB.innerText = imp;
  if (confB) confB.innerText = conf;
  if (easeB) easeB.innerText = ease;

  const pI = document.getElementById('prevImp');
  const pC = document.getElementById('prevConf');
  const pE = document.getElementById('prevEase');

  if (pI) pI.innerText = `${imp}/10`;
  if (pC) pC.innerText = `${conf}/10`;
  if (pE) pE.innerText = `${ease}/10`;
}

function setupLivePreviewListeners() {
  const titleInput = document.getElementById('ideaTitle');
  const authorInput = document.getElementById('authorName');
  const catSelect = document.getElementById('ideaCategory');
  const descInput = document.getElementById('ideaDesc');

  if (titleInput) {
    titleInput.addEventListener('input', (e) => {
      const pT = document.getElementById('previewTitle');
      if (pT) pT.innerText = e.target.value.trim() || 'Your Idea Title';
    });
  }

  if (authorInput) {
    authorInput.addEventListener('input', (e) => {
      const pA = document.getElementById('previewAuthor');
      if (pA) pA.innerText = e.target.value.trim() ? `By ${e.target.value.trim()}` : 'By Submitter';
    });
  }

  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      const pC = document.getElementById('previewCategory');
      if (pC) pC.innerText = e.target.value;
    });
  }

  if (descInput) {
    descInput.addEventListener('input', (e) => {
      const pD = document.getElementById('previewDesc');
      if (pD) pD.innerText = e.target.value.trim() || 'Description will preview here as you type...';
    });
  }
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
    status: 'Route for discussion',
    createdAt: new Date().toISOString(),
    adminNotes: ''
  };

  ideas.unshift(newIdea);
  saveIdeas();

  document.getElementById('ideaForm').reset();
  document.getElementById('impactInput').value = 7;
  document.getElementById('confidenceInput').value = 8;
  document.getElementById('easeInput').value = 6;
  updateIcePreview();

  const pT = document.getElementById('previewTitle');
  const pA = document.getElementById('previewAuthor');
  const pC = document.getElementById('previewCategory');
  const pD = document.getElementById('previewDesc');

  if (pT) pT.innerText = 'Your Idea Title';
  if (pA) pA.innerText = 'By Submitter';
  if (pC) pC.innerText = 'Content & Keywords';
  if (pD) pD.innerText = 'Description will preview here as you type...';

  showToast('🎉 Idea submitted successfully!', 'success');
}

// Calculate Total ICE Score: (I + C + E) / 3
function calculateIceScore(idea) {
  const sum = (Number(idea.impact) || 0) + (Number(idea.confidence) || 0) + (Number(idea.ease) || 0);
  return (sum / 3).toFixed(1);
}

// Rendering
function renderAllViews() {
  const teamTotal = document.getElementById('teamTotalCount');
  if (teamTotal) teamTotal.innerText = ideas.length;
  renderTeamFeed();
  if (currentRole === 'admin') {
    renderAdminPortal();
  }
}

function renderTeamFeed() {
  const container = document.getElementById('teamFeedContainer');
  if (!container) return;

  if (ideas.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>No ideas submitted yet</h3>
        <p>Be the first one to propose an SEO initiative!</p>
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

  const kTotal = document.getElementById('kpiTotal');
  const kSelected = document.getElementById('kpiSelected');
  const kDiscussion = document.getElementById('kpiDiscussion');
  const kAvgIce = document.getElementById('kpiAvgIce');

  if (kTotal) kTotal.innerText = total;
  if (kSelected) kSelected.innerText = selectedCount;
  if (kDiscussion) kDiscussion.innerText = discussionCount;
  if (kAvgIce) kAvgIce.innerText = avgIce;

  const cAll = document.getElementById('countAll');
  const cGo = document.getElementById('countGoAhead');
  const cSel = document.getElementById('countSelected');
  const cRoute = document.getElementById('countRoute');
  const cDisc = document.getElementById('countDiscussion');
  const cRej = document.getElementById('countRejected');

  if (cAll) cAll.innerText = total;
  if (cGo) cGo.innerText = ideas.filter(i => i.status === 'Go ahead').length;
  if (cSel) cSel.innerText = ideas.filter(i => i.status === 'Selected').length;
  if (cRoute) cRoute.innerText = ideas.filter(i => i.status === 'Route for discussion').length;
  if (cDisc) cDisc.innerText = ideas.filter(i => i.status === 'Discussion').length;
  if (cRej) cRej.innerText = ideas.filter(i => i.status === 'Rejected').length;
}

function setQuickStatus(status, buttonEl) {
  currentAdminQuickFilter = status;
  const statFilter = document.getElementById('adminStatusFilter');
  if (statFilter) statFilter.value = status;
  
  document.querySelectorAll('.stage-pill').forEach(btn => btn.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');
  
  filterAdminIdeas();
}

function filterAdminIdeas() {
  const searchInput = document.getElementById('adminSearch');
  const search = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const statusFilterEl = document.getElementById('adminStatusFilter');
  const statusFilter = statusFilterEl ? statusFilterEl.value : 'All';
  const sortEl = document.getElementById('adminSort');
  const sort = sortEl ? sortEl.value : 'ice-desc';

  let filtered = [...ideas];

  if (statusFilter !== 'All') {
    filtered = filtered.filter(i => i.status === statusFilter);
  }

  if (search) {
    filtered = filtered.filter(i => 
      i.title.toLowerCase().includes(search) ||
      i.description.toLowerCase().includes(search) ||
      i.name.toLowerCase().includes(search) ||
      i.email.toLowerCase().includes(search) ||
      i.category.toLowerCase().includes(search)
    );
  }

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
  if (!tbody) return;

  if (filteredIdeas.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

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
              <span>${escapeHtml(idea.name)}</span>
              <span>•</span>
              <span>${escapeHtml(idea.email)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-tag">${escapeHtml(idea.category)}</span>
        </td>
        <td>
          <div class="ice-breakdown-row">
            <span class="mini-ice-chip chip-i" title="Impact"><strong>I:</strong> ${idea.impact}</span>
            <span class="mini-ice-chip chip-c" title="Confidence"><strong>C:</strong> ${idea.confidence}</span>
            <span class="mini-ice-chip chip-e" title="Ease"><strong>E:</strong> ${idea.ease}</span>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon btn-icon-delete" title="Delete idea" onclick="deleteIdea('${idea.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    selectElement.className = `status-dropdown ${getStatusDropdownClass(newStatus)}`;
    showToast(`Status updated to "${newStatus}"`, 'success');
  }
}

function deleteIdea(id) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;

  if (confirm(`Delete "${idea.title}"?`)) {
    ideas = ideas.filter(i => i.id !== id);
    saveIdeas();
    showToast('Idea deleted.');
  }
}

// Detail & Edit Modal
function openDetailModal(id) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;

  const totalScore = calculateIceScore(idea);
  const scoreClass = getIceScoreBadgeClass(totalScore);

  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailModalContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="modal-header">
      <span class="badge-tag">${escapeHtml(idea.category)}</span>
      <button class="modal-close" onclick="closeDetailModal()">&times;</button>
    </div>

    <h2 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-main);">${escapeHtml(idea.title)}</h2>
    
    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
      <span>By ${escapeHtml(idea.name)} (${escapeHtml(idea.email)}) • ${new Date(idea.createdAt).toLocaleDateString()}</span>
    </div>

    <div style="background: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
      <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.3rem;">Description</h4>
      <p style="font-size: 0.875rem; line-height: 1.45; color: var(--text-secondary); white-space: pre-line;">${escapeHtml(idea.description)}</p>
    </div>

    <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 1rem; align-items: center; background: #ffffff; border: 1px solid var(--border-color); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
      <div style="display: flex; gap: 1.25rem;">
        <div>
          <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">Impact</span>
          <strong style="font-size: 1.1rem; color: #2563eb;">${idea.impact} / 10</strong>
        </div>
        <div>
          <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">Confidence</span>
          <strong style="font-size: 1.1rem; color: #7c3aed;">${idea.confidence} / 10</strong>
        </div>
        <div>
          <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">Ease</span>
          <strong style="font-size: 1.1rem; color: #059669;">${idea.ease} / 10</strong>
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
      <label for="modalStatus">Stage Status</label>
      <select id="modalStatus" class="form-control" style="font-weight: 700;">
        <option value="Selected" ${idea.status === 'Selected' ? 'selected' : ''}>Selected</option>
        <option value="Rejected" ${idea.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
        <option value="Route for discussion" ${idea.status === 'Route for discussion' ? 'selected' : ''}>Route for discussion</option>
        <option value="Discussion" ${idea.status === 'Discussion' ? 'selected' : ''}>Discussion</option>
        <option value="Go ahead" ${idea.status === 'Go ahead' ? 'selected' : ''}>Go ahead</option>
      </select>
    </div>

    <div class="form-group">
      <label for="modalAdminNotes">Admin Notes</label>
      <textarea id="modalAdminNotes" class="form-control" rows="2" placeholder="Add decision notes...">${escapeHtml(idea.adminNotes || '')}</textarea>
    </div>

    <div class="modal-actions">
      <button type="button" class="btn btn-outline" onclick="closeDetailModal()">Cancel</button>
      <button type="button" class="btn btn-primary" onclick="saveDetailModalChanges('${idea.id}')">Save</button>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  if (modal) modal.style.display = 'none';
}

function saveDetailModalChanges(id) {
  const idea = ideas.find(i => i.id === id);
  if (idea) {
    const stat = document.getElementById('modalStatus');
    const notes = document.getElementById('modalAdminNotes');
    if (stat) idea.status = stat.value;
    if (notes) idea.adminNotes = notes.value.trim();
    saveIdeas();
    closeDetailModal();
    showToast('Saved!', 'success');
  }
}

// Export Data to CSV
function exportDataToCSV() {
  if (ideas.length === 0) {
    showToast('No ideas to export.');
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
  link.setAttribute('download', `seo_ideas_ice_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exported CSV!', 'success');
}

// Utilities
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
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}
