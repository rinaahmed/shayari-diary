/* ============================================================
   KUNWAL KE PHOOL — Shayari Diary
   ============================================================ */

'use strict';

// ── Storage keys ─────────────────────────────────────────────
const STORAGE_KEY  = 'kunwal_entries';
const BACKUP_KEY   = 'kunwal_backup_count';
const SETTINGS_KEY = 'kunwal_settings';

// ── Default seed data: saved poems by other poets only.
//    Kunwal's own shayari will be imported via the Import feature.
const DEFAULT_ENTRIES = [
  {
    id: 'seed-ps-1',
    type: 'saved',
    title: '',
    urdu: 'خوشبو کی طرح میں بھی اڑ جاؤں گی ایک دن\nتم ڈھونڈتے رہنا مجھے دنیا میں کہاں کہاں',
    translit: '',
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
    translit: '',
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
    translit: '',
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
    translit: '',
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
    translit: '',
    english: '',
    author: 'Faiz Ahmed Faiz',
    tags: ['faiz', 'love', 'perspective'],
    dateAdded: '2024-01-05T00:00:00.000Z',
    notes: '',
    isGhazal: false,
    ghazalProgress: null
  }
];

const DEFAULT_SETTINGS = {
  nastaliqScale: 100,
  showTranslit: true,
  dailyReminder: true,
  appLock: false
};

// ── State ────────────────────────────────────────────────────
const state = {
  entries: [],
  settings: { ...DEFAULT_SETTINGS },
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
  return str.split(/\n{2,}/)
    .map(sher => `<p class="sher-block">${esc(sher).replace(/\n/g, '<br>')}</p>`)
    .join('');
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
  return { sher: 'Sher', ghazal: 'Ghazal', saved: 'Mehfil' }[type] || type;
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
  } catch {
    showToast('Storage error — data may not be saved.');
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    state.settings = { ...DEFAULT_SETTINGS };
  }
  applySettings();
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  applySettings();
}

function applySettings() {
  // Nastaliq scale — applied as CSS custom property on :root
  document.documentElement.style.setProperty(
    '--nastaliq-scale', state.settings.nastaliqScale / 100
  );
  // Scale urdu inputs and card text proportionally
  const scale = state.settings.nastaliqScale / 100;
  document.documentElement.style.setProperty(
    '--urdu-card-size', `${1 * scale}rem`
  );
  document.documentElement.style.setProperty(
    '--urdu-detail-size', `${1.25 * scale}rem`
  );
  document.documentElement.style.setProperty(
    '--urdu-input-size', `${1.19 * scale}rem`
  );
}

// ── Navigation ───────────────────────────────────────────────
function navigate(view, params = {}) {
  state.view = view;
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
    renderSettings();
  } else if (view === 'insights') {
    state.viewHistory.push('insights');
    renderInsights();
  } else if (view === 'writing') {
    state.viewHistory.push('writing');
    startWritingMode();
  }

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
      (e.urdu    && e.urdu.toLowerCase().includes(q)) ||
      (e.translit && e.translit.toLowerCase().includes(q)) ||
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
        <div class="empty-ornament"><div class="empty-ornament-diamond"></div></div>
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

const SHER_DIVIDER = `
  <div class="sher-divider">
    <div class="sher-divider-rule"></div>
    <div class="sher-divider-diamond"></div>
    <div class="sher-divider-rule"></div>
  </div>`;

