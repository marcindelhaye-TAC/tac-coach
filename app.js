/* ============================================================================
   Tour Against Cancer — Coach
   Endurance coaching & athlete monitoring PWA (single-device, local storage).
   ============================================================================ */

/* ------------------------------ Config ---------------------------------- */
const SPORTS = {
  biking:     { label: 'Biking',            color: '#ff6b35', icon: '🚴' },
  running:    { label: 'Running',           color: '#4cc9f0', icon: '🏃' },
  walking:    { label: 'Walking',           color: '#90be6d', icon: '🚶' },
  swimming:   { label: 'Swimming',          color: '#4361ee', icon: '🏊' },
  strength:   { label: 'Strength',          color: '#b5179e', icon: '🏋️' },
  injury:     { label: 'Injury prevention', color: '#f9c74f', icon: '🩹' },
  stretching: { label: 'Stretching',        color: '#43aa8b', icon: '🧘' },
  other:      { label: 'Other',             color: '#8d99ae', icon: '⭐' }
};

const DEFAULT_POWER_ZONES = [
  { name: 'Z1 Active recovery', min: 0,   max: 55 },
  { name: 'Z2 Endurance',       min: 56,  max: 75 },
  { name: 'Z3 Tempo',           min: 76,  max: 90 },
  { name: 'Z4 Threshold',       min: 91,  max: 105 },
  { name: 'Z5 VO2max',          min: 106, max: 120 },
  { name: 'Z6 Anaerobic',       min: 121, max: 150 },
  { name: 'Z7 Neuromuscular',   min: 151, max: 300 }
];
const DEFAULT_HR_ZONES = [
  { name: 'Z1 Recovery',   min: 0,  max: 68 },
  { name: 'Z2 Endurance',  min: 69, max: 83 },
  { name: 'Z3 Tempo',      min: 84, max: 94 },
  { name: 'Z4 Threshold',  min: 95, max: 105 },
  { name: 'Z5 Anaerobic',  min: 106, max: 130 }
];
const DEFAULT_PACE_ZONES = [
  { name: 'Z1 Easy',       min: 78,  max: 88 },
  { name: 'Z2 Endurance',  min: 88,  max: 95 },
  { name: 'Z3 Tempo',      min: 95,  max: 100 },
  { name: 'Z4 Threshold',  min: 100, max: 106 },
  { name: 'Z5 Interval',   min: 106, max: 130 }
];

/* ------------------------------ State ----------------------------------- */
const LS_KEY = 'tac_coach_state_v1';

function uid() { return Math.random().toString(36).slice(2, 10); }

function seed() {
  const a1 = uid();
  const t = new Date();
  const iso = (offset) => toISO(addDays(t, offset));
  return {
    role: 'coach',
    currentAthleteId: a1,
    ui: { view: 'dashboard', calMonth: t.getMonth(), calYear: t.getFullYear() },
    settings: { weekStart: 1, intervals: { apiKey: '', athleteId: '', lastSync: null } },
    athletes: [{
      id: a1, name: 'Demo Athlete', email: '', sport: 'biking',
      ftp: 250, maxHr: 190, thresholdHr: 168, thresholdPace: 240, /* sec/km */
      powerZones: clone(DEFAULT_POWER_ZONES),
      hrZones: clone(DEFAULT_HR_ZONES),
      paceZones: clone(DEFAULT_PACE_ZONES)
    }],
    sessions: [
      { id: uid(), athleteId: a1, date: iso(0), sport: 'biking', name: 'Endurance ride', duration: 90, load: 75, desc: '2x20min Z2 tempo, rest 5min easy.', strength: [], status: 'planned' },
      { id: uid(), athleteId: a1, date: iso(1), sport: 'strength', name: 'Full body strength', duration: 45, load: 30, desc: 'Focus on legs & core.', status: 'planned',
        strength: [
          { exercise: 'Back squat', sets: 4, reps: '6', weight: '80kg', rest: '2:00' },
          { exercise: 'Romanian deadlift', sets: 3, reps: '8', weight: '60kg', rest: '1:30' },
          { exercise: 'Plank', sets: 3, reps: '45s', weight: '-', rest: '1:00' }
        ] },
      { id: uid(), athleteId: a1, date: iso(2), sport: 'running', name: 'Easy run', duration: 40, load: 35, desc: 'Zone 2 conversational pace.', strength: [], status: 'planned' }
    ],
    library: [
      { id: uid(), sport: 'biking', name: 'Sweet spot 3x12', duration: 75, load: 68, desc: '3x12min @ 88-93% FTP, 5min recovery.', strength: [] },
      { id: uid(), sport: 'swimming', name: 'Technique + endurance', duration: 60, load: 40, desc: '400 warmup, 8x100 drills, 800 steady.', strength: [] }
    ],
    questionnaires: [{
      id: uid(), title: 'Athlete intake', questions: [
        { id: uid(), type: 'scale', text: 'Current motivation (1-10)' },
        { id: uid(), type: 'choice', text: 'Main goal this season', options: ['Fitness', 'Race performance', 'Weight', 'Return from injury'] },
        { id: uid(), type: 'text', text: 'Any injuries or limitations?' }
      ]
    }],
    responses: [],   /* questionnaire responses */
    checkins: { sleep: [], session: [], weekly: [] },
    tests: [
      { id: uid(), athleteId: a1, date: iso(-28), type: 'FTP test (20-min)', sport: 'biking',
        primary: { value: 240, unit: 'W' },
        metrics: [{ label: '20-min power', value: 253, unit: 'W' }, { label: 'Weight', value: 72, unit: 'kg' }, { label: 'W/kg', value: 3.3, unit: '' }],
        notes: 'Baseline test, felt strong.' }
    ]
  };
}

function clone(x) { return JSON.parse(JSON.stringify(x)); }

const TEST_TYPES = ['FTP test (20-min)', 'Ramp test', 'VO2max test', 'Lactate threshold', 'Critical power', 'Time trial', 'Cooper 12-min', '5-min power test', 'Sprint test', 'Swim CSS', 'Running field test', 'Body composition', 'Other'];

let state = load();
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) {}
  return seed();
}
/* keep older saved states forward-compatible when new features are added */
function migrate(s) {
  if (!Array.isArray(s.tests)) s.tests = [];
  if (!s.checkins) s.checkins = { sleep: [], session: [], weekly: [] };
  return s;
}
function save() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

/* ------------------------------ Date utils ------------------------------ */
function toISO(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fromISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function todayISO() { return toISO(new Date()); }
function fmtDate(s) { return fromISO(s).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }
function weekKey(d) {
  const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day);
  return toISO(x);
}
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ------------------------------ Helpers --------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function currentAthlete() { return state.athletes.find(a => a.id === state.currentAthleteId) || state.athletes[0]; }
function athleteSessions(id) { return state.sessions.filter(s => s.athleteId === id); }

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

/* ------------------------------ Modal ----------------------------------- */
function openModal(title, bodyHTML, footHTML) {
  const root = $('#modal-root');
  root.innerHTML = `
    <div class="overlay" data-overlay>
      <div class="modal" role="dialog" aria-modal="true">
        <div class="mhead"><h3>${esc(title)}</h3><button class="x" data-close>&times;</button></div>
        <div class="mbody">${bodyHTML}</div>
        ${footHTML ? `<div class="mfoot">${footHTML}</div>` : ''}
      </div>
    </div>`;
  root.querySelector('[data-overlay]').addEventListener('mousedown', (e) => { if (e.target.dataset.overlay !== undefined) closeModal(); });
  root.querySelector('[data-close]').addEventListener('click', closeModal);
  return root.querySelector('.modal');
}
function closeModal() { $('#modal-root').innerHTML = ''; }

