/**
 * SEO Ideas Hub - Application Logic with Google Sheet Live Sync
 * Passcodes:
 *   Team Entry: 7730 (Submit Idea only)
 *   Admin Portal: 8967 (View all ideas, ICE scores, status)
 *
 * Google Sheet: https://docs.google.com/spreadsheets/d/1U85yUu5J21RHuxNq-Sc38_zklRSWiGkLitB8w6SChIg/edit
 */

const PASSCODES = {
  team: '7730',
  admin: '8967'
};

// Google Apps Script Web App Deployment URL
const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbya3Ut7mQggtzmkGHDWbkgffyxuwLoKIyPZ-WbWCHH4YsckueBYTWzRpDKEaQYsA9jdBQ/exec';
const GOOGLE_SHEET_ID = '1U85yUu5J21RHuxNq-Sc38_zklRSWiGkLitB8w6SChIg';

const STORAGE_KEY = 'seo_hub_ideas_v4';
const AUTH_KEY = 'seo_hub_auth_role';

// State
let currentRole = null;
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
      ideas = [];
    }
  } else {
    ideas = [];
  }
}

function saveIdeas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  if (currentRole === 'admin') {
    renderAdminPortal();
  }
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
    showToast('Welcome to SEO Ideas Submission!', 'success');
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
  const headerRight = document.getElementById('headerRight');
  const headerSubtitle = document.getElementById('headerSubtitle');

  if (authSec) authSec.classList.remove('active');
  if (headerRight) headerRight.style.display = 'flex';

  const discreetAdminBtn = document.getElementById('discreetAdminBtn');

  if (role === 'admin') {
    if (discreetAdminBtn) discreetAdminBtn.style.display = 'none';
    if (headerSubtitle) headerSubtitle.innerText = 'Admin Evaluation & Decision Console';
    switchView('admin');
    fetchLiveIdeasFromSheet(false); // auto-sync from sheet on admin load
  } else {
    if (discreetAdminBtn) discreetAdminBtn.style.display = 'inline-flex';
    if (headerSubtitle) headerSubtitle.innerText = 'Traffic & Growth Initiatives';
    resetFormForNewIdea();
    switchView('team');
  }
}

function logout() {
  currentRole = null;
  sessionStorage.removeItem(AUTH_KEY);
  const headerRight = document.getElementById('headerRight');
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

  if (viewName === 'team') {
    const teamSec = document.getElementById('teamSection');
    if (teamSec) teamSec.classList.add('active');
  } else if (viewName === 'admin') {
    const adminSec = document.getElementById('adminSection');
    if (adminSec) adminSec.classList.add('active');
    renderAdminPortal();
  }
}

function hideAllSections() {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
}

// Admin Gate Modal
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
      err.innerText = 'Incorrect Admin Password.';
      err.style.display = 'block';
    }
    if (input) input.select();
  }
}

// Live ICE & Preview Updates
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

// Submit Idea Handler
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

  // 1. Save locally
  ideas.unshift(newIdea);
  saveIdeas();

  // 2. Sync to Google Sheet asynchronously
  if (GOOGLE_SHEET_WEBAPP_URL) {
    fetch(GOOGLE_SHEET_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIdea)
    }).catch(err => console.log('Sheet sync queued', err));
  }

  // 3. Show success card
  document.getElementById('submissionFormWrap').style.display = 'none';
  document.getElementById('submitSuccessCard').style.display = 'block';

  showToast('🎉 Idea saved to Google Sheet!', 'success');
}

function resetFormForNewIdea() {
  const formWrap = document.getElementById('submissionFormWrap');
  const successCard = document.getElementById('submitSuccessCard');
  const form = document.getElementById('ideaForm');

  if (form) form.reset();
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
  if (pC) pC.innerText = 'Uplifting Existing Traffic';
  if (pD) pD.innerText = 'Description will preview here as you type...';

  if (successCard) successCard.style.display = 'none';
  if (formWrap) formWrap.style.display = 'grid';
}

