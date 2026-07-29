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
  const co1 = uid(), co2 = uid();
  const t = new Date();
  const iso = (offset) => toISO(addDays(t, offset));
  return {
    role: 'coach',
    currentAthleteId: a1,
    coaches: [{ id: co1, name: 'Coach 1' }, { id: co2, name: 'Coach 2' }],
    currentCoachId: co1,
    ui: { view: 'dashboard', calMonth: t.getMonth(), calYear: t.getFullYear() },
    settings: {
      weekStart: 1,
      intervals: { apiKey: '', athleteId: '', lastSync: null },
      notifications: { enabled: false, morning: true, postSession: true, sundayEve: true, morningTime: '07:00', eveningTime: '20:00' }
    },
    athletes: [{
      id: a1, name: 'Demo Athlete', email: '', sport: 'biking',
      coachIds: [co1, co2],
      ftp: 250, maxHr: 190, thresholdHr: 168, thresholdPace: 240, /* sec/km */
      powerZones: clone(DEFAULT_POWER_ZONES),
      hrZones: clone(DEFAULT_HR_ZONES),
      paceZones: clone(DEFAULT_PACE_ZONES)
    }],
    sessions: [
      { id: uid(), athleteId: a1, date: iso(0), sport: 'biking', name: 'Endurance ride', duration: 90, load: 75, desc: '2x20min Z2 tempo, rest 5min easy.', strength: [], status: 'planned',
        steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 3, min: 20 }, { zt: 'power', z: 1, min: 5 }, { zt: 'power', z: 3, min: 20 }, { zt: 'power', z: 1, min: 30 }] },
      { id: uid(), athleteId: a1, date: iso(1), sport: 'strength', name: 'Full body strength', duration: 45, load: 30, desc: 'Focus on legs & core.', status: 'planned', steps: [],
        strength: [
          { exercise: 'Back squat', sets: 4, reps: '6', weight: '80kg', rest: '2:00' },
          { exercise: 'Romanian deadlift', sets: 3, reps: '8', weight: '60kg', rest: '1:30' },
          { exercise: 'Plank', sets: 3, reps: '45s', weight: '-', rest: '1:00' }
        ] },
      { id: uid(), athleteId: a1, date: iso(2), sport: 'running', name: 'Easy run', duration: 40, load: 35, desc: 'Zone 2 conversational pace.', strength: [], status: 'planned',
        steps: [{ zt: 'hr', z: 1, min: 10 }, { zt: 'hr', z: 1, min: 30 }] }
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
    ],
    cycles: [
      { id: uid(), athleteId: a1, type: 'macro', name: 'Season 2026', start: iso(-30), end: iso(240), sport: 'biking', zones: [], focus: 'Build to peak form for late-summer target event.' },
      { id: uid(), athleteId: a1, type: 'meso', name: 'March — Base', start: iso(-5), end: iso(25), sport: 'running', zones: ['Z1', 'Z2'], focus: 'Aerobic base: Z1/Z2 running volume.' },
      { id: uid(), athleteId: a1, type: 'micro', name: 'This week', start: weekKey(new Date()), end: toISO(addDays(fromISO(weekKey(new Date())), 6)), sport: 'biking', zones: ['Z2', 'Z3'], focus: 'Sweet-spot introduction, keep easy days easy.' }
    ],
    messages: [
      { id: uid(), athleteId: a1, from: 'athlete', date: iso(-1), ts: Date.now() - 86400000, text: 'Legs felt heavy today, slept badly.' },
      { id: uid(), athleteId: a1, from: 'coach', date: iso(-1), ts: Date.now() - 82800000, text: 'Thanks for letting me know — take tomorrow easy, drop to Z1.' }
    ],
    dayNotes: [
      { id: uid(), athleteId: a1, date: iso(-2), text: 'Went out with friends, few drinks 🍻' }
    ],
    nutrition: [
      { id: uid(), athleteId: a1, week: weekKey(new Date()), title: 'Base week fuelling', focus: 'Prioritise protein (1.6 g/kg) + carbs around key sessions. Hydration on long rides.', notes: 'Aim for 3 veg-rich meals/day. Limit alcohol on training days.' }
    ],
    goals: [
      { id: uid(), athleteId: a1, by: 'coach', text: 'Raise FTP to 270 W by June', due: iso(150), status: 'open', createdAt: iso(-20) },
      { id: uid(), athleteId: a1, by: 'athlete', text: 'Complete first 100 km ride', due: iso(60), status: 'open', createdAt: iso(-10) }
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
  if (!Array.isArray(s.cycles)) s.cycles = [];
  if (!Array.isArray(s.messages)) s.messages = [];
  if (!Array.isArray(s.dayNotes)) s.dayNotes = [];
  if (!Array.isArray(s.nutrition)) s.nutrition = [];
  if (!Array.isArray(s.goals)) s.goals = [];
  if (!s.settings) s.settings = {};
  if (!s.settings.notifications) s.settings.notifications = { enabled: false, morning: true, postSession: true, sundayEve: true, morningTime: '07:00', eveningTime: '20:00' };
  s.sessions.forEach(x => { if (!Array.isArray(x.steps)) x.steps = []; });
  // Coaches (2 coaches per athlete support)
  if (!Array.isArray(s.coaches) || !s.coaches.length) s.coaches = [{ id: uid(), name: 'Coach 1' }, { id: uid(), name: 'Coach 2' }];
  if (!s.currentCoachId || !s.coaches.find(c => c.id === s.currentCoachId)) s.currentCoachId = s.coaches[0].id;
  s.athletes.forEach(a => { if (!Array.isArray(a.coachIds)) a.coachIds = [s.coaches[0].id]; });
  return s;
}
function currentCoach() { return state.coaches.find(c => c.id === state.currentCoachId) || state.coaches[0]; }
function athleteCoaches(a) { return (a.coachIds || []).map(id => state.coaches.find(c => c.id === id)).filter(Boolean); }
function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  if (Cloud.enabled && Cloud.user && !Cloud.applyingRemote) Cloud.push();
}

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

/* ------------------------------ Zones / load / compliance --------------- */
const CYCLE_TYPES = { macro: 'Macrocycle', meso: 'Mesocycle', micro: 'Microcycle' };
const ZONE_COLORS = ['#35c98b', '#7bc043', '#f5c518', '#f39c12', '#e67e22', '#e74c3c', '#c0392b']; // Z1..Z7-ish

function zoneList(a, zt) { return zt === 'hr' ? (a.hrZones || []) : zt === 'pace' ? (a.paceZones || []) : (a.powerZones || []); }
function zoneColor(z) { return ZONE_COLORS[Math.min(z, ZONE_COLORS.length - 1)] || '#8d99ae'; }
function stepZoneName(a, step) { const z = zoneList(a, step.zt)[step.z]; return z ? z.name : `Z${step.z + 1}`; }
function shortZone(step) { return 'Z' + (step.z + 1); }
// intensity factor from zone midpoint (fraction of threshold)
function stepIF(a, step) {
  const z = zoneList(a, step.zt)[step.z]; if (!z) return 0.6;
  const midPct = (Number(z.min) + Number(z.max)) / 2;
  return Math.max(0.3, Math.min(1.6, midPct / 100));
}
function stepsDuration(steps) { return (steps || []).reduce((n, s) => n + (Number(s.min) || 0), 0); }
function stepsLoad(a, steps) { // TSS-style estimate: sum (min/60)*IF^2*100
  return Math.round((steps || []).reduce((n, s) => { const IF = stepIF(a, s); return n + (Number(s.min) || 0) / 60 * IF * IF * 100; }, 0));
}
// cycles covering a given date (ISO)
function activeCycles(aid, dateISO) {
  return state.cycles.filter(c => c.athleteId === aid && c.start <= dateISO && c.end >= dateISO);
}
function activeCycleOfType(aid, type, dateISO) { return activeCycles(aid, dateISO).find(c => c.type === type); }