/* ------------------------------ Nav / Router ---------------------------- */
const NAV = [
  { id: 'dashboard',      label: 'Dashboard',      icon: '📊', roles: ['coach', 'athlete'] },
  { id: 'calendar',       label: 'Calendar',       icon: '📅', roles: ['coach', 'athlete'] },
  { id: 'library',        label: 'Workouts',       icon: '📚', roles: ['coach'] },
  { id: 'questionnaires', label: 'Questionnaires', icon: '📝', roles: ['coach', 'athlete'] },
  { id: 'testing',        label: 'Testing',        icon: '🧪', roles: ['coach', 'athlete'] },
  { id: 'athletes',       label: 'Athletes & Zones', icon: '⚙️', roles: ['coach'] },
  { id: 'monitor',        label: 'Monitoring',     icon: '❤️', roles: ['coach'] },
  { id: 'settings',       label: 'Settings',       icon: '🔌', roles: ['coach'] }
];
function navForRole() { return NAV.filter(n => n.roles.includes(state.role)); }
function go(view) { state.ui.view = view; save(); render(); window.scrollTo(0, 0); }

/* ============================================================================
   RENDER
   ============================================================================ */
function render() {
  const nav = navForRole();
  if (!nav.find(n => n.id === state.ui.view)) state.ui.view = 'dashboard';
  const view = state.ui.view;

  const app = $('#app');
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <img src="./icons/logo.svg" alt="logo"/>
          <div><h1>Tour Against Cancer</h1><small>Coaching platform</small></div>
        </div>
        <nav class="nav">
          ${nav.map(n => `<button data-nav="${n.id}" class="${view === n.id ? 'active' : ''}"><span class="ico">${n.icon}</span>${n.label}</button>`).join('')}
        </nav>
        <div class="role-switch">
          <div class="seg">
            <button data-role="coach" class="${state.role === 'coach' ? 'active' : ''}">Coach</button>
            <button data-role="athlete" class="${state.role === 'athlete' ? 'active' : ''}">Athlete</button>
          </div>
          <div class="who">
            Athlete
            <select data-athlete-select>
              ${state.athletes.map(a => `<option value="${a.id}" ${a.id === state.currentAthleteId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
            </select>
          </div>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <h2>${nav.find(n => n.id === view)?.label || ''}</h2>
          <div class="actions" id="topbar-actions"></div>
        </div>
        <div class="content" id="view"></div>
      </main>

      <nav class="mobile-nav">
        ${nav.map(n => `<button data-nav="${n.id}" class="${view === n.id ? 'active' : ''}"><span class="ico">${n.icon}</span>${n.label}</button>`).join('')}
      </nav>
    </div>`;

  $$('[data-nav]').forEach(b => b.addEventListener('click', () => go(b.dataset.nav)));
  $$('[data-role]').forEach(b => b.addEventListener('click', () => { state.role = b.dataset.role; save(); render(); }));
  $('[data-athlete-select]').addEventListener('change', (e) => { state.currentAthleteId = e.target.value; save(); render(); });

  const views = {
    dashboard: viewDashboard, calendar: viewCalendar, library: viewLibrary,
    questionnaires: viewQuestionnaires, testing: viewTesting, athletes: viewAthletes, monitor: viewMonitor, settings: viewSettings
  };
  (views[view] || viewDashboard)();
}

/* ------------------------------ Dashboard ------------------------------- */
function viewDashboard() {
  const v = $('#view');
  const a = currentAthlete();
  const isAthlete = state.role === 'athlete';

  const prompts = pendingPrompts(a);
  const upcoming = athleteSessions(a.id).filter(s => s.date >= todayISO() && s.status !== 'done')
    .sort((x, y) => x.date.localeCompare(y.date)).slice(0, 5);
  const doneCount = athleteSessions(a.id).filter(s => s.status === 'done').length;
  const plannedCount = athleteSessions(a.id).filter(s => s.status !== 'done').length;
  const weekLoad = athleteSessions(a.id).filter(s => weekKey(fromISO(s.date)) === weekKey(new Date()))
    .reduce((n, s) => n + (Number(s.load) || 0), 0);
  const lastSleep = [...state.checkins.sleep].filter(s => s.athleteId === a.id).sort((x, y) => y.date.localeCompare(x.date))[0];

  v.innerHTML = `
    ${prompts.length ? `<div class="grid" style="margin-bottom:16px">${prompts.map(p => p.html).join('')}</div>` : ''}

    <div class="grid cols-4">
      <div class="card stat"><span class="l">Week load (TSS)</span><span class="v">${weekLoad}</span><div class="grad-bar"></div></div>
      <div class="card stat"><span class="l">Planned</span><span class="v">${plannedCount}</span></div>
      <div class="card stat"><span class="l">Completed</span><span class="v">${doneCount}</span></div>
      <div class="card stat"><span class="l">FTP / Max HR</span><span class="v">${a.ftp}<small style="font-size:14px;color:var(--muted)"> W</small></span><span class="sub">${a.maxHr} bpm max</span></div>
    </div>

    <div class="section-title">Upcoming sessions</div>
    <div class="list">
      ${upcoming.length ? upcoming.map(s => sessionRow(s)).join('') : '<div class="empty">Nothing scheduled. Add sessions on the Calendar.</div>'}
    </div>

    <div class="grid cols-2" style="margin-top:20px">
      <div class="card">
        <h3>Recent sleep</h3>
        ${lastSleep ? `<div class="sub">${fmtDate(lastSleep.date)}</div><div class="stat" style="margin-top:8px"><span class="v">${lastSleep.hours}h</span><span class="l">Quality ${lastSleep.quality}/10 · felt ${lastSleep.feel}/10</span></div>` : '<div class="empty">No sleep check-ins yet.</div>'}
      </div>
      <div class="card">
        <h3>Load — last 8 weeks</h3>
        ${sparkline(loadHistory(a.id, 8))}
        <div class="sub" style="margin-top:8px">Weekly training load trend</div>
      </div>
    </div>`;

  $$('[data-open-session]').forEach(b => b.addEventListener('click', () => openSessionModal(b.dataset.openSession)));
  bindPromptButtons();
}

function pendingPrompts(a) {
  const out = [];
  const today = todayISO();

  // Morning sleep
  const hasSleep = state.checkins.sleep.some(s => s.athleteId === a.id && s.date === today);
  if (!hasSleep) out.push({ html: `
    <div class="prompt"><span class="icon">🌙</span>
      <div class="grow"><b>Morning check-in</b><div class="sub">How did you sleep last night?</div></div>
      <button class="btn primary sm" data-prompt="sleep">Answer</button></div>` });

  // Post-session RPE (done but no rpe)
  const pending = athleteSessions(a.id).filter(s => s.status === 'done' && (s.rpe == null));
  if (pending.length) out.push({ html: `
    <div class="prompt"><span class="icon">✅</span>
      <div class="grow"><b>Session feedback</b><div class="sub">${pending.length} completed session(s) need an RPE & how you felt.</div></div>
      <button class="btn primary sm" data-prompt="rpe" data-sid="${pending[0].id}">Answer</button></div>` });

  // Weekly reflection (on/after Sunday, once per week)
  const wk = weekKey(new Date());
  const hasWeekly = state.checkins.weekly.some(w => w.athleteId === a.id && w.week === wk);
  const isSunday = new Date().getDay() === 0;
  if (isSunday && !hasWeekly) out.push({ html: `
    <div class="prompt"><span class="icon">📆</span>
      <div class="grow"><b>Weekly reflection</b><div class="sub">How did this week's training feel?</div></div>
      <button class="btn primary sm" data-prompt="weekly">Answer</button></div>` });

  return out;
}
function bindPromptButtons() {
  $$('[data-prompt]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.prompt === 'sleep') openSleepModal();
    if (b.dataset.prompt === 'rpe') openRpeModal(b.dataset.sid);
    if (b.dataset.prompt === 'weekly') openWeeklyModal();
  }));
}

