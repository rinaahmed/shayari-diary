/* ============================================================
   KUNWAL KE PHOOL — Shayari Diary
   ============================================================ */

'use strict';

// ── Storage key ──────────────────────────────────────────────
const STORAGE_KEY = 'kunwal_entries';

// ── Default seed data: saved poems by other poets only.
//    Kunwal's own shayari will be imported via the Import feature.
const DEFAULT_ENTRIES = [
  {
    id: 'seed-ps-1',
    type: 'saved',
    title: '',
    urdu: 'خوشبو کی طرح میں بھی اڑ جاؤں گی ایک دن\nتم ڈھونڈتے رہنا مجھے دنیا میں کہاں کہاں',
    english: '',
    author: 'Parveen Shakir',
    tags: ['parveen-shakir', 'legacy', 'memory'],
    dateAdded: '2024-01-01T00:00:00.000Z',
    notes: '',
    isGhazal: false,
    ghazalProgress: null
  },
  {
    id: 'seed-mir-1',
    type: 'saved',
    title: '',
    urdu: 'پتا پتا بوٹا بوٹا حال ہمارا جانے ہے\nجانے نہ جانے گل ہی نہ جانے باغ تو سارا جانے ہے',
    english: '',
    author: 'Mir Taqi Mir',
    tags: ['mir-taqi-mir', 'nature', 'longing'],
    dateAdded: '2024-01-02T00:00:00.000Z',
    notes: '',
    isGhazal: false,
    ghazalProgress: null
  },
  {
    id: 'seed-mir-2',
    type: 'saved',
    title: '',
    urdu: 'اشک آنکھوں میں کب نہیں آتا\nلہو آتا ہے جب نہیں آتا',
    english: '',
    author: 'Mir Taqi Mir',
    tags: ['mir-taqi-mir', 'grief', 'tears'],
    dateAdded: '2024-01-03T00:00:00.000Z',
    notes: '',
    isGhazal: false,
    ghazalProgress: null
  },
  {
    id: 'seed-ghalib-1',
    type: 'saved',
    title: '',
    urdu: 'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے\nبہت نکلے مرے ارمان لیکن پھر بھی کم نکلے',
    english: '',
    author: 'Ghalib',
    tags: ['ghalib', 'desire', 'longing'],
    dateAdded: '2024-01-04T00:00:00.000Z',
    notes: '',
    isGhazal: false,
    ghazalProgress: null
  },
  {
    id: 'seed-faiz-1',
    type: 'saved',
    title: '',
    urdu: 'اور بھی دکھ ہیں زمانے میں محبت کے سوا\nراحتیں اور بھی ہیں وصل کی راحت کے سوا',
    english: '',
    author: 'Faiz Ahmed Faiz',
    tags: ['faiz', 'love', 'perspective'],
    dateAdded: '2024-01-05T00:00:00.000Z',
    notes: '',
    isGhazal: false,
    ghazalProgress: null
  }
];

// ── State ────────────────────────────────────────────────────
const state = {
  entries: [],
  view: 'home',
  activeTab: 'sher',
  search: '',
  selectedTags: new Set(),
  editingId: null,
  viewingId: null,
  qafiaList: [],
  viewHistory: ['home']
};

// ── Utilities ────────────────────────────────────────────────
function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function urduHtml(str) {
  return esc(str).replace(/\n/g, '<br>');
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function fmtDateLong(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function typeLabel(type) {
  return { sher: 'Sher', ghazal: 'Ghazal', saved: 'Saved' }[type] || type;
}

// ── Storage ──────────────────────────────────────────────────
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state.entries = JSON.parse(raw);
    } else {
      state.entries = DEFAULT_ENTRIES.map(e => ({ ...e }));
      saveData();
    }
  } catch {
    state.entries = DEFAULT_ENTRIES.map(e => ({ ...e }));
    saveData();
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
  } catch (err) {
    showToast('Storage error — data may not be saved.');
  }
}

// ── Navigation ───────────────────────────────────────────────
function navigate(view, params = {}) {
  const prev = state.view;
  state.view = view;

  // Update view visibility
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');

  if (view === 'home') {
    state.viewHistory = ['home'];
    renderHome();
  } else if (view === 'form') {
    state.viewHistory.push('form');
    renderForm(params.id || null);
  } else if (view === 'detail') {
    state.viewHistory.push('detail');
    renderDetail(params.id);
  } else if (view === 'settings') {
    state.viewHistory.push('settings');
  }

  // Store for browser back
  history.pushState({ view, ...params }, '', '#' + view + (params.id ? '/' + params.id : ''));
}

