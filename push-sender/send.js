/* Scheduled push sender for Tour Against Cancer.
   Runs on GitHub Actions (cron). Reads coach reminders + athlete push tokens from Firestore
   and sends web-push via Firebase Cloud Messaging. Uses a service-account key from the
   FIREBASE_SERVICE_ACCOUNT secret. Times are interpreted in Europe/Brussels. */
const admin = require('firebase-admin');

const APP_URL = 'https://marcindelhaye-tac.github.io/tac-coach/';
const TZ = 'Europe/Brussels';

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('Missing FIREBASE_SERVICE_ACCOUNT secret'); process.exit(1);
}
const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();
const msg = admin.messaging();

function nowLocal() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, hour12: false, weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).formatToParts(new Date());
  const get = t => (parts.find(p => p.type === t) || {}).value;
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { hhmm: `${get('hour')}:${get('minute')}`, dateISO: `${get('year')}-${get('month')}-${get('day')}`, dow: wd[get('weekday')] };
}

async function collectTokens() {
  const snap = await db.collection('pushTokens').get();
  const byUid = {};
  snap.forEach(d => { const x = d.data(); byUid[d.id] = { tokens: x.tokens || [], role: x.role }; });
  return byUid;
}
function targetsFor(byUid, target) {
  const out = [];
  for (const [uid, v] of Object.entries(byUid)) {
    if (v.role !== 'athlete') continue;
    if (target && target !== 'all' && uid !== target) continue;
    (v.tokens || []).forEach(t => out.push({ token: t, uid }));
  }
  return out;
}
async function send(title, body, targets) {
  if (!targets.length) return { sent: 0, failed: 0, noTokens: true };
  const tokens = targets.map(t => t.token);
  const resp = await msg.sendEachForMulticast({
    tokens,
    notification: { title, body },
    webpush: { fcmOptions: { link: APP_URL }, notification: { icon: APP_URL + 'icons/logo.svg' } }
  });
  const bad = [];
  resp.responses.forEach((r, i) => {
    if (!r.success) {
      const code = (r.error && r.error.code) || '';
      if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) bad.push(targets[i]);
    }
  });
  for (const b of bad) {
    await db.collection('pushTokens').doc(b.uid).update({ tokens: admin.firestore.FieldValue.arrayRemove(b.token) }).catch(() => {});
  }
  return { sent: resp.successCount, failed: resp.failureCount };
}

async function run() {
  const { hhmm, dateISO, dow } = nowLocal();
  console.log('Run', dateISO, hhmm, 'dow', dow);
  const byUid = await collectTokens();

  // 1) scheduled reminders (shared/coach.reminders)
  const shared = await db.collection('shared').doc('coach').get();
  const reminders = (shared.exists && shared.data().reminders) || [];
  for (const r of reminders) {
    if (!r.active) continue;
    if (r.freq === 'sun' && dow !== 0) continue;
    if (r.freq === 'weekdays' && !(dow >= 1 && dow <= 5)) continue;
    if (hhmm < (r.time || '07:00')) continue;
    const logRef = db.collection('pushLog').doc(`${r.id}_${dateISO}`);
    if ((await logRef.get()).exists) continue;             // already sent today
    const res = await send(r.title || 'Reminder', r.body || '', targetsFor(byUid, r.target || 'all'));
    await logRef.set({ reminderId: r.id, date: dateISO, sentAt: Date.now(), ...res });
    console.log('reminder sent:', r.title, res);
  }

  // 2) one-off "send now" queue (pushQueue)
  const q = await db.collection('pushQueue').where('sent', '==', false).get();
  for (const doc of q.docs) {
    const d = doc.data();
    const res = await send(d.title || 'Message', d.body || '', targetsFor(byUid, d.target || 'all'));
    await doc.ref.update({ sent: true, sentAt: Date.now(), result: res });
    console.log('queue sent:', d.title, res);
  }
}

run().then(() => { console.log('done'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