function sessionRow(s) {
  const sp = SPORTS[s.sport] || SPORTS.other;
  return `<div class="row">
    <span class="dot" style="background:${sp.color}"></span>
    <div class="grow">
      <div class="title">${sp.icon} ${esc(s.name)}</div>
      <div class="meta">${fmtDate(s.date)} · ${sp.label} · ${s.duration || 0} min · ${s.load || 0} TSS</div>
    </div>
    ${s.status === 'done' ? '<span class="badge"><span class="dot" style="background:var(--ok)"></span>Done</span>' : ''}
    <button class="btn sm" data-open-session="${s.id}">Open</button>
  </div>`;
}

function loadHistory(aid, weeks) {
  const arr = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const wk = weekKey(addDays(new Date(), -i * 7));
    const load = state.sessions.filter(s => s.athleteId === aid && weekKey(fromISO(s.date)) === wk)
      .reduce((n, s) => n + (Number(s.load) || 0), 0);
    arr.push(load);
  }
  return arr;
}
function sparkline(vals) {
  const max = Math.max(1, ...vals);
  return `<div class="spark">${vals.map(v => `<span style="height:${Math.round((v / max) * 100)}%" title="${v} TSS"></span>`).join('')}</div>`;
}

/* ------------------------------ Calendar -------------------------------- */
function viewCalendar() {
  const actions = $('#topbar-actions');
  actions.innerHTML = state.role === 'coach'
    ? `<button class="btn primary sm" id="add-session">+ Add session</button>`
    : `<span class="badge">Drag sessions to reschedule</span>`;
  if (state.role === 'coach') $('#add-session').addEventListener('click', () => openSessionModal(null));

  drawCalendar();
}

function drawCalendar() {
  const v = $('#view');
  const a = currentAthlete();
  const { calMonth: m, calYear: y } = state.ui;
  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-based
  const gridStart = addDays(first, -startOffset);

  let cells = '';
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const iso = toISO(d);
    const inMonth = d.getMonth() === m;
    const isToday = iso === todayISO();
    const daySessions = athleteSessions(a.id).filter(s => s.date === iso);
    const dayLoad = daySessions.reduce((n, s) => n + (Number(s.load) || 0), 0);
    cells += `
      <div class="cal-cell ${inMonth ? '' : 'dim'} ${isToday ? 'today' : ''}" data-day="${iso}">
        <div class="d"><span>${d.getDate()}</span>${dayLoad ? `<span class="load">${dayLoad} TSS</span>` : ''}</div>
        ${daySessions.map(s => sessionChip(s)).join('')}
      </div>`;
  }

  v.innerHTML = `
    <div class="cal-head">
      <div class="btn-row">
        <button class="btn sm" id="cal-prev">‹</button>
        <button class="btn sm" id="cal-today">Today</button>
        <button class="btn sm" id="cal-next">›</button>
      </div>
      <h3 style="margin:0">${MONTHS[m]} ${y}</h3>
      <div class="btn-row">${Object.entries(SPORTS).map(([k, s]) => `<span class="badge"><span class="dot" style="background:${s.color}"></span>${s.label}</span>`).slice(0,4).join('')}</div>
    </div>
    <div class="cal-grid">${DOW.map(d => `<div class="cal-dow">${d}</div>`).join('')}</div>
    <div class="cal-grid" id="cal-body">${cells}</div>`;

  $('#cal-prev').addEventListener('click', () => shiftMonth(-1));
  $('#cal-next').addEventListener('click', () => shiftMonth(1));
  $('#cal-today').addEventListener('click', () => { const t = new Date(); state.ui.calMonth = t.getMonth(); state.ui.calYear = t.getFullYear(); save(); drawCalendar(); });

  bindCalendarDnD();
}
function shiftMonth(n) {
  let m = state.ui.calMonth + n, y = state.ui.calYear;
  if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
  state.ui.calMonth = m; state.ui.calYear = y; save(); drawCalendar();
}

function sessionChip(s) {
  const sp = SPORTS[s.sport] || SPORTS.other;
  return `<div class="sess ${s.status === 'done' ? 'done' : ''}" draggable="true" data-sess="${s.id}" style="border-left-color:${sp.color}">
    <div class="t">${sp.icon} ${esc(s.name)} ${s.status === 'done' ? '<span class="check">✓</span>' : ''}</div>
    <div class="m">${s.duration || 0}min · ${s.load || 0} TSS</div>
  </div>`;
}

let dragId = null;
function bindCalendarDnD() {
  $$('.sess').forEach(el => {
    el.addEventListener('dragstart', (e) => { dragId = el.dataset.sess; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => el.style.opacity = '.4', 0); });
    el.addEventListener('dragend', () => { el.style.opacity = '1'; dragId = null; });
    el.addEventListener('click', (e) => { e.stopPropagation(); openSessionModal(el.dataset.sess); });
  });
  $$('.cal-cell').forEach(cell => {
    cell.addEventListener('dragover', (e) => { e.preventDefault(); cell.classList.add('drop-hover'); });
    cell.addEventListener('dragleave', () => cell.classList.remove('drop-hover'));
    cell.addEventListener('drop', (e) => {
      e.preventDefault(); cell.classList.remove('drop-hover');
      if (!dragId) return;
      const s = state.sessions.find(x => x.id === dragId);
      if (s) { s.date = cell.dataset.day; save(); drawCalendar(); toast('Session moved to ' + fmtDate(s.date)); }
    });
    // click empty cell to add (coach)
    cell.addEventListener('click', () => { if (state.role === 'coach') openSessionModal(null, cell.dataset.day); });
  });
}

/* ------------------------------ Session modal --------------------------- */
function openSessionModal(id, presetDate) {
  const editing = id ? state.sessions.find(s => s.id === id) : null;
  const s = editing || { id: null, sport: 'biking', name: '', duration: 60, load: 50, date: presetDate || todayISO(), desc: '', strength: [], status: 'planned' };
  const canEdit = state.role === 'coach';

  const sportOpts = Object.entries(SPORTS).map(([k, sp]) => `<option value="${k}" ${s.sport === k ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`).join('');

  const body = `
    <label>Sport</label>
    <select id="f-sport" ${canEdit ? '' : 'disabled'}>${sportOpts}</select>
    <label>Session name</label>
    <input id="f-name" value="${esc(s.name)}" ${canEdit ? '' : 'disabled'} placeholder="e.g. Threshold intervals"/>
    <div class="inline">
      <div><label>Date</label><input id="f-date" type="date" value="${s.date}"/></div>
      <div><label>Duration (min)</label><input id="f-dur" type="number" value="${s.duration || 0}" ${canEdit ? '' : 'disabled'}/></div>
      <div><label>Load (TSS)</label><input id="f-load" type="number" value="${s.load || 0}" ${canEdit ? '' : 'disabled'}/></div>
    </div>
    <label>Workout / steps</label>
    <textarea id="f-desc" ${canEdit ? '' : 'disabled'} placeholder="e.g. 2x20min @ 95% FTP, 5min recovery">${esc(s.desc)}</textarea>
    <div id="strength-block"></div>
  `;
  const foot = `
    ${editing && canEdit ? '<button class="btn danger" id="f-del">Delete</button>' : ''}
    ${s.status !== 'done' ? '<button class="btn" id="f-done">Mark complete</button>' : '<span class="badge"><span class="dot" style="background:var(--ok)"></span>Completed</span>'}
    <button class="btn primary" id="f-save">${canEdit ? 'Save' : 'Save date'}</button>`;

  openModal(editing ? 'Edit session' : 'New session', body, foot);

  const strengthState = clone(s.strength || []);
  renderStrengthEditor(strengthState, canEdit);

  $('#f-sport').addEventListener('change', () => renderStrengthEditor(strengthState, canEdit));

  $('#f-save').addEventListener('click', () => {
    const obj = {
      id: s.id || uid(), athleteId: state.currentAthleteId,
      sport: $('#f-sport').value, name: $('#f-name').value.trim() || 'Untitled',
      date: $('#f-date').value, duration: Number($('#f-dur').value) || 0, load: Number($('#f-load').value) || 0,
      desc: $('#f-desc').value, strength: strengthState, status: s.status || 'planned',
      rpe: s.rpe, feeling: s.feeling, feltNote: s.feltNote
    };
    if (editing) Object.assign(editing, obj); else state.sessions.push(obj);
    save(); closeModal(); render(); toast('Saved');
  });

  if ($('#f-del')) $('#f-del').addEventListener('click', () => {
    state.sessions = state.sessions.filter(x => x.id !== s.id); save(); closeModal(); render(); toast('Deleted');
  });
  if ($('#f-done')) $('#f-done').addEventListener('click', () => {
    const target = editing || (() => { const o = { ...s, id: uid(), athleteId: state.currentAthleteId, strength: strengthState }; state.sessions.push(o); return o; })();
    target.status = 'done'; save(); closeModal(); render();
    openRpeModal(target.id); // trigger post-session check-in
  });
}