function goBack() {
  state.viewHistory.pop();
  const prev = state.viewHistory[state.viewHistory.length - 1] || 'home';
  navigate(prev, {});
}

// ── Tab ink indicator ────────────────────────────────────────
function updateTabInk() {
  const activeTab = document.querySelector('.tab.active');
  const ink = document.getElementById('tabInk');
  if (!activeTab || !ink) return;
  ink.style.left  = activeTab.offsetLeft + 'px';
  ink.style.width = activeTab.offsetWidth + 'px';
}

// ── HOME VIEW ────────────────────────────────────────────────
function renderHome() {
  renderTagFilter();
  renderEntryList();
}

function getFilteredEntries() {
  const tab = state.activeTab;
  let list = state.entries.filter(e => e.type === tab);

  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(e =>
      (e.urdu  && e.urdu.toLowerCase().includes(q)) ||
      (e.english && e.english.toLowerCase().includes(q)) ||
      (e.author  && e.author.toLowerCase().includes(q)) ||
      (e.title   && e.title.toLowerCase().includes(q)) ||
      (e.tags    && e.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  if (state.selectedTags.size > 0) {
    list = list.filter(e =>
      e.tags && [...state.selectedTags].every(t => e.tags.includes(t))
    );
  }

  return list.slice().sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
}

function getAllTagsForTab() {
  const tags = new Set();
  state.entries
    .filter(e => e.type === state.activeTab)
    .forEach(e => (e.tags || []).forEach(t => tags.add(t)));
  return [...tags].sort();
}

function getAllTags() {
  const tags = new Set();
  state.entries.forEach(e => (e.tags || []).forEach(t => tags.add(t)));
  return [...tags].sort();
}

function renderTagFilter() {
  const container = document.getElementById('tagFilter');
  const tags = getAllTagsForTab();
  if (!tags.length) { container.innerHTML = ''; return; }

  container.innerHTML = tags.map(t =>
    `<button class="tag-pill${state.selectedTags.has(t) ? ' active' : ''}" data-tag="${esc(t)}">${esc(t)}</button>`
  ).join('');

  container.querySelectorAll('.tag-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tag;
      state.selectedTags.has(t) ? state.selectedTags.delete(t) : state.selectedTags.add(t);
      renderHome();
    });
  });
}

