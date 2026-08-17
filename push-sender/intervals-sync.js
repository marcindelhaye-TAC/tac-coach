/* One-way sync: push TAC planned workouts to each athlete's Intervals.icu calendar.
   Runs on GitHub Actions (scheduled). Reads athletes + their Intervals creds from Firestore.
   Idempotent: on each run it removes its own previously-created events (external_id "tac-…")
   in the window and recreates them from the current plan, so there are never duplicates. */
const admin = require('firebase-admin');

const API = 'https://intervals.icu/api/v1';
const WINDOW_DAYS = 21;
const TYPE = { biking: 'Ride', running: 'Run', swimming: 'Swim', walking: 'Walk', strength: 'WeightTraining', injury: 'Workout', stretching: 'Yoga', other: 'Workout' };

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
  // 2. create current planned sessions in the window
  const sessions = (data.sessions || []).filter(s => s.status !== 'done' && s.date >= oldest && s.date <= newest);
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
  // 3. stamp last sync (nested field update, won't clobber the rest)
  try { await db.collection('athletes').doc(aid).update({ 'intervals.lastSync': new Date().toISOString().replace('T', ' ').slice(0, 16) }); } catch (e) {}
  return { athlete: data.name || aid, removed, created };
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