function renderStrengthEditor(list, canEdit) {
  const block = $('#strength-block');
  if (!block) return;
  if ($('#f-sport').value !== 'strength') { block.innerHTML = ''; return; }
  block.innerHTML = `
    <label>Strength exercises</label>
    <table class="ztable"><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th><th>Rest</th>${canEdit ? '<th></th>' : ''}</tr></thead>
      <tbody id="str-rows"></tbody></table>
    ${canEdit ? '<div class="btn-row" style="margin-top:8px"><button class="btn sm" id="str-add">+ Add exercise</button></div>' : ''}`;
  const rows = $('#str-rows');
  function draw() {
    rows.innerHTML = list.map((ex, i) => `
      <tr>
        <td><input data-si="${i}" data-k="exercise" value="${esc(ex.exercise)}" ${canEdit ? '' : 'disabled'}/></td>
        <td><input data-si="${i}" data-k="sets" value="${esc(ex.sets)}" ${canEdit ? '' : 'disabled'} style="width:56px"/></td>
        <td><input data-si="${i}" data-k="reps" value="${esc(ex.reps)}" ${canEdit ? '' : 'disabled'} style="width:64px"/></td>
        <td><input data-si="${i}" data-k="weight" value="${esc(ex.weight)}" ${canEdit ? '' : 'disabled'} style="width:74px"/></td>
        <td><input data-si="${i}" data-k="rest" value="${esc(ex.rest)}" ${canEdit ? '' : 'disabled'} style="width:64px"/></td>
        ${canEdit ? `<td><button class="x" data-del="${i}">&times;</button></td>` : ''}
      </tr>`).join('');
    $$('#str-rows input').forEach(inp => inp.addEventListener('input', () => { list[inp.dataset.si][inp.dataset.k] = inp.value; }));
    $$('#str-rows [data-del]').forEach(b => b.addEventListener('click', () => { list.splice(Number(b.dataset.del), 1); draw(); }));
  }
  draw();
  if ($('#str-add')) $('#str-add').addEventListener('click', () => { list.push({ exercise: '', sets: 3, reps: '10', weight: '', rest: '1:00' }); draw(); });
}

/* ------------------------------ Check-in modals ------------------------- */
function scaleField(id, val) {
  return `<div class="scale" id="${id}">${Array.from({ length: 10 }, (_, i) => i + 1)
    .map(n => `<button data-n="${n}" class="${val === n ? 'sel' : ''}">${n}</button>`).join('')}</div>`;
}
function bindScale(id, cb, initial) {
  let val = initial || null;
  $$(`#${id} button`).forEach(b => b.addEventListener('click', () => {
    val = Number(b.dataset.n); $$(`#${id} button`).forEach(x => x.classList.toggle('sel', x === b)); cb(val);
  }));
  return () => val;
}

function openRpeModal(sid) {
  const s = state.sessions.find(x => x.id === sid);
  if (!s) return;
  const body = `
    <div class="sub" style="margin-bottom:10px">${SPORTS[s.sport].icon} ${esc(s.name)} · ${fmtDate(s.date)}</div>
    <label>RPE — how hard was this session? (1 easy – 10 max)</label>
    ${scaleField('rpe-scale', s.rpe)}
    <label>How did you feel after this training?</label>
    <textarea id="rpe-note" placeholder="Legs, energy, mood, niggles...">${esc(s.feltNote || '')}</textarea>`;
  openModal('Session feedback', body, `<button class="btn primary" id="rpe-save">Save feedback</button>`);
  const getRpe = bindScale('rpe-scale', () => {}, s.rpe);
  $('#rpe-save').addEventListener('click', () => {
    s.rpe = getRpe(); s.feltNote = $('#rpe-note').value;
    state.checkins.session.push({ id: uid(), athleteId: s.athleteId, sessionId: s.id, date: todayISO(), rpe: s.rpe, note: s.feltNote });
    save(); closeModal(); render(); toast('Feedback saved');
  });
}

function openSleepModal() {
  const body = `
    <label>How many hours did you sleep?</label>
    <input id="sl-hours" type="number" step="0.5" value="7.5"/>
    <label>Sleep quality (1 poor – 10 great)</label>
    ${scaleField('sl-quality')}
    <label>How do you feel this morning? (1 wrecked – 10 fresh)</label>
    ${scaleField('sl-feel')}
    <label>Notes (optional)</label>
    <textarea id="sl-note" placeholder="Woke up during the night, sore, stressed..."></textarea>`;
  openModal('Morning check-in — Sleep', body, `<button class="btn primary" id="sl-save">Save</button>`);
  const getQ = bindScale('sl-quality', () => {}), getF = bindScale('sl-feel', () => {});
  $('#sl-save').addEventListener('click', () => {
    state.checkins.sleep.push({
      id: uid(), athleteId: state.currentAthleteId, date: todayISO(),
      hours: Number($('#sl-hours').value) || 0, quality: getQ() || 0, feel: getF() || 0, note: $('#sl-note').value
    });
    save(); closeModal(); render(); toast('Sleep logged');
  });
}

function openWeeklyModal() {
  const body = `
    <label>How did you feel about this week's training?</label>
    ${scaleField('wk-train')}
    <label>How did you feel in yourself this week?</label>
    ${scaleField('wk-self')}
    <label>Anything to tell your coach?</label>
    <textarea id="wk-note" placeholder="Highlights, struggles, life stress, motivation..."></textarea>`;
  openModal('Weekly reflection', body, `<button class="btn primary" id="wk-save">Save</button>`);
  const getT = bindScale('wk-train', () => {}), getS = bindScale('wk-self', () => {});
  $('#wk-save').addEventListener('click', () => {
    state.checkins.weekly.push({
      id: uid(), athleteId: state.currentAthleteId, week: weekKey(new Date()), date: todayISO(),
      training: getT() || 0, self: getS() || 0, note: $('#wk-note').value
    });
    save(); closeModal(); render(); toast('Weekly reflection saved');
  });
}