// how well a completed session's ACTUAL time-in-zone matched the PLAN (0-100)
function sessionCompliance(s) {
  const plan = s.steps || [];
  const act = s.actual || null;
  if (!plan.length) return null;              // nothing structured to compare
  if (!act) return s.status === 'done' ? 100 : null; // done without adjustment = assume as planned
  // aggregate minutes per zone key
  const key = x => x.zt + x.z;
  const agg = arr => arr.reduce((m, x) => { m[key(x)] = (m[key(x)] || 0) + (Number(x.min) || 0); return m; }, {});
  const P = agg(plan), A = agg(act);
  const keys = new Set([...Object.keys(P), ...Object.keys(A)]);
  let diff = 0, total = 0;
  keys.forEach(k => { diff += Math.abs((P[k] || 0) - (A[k] || 0)); total += (P[k] || 0); });
  if (!total) return null;
  return Math.max(0, Math.round(100 - (diff / total) * 100 / 2)); // /2 so swaps aren't double-counted
}
// weekly average compliance across completed sessions
function weeklyCompliance(aid, wk) {
  const vals = athleteSessions(aid).filter(s => s.status === 'done' && weekKey(fromISO(s.date)) === wk)
    .map(sessionCompliance).filter(v => v != null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((n, v) => n + v, 0) / vals.length);
}