function renderEntryList() {
  const container = document.getElementById('entryList');
  const entries = getFilteredEntries();

  if (!entries.length) {
    const hasAny = state.entries.some(e => e.type === state.activeTab);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-ornament">🌹</div>
        <h3>${hasAny ? 'Nothing matches' : 'Start writing'}</h3>
        <p>${hasAny
          ? 'No entries match your search or filter.'
          : 'Tap + to add your first ' + typeLabel(state.activeTab) + '.'
        }</p>
      </div>`;
    return;
  }

  container.innerHTML = entries.map(e => cardHtml(e)).join('');
  container.querySelectorAll('.entry-card').forEach(card => {
    card.addEventListener('click', () => navigate('detail', { id: card.dataset.id }));
  });
}

function cardHtml(entry) {
  const type = entry.type || 'sher';
  const lines = (entry.urdu || '').split('\n').filter(l => l.trim());
  const previewText = lines.slice(0, 2).map(esc).join('<br>');
  const moreCount = lines.length - 2;

  const nameHtml = entry.title
    ? `<span class="card-name">${esc(entry.title)}</span>`
    : '';

  let progressHtml = '';
  if (type === 'ghazal' && entry.ghazalProgress) {
    const gp = entry.ghazalProgress;
    progressHtml = `
      <div class="card-progress">
        <span>${gp.sherCount || 0}/5 sher</span>
        <span class="${gp.hasMatla ? 'prog-done' : 'prog-pending'}"> · Matla ${gp.hasMatla ? '✓' : '–'}</span>
        <span class="${gp.hasMaqta ? 'prog-done' : 'prog-pending'}"> · Maqta ${gp.hasMaqta ? '✓' : '–'}</span>
      </div>`;
  }

  const tagsHtml = (entry.tags && entry.tags.length)
    ? entry.tags.map(t => `<span class="tag-chip">${esc(t)}</span>`).join('')
    : '';

  const authorHtml = (entry.author && entry.author !== 'Kunwal')
    ? `<span class="card-author">${esc(entry.author)}</span>`
    : '';

  return `
    <article class="entry-card" data-id="${esc(entry.id)}">
      <div class="card-head">
        <span class="badge badge-${type}">${typeLabel(type)}</span>
        ${nameHtml}
      </div>
      <div class="card-urdu urdu-text">${previewText}</div>
      ${moreCount > 0 ? `<p class="card-more">+${moreCount} more line${moreCount > 1 ? 's' : ''}</p>` : ''}
      ${progressHtml}
      <hr class="card-sep">
      <div class="card-foot">
        <div class="card-chips">${tagsHtml}</div>
        ${authorHtml}
        <span class="card-date">${fmtDate(entry.dateAdded)}</span>
      </div>
    </article>`;
}

// ── FORM VIEW ────────────────────────────────────────────────
function renderForm(id) {
  state.editingId = id || null;
  state.qafiaList = [];

  document.getElementById('formTitle').textContent = id ? 'Edit Entry' : 'New Entry';
  document.getElementById('entryForm').reset();
  document.getElementById('fieldAuthor').value = 'Kunwal';
  document.getElementById('qafiaChips').innerHTML = '';
  document.getElementById('ghazalSection').classList.add('hidden');
  document.getElementById('tagSuggestions').innerHTML = '';

  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.type-btn[data-type="sher"]').classList.add('active');

  if (id) {
    const entry = state.entries.find(e => e.id === id);
    if (!entry) return;

    document.querySelector(`.type-btn[data-type="${entry.type}"]`)?.classList.add('active');
    document.getElementById('fieldTitle').value  = entry.title   || '';
    document.getElementById('fieldUrdu').value   = entry.urdu    || '';
    document.getElementById('fieldEnglish').value = entry.english || '';
    document.getElementById('fieldAuthor').value = entry.author  || 'Kunwal';
    document.getElementById('fieldTags').value   = (entry.tags || []).join(', ');
    document.getElementById('fieldNotes').value  = entry.notes   || '';

    if (entry.type === 'ghazal') {
      document.getElementById('ghazalSection').classList.remove('hidden');
      const gp = entry.ghazalProgress || {};
      document.getElementById('fieldRadif').value      = gp.radif     || '';
      document.getElementById('fieldSherCount').value  = gp.sherCount || 0;
      document.getElementById('checkMatla').checked    = !!gp.hasMatla;
      document.getElementById('checkMaqta').checked    = !!gp.hasMaqta;
      document.getElementById('checkMin5').checked     = (gp.sherCount || 0) >= 5;
      document.getElementById('checkRadifAll').checked = !!gp.radifAll;
      document.getElementById('checkUniqueQafia').checked = !!gp.uniqueQafia;
      document.getElementById('checkBehr').checked        = !!gp.behrPolished;
      document.getElementById('checkNoRepeat').checked    = !!gp.noRepeat;
      document.getElementById('checkStrongImage').checked = !!gp.strongImage;
      document.getElementById('checkStandsAlone').checked = !!gp.standsAlone;
      document.getElementById('fieldPolishNotes').value   = gp.notes || '';

      state.qafiaList = Array.isArray(gp.qafiaUsed) ? [...gp.qafiaUsed] : [];
      renderQafiaChips();
    }

    if (entry.type === 'saved') {
      document.getElementById('fieldAuthor').value = entry.author || '';
    }
  }

  // Render tag suggestions from existing tags
  renderTagSuggestions();
}

function renderQafiaChips() {
  const container = document.getElementById('qafiaChips');
  container.innerHTML = state.qafiaList.map((w, i) =>
    `<div class="chip">
       <span>${esc(w)}</span>
       <button type="button" class="chip-remove" data-i="${i}" aria-label="Remove">×</button>
     </div>`
  ).join('');
  container.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.qafiaList.splice(Number(btn.dataset.i), 1);
      renderQafiaChips();
    });
  });
}

function renderTagSuggestions() {
  const allTags = getAllTags();
  if (!allTags.length) return;
  const container = document.getElementById('tagSuggestions');

  function update() {
    const existing = document.getElementById('fieldTags').value
      .split(',').map(t => t.trim()).filter(Boolean);
    const remaining = allTags.filter(t => !existing.includes(t));
    if (!remaining.length) { container.innerHTML = ''; return; }
    container.innerHTML = remaining.map(t =>
      `<button type="button" class="tag-suggest-pill" data-tag="${esc(t)}">${esc(t)}</button>`
    ).join('');
    container.querySelectorAll('.tag-suggest-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = document.getElementById('fieldTags');
        const current = field.value.split(',').map(t => t.trim()).filter(Boolean);
        if (!current.includes(btn.dataset.tag)) {
          current.push(btn.dataset.tag);
          field.value = current.join(', ');
        }
        update();
      });
    });
  }

  document.getElementById('fieldTags').addEventListener('input', update);
  update();
}

function collectFormData() {
  const type = document.querySelector('.type-btn.active')?.dataset.type || 'sher';

  const entry = {
    type,
    title:     document.getElementById('fieldTitle').value.trim(),
    urdu:      document.getElementById('fieldUrdu').value.trim(),
    english:   document.getElementById('fieldEnglish').value.trim(),
    author:    document.getElementById('fieldAuthor').value.trim() || 'Kunwal',
    tags:      document.getElementById('fieldTags').value
                 .split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    notes:     document.getElementById('fieldNotes').value.trim(),
    isGhazal:  type === 'ghazal',
    ghazalProgress: null
  };

  if (type === 'ghazal') {
    entry.ghazalProgress = {
      hasMatla:    document.getElementById('checkMatla').checked,
      hasMaqta:    document.getElementById('checkMaqta').checked,
      sherCount:   parseInt(document.getElementById('fieldSherCount').value, 10) || 0,
      radif:       document.getElementById('fieldRadif').value.trim(),
      qafiaUsed:   [...state.qafiaList],
      behrPolished: document.getElementById('checkBehr').checked,
      radifAll:    document.getElementById('checkRadifAll').checked,
      uniqueQafia: document.getElementById('checkUniqueQafia').checked,
      noRepeat:    document.getElementById('checkNoRepeat').checked,
      strongImage: document.getElementById('checkStrongImage').checked,
      standsAlone: document.getElementById('checkStandsAlone').checked,
      notes:       document.getElementById('fieldPolishNotes').value.trim()
    };
  }

  return entry;
}

// ── DETAIL VIEW ──────────────────────────────────────────────
function renderDetail(id) {
  state.viewingId = id;
  const entry = state.entries.find(e => e.id === id);
  if (!entry) { navigate('home'); return; }

  const container = document.getElementById('detailContent');
  const type = entry.type || 'sher';

  const tagsHtml = (entry.tags && entry.tags.length)
    ? `<div class="detail-tags">${entry.tags.map(t => `<span class="tag-chip">${esc(t)}</span>`).join('')}</div>`
    : '';

  let ghazalHtml = '';
  if (type === 'ghazal' && entry.ghazalProgress) {
    const gp = entry.ghazalProgress;
    const checks = [
      { label: 'Matla',         done: gp.hasMatla },
      { label: 'Maqta',         done: gp.hasMaqta },
      { label: `${gp.sherCount || 0} sher`, done: (gp.sherCount || 0) >= 5 },
      { label: 'Behr polished', done: gp.behrPolished },
      { label: 'Radif all',     done: gp.radifAll },
      { label: 'Unique qafia',  done: gp.uniqueQafia },
      { label: 'No repeat',     done: gp.noRepeat },
      { label: 'Strong image',  done: gp.strongImage },
      { label: 'Stands alone',  done: gp.standsAlone }
    ];
    ghazalHtml = `
      <div class="detail-ghazal-progress">
        <p class="ghazal-progress-title">Ghazal Progress</p>
        <div class="progress-grid">
          ${checks.map(c => `<div class="progress-item${c.done ? ' done' : ''}">${c.label} ${c.done ? '✓' : '–'}</div>`).join('')}
        </div>
        ${gp.radif ? `<div class="progress-detail"><strong>Radif</strong> <span class="urdu-text">${esc(gp.radif)}</span></div>` : ''}
        ${(gp.qafiaUsed && gp.qafiaUsed.length) ? `<div class="progress-detail"><strong>Qafia</strong> ${gp.qafiaUsed.map(q => `<span class="tag-chip urdu-text">${esc(q)}</span>`).join('')}</div>` : ''}
        ${gp.notes ? `<div class="progress-detail" style="display:block"><strong>Polish notes</strong><br>${esc(gp.notes)}</div>` : ''}
      </div>`;
  }

  container.innerHTML = `
    <div class="detail-inner">
      <div class="detail-header-row">
        <span class="detail-badge detail-badge-${type}">${typeLabel(type)}</span>
        ${entry.title ? `<span class="detail-title-urdu">${esc(entry.title)}</span>` : ''}
      </div>
      <div class="detail-poetry">
        <div class="detail-urdu urdu-text">${urduHtml(entry.urdu)}</div>
        ${entry.english ? `<div class="detail-english">${esc(entry.english)}</div>` : ''}
      </div>
      <div class="detail-byline">
        <span class="detail-author">— ${esc(entry.author || 'Kunwal')}</span>
        <span class="detail-date">${fmtDateLong(entry.dateAdded)}</span>
      </div>
      ${tagsHtml}
      ${ghazalHtml}
      ${entry.notes ? `<div class="detail-notes"><strong>Notes:</strong> ${esc(entry.notes)}</div>` : ''}
    </div>`;
}

// ── EXPORT / IMPORT ──────────────────────────────────────────
function exportData() {
  const json = JSON.stringify({ version: 1, entries: state.entries }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `kunwal-ke-phool-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Data exported successfully.');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      const incoming = parsed.entries || (Array.isArray(parsed) ? parsed : []);
      if (!incoming.length) { showToast('No entries found in file.'); return; }

      let added = 0, skipped = 0;
      const existingIds = new Set(state.entries.map(e => e.id));
      incoming.forEach(entry => {
        if (!entry.id) entry.id = genId();
        if (existingIds.has(entry.id)) {
          skipped++;
        } else {
          // Ensure required fields have defaults
          entry.type  = entry.type  || 'sher';
          entry.author = entry.author || 'Kunwal';
          entry.tags   = entry.tags   || [];
          entry.dateAdded = entry.dateAdded || new Date().toISOString();
          entry.isGhazal = entry.isGhazal || false;
          entry.ghazalProgress = entry.ghazalProgress || null;
          state.entries.push(entry);
          existingIds.add(entry.id);
          added++;
        }
      });

      saveData();
      navigate('home');
      showToast(`Imported ${added} entries${skipped ? `, skipped ${skipped} duplicates` : ''}.`);
    } catch {
      showToast('Invalid JSON file. Could not import.');
    }
  };
  reader.readAsText(file);
}