/* ------------------------------ Library --------------------------------- */
function viewLibrary() {
  const actions = $('#topbar-actions');
  actions.innerHTML = `<button class="btn primary sm" id="add-lib">+ New workout</button>`;
  $('#add-lib').addEventListener('click', () => openLibModal(null));

  const v = $('#view');
  v.innerHTML = `
    <p class="sub">Reusable workout templates. Add one to an athlete's calendar with one click.</p>
    <div class="grid cols-2" style="margin-top:10px">
      ${state.library.map(w => {
        const sp = SPORTS[w.sport] || SPORTS.other;
        return `<div class="card">
          <div class="badge" style="border-left:3px solid ${sp.color}">${sp.icon} ${sp.label}</div>
          <h3 style="margin-top:8px">${esc(w.name)}</h3>
          <div class="sub">${w.duration || 0} min · ${w.load || 0} TSS</div>
          <p class="sub" style="margin-top:8px">${esc(w.desc || '')}</p>
          <div class="btn-row" style="margin-top:10px">
            <button class="btn sm primary" data-sched="${w.id}">Add to calendar</button>
            <button class="btn sm" data-edit="${w.id}">Edit</button>
            <button class="btn sm danger" data-del="${w.id}">Delete</button>
          </div>
        </div>`;
      }).join('') || '<div class="empty">No templates yet.</div>'}
    </div>`;
  $$('[data-edit]').forEach(b => b.addEventListener('click', () => openLibModal(b.dataset.edit)));
  $$('[data-del]').forEach(b => b.addEventListener('click', () => { state.library = state.library.filter(w => w.id !== b.dataset.del); save(); viewLibrary(); }));
  $$('[data-sched]').forEach(b => b.addEventListener('click', () => scheduleFromLib(b.dataset.sched)));
}
function openLibModal(id) {
  const editing = id ? state.library.find(w => w.id === id) : null;
  const w = editing || { sport: 'biking', name: '', duration: 60, load: 50, desc: '', strength: [] };
  const sportOpts = Object.entries(SPORTS).map(([k, sp]) => `<option value="${k}" ${w.sport === k ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`).join('');
  const body = `
    <label>Sport</label><select id="l-sport">${sportOpts}</select>
    <label>Name</label><input id="l-name" value="${esc(w.name)}"/>
    <div class="inline">
      <div><label>Duration (min)</label><input id="l-dur" type="number" value="${w.duration}"/></div>
      <div><label>Load (TSS)</label><input id="l-load" type="number" value="${w.load}"/></div>
    </div>
    <label>Workout / steps</label><textarea id="l-desc">${esc(w.desc)}</textarea>`;
  openModal(editing ? 'Edit workout' : 'New workout', body, `<button class="btn primary" id="l-save">Save</button>`);
  $('#l-save').addEventListener('click', () => {
    const obj = { id: w.id || uid(), sport: $('#l-sport').value, name: $('#l-name').value.trim() || 'Untitled', duration: Number($('#l-dur').value) || 0, load: Number($('#l-load').value) || 0, desc: $('#l-desc').value, strength: w.strength || [] };
    if (editing) Object.assign(editing, obj); else state.library.push(obj);
    save(); closeModal(); viewLibrary(); toast('Saved');
  });
}
function scheduleFromLib(id) {
  const w = state.library.find(x => x.id === id);
  const body = `<label>Add "<b>${esc(w.name)}</b>" to ${esc(currentAthlete().name)} on:</label><input id="sch-date" type="date" value="${todayISO()}"/>`;
  openModal('Add to calendar', body, `<button class="btn primary" id="sch-go">Add</button>`);
  $('#sch-go').addEventListener('click', () => {
    state.sessions.push({ id: uid(), athleteId: state.currentAthleteId, sport: w.sport, name: w.name, date: $('#sch-date').value, duration: w.duration, load: w.load, desc: w.desc, strength: clone(w.strength || []), status: 'planned' });
    save(); closeModal(); toast('Added to calendar'); go('calendar');
  });
}

/* ------------------------------ Questionnaires -------------------------- */
function viewQuestionnaires() {
  const actions = $('#topbar-actions');
  const v = $('#view');
  if (state.role === 'coach') {
    actions.innerHTML = `<button class="btn primary sm" id="add-q">+ New questionnaire</button>`;
    $('#add-q').addEventListener('click', () => openQBuilder(null));
    v.innerHTML = `
      <p class="sub">Build your own questionnaires and review athlete responses.</p>
      <div class="list" style="margin-top:10px">
        ${state.questionnaires.map(q => {
          const resp = state.responses.filter(r => r.qid === q.id).length;
          return `<div class="row"><div class="grow"><div class="title">${esc(q.title)}</div><div class="meta">${q.questions.length} questions · ${resp} response(s)</div></div>
            <button class="btn sm" data-edit="${q.id}">Edit</button>
            <button class="btn sm" data-resp="${q.id}">Responses</button>
            <button class="btn sm danger" data-del="${q.id}">Delete</button></div>`;
        }).join('') || '<div class="empty">No questionnaires yet.</div>'}
      </div>`;
    $$('[data-edit]').forEach(b => b.addEventListener('click', () => openQBuilder(b.dataset.edit)));
    $$('[data-del]').forEach(b => b.addEventListener('click', () => { state.questionnaires = state.questionnaires.filter(q => q.id !== b.dataset.del); save(); viewQuestionnaires(); }));
    $$('[data-resp]').forEach(b => b.addEventListener('click', () => showResponses(b.dataset.resp)));
  } else {
    actions.innerHTML = '';
    v.innerHTML = `
      <p class="sub">Questionnaires from your coach.</p>
      <div class="list" style="margin-top:10px">
        ${state.questionnaires.map(q => {
          const done = state.responses.some(r => r.qid === q.id && r.athleteId === state.currentAthleteId);
          return `<div class="row"><div class="grow"><div class="title">${esc(q.title)}</div><div class="meta">${q.questions.length} questions ${done ? '· ✓ completed' : ''}</div></div>
            <button class="btn sm primary" data-fill="${q.id}">${done ? 'Fill again' : 'Fill in'}</button></div>`;
        }).join('') || '<div class="empty">No questionnaires assigned.</div>'}
      </div>`;
    $$('[data-fill]').forEach(b => b.addEventListener('click', () => openQFill(b.dataset.fill)));
  }
}

function openQBuilder(id) {
  const editing = id ? state.questionnaires.find(q => q.id === id) : null;
  const q = editing ? clone(editing) : { id: uid(), title: '', questions: [] };
  const body = `
    <label>Title</label><input id="q-title" value="${esc(q.title)}" placeholder="e.g. Weekly wellness"/>
    <div class="section-title" style="margin-top:14px">Questions</div>
    <div id="q-list"></div>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn sm" data-add="scale">+ Scale (1-10)</button>
      <button class="btn sm" data-add="choice">+ Multiple choice</button>
      <button class="btn sm" data-add="text">+ Text</button>
    </div>`;
  openModal(editing ? 'Edit questionnaire' : 'New questionnaire', body, `<button class="btn primary" id="q-save">Save</button>`);

  function drawQ() {
    $('#q-list').innerHTML = q.questions.map((qu, i) => `
      <div class="card" style="margin-bottom:8px;padding:12px">
        <div class="inline"><div><span class="badge">${qu.type}</span></div><button class="x" data-qdel="${i}" style="margin-left:auto">&times;</button></div>
        <input data-qi="${i}" data-qk="text" value="${esc(qu.text)}" placeholder="Question text" style="margin-top:8px"/>
        ${qu.type === 'choice' ? `<input data-qi="${i}" data-qk="options" value="${esc((qu.options || []).join(', '))}" placeholder="Option A, Option B, Option C" style="margin-top:8px"/>` : ''}
      </div>`).join('') || '<div class="empty">No questions yet — add some below.</div>';
    $$('#q-list [data-qi]').forEach(inp => inp.addEventListener('input', () => {
      const i = Number(inp.dataset.qi);
      if (inp.dataset.qk === 'options') q.questions[i].options = inp.value.split(',').map(s => s.trim()).filter(Boolean);
      else q.questions[i][inp.dataset.qk] = inp.value;
    }));
    $$('#q-list [data-qdel]').forEach(b => b.addEventListener('click', () => { q.questions.splice(Number(b.dataset.qdel), 1); drawQ(); }));
  }
  drawQ();
  $$('[data-add]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.add;
    q.questions.push({ id: uid(), type: t, text: '', options: t === 'choice' ? ['Option A', 'Option B'] : undefined });
    drawQ();
  }));
  $('#q-save').addEventListener('click', () => {
    q.title = $('#q-title').value.trim() || 'Untitled';
    if (editing) Object.assign(editing, q); else state.questionnaires.push(q);
    save(); closeModal(); viewQuestionnaires(); toast('Saved');
  });
}