// Fitness model: CTL (42d), ATL (7d) exponentially-weighted daily load; TSB = CTL-ATL(previous day)
function computeFitness(aid, daysBack = 120) {
  const today = new Date();
  const start = addDays(today, -daysBack);
  // daily load: completed sessions use actual/planned load; planned future ignored
  const dayLoad = {};
  athleteSessions(aid).forEach(s => {
    if (s.status !== 'done') return;
    const L = Number(s.load) || stepsLoad(currentAthlete(), s.steps) || 0;
    dayLoad[s.date] = (dayLoad[s.date] || 0) + L;
  });
  const out = [];
  let ctl = 0, atl = 0;
  for (let d = new Date(start); d <= today; d = addDays(d, 1)) {
    const iso = toISO(d);
    const L = dayLoad[iso] || 0;
    ctl = ctl + (L - ctl) / 42;
    atl = atl + (L - atl) / 7;
    out.push({ date: iso, ctl: +ctl.toFixed(1), atl: +atl.toFixed(1), tsb: +(ctl - atl).toFixed(1) });
  }
  return out;
}

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
  { id: 'planning',       label: 'Planning',       icon: '🗓️', roles: ['coach', 'athlete'] },
  { id: 'library',        label: 'Workouts',       icon: '📚', roles: ['coach'] },
  { id: 'fitness',        label: 'Fitness',        icon: '📈', roles: ['coach', 'athlete'] },
  { id: 'testing',        label: 'Testing',        icon: '🧪', roles: ['coach', 'athlete'] },
  { id: 'nutrition',      label: 'Nutrition',      icon: '🥗', roles: ['coach', 'athlete'] },
  { id: 'goals',          label: 'Goals',          icon: '🎯', roles: ['coach', 'athlete'] },
  { id: 'questionnaires', label: 'Questionnaires', icon: '📝', roles: ['coach', 'athlete'] },
  { id: 'messages',       label: 'Messages',       icon: '💬', roles: ['coach', 'athlete'] },
  { id: 'athletes',       label: 'Athletes & Zones', icon: '⚙️', roles: ['coach'] },
  { id: 'monitor',        label: 'Monitoring',     icon: '❤️', roles: ['coach'] },
  { id: 'settings',       label: 'Settings',       icon: '🔌', roles: ['coach', 'athlete'] }
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
          ${state.role === 'coach' ? `<div class="who">
            Acting as
            <select data-coach-select>
              ${state.coaches.map(c => `<option value="${c.id}" ${c.id === state.currentCoachId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
            </select>
          </div>` : ''}
          ${Cloud.user ? `<div class="who" style="margin-top:10px;display:flex;align-items:center;gap:8px;justify-content:space-between">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🟢 ${esc(Cloud.user.email)}</span>
            <button class="btn sm ghost" id="logout-btn" style="flex:0 0 auto">Log out</button>
          </div>` : ''}
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
  if ($('[data-coach-select]')) $('[data-coach-select]').addEventListener('change', (e) => { state.currentCoachId = e.target.value; save(); render(); });
  if ($('#logout-btn')) $('#logout-btn').addEventListener('click', () => Cloud.logout());

  const views = {
    dashboard: viewDashboard, calendar: viewCalendar, planning: viewPlanning, library: viewLibrary,
    fitness: viewFitness, testing: viewTesting, nutrition: viewNutrition, goals: viewGoals,
    questionnaires: viewQuestionnaires, messages: viewMessages, athletes: viewAthletes, monitor: viewMonitor, settings: viewSettings
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
  const compliance = weeklyCompliance(a.id, weekKey(new Date()));

  v.innerHTML = `
    ${recommendationHTML(a.id, todayISO())}
    ${prompts.length ? `<div class="grid" style="margin-bottom:16px">${prompts.map(p => p.html).join('')}</div>` : ''}

    <div class="grid cols-4">
      <div class="card stat"><span class="l">Week load (TSS)</span><span class="v">${weekLoad}</span><div class="grad-bar"></div></div>
      <div class="card stat"><span class="l">Plan match (week)</span><span class="v" style="color:${compliance == null ? 'var(--muted)' : compliance >= 80 ? 'var(--ok)' : compliance >= 60 ? 'var(--yellow)' : 'var(--accent-2)'}">${compliance == null ? '—' : compliance + '%'}</span><span class="sub">actual vs planned zones</span></div>
      <div class="card stat"><span class="l">Completed / Planned</span><span class="v">${doneCount}<small style="font-size:14px;color:var(--muted)"> / ${plannedCount}</small></span></div>
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
    const dayNotes = state.dayNotes.filter(n => n.athleteId === a.id && n.date === iso);
    cells += `
      <div class="cal-cell ${inMonth ? '' : 'dim'} ${isToday ? 'today' : ''}" data-day="${iso}">
        <div class="d"><span>${d.getDate()} ${dayNotes.length ? '<span class="note-dot" title="' + esc(dayNotes.map(n => n.text).join(' · ')) + '"></span>' : ''}</span>${dayLoad ? `<span class="load">${dayLoad} TSS</span>` : ''}</div>
        ${daySessions.map(s => sessionChip(s)).join('')}
        ${dayNotes.map(n => `<div class="day-note" title="${esc(n.text)}">📌 ${esc(n.text.slice(0, 24))}${n.text.length > 24 ? '…' : ''}</div>`).join('')}
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
/* Reusable zone-click workout builder. Mutates `steps` in place; calls onChange after edits. */
function mountStepBuilder(hostId, steps, a, canEdit, onChange) {
  const host = document.getElementById(hostId);
  if (!host) return;
  let zt = steps[0] ? steps[0].zt : 'power';
  function totals() {
    const el = host.querySelector('#sb-tot');
    if (el) el.textContent = steps.length ? `Total: ${stepsDuration(steps)} min · ~${stepsLoad(a, steps)} TSS (auto-calculated)` : '';
  }
  function drawSteps() {
    const wrap = host.querySelector('#sb-steps');
    wrap.innerHTML = steps.length ? steps.map((st, i) => `
      <div class="step-row">
        <span class="sw" style="background:${zoneColor(st.z)}"></span>
        <span class="zn">${shortZone(st)} · ${esc(stepZoneName(a, st))} <span class="sub">(${st.zt === 'hr' ? 'HR' : 'Power'})</span></span>
        <input type="number" data-si="${i}" value="${st.min}" ${canEdit ? '' : 'disabled'}/><span class="sub">min</span>
        ${canEdit ? `<button class="x" data-sdel="${i}">&times;</button>` : ''}
      </div>`).join('') : `<div class="sub" style="padding:6px">No blocks yet.${canEdit ? ' Click a zone above to add one.' : ''}</div>`;
    wrap.querySelectorAll('input[data-si]').forEach(inp => inp.addEventListener('input', () => { steps[inp.dataset.si].min = Number(inp.value) || 0; totals(); onChange && onChange(); }));
    wrap.querySelectorAll('[data-sdel]').forEach(b => b.addEventListener('click', () => { steps.splice(Number(b.dataset.sdel), 1); drawSteps(); onChange && onChange(); }));
    totals();
  }
  function draw() {
    const zones = zoneList(a, zt);
    host.innerHTML = `
      <label>Workout blocks — ${canEdit ? 'click a zone to add a block, then type the minutes' : 'planned zones'}</label>
      ${canEdit ? `<div class="seg2" id="sb-type" style="margin-bottom:8px">
        <button data-zt="power" class="${zt === 'power' ? 'active' : ''}">Power</button>
        <button data-zt="hr" class="${zt === 'hr' ? 'active' : ''}">Heart rate</button>
      </div>
      <div class="zone-chips" id="sb-chips" style="margin-bottom:10px">
        ${zones.map((z, i) => `<button data-add="${i}" style="border-left-color:${zoneColor(i)}">Z${i + 1} ${esc((z.name || '').replace(/^Z\d+\s*/, ''))}</button>`).join('')}
      </div>` : ''}
      <div id="sb-steps"></div>
      <div class="sub" id="sb-tot" style="margin-top:6px"></div>`;
    drawSteps();
    if (canEdit) {
      host.querySelectorAll('#sb-type button').forEach(b => b.addEventListener('click', () => { zt = b.dataset.zt; draw(); }));
      host.querySelectorAll('#sb-chips button').forEach(b => b.addEventListener('click', () => { steps.push({ zt, z: Number(b.dataset.add), min: 10 }); drawSteps(); onChange && onChange(); }));
    }
  }
  draw();
}

/* Recommendation banner from the active meso/micro cycle covering a date */
function recommendationHTML(aid, dateISO) {
  const meso = activeCycleOfType(aid, 'meso', dateISO);
  const micro = activeCycleOfType(aid, 'micro', dateISO);
  const c = micro || meso;
  if (!c) return '';
  const sp = SPORTS[c.sport] || SPORTS.other;
  const zones = (c.zones || []).map(z => `<span class="zbadge">${esc(z)}</span>`).join('');
  return `<div class="prompt" style="margin-bottom:14px"><span class="icon">💡</span>
    <div class="grow"><b>Recommended focus (${CYCLE_TYPES[c.type]})</b>
    <div class="sub">${sp.icon} ${sp.label} — ${esc(c.focus || '')} ${zones}</div></div></div>`;
}

function openSessionModal(id, presetDate) {
  const editing = id ? state.sessions.find(s => s.id === id) : null;
  const s = editing || { id: null, sport: 'biking', name: '', duration: 60, load: 50, date: presetDate || todayISO(), desc: '', strength: [], steps: [], status: 'planned' };
  const canEdit = state.role === 'coach';
  const a = currentAthlete();

  const sportOpts = Object.entries(SPORTS).map(([k, sp]) => `<option value="${k}" ${s.sport === k ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`).join('');

  const body = `
    ${recommendationHTML(state.currentAthleteId, s.date)}
    <label>Sport</label>
    <select id="f-sport" ${canEdit ? '' : 'disabled'}>${sportOpts}</select>
    <label>Session name</label>
    <input id="f-name" value="${esc(s.name)}" ${canEdit ? '' : 'disabled'} placeholder="e.g. Threshold intervals"/>
    <div class="inline">
      <div><label>Date</label><input id="f-date" type="date" value="${s.date}"/></div>
      <div><label>Duration (min)</label><input id="f-dur" type="number" value="${s.duration || 0}" ${canEdit ? '' : 'disabled'}/></div>
      <div><label>Load (TSS)</label><input id="f-load" type="number" value="${s.load || 0}" ${canEdit ? '' : 'disabled'}/></div>
    </div>
    <div id="steps-block" style="margin-top:12px"></div>
    <label>Notes / extra instructions</label>
    <textarea id="f-desc" ${canEdit ? '' : 'disabled'} placeholder="e.g. keep cadence high, fuel every 30min">${esc(s.desc)}</textarea>
    <div id="strength-block"></div>
  `;
  const foot = `
    ${editing && canEdit ? '<button class="btn danger" id="f-del">Delete</button>' : ''}
    ${s.status !== 'done' ? '<button class="btn" id="f-done">Mark complete</button>' : '<span class="badge"><span class="dot" style="background:var(--ok)"></span>Completed</span>'}
    <button class="btn primary" id="f-save">${canEdit ? 'Save' : 'Save date'}</button>`;

  openModal(editing ? 'Edit session' : 'New session', body, foot);

  const stepsState = clone(s.steps || []);
  const strengthState = clone(s.strength || []);
  const strengthMeta = { focus: s.focus || '', targetRpe: s.targetRpe || '' };

  const syncTotals = () => {
    if (stepsState.length) { $('#f-dur').value = stepsDuration(stepsState); $('#f-load').value = stepsLoad(a, stepsState); }
  };
  mountStepBuilder('steps-block', stepsState, a, canEdit, syncTotals);
  renderStrengthEditor(strengthState, canEdit, strengthMeta);

  $('#f-sport').addEventListener('change', () => renderStrengthEditor(strengthState, canEdit, strengthMeta));

  $('#f-save').addEventListener('click', () => {
    const obj = {
      id: s.id || uid(), athleteId: state.currentAthleteId,
      sport: $('#f-sport').value, name: $('#f-name').value.trim() || 'Untitled',
      date: $('#f-date').value, duration: Number($('#f-dur').value) || 0, load: Number($('#f-load').value) || 0,
      desc: $('#f-desc').value, steps: stepsState, strength: strengthState,
      focus: strengthMeta.focus, targetRpe: strengthMeta.targetRpe, status: s.status || 'planned',
      rpe: s.rpe, feeling: s.feeling, feltNote: s.feltNote, actual: s.actual
    };
    if (editing) Object.assign(editing, obj); else state.sessions.push(obj);
    save(); closeModal(); render(); toast('Saved');
  });

  if ($('#f-del')) $('#f-del').addEventListener('click', () => {
    state.sessions = state.sessions.filter(x => x.id !== s.id); save(); closeModal(); render(); toast('Deleted');
  });
  if ($('#f-done')) $('#f-done').addEventListener('click', () => {
    let target = editing;
    if (!target) { target = { ...s, id: uid(), athleteId: state.currentAthleteId, steps: stepsState, strength: strengthState, focus: strengthMeta.focus, targetRpe: strengthMeta.targetRpe }; state.sessions.push(target); }
    else { target.steps = stepsState; target.strength = strengthState; target.focus = strengthMeta.focus; target.targetRpe = strengthMeta.targetRpe; }
    target.status = 'done'; save(); closeModal(); render();
    openRpeModal(target.id); // trigger post-session check-in
  });
}

function renderStrengthEditor(list, canEdit, meta) {
  const block = $('#strength-block');
  if (!block) return;
  if ($('#f-sport').value !== 'strength') { block.innerHTML = ''; return; }
  meta = meta || {};
  block.innerHTML = `
    <div class="inline">
      <div style="flex:2"><label>Focus of the training</label><input id="str-focus" value="${esc(meta.focus || '')}" ${canEdit ? '' : 'disabled'} placeholder="e.g. Max strength — legs & core"/></div>
      <div><label>Target RPE (1–10)</label><input id="str-rpe" type="number" min="1" max="10" value="${esc(meta.targetRpe || '')}" ${canEdit ? '' : 'disabled'} placeholder="e.g. 8"/></div>
    </div>
    <label style="margin-top:12px">Strength exercises</label>
    <table class="ztable"><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th><th>Rest</th>${canEdit ? '<th></th>' : ''}</tr></thead>
      <tbody id="str-rows"></tbody></table>
    ${canEdit ? '<div class="btn-row" style="margin-top:8px"><button class="btn sm" id="str-add">+ Add exercise</button></div>' : ''}`;
  if ($('#str-focus')) $('#str-focus').addEventListener('input', e => { meta.focus = e.target.value; });
  if ($('#str-rpe')) $('#str-rpe').addEventListener('input', e => { meta.targetRpe = e.target.value; });
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
  const a = state.athletes.find(x => x.id === s.athleteId) || currentAthlete();
  const hasPlan = (s.steps || []).length > 0;
  const body = `
    <div class="sub" style="margin-bottom:10px">${SPORTS[s.sport].icon} ${esc(s.name)} · ${fmtDate(s.date)}</div>
    <label>RPE — how hard was this session? (1 easy – 10 max)</label>
    ${scaleField('rpe-scale', s.rpe)}
    <label>How did you feel after this training?</label>
    <textarea id="rpe-note" placeholder="Legs, energy, mood, niggles...">${esc(s.feltNote || '')}</textarea>
    ${hasPlan ? `<label style="margin-top:14px">Actual time in each zone (adjust if the session differed from plan — this drives your compliance %)</label><div id="rpe-actual"></div>` : ''}`;
  openModal('Session feedback', body, `<button class="btn primary" id="rpe-save">Save feedback</button>`);
  const getRpe = bindScale('rpe-scale', () => {}, s.rpe);

  const actual = clone(s.actual && s.actual.length ? s.actual : (s.steps || []));
  if (hasPlan) mountStepBuilder('rpe-actual', actual, a, true, null);

  $('#rpe-save').addEventListener('click', () => {
    s.rpe = getRpe(); s.feltNote = $('#rpe-note').value;
    if (hasPlan) s.actual = actual;
    state.checkins.session.push({ id: uid(), athleteId: s.athleteId, sessionId: s.id, date: todayISO(), rpe: s.rpe, note: s.feltNote });
    save(); closeModal(); render();
    const c = sessionCompliance(s);
    toast(c != null ? `Saved · ${c}% match to plan` : 'Feedback saved');
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

    <div class="card" style="margin-top:16px">
      <h3>Coaches for ${esc(a.name)}</h3>
      <p class="sub">Assign up to 2 coaches to this athlete. Both can program and message. Use “Acting as” in the sidebar to switch which coach you are.</p>
      <div id="coach-assign"></div>
      <div class="section-title" style="margin-top:14px">All coaches</div>
      <div id="coach-list"></div>
      <div class="btn-row" style="margin-top:10px"><button class="btn sm" id="coach-add">+ Add coach</button></div>
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

  // ----- Coaches (max 2 per athlete) -----
  function drawCoaches() {
    a.coachIds = a.coachIds || [];
    const atMax = a.coachIds.length >= 2;
    $('#coach-assign').innerHTML = a.coachIds.length
      ? a.coachIds.map(id => { const c = state.coaches.find(x => x.id === id); return c ? `<span class="badge" style="background:var(--accent);color:var(--accent-ink);margin:0 6px 6px 0">👤 ${esc(c.name)} <button class="x" data-unassign="${id}" style="color:var(--accent-ink);font-size:16px">&times;</button></span>` : ''; }).join('')
      : '<div class="sub">No coaches assigned yet.</div>';

    $('#coach-list').innerHTML = state.coaches.map(c => {
      const assigned = a.coachIds.includes(c.id);
      return `<div class="row">
        <span class="dot" style="background:${assigned ? 'var(--ok)' : 'var(--line)'}"></span>
        <div class="grow"><input data-coach-name="${c.id}" value="${esc(c.name)}" style="border:0;background:transparent;padding:4px 0;font-weight:600"/></div>
        ${assigned ? `<button class="btn sm" data-unassign="${c.id}">Unassign</button>` : `<button class="btn sm primary" data-assign="${c.id}" ${atMax ? 'disabled title="Max 2 coaches"' : ''}>Assign</button>`}
        ${state.coaches.length > 1 ? `<button class="btn sm danger" data-coach-del="${c.id}">Delete</button>` : ''}
      </div>`;
    }).join('');

    $$('[data-assign]').forEach(b => b.addEventListener('click', () => { if (a.coachIds.length < 2 && !a.coachIds.includes(b.dataset.assign)) { a.coachIds.push(b.dataset.assign); save(); drawCoaches(); } }));
    $$('[data-unassign]').forEach(b => b.addEventListener('click', () => { a.coachIds = a.coachIds.filter(id => id !== b.dataset.unassign); save(); drawCoaches(); }));
    $$('[data-coach-name]').forEach(inp => inp.addEventListener('change', () => { const c = state.coaches.find(x => x.id === inp.dataset.coachName); if (c) { c.name = inp.value.trim() || 'Coach'; save(); render(); } }));
    $$('[data-coach-del]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.coachDel;
      state.coaches = state.coaches.filter(c => c.id !== id);
      state.athletes.forEach(at => { at.coachIds = (at.coachIds || []).filter(cid => cid !== id); });
      if (state.currentCoachId === id) state.currentCoachId = state.coaches[0] ? state.coaches[0].id : null;
      save(); render();
    }));
  }
  $('#coach-add').addEventListener('click', () => { state.coaches.push({ id: uid(), name: 'Coach ' + (state.coaches.length + 1) }); save(); drawCoaches(); });
  drawCoaches();

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

/* ------------------------------ Planning / cycles ----------------------- */
function viewPlanning() {
  const a = currentAthlete();
  const canEdit = state.role === 'coach';
  const actions = $('#topbar-actions');
  actions.innerHTML = canEdit ? `<button class="btn primary sm" id="add-cycle">+ Add cycle</button>` : '';
  if (canEdit) $('#add-cycle').addEventListener('click', () => openCycleModal(null));

  const cycles = state.cycles.filter(c => c.athleteId === a.id);
  const group = (type) => cycles.filter(c => c.type === type).sort((x, y) => x.start.localeCompare(y.start));

  const v = $('#view');
  v.innerHTML = `
    ${recommendationHTML(a.id, todayISO())}
    <p class="sub">Season structure for ${esc(a.name)}. Macrocycle = whole season · Mesocycle = block (weeks/month) · Microcycle = week. The focus you set here drives the recommendations on the calendar and when building sessions.</p>
    ${['macro', 'meso', 'micro'].map(type => `
      <div class="section-title">${CYCLE_TYPES[type]}s</div>
      <div>${group(type).length ? group(type).map(c => cycleBar(c, canEdit)).join('') : '<div class="empty">None yet.</div>'}</div>
    `).join('')}`;

  $$('[data-cycle-edit]').forEach(b => b.addEventListener('click', () => openCycleModal(b.dataset.cycleEdit)));
}
function cycleBar(c, canEdit) {
  const sp = SPORTS[c.sport] || SPORTS.other;
  const zones = (c.zones || []).map(z => `<span class="zbadge">${esc(z)}</span>`).join('');
  return `<div class="cycle-bar ${c.type}">
    <div class="ttl"><span>${esc(c.name)}</span>${canEdit ? `<button class="btn sm" data-cycle-edit="${c.id}">Edit</button>` : ''}</div>
    <div class="rng">${fmtDate(c.start)} → ${fmtDate(c.end)} · ${sp.icon} ${sp.label}</div>
    <div class="foc">${esc(c.focus || '')} ${zones}</div>
  </div>`;
}
function openCycleModal(id) {
  const editing = id ? state.cycles.find(c => c.id === id) : null;
  const c = editing || { type: 'meso', name: '', sport: 'biking', start: todayISO(), end: toISO(addDays(new Date(), 27)), zones: [], focus: '' };
  const typeOpts = Object.entries(CYCLE_TYPES).map(([k, l]) => `<option value="${k}" ${c.type === k ? 'selected' : ''}>${l}</option>`).join('');
  const sportOpts = Object.entries(SPORTS).map(([k, sp]) => `<option value="${k}" ${c.sport === k ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`).join('');
  const body = `
    <div class="inline">
      <div><label>Type</label><select id="c-type">${typeOpts}</select></div>
      <div><label>Sport focus</label><select id="c-sport">${sportOpts}</select></div>
    </div>
    <label>Name</label><input id="c-name" value="${esc(c.name)}" placeholder="e.g. March — Base"/>
    <div class="inline">
      <div><label>Start</label><input id="c-start" type="date" value="${c.start}"/></div>
      <div><label>End</label><input id="c-end" type="date" value="${c.end}"/></div>
    </div>
    <label>Target zones (comma separated, e.g. Z1, Z2)</label>
    <input id="c-zones" value="${esc((c.zones || []).join(', '))}" placeholder="Z1, Z2"/>
    <label>Goal / focus for this block</label>
    <textarea id="c-focus" placeholder="e.g. Aerobic base — Z1/Z2 running volume">${esc(c.focus || '')}</textarea>`;
  const foot = `${editing ? '<button class="btn danger" id="c-del">Delete</button>' : ''}<button class="btn primary" id="c-save">Save</button>`;
  openModal(editing ? 'Edit cycle' : 'New cycle', body, foot);
  $('#c-save').addEventListener('click', () => {
    const obj = {
      id: c.id || uid(), athleteId: state.currentAthleteId, type: $('#c-type').value,
      name: $('#c-name').value.trim() || CYCLE_TYPES[$('#c-type').value], sport: $('#c-sport').value,
      start: $('#c-start').value, end: $('#c-end').value,
      zones: $('#c-zones').value.split(',').map(z => z.trim()).filter(Boolean), focus: $('#c-focus').value
    };
    if (editing) Object.assign(editing, obj); else state.cycles.push(obj);
    save(); closeModal(); render(); toast('Cycle saved');
  });
  if ($('#c-del')) $('#c-del').addEventListener('click', () => { state.cycles = state.cycles.filter(x => x.id !== c.id); save(); closeModal(); render(); toast('Deleted'); });
}

/* ------------------------------ Fitness (CTL/ATL/TSB) ------------------- */
function viewFitness() {
  const a = currentAthlete();
  const data = computeFitness(a.id, 120);
  const last = data[data.length - 1] || { ctl: 0, atl: 0, tsb: 0 };
  const form = last.tsb;
  const formLabel = form > 5 ? 'Fresh' : form < -15 ? 'High fatigue' : form < -5 ? 'Building' : 'Neutral';
  const v = $('#view');
  v.innerHTML = `
    <p class="sub">Fitness (CTL, 42-day), Fatigue (ATL, 7-day) and Form (TSB = Fitness − Fatigue), built from completed sessions — the same model as Intervals.icu / TrainingPeaks.</p>
    <div class="grid cols-3" style="margin:12px 0">
      <div class="card stat"><span class="l">Fitness (CTL)</span><span class="v" style="color:var(--accent)">${last.ctl}</span></div>
      <div class="card stat"><span class="l">Fatigue (ATL)</span><span class="v" style="color:var(--accent-2)">${last.atl}</span></div>
      <div class="card stat"><span class="l">Form (TSB)</span><span class="v" style="color:var(--yellow)">${last.tsb}</span><span class="sub">${formLabel}</span></div>
    </div>
    <div class="card">
      <h3>Fitness / Fatigue / Form — last 120 days</h3>
      <div class="chart-wrap">${fitnessChart(data)}</div>
      <div class="legend">
        <span><i style="background:var(--accent)"></i>Fitness (CTL)</span>
        <span><i style="background:var(--accent-2)"></i>Fatigue (ATL)</span>
        <span><i style="background:var(--yellow)"></i>Form (TSB)</span>
      </div>
      <p class="sub" style="margin-top:8px">Tip: form dips negative during hard blocks and rises positive as you taper toward an event. Values grow as you complete more sessions.</p>
    </div>`;
}
function fitnessChart(data) {
  const W = 760, H = 280, pad = 34;
  if (!data.length) return '<div class="empty">No data yet.</div>';
  const vals = data.flatMap(d => [d.ctl, d.atl, d.tsb]);
  const min = Math.min(0, ...vals), max = Math.max(10, ...vals);
  const x = i => pad + (i / (data.length - 1 || 1)) * (W - pad * 2);
  const y = val => H - pad - ((val - min) / (max - min || 1)) * (H - pad * 2);
  const path = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');
  const zeroY = y(0);
  // month gridlines
  let grid = '';
  data.forEach((d, i) => { if (fromISO(d.date).getDate() === 1) grid += `<line x1="${x(i)}" y1="${pad}" x2="${x(i)}" y2="${H - pad}" stroke="var(--line)" stroke-dasharray="2,3"/><text x="${x(i)}" y="${H - pad + 14}" fill="var(--muted)" font-size="10" text-anchor="middle">${MONTHS[fromISO(d.date).getMonth()].slice(0, 3)}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" style="min-width:520px">
    ${grid}
    <line x1="${pad}" y1="${zeroY}" x2="${W - pad}" y2="${zeroY}" stroke="var(--line)"/>
    <text x="${pad - 6}" y="${zeroY + 3}" fill="var(--muted)" font-size="10" text-anchor="end">0</text>
    <path d="${path('ctl')}" fill="none" stroke="#3b30e6" stroke-width="2.5"/>
    <path d="${path('atl')}" fill="none" stroke="#e50914" stroke-width="2"/>
    <path d="${path('tsb')}" fill="none" stroke="#f5c518" stroke-width="1.6" stroke-dasharray="4,3"/>
  </svg>`;
}

/* ------------------------------ Nutrition ------------------------------- */
function viewNutrition() {
  const a = currentAthlete();
  const canEdit = state.role === 'coach';
  const actions = $('#topbar-actions');
  actions.innerHTML = canEdit ? `<button class="btn primary sm" id="add-nut">+ Add week</button>` : '';
  if (canEdit) $('#add-nut').addEventListener('click', () => openNutritionModal(null));

  const items = state.nutrition.filter(n => n.athleteId === a.id).sort((x, y) => y.week.localeCompare(x.week));
  const thisWeek = weekKey(new Date());
  const v = $('#view');
  v.innerHTML = `
    <p class="sub">Weekly nutrition guidance for ${esc(a.name)}.</p>
    <div class="list" style="margin-top:10px">
      ${items.length ? items.map(n => `
        <div class="card">
          <div class="badge" style="${n.week === thisWeek ? 'background:var(--accent);color:var(--accent-ink)' : ''}">Week of ${fmtDate(n.week)}${n.week === thisWeek ? ' · this week' : ''}</div>
          <h3 style="margin-top:8px">${esc(n.title || 'Nutrition focus')}</h3>
          <p class="sub"><b style="color:var(--text)">Focus:</b> ${esc(n.focus || '')}</p>
          ${n.notes ? `<p class="sub">${esc(n.notes)}</p>` : ''}
          ${canEdit ? `<div class="btn-row" style="margin-top:8px"><button class="btn sm" data-nut-edit="${n.id}">Edit</button><button class="btn sm danger" data-nut-del="${n.id}">Delete</button></div>` : ''}
        </div>`).join('') : '<div class="empty">No nutrition guidance yet.</div>'}
    </div>`;
  $$('[data-nut-edit]').forEach(b => b.addEventListener('click', () => openNutritionModal(b.dataset.nutEdit)));
  $$('[data-nut-del]').forEach(b => b.addEventListener('click', () => { state.nutrition = state.nutrition.filter(n => n.id !== b.dataset.nutDel); save(); viewNutrition(); }));
}
function openNutritionModal(id) {
  const editing = id ? state.nutrition.find(n => n.id === id) : null;
  const n = editing || { week: weekKey(new Date()), title: '', focus: '', notes: '' };
  const body = `
    <label>Week starting (Monday)</label><input id="n-week" type="date" value="${n.week}"/>
    <label>Title</label><input id="n-title" value="${esc(n.title)}" placeholder="e.g. Base week fuelling"/>
    <label>Focus for the week</label><textarea id="n-focus" placeholder="e.g. Protein 1.6 g/kg, carbs around key sessions, hydration">${esc(n.focus)}</textarea>
    <label>Extra notes (optional)</label><textarea id="n-notes" placeholder="Meal ideas, what to avoid, supplements...">${esc(n.notes || '')}</textarea>`;
  openModal(editing ? 'Edit nutrition' : 'Nutrition for a week', body, `<button class="btn primary" id="n-save">Save</button>`);
  $('#n-save').addEventListener('click', () => {
    const obj = { id: n.id || uid(), athleteId: state.currentAthleteId, week: weekKey(fromISO($('#n-week').value)), title: $('#n-title').value, focus: $('#n-focus').value, notes: $('#n-notes').value };
    if (editing) Object.assign(editing, obj); else state.nutrition.push(obj);
    save(); closeModal(); viewNutrition(); toast('Saved');
  });
}

/* ------------------------------ Goals ----------------------------------- */
function viewGoals() {
  const a = currentAthlete();
  const actions = $('#topbar-actions');
  actions.innerHTML = `<button class="btn primary sm" id="add-goal">+ Add goal</button>`;
  $('#add-goal').addEventListener('click', () => openGoalModal(null));

  const goals = state.goals.filter(g => g.athleteId === a.id).sort((x, y) => (x.status === y.status ? (x.due || '').localeCompare(y.due || '') : x.status === 'open' ? -1 : 1));
  const v = $('#view');
  v.innerHTML = `
    <p class="sub">Goals for ${esc(a.name)}. Both coach and athlete can add them.</p>
    <div class="list" style="margin-top:10px">
      ${goals.length ? goals.map(g => `
        <div class="row">
          <button class="btn sm" data-goal-toggle="${g.id}" title="Toggle done">${g.status === 'done' ? '✅' : '⬜'}</button>
          <div class="grow">
            <div class="title" style="${g.status === 'done' ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(g.text)}</div>
            <div class="meta">by ${g.by} ${g.due ? '· target ' + fmtDate(g.due) : ''}</div>
          </div>
          <button class="btn sm" data-goal-edit="${g.id}">Edit</button>
          <button class="btn sm danger" data-goal-del="${g.id}">Delete</button>
        </div>`).join('') : '<div class="empty">No goals yet.</div>'}
    </div>`;
  $$('[data-goal-toggle]').forEach(b => b.addEventListener('click', () => { const g = state.goals.find(x => x.id === b.dataset.goalToggle); g.status = g.status === 'done' ? 'open' : 'done'; save(); viewGoals(); }));
  $$('[data-goal-edit]').forEach(b => b.addEventListener('click', () => openGoalModal(b.dataset.goalEdit)));
  $$('[data-goal-del]').forEach(b => b.addEventListener('click', () => { state.goals = state.goals.filter(x => x.id !== b.dataset.goalDel); save(); viewGoals(); }));
}
function openGoalModal(id) {
  const editing = id ? state.goals.find(g => g.id === id) : null;
  const g = editing || { text: '', due: '', status: 'open' };
  const body = `
    <label>Goal</label><textarea id="g-text" placeholder="e.g. Raise FTP to 270 W">${esc(g.text)}</textarea>
    <label>Target date (optional)</label><input id="g-due" type="date" value="${g.due || ''}"/>`;
  openModal(editing ? 'Edit goal' : 'New goal', body, `<button class="btn primary" id="g-save">Save</button>`);
  $('#g-save').addEventListener('click', () => {
    const obj = { id: g.id || uid(), athleteId: state.currentAthleteId, by: editing ? g.by : state.role, text: $('#g-text').value.trim() || 'Goal', due: $('#g-due').value, status: g.status || 'open', createdAt: g.createdAt || todayISO() };
    if (editing) Object.assign(editing, obj); else state.goals.push(obj);
    save(); closeModal(); viewGoals(); toast('Saved');
  });
}

/* ------------------------------ Messages & day notes -------------------- */
function viewMessages() {
  const a = currentAthlete();
  const me = state.role; // 'coach' | 'athlete'
  const msgs = state.messages.filter(m => m.athleteId === a.id).sort((x, y) => x.ts - y.ts);
  const notes = state.dayNotes.filter(n => n.athleteId === a.id).sort((x, y) => y.date.localeCompare(x.date));
  const v = $('#view');
  v.innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <h3>💬 Chat ${me === 'coach' ? 'with ' + esc(a.name) : 'with coach'}</h3>
        <div class="chat" id="chat">
          ${msgs.length ? msgs.map(m => {
            const author = m.from === 'coach' ? ((state.coaches.find(c => c.id === m.coachId) || {}).name || 'Coach') : esc(a.name);
            const isMe = m.from === me;
            return `<div class="bubble ${isMe ? 'me' : 'them'}">${esc(m.text)}<span class="when">${isMe && m.from === 'athlete' ? 'You' : esc(author)} · ${fmtDate(m.date)}</span></div>`;
          }).join('') : '<div class="sub">No messages yet.</div>'}
        </div>
        <div class="chat-input">
          <input id="msg-text" placeholder="Type a message..."/>
          <button class="btn primary" id="msg-send">Send</button>
        </div>
      </div>
      <div class="card">
        <h3>📌 Day notes</h3>
        <p class="sub">Log something about a specific day (e.g. “went out, few drinks”, poor sleep, travel). Shows up for the coach.</p>
        <div class="inline">
          <div><label>Date</label><input id="note-date" type="date" value="${todayISO()}"/></div>
          <div style="flex:2"><label>Note</label><input id="note-text" placeholder="e.g. Went out with friends 🍻"/></div>
        </div>
        <div class="btn-row" style="margin-top:8px"><button class="btn primary sm" id="note-add">Add note</button></div>
        <div class="list" style="margin-top:12px">
          ${notes.length ? notes.map(n => `<div class="row"><div class="grow"><div class="title">${esc(n.text)}</div><div class="meta">${fmtDate(n.date)}</div></div><button class="btn sm danger" data-note-del="${n.id}">×</button></div>`).join('') : '<div class="empty">No day notes yet.</div>'}
        </div>
      </div>
    </div>`;

  const chatEl = $('#chat'); if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
  const send = () => {
    const t = $('#msg-text').value.trim(); if (!t) return;
    state.messages.push({ id: uid(), athleteId: a.id, from: me, coachId: me === 'coach' ? state.currentCoachId : undefined, date: todayISO(), ts: Date.now(), text: t });
    save(); viewMessages();
  };
  $('#msg-send').addEventListener('click', send);
  $('#msg-text').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  $('#note-add').addEventListener('click', () => {
    const t = $('#note-text').value.trim(); if (!t) return;
    state.dayNotes.push({ id: uid(), athleteId: a.id, date: $('#note-date').value, text: t });
    save(); viewMessages(); toast('Note added');
  });
  $$('[data-note-del]').forEach(b => b.addEventListener('click', () => { state.dayNotes = state.dayNotes.filter(n => n.id !== b.dataset.noteDel); save(); viewMessages(); }));
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
  const nt = state.settings.notifications;
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
      <h3>Reminders & notifications</h3>
      <p class="sub">Reminds the athlete to fill in their check-ins: after each session, every morning (sleep), and Sunday evening (weekly reflection).</p>
      <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="nt-enabled" style="width:auto" ${nt.enabled ? 'checked' : ''}/> <span>Enable notifications on this device</span></label>
      <div style="margin-top:8px">
        <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="nt-morning" style="width:auto" ${nt.morning ? 'checked' : ''}/> <span>Every morning — sleep check-in</span></label>
        <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="nt-post" style="width:auto" ${nt.postSession ? 'checked' : ''}/> <span>After each completed session — RPE & feeling</span></label>
        <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="nt-sun" style="width:auto" ${nt.sundayEve ? 'checked' : ''}/> <span>Sunday evening — weekly reflection</span></label>
      </div>
      <div class="inline" style="margin-top:8px">
        <div><label>Morning time</label><input id="nt-mtime" type="time" value="${nt.morningTime || '07:00'}"/></div>
        <div><label>Evening time</label><input id="nt-etime" type="time" value="${nt.eveningTime || '20:00'}"/></div>
      </div>
      <div class="btn-row" style="margin-top:10px"><button class="btn" id="nt-test">Send a test notification</button></div>
      <div class="hint">Web notifications fire reliably while the app is open or recently in the background. For alerts when the app is fully closed — especially on iPhone — a small push server is needed (can be added later). Install the app (below) for the best reminder reliability.</div>
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

  // Notifications
  const saveNt = () => {
    nt.morning = $('#nt-morning').checked; nt.postSession = $('#nt-post').checked; nt.sundayEve = $('#nt-sun').checked;
    nt.morningTime = $('#nt-mtime').value; nt.eveningTime = $('#nt-etime').value; save();
  };
  ['#nt-morning', '#nt-post', '#nt-sun', '#nt-mtime', '#nt-etime'].forEach(id => $(id).addEventListener('change', saveNt));
  $('#nt-enabled').addEventListener('change', async (e) => {
    if (e.target.checked) {
      const ok = await requestNotifPermission();
      nt.enabled = ok; save();
      if (ok) { toast('Notifications on'); checkReminders(); } else { e.target.checked = false; toast('Permission denied in browser'); }
    } else { nt.enabled = false; save(); toast('Notifications off'); }
  });
  $('#nt-test').addEventListener('click', async () => {
    const ok = Notification.permission === 'granted' ? true : await requestNotifPermission();
    if (ok) notify('Tour Against Cancer', 'Test notification — reminders are working ✅'); else toast('Enable notifications first');
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

/* ------------------------------ Notifications --------------------------- */
async function requestNotifPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const p = await Notification.requestPermission();
  return p === 'granted';
}
function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body, icon: './icons/logo.svg', badge: './icons/logo.svg' })).catch(() => new Notification(title, { body }));
    } else { new Notification(title, { body }); }
  } catch (e) {}
}
// de-dupe so a reminder fires at most once per day per type
function reminderFiredKey(type) { return `tac_notif_${type}_${todayISO()}`; }
function alreadyFired(type) { return localStorage.getItem(reminderFiredKey(type)) === '1'; }
function markFired(type) { localStorage.setItem(reminderFiredKey(type), '1'); }