// ── TOAST ────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── CONFIRM DIALOG ───────────────────────────────────────────
function confirm(message, onOk) {
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmOverlay').classList.remove('hidden');
  document.getElementById('confirmOk').onclick = () => {
    document.getElementById('confirmOverlay').classList.add('hidden');
    onOk();
  };
  document.getElementById('confirmCancel').onclick = () => {
    document.getElementById('confirmOverlay').classList.add('hidden');
  };
}

// ── SHARE / COPY ─────────────────────────────────────────────
function shareEntry(id) {
  const entry = state.entries.find(e => e.id === id);
  if (!entry) return;

  let text = entry.urdu || '';
  if (entry.english) text += '\n\n' + entry.english;
  if (entry.author && entry.author !== 'Kunwal') text += '\n\n— ' + entry.author;

  if (navigator.share) {
    navigator.share({ text }).catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast('Copied to clipboard.'))
    .catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard.');
    });
}

// ── EVENT BINDING ────────────────────────────────────────────
function bindEvents() {

  // ── Home: settings button
  document.getElementById('settingsBtn').addEventListener('click', () => navigate('settings'));

  // ── Home: tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeTab = tab.dataset.tab;
      state.selectedTags.clear();
      updateTabInk();
      renderHome();
    });
  });

  // ── Home: search
  document.getElementById('searchInput').addEventListener('input', e => {
    state.search = e.target.value;
    renderEntryList();
  });

  // ── Home: FAB
  document.getElementById('addBtn').addEventListener('click', () => navigate('form'));

  // ── Form: back
  document.getElementById('formBackBtn').addEventListener('click', () => {
    navigate('home');
  });

  // ── Form: type buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.type;
      const ghazalSection = document.getElementById('ghazalSection');
      const authorField   = document.getElementById('fieldAuthor');

      if (type === 'ghazal') {
        ghazalSection.classList.remove('hidden');
      } else {
        ghazalSection.classList.add('hidden');
      }

      if (type === 'saved') {
        if (authorField.value === 'Kunwal') authorField.value = '';
        authorField.placeholder = 'Poet name…';
      } else {
        if (!authorField.value) authorField.value = 'Kunwal';
        authorField.placeholder = 'Kunwal';
      }
    });
  });

  // ── Form: qafia chip input
  document.getElementById('qafiaInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (val && !state.qafiaList.includes(val)) {
        state.qafiaList.push(val);
        renderQafiaChips();
      }
      e.target.value = '';
    }
  });

  // ── Form: submit
  document.getElementById('entryForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = collectFormData();

    if (!data.urdu) {
      showToast('Please enter some Urdu text.');
      document.getElementById('fieldUrdu').focus();
      return;
    }
    if (data.type === 'saved' && !data.author) {
      showToast('Please enter the poet\'s name.');
      document.getElementById('fieldAuthor').focus();
      return;
    }

    if (state.editingId) {
      const idx = state.entries.findIndex(e => e.id === state.editingId);
      if (idx !== -1) {
        state.entries[idx] = {
          ...state.entries[idx],
          ...data,
          id: state.editingId,
          dateAdded: state.entries[idx].dateAdded
        };
      }
      saveData();
      showToast('Entry updated.');
      navigate('detail', { id: state.editingId });
    } else {
      const entry = {
        id: genId(),
        dateAdded: new Date().toISOString(),
        ...data
      };
      state.entries.unshift(entry);
      saveData();
      showToast('Entry saved. 🌹');
      navigate('home');
    }
  });

  // ── Detail: back
  document.getElementById('detailBackBtn').addEventListener('click', () => navigate('home'));

  // ── Detail: edit
  document.getElementById('editBtn').addEventListener('click', () => {
    navigate('form', { id: state.viewingId });
  });

  // ── Detail: delete
  document.getElementById('deleteBtn').addEventListener('click', () => {
    confirm('Delete this entry? This cannot be undone.', () => {
      state.entries = state.entries.filter(e => e.id !== state.viewingId);
      saveData();
      showToast('Entry deleted.');
      navigate('home');
    });
  });

  // ── Detail: share/copy
  document.getElementById('shareBtn').addEventListener('click', () => {
    shareEntry(state.viewingId);
  });

  // ── Settings: back
  document.getElementById('settingsBackBtn').addEventListener('click', () => navigate('home'));

  // ── Settings: export
  document.getElementById('exportBtn').addEventListener('click', exportData);

  // ── Settings: import
  document.getElementById('importFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importData(file);
    e.target.value = '';
  });

  // ── Settings: clear all
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    confirm(
      'Delete ALL entries permanently? This cannot be undone. Export first if you want a backup.',
      () => {
        state.entries = [];
        saveData();
        navigate('home');
        showToast('All data cleared.');
      }
    );
  });

  // ── Overlay: click outside to dismiss
  document.getElementById('confirmOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('confirmOverlay')) {
      document.getElementById('confirmOverlay').classList.add('hidden');
    }
  });

  // ── Browser back button
  window.addEventListener('popstate', e => {
    const v = e.state?.view || 'home';
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + v).classList.add('active');
    state.view = v;
    if (v === 'home') renderHome();
    else if (v === 'detail' && e.state?.id) renderDetail(e.state.id);
  });
}

// ── SERVICE WORKER ───────────────────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline functionality unavailable — non-fatal
    });
  }
}

// ── INIT ─────────────────────────────────────────────────────
function init() {
  loadData();
  bindEvents();
  renderHome();
  requestAnimationFrame(updateTabInk);
  registerSW();

  // Push initial history state
  history.replaceState({ view: 'home' }, '', '#home');
}

document.addEventListener('DOMContentLoaded', init);