function openQFill(id) {
  const q = state.questionnaires.find(x => x.id === id);
  const body = q.questions.map((qu, i) => {
    if (qu.type === 'scale') return `<label>${esc(qu.text)}</label>${scaleField('qf-' + i)}`;
    if (qu.type === 'choice') return `<label>${esc(qu.text)}</label><select id="qf-${i}">${(qu.options || []).map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
    return `<label>${esc(qu.text)}</label><textarea id="qf-${i}"></textarea>`;
  }).join('');
  openModal(q.title, body || '<div class="empty">No questions.</div>', `<button class="btn primary" id="qf-save">Submit</button>`);
  const getters = q.questions.map((qu, i) => qu.type === 'scale' ? bindScale('qf-' + i, () => {}) : null);
  $('#qf-save').addEventListener('click', () => {
    const answers = q.questions.map((qu, i) => ({
      q: qu.text, type: qu.type,
      value: qu.type === 'scale' ? (getters[i]() || 0) : $('#qf-' + i).value
    }));
    state.responses.push({ id: uid(), qid: q.id, athleteId: state.currentAthleteId, date: todayISO(), answers });
    save(); closeModal(); viewQuestionnaires(); toast('Submitted');
  });
}
function showResponses(id) {
  const q = state.questionnaires.find(x => x.id === id);
  const rs = state.responses.filter(r => r.qid === id);
  const body = rs.length ? rs.map(r => {
    const ath = state.athletes.find(a => a.id === r.athleteId);
    return `<div class="card" style="margin-bottom:8px"><div class="sub">${esc(ath ? ath.name : '—')} · ${fmtDate(r.date)}</div>
      ${r.answers.map(a => `<div style="margin-top:6px"><b>${esc(a.q)}</b><div class="sub">${esc(a.value)}</div></div>`).join('')}</div>`;
  }).join('') : '<div class="empty">No responses yet.</div>';
  openModal('Responses — ' + q.title, body, '');
}

/* ------------------------------ Athletes & Zones ------------------------ */
function viewAthletes() {
  const actions = $('#topbar-actions');
  actions.innerHTML = `<button class="btn primary sm" id="add-ath">+ Add athlete</button>`;
  $('#add-ath').addEventListener('click', () => {
    const a = { id: uid(), name: 'New athlete', email: '', sport: 'biking', ftp: 200, maxHr: 190, thresholdHr: 165, thresholdPace: 270, powerZones: clone(DEFAULT_POWER_ZONES), hrZones: clone(DEFAULT_HR_ZONES), paceZones: clone(DEFAULT_PACE_ZONES) };
    state.athletes.push(a); state.currentAthleteId = a.id; save(); viewAthletes();
  });

  const a = currentAthlete();
  const v = $('#view');
  v.innerHTML = `
    <div class="card">
      <h3>Athlete profile</h3>
      <div class="inline"><div><label>Name</label><input id="a-name" value="${esc(a.name)}"/></div>
        <div><label>Email</label><input id="a-email" value="${esc(a.email || '')}"/></div></div>
      <div class="inline">
        <div><label>FTP (W)</label><input id="a-ftp" type="number" value="${a.ftp}"/></div>
        <div><label>Threshold HR</label><input id="a-thr" type="number" value="${a.thresholdHr}"/></div>
        <div><label>Max HR</label><input id="a-max" type="number" value="${a.maxHr}"/></div>
        <div><label>Threshold pace (s/km)</label><input id="a-pace" type="number" value="${a.thresholdPace}"/></div>
      </div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn primary" id="a-save">Save profile</button>
        ${state.athletes.length > 1 ? '<button class="btn danger" id="a-del">Remove athlete</button>' : ''}
      </div>
    </div>

    <div class="pill-tabs" style="margin-top:18px" id="ztabs">
      <button data-zt="powerZones" class="active">Power zones</button>
      <button data-zt="hrZones">HR zones</button>
      <button data-zt="paceZones">Pace zones</button>
    </div>
    <div class="card" id="zone-card"></div>`;

  $('#a-save').addEventListener('click', () => {
    a.name = $('#a-name').value; a.email = $('#a-email').value;
    a.ftp = Number($('#a-ftp').value) || 0; a.thresholdHr = Number($('#a-thr').value) || 0;
    a.maxHr = Number($('#a-max').value) || 0; a.thresholdPace = Number($('#a-pace').value) || 0;
    save(); render(); toast('Profile saved');
  });
  if ($('#a-del')) $('#a-del').addEventListener('click', () => {
    state.athletes = state.athletes.filter(x => x.id !== a.id); state.currentAthleteId = state.athletes[0].id; save(); render();
  });

  let ztab = 'powerZones';
  function drawZones() {
    const zones = a[ztab];
    const unit = ztab === 'powerZones' ? '% FTP' : ztab === 'hrZones' ? '% Thr HR' : '% Thr pace';
    const ref = ztab === 'powerZones' ? a.ftp : ztab === 'hrZones' ? a.thresholdHr : a.thresholdPace;
    $('#zone-card').innerHTML = `
      <div class="sub" style="margin-bottom:10px">Percentages of ${ztab === 'powerZones' ? 'FTP (' + a.ftp + 'W)' : ztab === 'hrZones' ? 'threshold HR (' + a.thresholdHr + ' bpm)' : 'threshold pace'}. Edit freely.</div>
      <table class="ztable"><thead><tr><th>Zone</th><th>Min ${unit}</th><th>Max ${unit}</th><th>Range</th></tr></thead>
        <tbody>${zones.map((z, i) => `<tr>
          <td><input data-zi="${i}" data-zk="name" value="${esc(z.name)}"/></td>
          <td><input data-zi="${i}" data-zk="min" type="number" value="${z.min}" style="width:80px"/></td>
          <td><input data-zi="${i}" data-zk="max" type="number" value="${z.max}" style="width:80px"/></td>
          <td class="sub">${zoneAbs(ztab, z, ref)}</td>
        </tr>`).join('')}</tbody></table>
      <div class="btn-row" style="margin-top:10px"><button class="btn sm" id="z-add">+ Add zone</button><button class="btn sm" id="z-reset">Reset defaults</button></div>`;
    $$('#zone-card [data-zi]').forEach(inp => inp.addEventListener('input', () => {
      const i = Number(inp.dataset.zi), k = inp.dataset.zk;
      a[ztab][i][k] = k === 'name' ? inp.value : Number(inp.value) || 0; save();
      if (k !== 'name') drawZones();
    }));
    $('#z-add').addEventListener('click', () => { a[ztab].push({ name: 'New zone', min: 0, max: 0 }); save(); drawZones(); });
    $('#z-reset').addEventListener('click', () => { a[ztab] = clone(ztab === 'powerZones' ? DEFAULT_POWER_ZONES : ztab === 'hrZones' ? DEFAULT_HR_ZONES : DEFAULT_PACE_ZONES); save(); drawZones(); });
  }
  function zoneAbs(type, z, ref) {
    if (!ref) return '';
    if (type === 'paceZones') return `${paceStr(ref * 100 / z.max)}–${paceStr(ref * 100 / z.min)} /km`;
    const lo = Math.round(ref * z.min / 100), hi = Math.round(ref * z.max / 100);
    return `${lo}–${hi} ${type === 'powerZones' ? 'W' : 'bpm'}`;
  }
  function paceStr(sec) { if (!isFinite(sec) || sec <= 0) return '–'; const m = Math.floor(sec / 60), s = Math.round(sec % 60); return `${m}:${String(s).padStart(2, '0')}`; }

  drawZones();
  $$('#ztabs [data-zt]').forEach(b => b.addEventListener('click', () => {
    ztab = b.dataset.zt; $$('#ztabs [data-zt]').forEach(x => x.classList.toggle('active', x === b)); drawZones();
  }));
}

/* ------------------------------ Testing --------------------------------- */
function viewTesting() {
  const actions = $('#topbar-actions');
  const a = currentAthlete();
  if (state.role === 'coach') {
    actions.innerHTML = `<button class="btn primary sm" id="add-test">+ Add test</button>`;
    $('#add-test').addEventListener('click', () => openTestModal(null));
  } else {
    actions.innerHTML = '';
  }

  const tests = state.tests.filter(t => t.athleteId === a.id).sort((x, y) => y.date.localeCompare(x.date));

  // latest result per test type, for the summary strip
  const latestByType = {};
  tests.forEach(t => { if (!latestByType[t.type]) latestByType[t.type] = t; });
  const summary = Object.values(latestByType).slice(0, 4);

  const v = $('#view');
  v.innerHTML = `
    <p class="sub">Testing moments and results for ${esc(a.name)}. Track FTP tests, VO₂max, lactate, time trials, field tests and more — with progress vs. previous tests.</p>

    ${summary.length ? `<div class="grid cols-4" style="margin-top:12px">
      ${summary.map(t => `<div class="card stat"><span class="l">${esc(t.type)}</span><span class="v">${esc(t.primary.value)}<small style="font-size:14px;color:var(--muted)"> ${esc(t.primary.unit)}</small></span><span class="sub">${fmtDate(t.date)}</span></div>`).join('')}
    </div>` : ''}

    <div class="section-title">Test history</div>
    <div class="list">
      ${tests.length ? tests.map(t => testRow(t, tests)).join('') : '<div class="empty">No tests recorded yet.' + (state.role === 'coach' ? ' Use “+ Add test”.' : '') + '</div>'}
    </div>`;

  $$('[data-test-open]').forEach(b => b.addEventListener('click', () => openTestModal(b.dataset.testOpen)));
}

function testRow(t, all) {
  const sp = SPORTS[t.sport] || SPORTS.other;
  // find previous test of same type to show delta
  const prev = all.filter(x => x.type === t.type && x.date < t.date).sort((a, b) => b.date.localeCompare(a.date))[0];
  let delta = '';
  if (prev && !isNaN(Number(t.primary.value)) && !isNaN(Number(prev.primary.value))) {
    const d = Number(t.primary.value) - Number(prev.primary.value);
    const col = d > 0 ? 'var(--ok)' : d < 0 ? 'var(--bad)' : 'var(--muted)';
    delta = `<span class="badge" style="color:${col}">${d > 0 ? '▲ +' : d < 0 ? '▼ ' : ''}${d === 0 ? '±0' : d}${esc(t.primary.unit)} vs prev</span>`;
  }
  const extra = (t.metrics || []).filter(m => m.label).map(m => `${esc(m.label)}: ${esc(m.value)}${esc(m.unit)}`).join(' · ');
  return `<div class="row">
    <span class="dot" style="background:${sp.color}"></span>
    <div class="grow">
      <div class="title">${esc(t.type)} — <b>${esc(t.primary.value)} ${esc(t.primary.unit)}</b></div>
      <div class="meta">${fmtDate(t.date)} · ${sp.label}${extra ? ' · ' + extra : ''}${t.notes ? ' · ' + esc(t.notes) : ''}</div>
    </div>
    ${delta}
    <button class="btn sm" data-test-open="${t.id}">${state.role === 'coach' ? 'Edit' : 'View'}</button>
  </div>`;
}

function openTestModal(id) {
  const editing = id ? state.tests.find(t => t.id === id) : null;
  const canEdit = state.role === 'coach';
  const t = editing ? clone(editing) : { id: null, athleteId: state.currentAthleteId, date: todayISO(), type: 'FTP test (20-min)', sport: 'biking', primary: { value: '', unit: 'W' }, metrics: [], notes: '' };

  const typeOpts = TEST_TYPES.map(x => `<option ${t.type === x ? 'selected' : ''}>${x}</option>`).join('');
  const sportOpts = Object.entries(SPORTS).map(([k, sp]) => `<option value="${k}" ${t.sport === k ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`).join('');
  const dis = canEdit ? '' : 'disabled';

  const body = `
    <div class="inline">
      <div><label>Test type</label><select id="t-type" ${dis}>${typeOpts}</select></div>
      <div><label>Sport</label><select id="t-sport" ${dis}>${sportOpts}</select></div>
    </div>
    <div class="inline">
      <div><label>Date</label><input id="t-date" type="date" value="${t.date}" ${dis}/></div>
      <div><label>Main result</label><input id="t-pval" value="${esc(t.primary.value)}" ${dis} placeholder="e.g. 245"/></div>
      <div><label>Unit</label><input id="t-punit" value="${esc(t.primary.unit)}" ${dis} placeholder="W, ml/kg/min, mmol, min:s"/></div>
    </div>
    <label>Additional metrics</label>
    <table class="ztable"><thead><tr><th>Metric</th><th>Value</th><th>Unit</th>${canEdit ? '<th></th>' : ''}</tr></thead><tbody id="t-rows"></tbody></table>
    ${canEdit ? '<div class="btn-row" style="margin-top:8px"><button class="btn sm" id="t-add">+ Add metric</button></div>' : ''}
    <label>Notes</label>
    <textarea id="t-notes" ${dis} placeholder="Conditions, protocol, how the athlete felt...">${esc(t.notes || '')}</textarea>
    ${canEdit ? `<label style="display:flex;align-items:center;gap:8px;margin-top:12px"><input type="checkbox" id="t-apply" style="width:auto"/> <span>Also update this athlete's FTP / threshold HR from this result</span></label>` : ''}
  `;
  const foot = canEdit
    ? `${editing ? '<button class="btn danger" id="t-del">Delete</button>' : ''}<button class="btn primary" id="t-save">Save test</button>`
    : '';
  openModal(editing ? 'Test result' : 'New test', body, foot);

  const metrics = clone(t.metrics || []);
  function drawMetrics() {
    const rows = $('#t-rows');
    rows.innerHTML = metrics.map((m, i) => `<tr>
      <td><input data-mi="${i}" data-mk="label" value="${esc(m.label)}" ${dis}/></td>
      <td><input data-mi="${i}" data-mk="value" value="${esc(m.value)}" ${dis} style="width:90px"/></td>
      <td><input data-mi="${i}" data-mk="unit" value="${esc(m.unit)}" ${dis} style="width:80px"/></td>
      ${canEdit ? `<td><button class="x" data-mdel="${i}">&times;</button></td>` : ''}
    </tr>`).join('') || `<tr><td colspan="4" class="sub" style="padding:10px">No extra metrics.</td></tr>`;
    $$('#t-rows [data-mi]').forEach(inp => inp.addEventListener('input', () => { metrics[inp.dataset.mi][inp.dataset.mk] = inp.value; }));
    $$('#t-rows [data-mdel]').forEach(b => b.addEventListener('click', () => { metrics.splice(Number(b.dataset.mdel), 1); drawMetrics(); }));
  }
  drawMetrics();
  if ($('#t-add')) $('#t-add').addEventListener('click', () => { metrics.push({ label: '', value: '', unit: '' }); drawMetrics(); });

  if ($('#t-save')) $('#t-save').addEventListener('click', () => {
    const obj = {
      id: t.id || uid(), athleteId: state.currentAthleteId,
      date: $('#t-date').value, type: $('#t-type').value, sport: $('#t-sport').value,
      primary: { value: $('#t-pval').value, unit: $('#t-punit').value },
      metrics: metrics.filter(m => m.label || m.value), notes: $('#t-notes').value
    };
    if (editing) Object.assign(editing, obj); else state.tests.push(obj);

    // optional: push result into athlete zones
    if ($('#t-apply') && $('#t-apply').checked) {
      const a = currentAthlete();
      const val = Number(obj.primary.value);
      if (!isNaN(val)) {
        if (obj.primary.unit.toLowerCase() === 'w') { a.ftp = val; toast('FTP updated to ' + val + 'W'); }
        else if (/bpm/i.test(obj.primary.unit)) { a.thresholdHr = val; toast('Threshold HR updated'); }
      }
    }
    save(); closeModal(); render(); toast('Test saved');
  });
  if ($('#t-del')) $('#t-del').addEventListener('click', () => {
    state.tests = state.tests.filter(x => x.id !== t.id); save(); closeModal(); render(); toast('Deleted');
  });
}

/* ------------------------------ Monitoring ------------------------------ */
function viewMonitor() {
  const v = $('#view');
  const a = currentAthlete();
  const sleep = state.checkins.sleep.filter(s => s.athleteId === a.id).sort((x, y) => y.date.localeCompare(x.date)).slice(0, 14);
  const weekly = state.checkins.weekly.filter(w => w.athleteId === a.id).sort((x, y) => y.week.localeCompare(x.week)).slice(0, 8);
  const rpe = state.checkins.session.filter(s => s.athleteId === a.id).sort((x, y) => y.date.localeCompare(x.date)).slice(0, 12);

  v.innerHTML = `
    <div class="grid cols-3">
      <div class="card"><h3>Sleep (last 14)</h3>${sleep.length ? sparkline(sleep.slice().reverse().map(s => s.hours)) + `<div class="sub" style="margin-top:8px">Avg ${(sleep.reduce((n, s) => n + s.hours, 0) / sleep.length).toFixed(1)}h · quality ${(sleep.reduce((n, s) => n + s.quality, 0) / sleep.length).toFixed(1)}/10</div>` : '<div class="empty">No data</div>'}</div>
      <div class="card"><h3>RPE (recent)</h3>${rpe.length ? sparkline(rpe.slice().reverse().map(s => s.rpe)) + `<div class="sub" style="margin-top:8px">Avg RPE ${(rpe.reduce((n, s) => n + (s.rpe || 0), 0) / rpe.length).toFixed(1)}/10</div>` : '<div class="empty">No data</div>'}</div>
      <div class="card"><h3>Weekly wellness</h3>${weekly.length ? sparkline(weekly.slice().reverse().map(w => w.self)) + `<div class="sub" style="margin-top:8px">Self ${(weekly.reduce((n, w) => n + w.self, 0) / weekly.length).toFixed(1)}/10 · training ${(weekly.reduce((n, w) => n + w.training, 0) / weekly.length).toFixed(1)}/10</div>` : '<div class="empty">No data</div>'}</div>
    </div>

    <div class="section-title">Sleep log</div>
    <div class="list">${sleep.length ? sleep.map(s => `<div class="row"><div class="grow"><div class="title">${s.hours}h · quality ${s.quality}/10 · felt ${s.feel}/10</div><div class="meta">${fmtDate(s.date)}${s.note ? ' · ' + esc(s.note) : ''}</div></div></div>`).join('') : '<div class="empty">No sleep check-ins.</div>'}</div>

    <div class="section-title">Session feedback</div>
    <div class="list">${rpe.length ? rpe.map(s => { const ses = state.sessions.find(x => x.id === s.sessionId); return `<div class="row"><div class="grow"><div class="title">RPE ${s.rpe}/10 — ${esc(ses ? ses.name : 'session')}</div><div class="meta">${fmtDate(s.date)}${s.note ? ' · ' + esc(s.note) : ''}</div></div></div>`; }).join('') : '<div class="empty">No session feedback.</div>'}</div>

    <div class="section-title">Weekly reflections</div>
    <div class="list">${weekly.length ? weekly.map(w => `<div class="row"><div class="grow"><div class="title">Training ${w.training}/10 · Self ${w.self}/10</div><div class="meta">Week of ${fmtDate(w.week)}${w.note ? ' · ' + esc(w.note) : ''}</div></div></div>`).join('') : '<div class="empty">No weekly reflections.</div>'}</div>`;
}

/* ------------------------------ Settings -------------------------------- */
function viewSettings() {
  const v = $('#view');
  const iv = state.settings.intervals;
  v.innerHTML = `
    <div class="card" style="max-width:640px">
      <h3>Intervals.icu connection</h3>
      <p class="sub">Connect your Intervals.icu account so activities and training-load calculations stay in sync. Create an API key in Intervals.icu → Settings → Developer.</p>
      <label>Athlete ID</label><input id="iv-id" value="${esc(iv.athleteId)}" placeholder="i12345"/>
      <label>API key</label><input id="iv-key" type="password" value="${esc(iv.apiKey)}" placeholder="Paste your API key"/>
      <div class="hint">Stored only on this device. Live two-way sync activates once a small sync connector is enabled.</div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn primary" id="iv-save">Save connection</button>
        <button class="btn" id="iv-sync">Sync now</button>
      </div>
      <div class="sub" style="margin-top:10px">${iv.lastSync ? 'Last sync: ' + iv.lastSync : 'Not synced yet.'}</div>
    </div>

    <div class="card" style="max-width:640px;margin-top:16px">
      <h3>App data</h3>
      <p class="sub">Everything is saved on this device. Export a backup or reset the app.</p>
      <div class="btn-row">
        <button class="btn" id="d-export">Export backup (.json)</button>
        <button class="btn" id="d-import">Import backup</button>
        <button class="btn danger" id="d-reset">Reset all data</button>
      </div>
      <input id="d-file" type="file" accept="application/json" style="display:none"/>
    </div>

    <div class="card" style="max-width:640px;margin-top:16px">
      <h3>Install as a free app</h3>
      <p class="sub">Free on PC and phone — no App Store, no fees. Opens full-screen like a native app and works offline.</p>
      <div class="btn-row" style="margin:6px 0 10px"><button class="btn primary" id="do-install">Install app now</button></div>
      <p class="sub"><b>iPhone/iPad (Safari):</b> Share → “Add to Home Screen”.<br/>
      <b>Android (Chrome):</b> menu ⋮ → “Install app”.<br/>
      <b>PC — Windows/Mac (Chrome/Edge):</b> tap the button above, or use the install icon in the address bar.</p>
    </div>`;

  $('#iv-save').addEventListener('click', () => { iv.athleteId = $('#iv-id').value.trim(); iv.apiKey = $('#iv-key').value.trim(); save(); toast('Connection saved'); });
  $('#iv-sync').addEventListener('click', () => {
    if (!iv.apiKey || !iv.athleteId) { toast('Enter athlete ID and API key first'); return; }
    iv.lastSync = new Date().toLocaleString(); save(); viewSettings();
    toast('Sync stub ran — enable connector for live data');
  });
  $('#d-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'tac-coach-backup.json'; a.click(); URL.revokeObjectURL(url);
  });
  $('#d-import').addEventListener('click', () => $('#d-file').click());
  $('#d-file').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { try { state = JSON.parse(r.result); save(); render(); toast('Backup imported'); } catch (x) { toast('Invalid file'); } }; r.readAsText(f);
  });
  $('#d-reset').addEventListener('click', () => {
    if (confirm('Reset all data? This cannot be undone.')) { state = seed(); save(); render(); toast('Reset'); }
  });

  $('#do-install').addEventListener('click', async () => {
    if (deferredInstall) {
      deferredInstall.prompt();
      const res = await deferredInstall.userChoice;
      if (res.outcome === 'accepted') toast('Installing…'); else toast('Install dismissed');
      deferredInstall = null;
    } else if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      toast('Already installed 🎉');
    } else {
      toast('Use your browser menu → “Add to Home Screen” / “Install app”');
    }
  });
}

/* ------------------------------ Install prompt -------------------------- */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });

/* ------------------------------ Boot ------------------------------------ */
render();