// Fetch live ideas from Google Sheet Web App (with GViz fallback)
async function fetchLiveIdeasFromSheet(showFeedback = true) {
  const syncBtn = document.getElementById('syncSheetBtn');
  if (syncBtn) {
    syncBtn.innerText = 'Syncing...';
    syncBtn.disabled = true;
  }

  let fetchedIdeas = null;

  // 1. Primary method: Apps Script Web App GET
  try {
    const res = await fetch(GOOGLE_SHEET_WEBAPP_URL + '?t=' + Date.now());
    const json = await res.json();
    if (json && json.status === 'success' && Array.isArray(json.ideas)) {
      fetchedIdeas = json.ideas;
    }
  } catch (err) {
    console.warn('Apps script GET fetch failed, trying GViz fallback...', err);
  }

  // 2. Fallback method: Google Visualization Public Endpoint
  if (!fetchedIdeas) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&t=${Date.now()}`;
      const res = await fetch(gvizUrl);
      const text = await res.text();
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const data = JSON.parse(jsonStr);

      if (data && data.table && Array.isArray(data.table.rows)) {
        fetchedIdeas = data.table.rows.map((row, idx) => {
          const c = row.c || [];
          const getVal = (col) => (c[col] ? (c[col].v !== null && c[col].v !== undefined ? c[col].v : '') : '');
          
          const impact = Number(getVal(7)) || 1;
          const confidence = Number(getVal(8)) || 1;
          const ease = Number(getVal(9)) || 1;
          const totalScore = ((impact + confidence + ease) / 3).toFixed(1);

          return {
            id: String(getVal(0) || ('idea-' + (idx + 1))),
            createdAt: String(getVal(1) || new Date().toISOString()),
            name: String(getVal(2) || ''),
            email: String(getVal(3) || ''),
            title: String(getVal(4) || ''),
            category: String(getVal(5) || 'Uplifting Existing Traffic'),
            description: String(getVal(6) || ''),
            impact: impact,
            confidence: confidence,
            ease: ease,
            totalIceScore: totalScore,
            status: String(getVal(11) || 'Route for discussion'),
            adminNotes: String(getVal(12) || '')
          };
        }).filter(item => item.title || item.name);
      }
    } catch (gvizErr) {
      console.warn('GViz fallback failed too:', gvizErr);
    }
  }

  if (fetchedIdeas && fetchedIdeas.length > 0) {
    ideas = fetchedIdeas;
    saveIdeas();
    if (showFeedback) showToast(`Synced ${ideas.length} ideas from Google Sheet!`, 'success');
  } else if (showFeedback) {
    showToast(`Synced! ${ideas.length} ideas in list.`, 'info');
  }

  if (syncBtn) {
    syncBtn.innerText = 'Sync from Google Sheet';
    syncBtn.disabled = false;
  }
  renderAdminPortal();
}

// Calculate Total ICE Score: (I + C + E) / 3
function calculateIceScore(idea) {
  const sum = (Number(idea.impact) || 0) + (Number(idea.confidence) || 0) + (Number(idea.ease) || 0);
  return (sum / 3).toFixed(1);
}

// Admin Portal Logic
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
  const categoryFilterEl = document.getElementById('adminCategoryFilter');
  const categoryFilter = categoryFilterEl ? categoryFilterEl.value : 'All';
  const sortEl = document.getElementById('adminSort');
  const sort = sortEl ? sortEl.value : 'ice-desc';

  let filtered = [...ideas];

  if (statusFilter !== 'All') {
    filtered = filtered.filter(i => i.status === statusFilter);
  }

  if (categoryFilter !== 'All') {
    filtered = filtered.filter(i => i.category === categoryFilter);
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
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
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

    if (GOOGLE_SHEET_WEBAPP_URL) {
      fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', id: id, status: newStatus, adminNotes: idea.adminNotes })
      }).catch(e => console.log('Sheet status update sent', e));
    }

    showToast(`Status updated to "${newStatus}" & saved to Sheet!`, 'success');
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
      <span>By ${escapeHtml(idea.name)} (${escapeHtml(idea.email)}) • ${idea.createdAt || 'Recent'}</span>
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

    if (GOOGLE_SHEET_WEBAPP_URL) {
      fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', id: id, status: idea.status, adminNotes: idea.adminNotes })
      }).catch(e => console.log('Sheet detail update sent', e));
    }

    closeDetailModal();
    showToast('Saved to Sheet & Dashboard!', 'success');
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
    `"${i.createdAt || ''}"`
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