function cardHtml(entry) {
  const type  = entry.type || 'sher';
  const lines = (entry.urdu || '').split('\n').filter(l => l.trim());
  const preview = lines.slice(0, 2).map(esc).join('<br>');
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
    ? `<span class="card-author">— ${esc(entry.author)}</span>`
    : '';

  return `
    <article class="entry-card" data-id="${esc(entry.id)}">
      <div class="card-head">
        <span class="badge badge-${type}">${typeLabel(type)}</span>
        ${nameHtml}
      </div>
      <div class="card-urdu urdu-text">${preview}</div>
      ${moreCount > 0 ? `<p class="card-more">+${moreCount} more line${moreCount > 1 ? 's' : ''}</p>` : ''}
      ${progressHtml}
      ${SHER_DIVIDER}
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

  document.getElementById('formTitle').textContent = id ? 'Edit Entry' : 'New Sher';
  document.getElementById('entryForm').reset();
  document.getElementById('fieldAuthor').value = 'Kunwal';
  document.getElementById('qafiaChips').innerHTML = '';
  document.getElementById('ghazalSection').classList.add('hidden');
  document.getElementById('tagSuggestions').innerHTML = '';

  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  if (!id) {
    document.querySelector('.type-btn[data-type="sher"]').classList.add('active');
  }

  if (id) {
    const entry = state.entries.find(e => e.id === id);
    if (!entry) return;

    document.querySelector(`.type-btn[data-type="${entry.type}"]`)?.classList.add('active');
    document.getElementById('fieldTitle').value   = entry.title   || '';
    document.getElementById('fieldUrdu').value    = entry.urdu    || '';
    document.getElementById('fieldTranslit').value = entry.translit || '';
    document.getElementById('fieldAuthor').value  = entry.author  || 'Kunwal';
    document.getElementById('fieldTags').value    = (entry.tags || []).join(', ');
    document.getElementById('fieldNotes').value   = entry.notes   || '';

    if (entry.type === 'ghazal') {
      document.getElementById('ghazalSection').classList.remove('hidden');
      const gp = entry.ghazalProgress || {};
      document.getElementById('fieldRadif').value         = gp.radif     || '';
      document.getElementById('fieldSherCount').value     = gp.sherCount || 0;
      document.getElementById('checkMatla').checked       = !!gp.hasMatla;
      document.getElementById('checkMaqta').checked       = !!gp.hasMaqta;
      document.getElementById('checkMin5').checked        = (gp.sherCount || 0) >= 5;
      document.getElementById('checkRadifAll').checked    = !!gp.radifAll;
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
    title:    document.getElementById('fieldTitle').value.trim(),
    urdu:     document.getElementById('fieldUrdu').value.trim(),
    translit: document.getElementById('fieldTranslit').value.trim(),
    english:  '',
    author:   document.getElementById('fieldAuthor').value.trim() || 'Kunwal',
    tags:     document.getElementById('fieldTags').value
                .split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    notes:    document.getElementById('fieldNotes').value.trim(),
    isGhazal: type === 'ghazal',
    ghazalProgress: null
  };

  if (type === 'ghazal') {
    entry.ghazalProgress = {
      hasMatla:     document.getElementById('checkMatla').checked,
      hasMaqta:     document.getElementById('checkMaqta').checked,
      sherCount:    parseInt(document.getElementById('fieldSherCount').value, 10) || 0,
      radif:        document.getElementById('fieldRadif').value.trim(),
      qafiaUsed:    [...state.qafiaList],
      behrPolished: document.getElementById('checkBehr').checked,
      radifAll:     document.getElementById('checkRadifAll').checked,
      uniqueQafia:  document.getElementById('checkUniqueQafia').checked,
      noRepeat:     document.getElementById('checkNoRepeat').checked,
      strongImage:  document.getElementById('checkStrongImage').checked,
      standsAlone:  document.getElementById('checkStandsAlone').checked,
      notes:        document.getElementById('fieldPolishNotes').value.trim()
    };
  }

  return entry;
}

function saveEntry() {
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
    const entry = { id: genId(), dateAdded: new Date().toISOString(), ...data };
    state.entries.unshift(entry);
    saveData();
    showToast('Entry saved.');
    navigate('home');

    const count = (parseInt(localStorage.getItem(BACKUP_KEY) || '0', 10)) + 1;
    localStorage.setItem(BACKUP_KEY, String(count));
    if (count % 5 === 0) {
      setTimeout(() => showActionToast('Back up your diary?', 'Export', exportData, 6000), 3200);
    }
  }
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

  const DETAIL_DIVIDER = `
    <div class="detail-sher-divider">
      <div class="detail-sher-divider-rule"></div>
      <div class="detail-sher-divider-diamond"></div>
      <div class="detail-sher-divider-rule"></div>
    </div>`;

  const showTranslit = state.settings.showTranslit && entry.translit;
  const translitHtml = showTranslit
    ? `<div class="detail-transliteration">${esc(entry.translit)}</div>`
    : '';

  let ghazalHtml = '';
  if (type === 'ghazal' && entry.ghazalProgress) {
    const gp = entry.ghazalProgress;
    const pills = [
      { label: 'Matla',         done: gp.hasMatla },
      { label: 'Maqta',         done: gp.hasMaqta },
      { label: `${gp.sherCount || 0} sher`, done: (gp.sherCount || 0) >= 5 },
      { label: 'Behr',          done: gp.behrPolished },
      { label: 'Radif',         done: gp.radifAll },
      { label: 'Qafia',         done: gp.uniqueQafia },
      { label: 'No repeat',     done: gp.noRepeat },
      { label: 'Strong image',  done: gp.strongImage },
      { label: 'Stands alone',  done: gp.standsAlone }
    ];
    ghazalHtml = `
      <div class="detail-ghazal-progress">
        <p class="ghazal-progress-title">Ghazal Progress</p>
        <div class="progress-pills">
          ${pills.map(p =>
            `<span class="progress-pill ${p.done ? 'done' : 'pending'}">${p.label} ${p.done ? '✓' : '–'}</span>`
          ).join('')}
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
        ${translitHtml}
      </div>
      <div class="detail-byline">
        <span class="detail-author">— ${esc(entry.author || 'Kunwal')}</span>
        <span class="detail-date">${fmtDateLong(entry.dateAdded)}</span>
      </div>
      ${tagsHtml}
      ${ghazalHtml}
      ${entry.notes ? `<div class="detail-notes">${esc(entry.notes)}</div>` : ''}
    </div>`;
}

// ── INSIGHTS VIEW ─────────────────────────────────────────────
function renderInsights() {
  const container = document.getElementById('insightsContent');

  const sherCount   = state.entries.filter(e => e.type === 'sher').length;
  const ghazalCount = state.entries.filter(e => e.type === 'ghazal').length;
  const mehfilCount = state.entries.filter(e => e.type === 'saved').length;

  // "Writing since" — only user's own compositions (sher/ghazal), not saved Mehfil poems
  const now = new Date();
  const ownDates = state.entries
    .filter(e => e.type === 'sher' || e.type === 'ghazal')
    .map(e => new Date(e.dateAdded)).filter(d => !isNaN(d));
  const firstOwnDate = ownDates.length ? new Date(Math.min(...ownDates)) : null;

  // Monthly histogram — current calendar year Jan–Dec
  const MONTHS_ABBR = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const CHART_H = 68;
  const year = now.getFullYear();

  const monthlyCounts = Array(12).fill(0);
  state.entries.forEach(e => {
    const d = new Date(e.dateAdded);
    if (d.getFullYear() === year) {
      monthlyCounts[d.getMonth()]++;
    }
  });
  const monthLabels = MONTHS_ABBR.slice();
  const maxCount = Math.max(...monthlyCounts, 1);
  const chartBarsHtml = monthlyCounts.map((c, i) => {
    const h = c === 0 ? 3 : Math.max(6, Math.round((c / maxCount) * CHART_H));
    const cls = c === maxCount ? 'peak' : c >= maxCount * 0.5 ? 'mid' : 'low';
    return `
      <div class="chart-col">
        <div class="chart-bar ${cls}" style="height:${h}px"></div>
        <span class="chart-month">${monthLabels[i]}</span>
      </div>`;
  }).join('');

  // Theme frequency
  const tagFreq = {};
  state.entries.forEach(e => (e.tags || []).forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
  const topTags = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxTagCount = topTags.length ? topTags[0][1] : 1;
  const themeBarsHtml = topTags.length
    ? topTags.map(([tag, cnt]) => `
        <div class="theme-bar-row">
          <span class="theme-bar-label">${esc(tag)}</span>
          <div class="theme-bar-track">
            <div class="theme-bar-fill" style="width:${Math.round((cnt / maxTagCount) * 100)}%"></div>
          </div>
          <span class="theme-bar-count">${cnt}</span>
        </div>`).join('')
    : '<p style="font-size:.82rem;color:var(--muted);padding:4px 0">No themes yet.</p>';

  // Favourite line — most recently added sher (user's own only)
  const favEntry = state.entries
    .filter(e => e.type === 'sher')
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))[0];
  const favLine = favEntry
    ? (favEntry.urdu || '').split('\n').filter(Boolean)[0] || ''
    : '';

  container.innerHTML = `
    <div class="stat-tiles">
      <div class="stat-tile">
        <span class="stat-number">${sherCount}</span>
        <span class="stat-label">Sher</span>
      </div>
      <div class="stat-tile">
        <span class="stat-number">${ghazalCount}</span>
        <span class="stat-label">Ghazals</span>
      </div>
      <div class="stat-tile">
        <span class="stat-number">${mehfilCount}</span>
        <span class="stat-label">Mehfil</span>
      </div>
    </div>

    <div class="chart-section">
      <p class="chart-section-title">This year's writing</p>
      <div class="chart-bars">${chartBarsHtml}</div>
    </div>

    <div class="themes-section">
      <p class="themes-section-title">Most-used themes</p>
      ${themeBarsHtml}
    </div>

    <div class="insights-closing">
      <div class="insights-closing-ornament">
        <div class="insights-closing-diamond"></div>
      </div>
      ${favLine ? `<p class="insights-fav-line">${esc(favLine)}</p>` : ''}
      ${firstOwnDate ? `<p class="insights-since">Writing since ${fmtDateLong(firstOwnDate.toISOString())}</p>` : ''}
    </div>`;
}

// ── SETTINGS VIEW ─────────────────────────────────────────────
function renderSettings() {
  const s = state.settings;

  const slider = document.getElementById('nastaliqSlider');
  slider.value = s.nastaliqScale;
  updateSliderGradient(slider);

  document.getElementById('toggleTranslit').checked  = s.showTranslit;
  document.getElementById('toggleReminder').checked  = s.dailyReminder;
  document.getElementById('toggleAppLock').checked   = s.appLock;
}

function updateSliderGradient(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.setProperty('--slider-pct', pct + '%');
}

// ── WRITING MODE ──────────────────────────────────────────────
let writingTimeInterval = null;

function startWritingMode() {
  const textarea = document.getElementById('writingTextarea');
  textarea.value = '';
  textarea.focus();
  updateWritingCounts();
  updateWritingTime();
  clearInterval(writingTimeInterval);
  writingTimeInterval = setInterval(updateWritingTime, 30000);
}

function updateWritingCounts() {
  const text  = document.getElementById('writingTextarea').value;
  const lines = text.split('\n').filter(l => l.trim()).length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('writingCounts').textContent = `${lines} misra · ${words} words`;
}

function updateWritingTime() {
  const now = new Date();
  const h   = now.getHours();
  const m   = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = ((h % 12) || 12);
  const el = document.getElementById('writingTime');
  if (el) el.textContent = `the hour of poets · ${h12}:${m} ${ampm}`;
}

function exitWritingMode() {
  clearInterval(writingTimeInterval);
  const text = document.getElementById('writingTextarea').value.trim();
  if (text) {
    // Pre-fill the form with written text
    navigate('form');
    document.getElementById('fieldUrdu').value = text;
  } else {
    goBack();
  }
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
  localStorage.setItem(BACKUP_KEY, '0');
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
          entry.type     = entry.type     || 'sher';
          entry.author   = entry.author   || 'Kunwal';
          entry.tags     = entry.tags     || [];
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
  const el  = document.getElementById('toast');
  const btn = document.getElementById('toastAction');
  document.getElementById('toastMsg').textContent = msg;
  btn.classList.add('hidden');
  el.classList.remove('has-action');
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

function showActionToast(msg, btnLabel, onAction, duration = 4200) {
  const el  = document.getElementById('toast');
  const btn = document.getElementById('toastAction');
  document.getElementById('toastMsg').textContent = msg;
  btn.textContent = btnLabel;
  btn.classList.remove('hidden');
  btn.onclick = () => {
    clearTimeout(toastTimer);
    el.classList.remove('show', 'has-action');
    onAction();
  };
  el.classList.add('show', 'has-action');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show', 'has-action'), duration);
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
  if (entry.translit) text += '\n\n' + entry.translit;
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

  // Home: insights button
  document.getElementById('insightsBtn').addEventListener('click', () => navigate('insights'));

  // Home: settings button
  document.getElementById('settingsBtn').addEventListener('click', () => navigate('settings'));

  // Home: tabs
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

  // Home: search
  document.getElementById('searchInput').addEventListener('input', e => {
    state.search = e.target.value;
    renderEntryList();
  });

  // Home: FAB
  document.getElementById('addBtn').addEventListener('click', () => navigate('form'));

  // Form: cancel
  document.getElementById('formCancelBtn').addEventListener('click', () => navigate('home'));

  // Form: save pill
  document.getElementById('saveBtn').addEventListener('click', saveEntry);

  // Form: also submit via enter/form submit
  document.getElementById('entryForm').addEventListener('submit', e => {
    e.preventDefault();
    saveEntry();
  });

  // Form: type buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.type;
      document.getElementById('ghazalSection').classList.toggle('hidden', type !== 'ghazal');

      const authorField = document.getElementById('fieldAuthor');
      if (type === 'saved') {
        if (authorField.value === 'Kunwal') authorField.value = '';
        authorField.placeholder = 'Poet name…';
      } else {
        if (!authorField.value) authorField.value = 'Kunwal';
        authorField.placeholder = 'Kunwal';
      }
    });
  });

  // Form: sher count drives checkMin5
  document.getElementById('fieldSherCount').addEventListener('input', e => {
    document.getElementById('checkMin5').checked = parseInt(e.target.value, 10) >= 5;
  });

  // Form: qafia chip input
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

  // Detail: back
  document.getElementById('detailBackBtn').addEventListener('click', () => navigate('home'));

  // Detail: edit
  document.getElementById('editBtn').addEventListener('click', () => {
    navigate('form', { id: state.viewingId });
  });

  // Detail: delete with undo
  document.getElementById('deleteBtn').addEventListener('click', () => {
    confirm('Delete this entry?', () => {
      const id  = state.viewingId;
      const idx = state.entries.findIndex(e => e.id === id);
      const deleted = { ...state.entries[idx] };
      state.entries.splice(idx, 1);
      navigate('home');

      let committed = false;
      showActionToast('Entry deleted.', 'Undo', () => {
        state.entries.splice(idx, 0, deleted);
        saveData();
        renderHome();
        committed = true;
      });
      setTimeout(() => { if (!committed) saveData(); }, 4700);
    });
  });

  // Detail: share/copy
  document.getElementById('shareBtn').addEventListener('click', () => {
    shareEntry(state.viewingId);
  });

  // Insights: back
  document.getElementById('insightsBackBtn').addEventListener('click', () => navigate('home'));

  // Settings: back
  document.getElementById('settingsBackBtn').addEventListener('click', () => navigate('home'));

  // Settings: nastaliq slider
  document.getElementById('nastaliqSlider').addEventListener('input', e => {
    state.settings.nastaliqScale = parseInt(e.target.value, 10);
    updateSliderGradient(e.target);
    saveSettings();
  });

  // Settings: toggles
  document.getElementById('toggleTranslit').addEventListener('change', e => {
    state.settings.showTranslit = e.target.checked;
    saveSettings();
  });
  document.getElementById('toggleReminder').addEventListener('change', e => {
    state.settings.dailyReminder = e.target.checked;
    saveSettings();
  });
  document.getElementById('toggleAppLock').addEventListener('change', e => {
    state.settings.appLock = e.target.checked;
    saveSettings();
  });

  // Settings: export
  document.getElementById('exportBtn').addEventListener('click', exportData);

  // Settings: import
  document.getElementById('importFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importData(file);
    e.target.value = '';
  });

  // Settings: clear all
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

  // Writing mode: done
  document.getElementById('writingDoneBtn').addEventListener('click', exitWritingMode);

  // Writing mode: count updates
  document.getElementById('writingTextarea').addEventListener('input', updateWritingCounts);

  // Overlay: click outside
  document.getElementById('confirmOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('confirmOverlay')) {
      document.getElementById('confirmOverlay').classList.add('hidden');
    }
  });

  // Browser back button
  window.addEventListener('popstate', e => {
    const v = e.state?.view || 'home';
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + v)?.classList.add('active');
    state.view = v;
    if (v === 'home') renderHome();
    else if (v === 'detail' && e.state?.id) renderDetail(e.state.id);
  });
}

// ── SERVICE WORKER ───────────────────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
  }
}

// ── INIT ─────────────────────────────────────────────────────
function init() {
  loadData();
  loadSettings();
  bindEvents();
  renderHome();
  requestAnimationFrame(updateTabInk);
  registerSW();
  history.replaceState({ view: 'home' }, '', '#home');
}

document.addEventListener('DOMContentLoaded', init);