function checkReminders() {
  const nt = state.settings.notifications;
  if (!nt || !nt.enabled || Notification.permission !== 'granted') return;
  const a = currentAthlete(); if (!a) return;
  const now = new Date();
  const hhmm = now.toTimeString().slice(0, 5);

  // Morning: sleep check-in
  if (nt.morning && !alreadyFired('morning') && hhmm >= (nt.morningTime || '07:00')) {
    const hasSleep = state.checkins.sleep.some(s => s.athleteId === a.id && s.date === todayISO());
    if (!hasSleep) { notify('Good morning 🌙', 'How did you sleep? Tap to log your morning check-in.'); markFired('morning'); }
  }
  // Post-session: completed sessions still missing RPE
  if (nt.postSession && !alreadyFired('post')) {
    const pending = athleteSessions(a.id).some(s => s.status === 'done' && s.rpe == null);
    if (pending) { notify('Session done ✅', 'Add your RPE and how you felt after training.'); markFired('post'); }
  }
  // Sunday evening: weekly reflection
  if (nt.sundayEve && !alreadyFired('sunday') && now.getDay() === 0 && hhmm >= (nt.eveningTime || '20:00')) {
    const wk = weekKey(now);
    const hasWeekly = state.checkins.weekly.some(w => w.athleteId === a.id && w.week === wk);
    if (!hasWeekly) { notify('Weekly reflection 📆', 'How did this week feel? Tap to fill in your weekly check-in.'); markFired('sunday'); }
  }
}

