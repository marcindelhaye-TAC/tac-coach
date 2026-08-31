/* One-way sync: push TAC planned workouts to each athlete's Intervals.icu calendar.
   Runs on GitHub Actions (scheduled). Reads athletes + their Intervals creds from Firestore.
   Idempotent: on each run it removes its own previously-created events (external_id "tac-…")
   in the window and recreates them from the current plan, so there are never duplicates. */
const admin = require('firebase-admin');

const API = 'https://intervals.icu/api/v1';
const WINDOW_DAYS = 21;      // forward: how far ahead to push planned workouts
const BACK_DAYS = 60;        // reverse: how far back to pull completed activities (covers since ~early July)
const TYPE = { biking: 'Ride', running: 'Run', swimming: 'Swim', walking: 'Walk', strength: 'WeightTraining', injury: 'Workout', stretching: 'Yoga', other: 'Workout' };
const REV_TYPE = { Ride: 'biking', VirtualRide: 'biking', GravelRide: 'biking', Run: 'running', VirtualRun: 'running', TrailRun: 'running', Swim: 'swimming', OpenWaterSwim: 'swimming', Walk: 'walking', Hike: 'walking', WeightTraining: 'strength', Workout: 'other', Yoga: 'stretching' };
function rid() { return Math.random().toString(36).slice(2, 10); }
function zoneTimesFor(act, zt) {
  const arr = zt === 'hr' ? act.icu_hr_zone_times : act.icu_zone_times;
  if (!Array.isArray(arr)) return [];
  const out = [];
  arr.forEach((z, i) => { const secs = typeof z === 'number' ? z : (z && (z.secs || z.time)) || 0; if (secs > 0) out.push({ zt, z: i, min: Math.round(secs / 60) }); });
  return out;
}
// downsample a raw stream array to K points (averaging buckets, keeping null gaps)
function downsample(data, K = 100) {
  if (!Array.isArray(data) || !data.length) return null;
  const clean = v => (v == null || isNaN(v)) ? null : Math.round(v * 10) / 10;
  if (data.length <= K) return data.map(clean);
  const out = [], bucket = data.length / K;
  for (let i = 0; i < K; i++) {
    const start = Math.floor(i * bucket), end = Math.floor((i + 1) * bucket);
    let sum = 0, c = 0;
    for (let j = start; j < end; j++) { const v = data[j]; if (v != null && !isNaN(v)) { sum += v; c++; } }
    out.push(c ? Math.round((sum / c) * 10) / 10 : null);
  }
  return out;
}
// fetch Power/HR/speed/altitude streams for one activity → compact {watts,hr,speed,alt}
async function fetchStreams(key, actId) {
  let arr;
  try { arr = await ivFetch(key, `/activity/${actId}/streams?types=watts,heartrate,velocity_smooth,altitude`); }
  catch (e) { return null; }
  if (!Array.isArray(arr)) return null;
  const byType = {}; arr.forEach(s => { if (s && s.type) byType[s.type] = s.data; });
  const out = {};
  const w = downsample(byType.watts); if (w) out.watts = w;
  const h = downsample(byType.heartrate); if (h) out.hr = h;
  const sp = downsample(byType.velocity_smooth); if (sp) out.speed = sp;   // m/s
  const al = downsample(byType.altitude); if (al) out.alt = al;
  return Object.keys(out).length ? out : null;
}
// attach graphs to recently-completed sessions that don't have them yet (bounded per run)
async function attachStreams(aid, key) {
  const ref = db.collection('athletes').doc(aid);
  let doc; try { doc = await ref.get(); } catch (e) { return 0; }
  if (!doc.exists) return 0;
  const sessions = doc.data().sessions || [];
  const cut = new Date(); cut.setDate(cut.getDate() - BACK_DAYS); const cutoff = ymd(cut);
  const targets = sessions
    .filter(s => s.status === 'done' && s.intervalsActivityId && String(s.intervalsActivityId).startsWith('iv-') && !s.streams && !s.streamsChecked && (s.date || '') >= cutoff)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 12);   // cap API calls per run
  if (!targets.length) return 0;
  let got = 0;
  const patch = {};
  for (const s of targets) {
    const actId = String(s.intervalsActivityId).slice(3);
    const st = await fetchStreams(key, actId);
    if (st) { patch[s.id] = { streams: st }; got++; } else { patch[s.id] = { streamsChecked: true }; }
  }
  await db.runTransaction(async (tx) => {
    const d = await tx.get(ref); if (!d.exists) return;
    const cur = d.data().sessions || [];
    const merged = cur.map(cs => { const p = patch[cs.id]; if (!p) return cs; return { ...cs, ...p }; });
    tx.update(ref, { sessions: merged });
  });
  return got;
}
// If a workout was completed TODAY and still has no RPE, push the athlete once for feedback.
// De-duped with a deterministic pushQueue doc id (rpe_<sessionId>) so it's asked at most once.
async function askTodaysRpe(aid) {
  const today = ymd(new Date());
  const ref = db.collection('athletes').doc(aid);
  let doc; try { doc = await ref.get(); } catch (e) { return 0; }
  if (!doc.exists) return 0;
  const sessions = (doc.data().sessions || []).filter(s => s.status === 'done' && s.date === today && s.rpe == null);
  let asked = 0;
  for (const s of sessions) {
    const qref = db.collection('pushQueue').doc('rpe_' + s.id);
    try {
      if ((await qref.get()).exists) continue;                 // already asked for this session
      await qref.set({ title: 'How was your training? 💪', body: (s.name ? s.name + ' — ' : '') + 'Tap to add your RPE and how you felt.', target: aid, createdAt: Date.now(), sent: false, kind: 'rpe', sessionId: s.id, by: 'auto' });
      asked++;
    } catch (e) {}
  }
  return asked;
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT) { console.error('Missing FIREBASE_SERVICE_ACCOUNT'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

function ymd(d) { return d.toISOString().slice(0, 10); }
function describe(s) {
  let d = s.desc || '';
  if (Array.isArray(s.steps) && s.steps.length) {
    const t = s.steps.map(x => `${x.min}min ${(x.zt === 'hr' ? 'HR ' : '')}Z${x.z + 1}`).join(', ');
    d = (d ? d + '\n\n' : '') + 'Zones: ' + t;
  }
  if (Array.isArray(s.strength) && s.strength.length) {
    const ex = s.strength.map(e => `${e.exercise || 'Exercise'}: ${(e.setRows || []).map(r => `${r.reps || '?'}x${r.weight || ''}`).join(', ')}`).join(' | ');
    d = (d ? d + '\n\n' : '') + 'Strength: ' + ex;
  }
  return d;
}
async function ivFetch(key, path, opts = {}) {
  const auth = 'Basic ' + Buffer.from('API_KEY:' + key).toString('base64');
  const res = await fetch(API + path, { ...opts, headers: { Authorization: auth, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} → ${res.status} ${await res.text()}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

async function syncAthlete(aid, data) {
  const iv = data.intervals || {};
  if (!iv.apiKey || !iv.athleteId) return null;
  const key = iv.apiKey, id = iv.athleteId;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(today); end.setDate(end.getDate() + WINDOW_DAYS);
  const oldest = ymd(today), newest = ymd(end);

  // 1. remove our previous events in the window
  const existing = await ivFetch(key, `/athlete/${id}/events?oldest=${oldest}&newest=${newest}`);
  let removed = 0;
  for (const ev of (existing || [])) {
    if (ev.external_id && String(ev.external_id).startsWith('tac-')) {
      try { await ivFetch(key, `/athlete/${id}/events/${ev.id}`, { method: 'DELETE' }); removed++; } catch (e) {}
    }
  }
  // 2. create current planned sessions in the window (skip ones that came FROM Intervals)
  const sessions = (data.sessions || []).filter(s => s.status !== 'done' && !s.intervalsEventId && s.date >= oldest && s.date <= newest);
  let created = 0;
  for (const s of sessions) {
    const body = {
      category: 'WORKOUT',
      start_date_local: s.date + 'T00:00:00',
      type: TYPE[s.sport] || 'Workout',
      name: s.name || 'Workout',
      description: describe(s),
      external_id: 'tac-' + s.id
    };
    if (s.duration) body.moving_time = Math.round(Number(s.duration) * 60);
    if (s.load) body.icu_training_load = Math.round(Number(s.load));
    try { await ivFetch(key, `/athlete/${id}/events`, { method: 'POST', body: JSON.stringify(body) }); created++; }
    catch (e) { console.error('create failed', s.name, e.message); }
  }
  // 3. reverse: pull completed activities + Intervals-native planned workouts + wellness (HRV/RHR)
  let pull = { matched: 0, imported: 0, plannedIn: 0, wellness: 0 };
  try { pull = await pullFromIntervals(aid, key, id); }
  catch (e) { console.error('pull failed', aid, e.message); }

  // 3a. attach Power/HR/speed/altitude graphs to recent completed sessions
  let streams = 0;
  try { streams = await attachStreams(aid, key); }
  catch (e) { console.error('streams failed', aid, e.message); }

  // 3c. push the athlete for RPE if a workout was completed TODAY (once per session)
  let rpeAsk = 0;
  try { rpeAsk = await askTodaysRpe(aid); }
  catch (e) { console.error('rpeAsk failed', aid, e.message); }

  // 3b. push TAC feedback (RPE) onto the matched Intervals activities
  let rpe = 0;
  for (const s of (data.sessions || [])) {
    if (s.rpe != null && s.intervalsActivityId && String(s.intervalsActivityId).startsWith('iv-')) {
      const actId = String(s.intervalsActivityId).slice(3);
      try { await ivFetch(key, `/athlete/${id}/activities/${actId}`, { method: 'PUT', body: JSON.stringify({ icu_rpe: Number(s.rpe) }) }); rpe++; }
      catch (e) { console.error('rpe push', actId, e.message); }
    }
  }

  // 4. stamp last sync (nested field update, won't clobber the rest)
  try { await db.collection('athletes').doc(aid).update({ 'intervals.lastSync': new Date().toISOString().replace('T', ' ').slice(0, 16) }); } catch (e) {}
  return { athlete: data.name || aid, removed, created, matched: pull.matched, imported: pull.imported, plannedIn: pull.plannedIn, wellness: pull.wellness, rpe, streams, rpeAsk };
}

// Intervals → TAC: completed activities, Intervals-native planned workouts, and daily wellness.
async function pullFromIntervals(aid, key, id) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const back = new Date(today); back.setDate(back.getDate() - BACK_DAYS);
  const ahead = new Date(today); ahead.setDate(ahead.getDate() + WINDOW_DAYS);
  const wStart = new Date(today); wStart.setDate(wStart.getDate() - 30);

  let acts = [], events = [], wells = [];
  try { acts = await ivFetch(key, `/athlete/${id}/activities?oldest=${ymd(back)}&newest=${ymd(today)}`) || []; } catch (e) { console.error('activities', e.message); }
  try { events = await ivFetch(key, `/athlete/${id}/events?oldest=${ymd(today)}&newest=${ymd(ahead)}&category=WORKOUT`) || []; } catch (e) { console.error('events', e.message); }
  try { wells = await ivFetch(key, `/athlete/${id}/wellness?oldest=${ymd(wStart)}&newest=${ymd(today)}`) || []; } catch (e) { console.error('wellness', e.message); }

  const ref = db.collection('athletes').doc(aid);
  let matched = 0, imported = 0, plannedIn = 0, wellCount = 0;
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref); if (!doc.exists) return;
    const data = doc.data();
    const sessions = data.sessions || [];
    const wellness = data.wellness || [];
    matched = 0; imported = 0; plannedIn = 0; wellCount = 0;

    // completed activities → mark planned done / import new
    for (const act of acts) {
      const actId = 'iv-' + act.id;
      const arpe = act.icu_rpe != null ? Number(act.icu_rpe) : null;
      const already = sessions.find(s => s.intervalsActivityId === actId);
      if (already) {
        // already imported — still refresh RPE from Intervals if TAC doesn't have one yet
        if (already.rpe == null && arpe != null) { already.rpe = arpe; matched++; }
        continue;
      }
      const date = String(act.start_date_local || '').slice(0, 10); if (!date) continue;
      const sport = REV_TYPE[act.type] || 'other';
      const load = Math.round(act.icu_training_load || 0);
      const dur = Math.round((act.moving_time || 0) / 60);
      const m = sessions.find(s => s.date === date && s.sport === sport && s.status !== 'done' && !s.intervalsActivityId);
      if (m) {
        m.status = 'done'; m.intervalsActivityId = actId;
        if (load) m.load = load; if (dur) m.duration = dur;
        if (m.rpe == null && arpe != null) m.rpe = arpe;   // bring RPE entered in Intervals into TAC
        const zt = (m.steps && m.steps[0] && m.steps[0].zt) || 'power';
        const actual = zoneTimesFor(act, zt); if (actual.length) m.actual = actual;
        matched++;
      } else {
        const ns = { id: rid(), athleteId: aid, date, sport, name: act.name || 'Activity', duration: dur, load, desc: 'Imported from Intervals.icu', steps: [], strength: [], status: 'done', intervalsActivityId: actId };
        if (arpe != null) ns.rpe = arpe;
        sessions.push(ns);
        imported++;
      }
    }

    // Intervals-native planned workouts (not the ones we pushed) → planned TAC sessions
    for (const ev of events) {
      if (ev.external_id && String(ev.external_id).startsWith('tac-')) continue;
      const evId = 'ivev-' + ev.id;
      if (sessions.some(s => s.intervalsEventId === evId)) continue;
      const date = String(ev.start_date_local || '').slice(0, 10); if (!date) continue;
      sessions.push({ id: rid(), athleteId: aid, date, sport: REV_TYPE[ev.type] || 'other', name: ev.name || 'Workout', duration: Math.round((ev.moving_time || 0) / 60), load: Math.round(ev.icu_training_load || 0), desc: (ev.description || '') + '\n(from Intervals.icu)', steps: [], strength: [], status: 'planned', intervalsEventId: evId });
      plannedIn++;
    }

    // daily wellness: HRV + resting HR (upsert by date)
    for (const w of wells) {
      const date = String(w.id || w.date || '').slice(0, 10); if (!date) continue;
      const hrv = w.hrv != null ? w.hrv : (w.hrvSDNN != null ? w.hrvSDNN : null);
      const rhr = w.restingHR != null ? w.restingHR : (w.resting_hr != null ? w.resting_hr : null);
      if (hrv == null && rhr == null) continue;
      let rec = wellness.find(x => x.date === date);
      if (!rec) { rec = { id: rid(), athleteId: aid, date }; wellness.push(rec); }
      if (hrv != null) rec.hrv = Math.round(hrv * 10) / 10;
      if (rhr != null) rec.restingHR = Math.round(rhr);
      wellCount++;
    }

    tx.update(ref, { sessions, wellness });
  });
  return { matched, imported, plannedIn, wellness: wellCount };
}

async function run() {
  const snap = await db.collection('athletes').get();
  const results = [];
  for (const doc of snap.docs) {
    try { const r = await syncAthlete(doc.id, doc.data()); if (r) results.push(r); }
    catch (e) { console.error('athlete', doc.id, 'sync error:', e.message); }
  }
  console.log('Intervals sync:', JSON.stringify(results));
}
run().then(() => { console.log('done'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