/* ------------------------------ Cloud sync (Firebase) ------------------- */
const Cloud = {
  enabled: false, auth: null, db: null, user: null, teamRef: null,
  applyingRemote: false, ready: false, saveTimer: null,
  // which parts of `state` are shared across devices (view prefs & device settings stay local)
  DATA_KEYS: ['athletes', 'coaches', 'sessions', 'library', 'questionnaires', 'responses', 'checkins', 'tests', 'cycles', 'messages', 'dayNotes', 'nutrition', 'goals'],

  init() {
    if (!window.FIREBASE_CONFIG || typeof firebase === 'undefined') return false;
    try {
      firebase.initializeApp(window.FIREBASE_CONFIG);
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
      this.enabled = true;
      return true;
    } catch (e) { console.warn('Firebase init failed', e); return false; }
  },

  start() {
    this.auth.onAuthStateChanged((u) => {
      this.user = u;
      if (u) this.onLogin(); else showAuthScreen();
    });
  },

  async onLogin() {
    // record/refresh this user's profile
    try {
      await this.db.collection('users').doc(this.user.uid).set({
        email: this.user.email, name: this.user.displayName || '', lastSeen: Date.now()
      }, { merge: true });
    } catch (e) {}

    this.teamRef = this.db.collection('team').doc('main');
    this.ready = false; // block local pushes until we've loaded the shared data at least once
    render();           // show app shell immediately (render never pushes)

    this.teamRef.onSnapshot((snap) => {
      if (snap.metadata.hasPendingWrites) return;         // ignore our own echo
      if (!snap.exists) { this.pushNow(); this.ready = true; return; } // first user seeds the shared team
      const data = snap.data();
      this.applyingRemote = true;
      this.DATA_KEYS.forEach(k => { if (data[k] !== undefined) state[k] = data[k]; });
      migrate(state);
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      this.applyingRemote = false;
      this.ready = true;
      if (!document.querySelector('#modal-root .modal')) render(); // don't clobber an open modal
    }, (err) => toast('Sync error: ' + err.message));

    checkReminders();
    if (!this._interval) { this._interval = setInterval(checkReminders, 5 * 60 * 1000); document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminders(); }); }
  },

  push() {
    if (!this.enabled || !this.user || this.applyingRemote || !this.ready) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.pushNow(), 600);
  },
  pushNow() {
    if (!this.teamRef) return;
    const payload = { _updatedAt: Date.now(), _updatedBy: (this.user && this.user.email) || '' };
    this.DATA_KEYS.forEach(k => { payload[k] = state[k]; });
    this.teamRef.set(payload).catch(e => toast('Sync error: ' + e.message));
  },

  logout() { if (this.auth) this.auth.signOut(); }
};

function showAuthScreen(msg) {
  const app = $('#app');
  app.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <img class="logo" src="./icons/logo.svg" alt="logo"/>
        <h2 style="text-align:center;margin:0 0 4px">Tour Against Cancer</h2>
        <p class="sub" style="text-align:center;margin:0 0 18px">Coaching platform — log in to sync across your devices.</p>
        <div class="seg" style="display:flex;background:var(--panel-2);border-radius:10px;padding:3px;margin-bottom:14px">
          <button class="authseg active" data-mode="login" style="flex:1;border:0;background:transparent;color:var(--text);padding:9px;border-radius:8px;cursor:pointer;font-weight:600">Log in</button>
          <button class="authseg" data-mode="signup" style="flex:1;border:0;background:transparent;color:var(--muted);padding:9px;border-radius:8px;cursor:pointer;font-weight:600">Create account</button>
        </div>
        <div id="signup-fields" style="display:none">
          <label>Your name</label><input id="au-name" placeholder="e.g. Marcin"/>
          <label>I am a…</label>
          <select id="au-role"><option value="coach">Coach</option><option value="athlete">Athlete</option></select>
        </div>
        <label>Email</label><input id="au-email" type="email" autocomplete="email" placeholder="you@example.com"/>
        <label>Password</label><input id="au-pass" type="password" autocomplete="current-password" placeholder="At least 6 characters"/>
        <div id="au-err" style="color:var(--bad);font-size:13px;margin-top:10px;min-height:16px">${esc(msg || '')}</div>
        <button class="btn primary" id="au-go" style="width:100%;justify-content:center;margin-top:6px">Log in</button>
        <p class="sub" style="text-align:center;margin-top:14px;font-size:12px">Your data is stored securely in your team's private cloud.</p>
      </div>
    </div>`;

  let mode = 'login';
  const setMode = (m) => {
    mode = m;
    $$('.authseg').forEach(b => { const on = b.dataset.mode === m; b.classList.toggle('active', on); b.style.background = on ? 'var(--accent)' : 'transparent'; b.style.color = on ? 'var(--accent-ink)' : (on ? '#fff' : 'var(--muted)'); });
    $('#signup-fields').style.display = m === 'signup' ? 'block' : 'none';
    $('#au-go').textContent = m === 'signup' ? 'Create account' : 'Log in';
  };
  $$('.authseg').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

  const go = async () => {
    const email = $('#au-email').value.trim(), pass = $('#au-pass').value;
    $('#au-err').textContent = '';
    if (!email || !pass) { $('#au-err').textContent = 'Enter your email and password.'; return; }
    $('#au-go').disabled = true;
    try {
      if (mode === 'signup') {
        const cred = await Cloud.auth.createUserWithEmailAndPassword(email, pass);
        const name = $('#au-name').value.trim() || email.split('@')[0];
        await cred.user.updateProfile({ displayName: name });
        await Cloud.db.collection('users').doc(cred.user.uid).set({ email, name, role: $('#au-role').value, createdAt: Date.now() }, { merge: true });
        state.role = $('#au-role').value; save();
      } else {
        await Cloud.auth.signInWithEmailAndPassword(email, pass);
      }
      // onAuthStateChanged takes over from here
    } catch (e) {
      $('#au-go').disabled = false;
      $('#au-err').textContent = friendlyAuthError(e);
    }
  };
  $('#au-go').addEventListener('click', go);
  $('#au-pass').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
}
function friendlyAuthError(e) {
  const c = (e && e.code) || '';
  if (c.includes('email-already-in-use')) return 'That email already has an account — try logging in.';
  if (c.includes('invalid-email')) return 'That email address looks invalid.';
  if (c.includes('weak-password')) return 'Password must be at least 6 characters.';
  if (c.includes('wrong-password') || c.includes('invalid-credential')) return 'Wrong email or password.';
  if (c.includes('user-not-found')) return 'No account with that email — create one first.';
  if (c.includes('network')) return 'Network problem — check your connection.';
  return (e && e.message) || 'Something went wrong.';
}

/* ------------------------------ Boot ------------------------------------ */
if (Cloud.init()) {
  Cloud.start();               // cloud mode: auth gate + live sync
} else {
  render();                    // local-only fallback (offline / no Firebase)
  checkReminders();
  setInterval(checkReminders, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminders(); });
}
