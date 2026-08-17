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
    ],
    reminders: [
      { id: uid(), kind: 'sleep', title: 'Good morning 🌙', body: 'How did you sleep? Log your morning check-in.', time: '07:00', freq: 'daily', target: 'all', active: true },
      { id: uid(), kind: 'weekly', title: 'Weekly reflection 📆', body: 'How did this week feel? Fill in your weekly check-in.', time: '20:00', freq: 'sun', target: 'all', active: true }
    ],
    scienceCustom: []
  };
}

function clone(x) { return JSON.parse(JSON.stringify(x)); }

const TEST_TYPES = ['FTP test (20-min)', 'Ramp test', 'VO2max test', 'Lactate threshold', 'Critical power', 'Time trial', 'Cooper 12-min', '5-min power test', 'Sprint test', 'Swim CSS', 'Running field test', 'Body composition', 'Other'];

/* ============================================================================
   Science-backed catalog: standardised fitness tests + evidence-based workouts,
   each linked to the peer-reviewed literature listed in SCIENCE_REFS.
   ============================================================================ */
const SCIENCE_REFS = {
  cooper: { authors: 'Cooper KH', year: 1968, title: 'A means of assessing maximal oxygen intake: correlation between field and treadmill testing', journal: 'JAMA 203(3):201–204' },
  coggan: { authors: 'Allen H, Coggan A, McGregor S', year: 2019, title: 'Training and Racing with a Power Meter (3rd ed.)', journal: 'VeloPress' },
  seiler: { authors: 'Seiler S', year: 2010, title: 'What is best practice for training intensity and duration distribution in endurance athletes?', journal: 'Int J Sports Physiol Perform 5(3):276–291' },
  stoggl: { authors: 'Stöggl T, Sperlich B', year: 2014, title: 'Polarized training has greater impact on key endurance variables than threshold, high-intensity, or high-volume training', journal: 'Front Physiol 5:33' },
  helgerud: { authors: 'Helgerud J, et al.', year: 2007, title: 'Aerobic high-intensity intervals improve VO2max more than moderate training', journal: 'Med Sci Sports Exerc 39(4):665–671' },
  tabata: { authors: 'Tabata I, et al.', year: 1996, title: 'Effects of moderate-intensity endurance and high-intensity intermittent training on anaerobic capacity and VO2max', journal: 'Med Sci Sports Exerc 28(10):1327–1330' },
  gibala: { authors: 'Gibala MJ, et al.', year: 2006, title: 'Short-term sprint interval versus traditional endurance training: similar initial adaptations', journal: 'J Physiol 575(3):901–911' },
  vanhatalo: { authors: 'Vanhatalo A, Doust JH, Burnley M', year: 2007, title: 'Determination of critical power using a 3-min all-out cycling test', journal: 'Med Sci Sports Exerc 39(3):548–555' },
  billat: { authors: 'Billat LV', year: 2001, title: 'Interval training for performance: a scientific and empirical practice', journal: 'Sports Med 31(1):13–31' },
  laursen: { authors: 'Laursen PB, Jenkins DG', year: 2002, title: 'The scientific basis for high-intensity interval training', journal: 'Sports Med 32(1):53–73' },
  ronnestad: { authors: 'Rønnestad BR, et al.', year: 2020, title: 'Superior performance improvements in elite cyclists following short-interval vs effort-matched long-interval training', journal: 'Scand J Med Sci Sports 30(5):849–857' },
  buchheit: { authors: 'Buchheit M, Laursen PB', year: 2013, title: 'High-intensity interval training, solutions to the programming puzzle (Parts I & II)', journal: 'Sports Med 43(5):313–338; 43(10):927–954' },
  buchheit3015: { authors: 'Buchheit M', year: 2008, title: 'The 30-15 Intermittent Fitness Test: accuracy for individualizing interval training', journal: 'J Strength Cond Res 22(2):365–374' },
  bangsbo: { authors: 'Bangsbo J, Iaia FM, Krustrup P', year: 2008, title: 'The Yo-Yo intermittent recovery test: a useful tool for evaluation of physical performance', journal: 'Sports Med 38(1):37–51' },
  sanmillan: { authors: 'San-Millán I, Brooks GA', year: 2018, title: 'Assessment of metabolic flexibility by blood lactate and substrate oxidation across the exercise intensity spectrum', journal: 'Sports Med 48(2):467–479' }
};

// zone index helper: Z1=0 … Z7=6.  cat: 'test' | 'workout'.  goal groups the library.
const SCIENCE_CATALOG = [
  // ---- Fitness tests (estimate form; run a testing block every 6–8 weeks) ----
  { id: 'sc_ftp20', cat: 'test', sport: 'biking', goal: 'test', name: 'FTP test — 20 min', duration: 55, load: 75,
    estimates: 'FTP (functional threshold power)', freq: 'every 6–8 weeks',
    desc: '15 min progressive warm-up incl. 3×1 min hard; 5 min easy; then 20 min ALL-OUT at the highest sustainable power; 10 min cool-down. FTP ≈ 95% of the 20-min average power.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 20 }, { zt: 'power', z: 0, min: 10 }], refs: ['coggan'] },
  { id: 'sc_ramp', cat: 'test', sport: 'biking', goal: 'test', name: 'Ramp test to exhaustion', duration: 30, load: 45,
    estimates: 'FTP / VO₂max power', freq: 'every 6–8 weeks',
    desc: 'From an easy start, increase power by a fixed step (e.g. +20 W/min) until failure. FTP ≈ 75% of the best 1-min power. Simple, low-fatigue alternative to the 20-min test.',
    steps: [{ zt: 'power', z: 1, min: 8 }, { zt: 'power', z: 3, min: 8 }, { zt: 'power', z: 4, min: 5 }, { zt: 'power', z: 5, min: 2 }, { zt: 'power', z: 0, min: 7 }], refs: ['coggan', 'laursen'] },
  { id: 'sc_3min', cat: 'test', sport: 'biking', goal: 'test', name: '3-min all-out (Critical Power)', duration: 30, load: 50,
    estimates: 'Critical Power & W′ (anaerobic capacity)', freq: 'every 8 weeks',
    desc: 'Thorough warm-up, then a single 3-min ALL-OUT effort starting maximally. End-power ≈ Critical Power; work above it ≈ W′. Validated field estimate of the power–duration relationship.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 6, min: 3 }, { zt: 'power', z: 0, min: 12 }], refs: ['vanhatalo'] },
  { id: 'sc_5k', cat: 'test', sport: 'running', goal: 'test', name: '5 km all-out run', duration: 40, load: 60,
    estimates: 'Running performance, vVO₂max, threshold pace', freq: 'every 8 weeks',
    desc: '15 min easy warm-up with 3–4 strides; 5 km time trial at maximal even pace on a flat course/track; easy cool-down. Track time + average HR to follow form over the season.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 3, min: 20 }, { zt: 'hr', z: 0, min: 5 }], refs: ['billat'] },
  { id: 'sc_cooper', cat: 'test', sport: 'running', goal: 'test', name: 'Cooper 12-min run', duration: 25, load: 40,
    estimates: 'VO₂max (from distance covered)', freq: 'every 8 weeks',
    desc: 'Cover the greatest possible distance in 12 minutes. VO₂max (ml/kg/min) ≈ (distance in metres − 504.9) / 44.73. Classic, well-validated field test.',
    steps: [{ zt: 'hr', z: 1, min: 10 }, { zt: 'hr', z: 4, min: 12 }, { zt: 'hr', z: 0, min: 3 }], refs: ['cooper'] },
  { id: 'sc_3015', cat: 'test', sport: 'running', goal: 'test', name: '30-15 Intermittent Fitness Test', duration: 30, load: 45,
    estimates: 'VIFT — for intermittent-sport interval prescription', freq: 'every 6–8 weeks',
    desc: '30 s runs / 15 s rest shuttle test with progressive speed to exhaustion. The final velocity (VIFT) individualises intermittent interval training. Best for team-sport athletes.',
    steps: [], refs: ['buchheit3015'] },

  // ---- Base / aerobic endurance ----
  { id: 'sc_z2ride', cat: 'workout', sport: 'biking', goal: 'base', name: 'Zone 2 endurance ride', duration: 90, load: 60,
    desc: 'Steady 60–90 min in Zone 2 (below the first lactate threshold), cadence 85–95. Develops mitochondrial density and fat oxidation — the aerobic foundation. Keep it truly easy.',
    steps: [{ zt: 'power', z: 1, min: 90 }], refs: ['sanmillan', 'seiler'] },
  { id: 'sc_longrun', cat: 'workout', sport: 'running', goal: 'base', name: 'Long aerobic run', duration: 80, load: 65,
    desc: '60–90 min continuous easy running in Zone 2, conversational pace. Builds aerobic base and durability. Volume of low-intensity work is the largest driver of endurance adaptation.',
    steps: [{ zt: 'hr', z: 1, min: 80 }], refs: ['seiler', 'stoggl'] },

  // ---- Threshold / "maximal 1-hour effort" (FTP focus) ----
  { id: 'sc_2x20', cat: 'workout', sport: 'biking', goal: 'threshold', name: 'Threshold 2×20 min', duration: 70, load: 85,
    desc: 'Warm-up; 2×20 min at 95–105% FTP (Zone 4) with 5 min easy between; cool-down. Raises the power you can hold for ~1 hour — the classic FTP/threshold developer.',
    steps: [{ zt: 'power', z: 1, min: 12 }, { zt: 'power', z: 3, min: 20 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 20 }, { zt: 'power', z: 1, min: 10 }], refs: ['coggan', 'seiler'] },
  { id: 'sc_sweetspot', cat: 'workout', sport: 'biking', goal: 'threshold', name: 'Sweet-spot 3×12 min', duration: 65, load: 72,
    desc: 'Warm-up; 3×12 min at 88–94% FTP (upper Zone 3) with 5 min recovery. High training stimulus for sustainable power at lower fatigue than full threshold — great for build phases.',
    steps: [{ zt: 'power', z: 1, min: 12 }, { zt: 'power', z: 2, min: 12 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 2, min: 12 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 2, min: 12 }, { zt: 'power', z: 1, min: 7 }], refs: ['coggan'] },
  { id: 'sc_overunder', cat: 'workout', sport: 'biking', goal: 'threshold', name: 'Over-unders 3×9 min', duration: 60, load: 78,
    desc: 'Warm-up; 3×[alternate 2 min at 105% FTP "over" / 1 min at 90% "under", ×3] with 5 min easy between blocks. Trains lactate tolerance and clearance around threshold.',
    steps: [{ zt: 'power', z: 1, min: 12 }, { zt: 'power', z: 3, min: 9 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 9 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 9 }, { zt: 'power', z: 1, min: 11 }], refs: ['coggan', 'seiler'] },

  // ---- VO₂max ----
  { id: 'sc_4x4', cat: 'workout', sport: 'biking', goal: 'vo2max', name: 'VO₂max 4×4 min', duration: 47, load: 75,
    desc: 'Warm-up; 4×4 min at 90–95% HRmax (Zone 5) with 3 min active recovery; cool-down. The classic Helgerud protocol — one of the most effective ways to raise VO₂max.',
    steps: [{ zt: 'hr', z: 1, min: 12 }, { zt: 'hr', z: 4, min: 4 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 4, min: 4 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 4, min: 4 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 4, min: 4 }, { zt: 'hr', z: 1, min: 10 }], refs: ['helgerud', 'laursen'] },
  { id: 'sc_short3015', cat: 'workout', sport: 'biking', goal: 'vo2max', name: 'Short intervals 3×13×30/15', duration: 55, load: 80,
    desc: 'Warm-up; 3 sets of 13×(30 s at ~110–120% FTP / 15 s easy) with 3 min between sets. Short intervals sustain more time near VO₂max at lower perceived effort than long intervals.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 4, min: 10 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 10 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 10 }, { zt: 'power', z: 1, min: 4 }], refs: ['ronnestad', 'buchheit'] },
  { id: 'sc_5x3', cat: 'workout', sport: 'running', goal: 'vo2max', name: 'vVO₂max 5×3 min', duration: 45, load: 72,
    desc: 'Warm-up; 5×3 min at the velocity associated with VO₂max (~current 3 km race pace) with equal-duration jog recovery. Maximises time at VO₂max for aerobic power.',
    steps: [{ zt: 'hr', z: 1, min: 12 }, { zt: 'hr', z: 4, min: 3 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 4, min: 3 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 4, min: 3 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 4, min: 3 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 4, min: 3 }, { zt: 'hr', z: 1, min: 6 }], refs: ['billat'] },

  // ---- Anaerobic / sprint ----
  { id: 'sc_tabata', cat: 'workout', sport: 'biking', goal: 'anaerobic', name: 'Tabata 8×20/10', duration: 24, load: 40,
    desc: 'Warm-up; 8×(20 s all-out / 10 s rest) = 4 min total; cool-down. Improves both anaerobic capacity and VO₂max in very little time — but very demanding; use sparingly.',
    steps: [{ zt: 'power', z: 1, min: 12 }, { zt: 'power', z: 6, min: 4 }, { zt: 'power', z: 0, min: 8 }], refs: ['tabata'] },
  { id: 'sc_sit', cat: 'workout', sport: 'biking', goal: 'anaerobic', name: 'Sprint intervals 5×30 s all-out', duration: 35, load: 55,
    desc: 'Warm-up; 5×30 s ALL-OUT (Wingate-style) with 4 min easy recovery; cool-down. Potent stimulus for aerobic and anaerobic adaptations with low total time.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 0, min: 4 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 0, min: 4 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 0, min: 4 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 1, min: 4 }], refs: ['gibala'] }
];
const SCIENCE_GOALS = { test: 'Fitness tests', base: 'Base / endurance', threshold: 'Threshold (1-hour max)', vo2max: 'VO₂max', anaerobic: 'Anaerobic / sprint' };
function refCite(key) { const r = SCIENCE_REFS[key]; return r ? `${r.authors} (${r.year}). ${r.title}. ${r.journal}.` : key; }

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
  if (!Array.isArray(s.reminders)) s.reminders = [];
  if (!Array.isArray(s.scienceCustom)) s.scienceCustom = [];
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
  { id: 'references',     label: 'References',     icon: '📖', roles: ['coach', 'athlete'] },
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
          ${!Cloud.user ? `<div class="seg">
            <button data-role="coach" class="${state.role === 'coach' ? 'active' : ''}">Coach</button>
            <button data-role="athlete" class="${state.role === 'athlete' ? 'active' : ''}">Athlete</button>
          </div>` : ''}
          ${(Cloud.user && Cloud.accountRole === 'coach') ? `<div class="seg" style="margin-bottom:8px">
            <button data-mode="coach" class="${state.role === 'coach' ? 'active' : ''}">Coaching</button>
            <button data-mode="athlete" class="${state.role === 'athlete' ? 'active' : ''}">My training</button>
          </div>` : ''}
          ${state.role === 'coach' ? `<div class="who">
            Athlete
            <select data-athlete-select>
              ${state.athletes.map(a => `<option value="${a.id}" ${a.id === state.currentAthleteId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
            </select>
          </div>` : ''}
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
          <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1">
            <h2 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0">${nav.find(n => n.id === view)?.label || ''}</h2>
            ${(state.role === 'coach' && state.athletes.length) ? `<select class="topbar-athlete" data-athlete-top title="Switch athlete">
              ${state.athletes.map(a => `<option value="${a.id}" ${a.id === state.currentAthleteId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
            </select>` : ''}
          </div>
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
  $$('[data-mode]').forEach(b => b.addEventListener('click', () => Cloud.setMode(b.dataset.mode)));
  if ($('[data-athlete-select]')) $('[data-athlete-select]').addEventListener('change', (e) => { state.currentAthleteId = e.target.value; save(); render(); });
  if ($('[data-athlete-top]')) $('[data-athlete-top]').addEventListener('change', (e) => { state.currentAthleteId = e.target.value; save(); render(); });
  if ($('[data-coach-select]')) $('[data-coach-select]').addEventListener('change', (e) => { state.currentCoachId = e.target.value; save(); render(); });
  if ($('#logout-btn')) $('#logout-btn').addEventListener('click', () => Cloud.logout());

  const views = {
    dashboard: viewDashboard, calendar: viewCalendar, planning: viewPlanning, library: viewLibrary,
    fitness: viewFitness, testing: viewTesting, nutrition: viewNutrition, goals: viewGoals,
    questionnaires: viewQuestionnaires, references: viewReferences, messages: viewMessages, athletes: viewAthletes, monitor: viewMonitor, settings: viewSettings
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

    <div class="card" style="margin-top:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <h3 style="margin:0">Training load by sport — last 8 weeks</h3>
        ${(() => { const wd = weekDistribution(a.id, weekKey(new Date())); return wd ? `<span class="badge" title="Intensity distribution this week (Seiler)"><span class="dot" style="background:var(--accent)"></span>${wd.model} · ${wd.lit}/${wd.mod}/${wd.hit}% LIT/MOD/HIT</span>` : ''; })()}
      </div>
      ${stackedLoadChart(weeklyLoadBySport(a.id, 8))}
      <div class="sub" style="margin-top:6px">Total weekly load, split by sport. The tag shows this week's intensity distribution model.</div>
    </div>

    <div class="card" style="margin-top:16px">
      <h3>Recent sleep</h3>
      ${lastSleep ? `<div class="sub">${fmtDate(lastSleep.date)}</div><div class="stat" style="margin-top:8px"><span class="v">${lastSleep.hours}h</span><span class="l">Quality ${lastSleep.quality}/10 · felt ${lastSleep.feel}/10</span></div>` : '<div class="empty">No sleep check-ins yet.</div>'}
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
      <div class="title">${sp.icon} ${esc(s.name)} ${focusBadge(s)}</div>
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

/* ---- Training focus classification (based on time-in-zone / intensity model) ----
   Session focus = primary physiological stimulus (peak meaningful zone), per the 7-zone model.
   Week model = intensity distribution (Seiler): Polarized / Pyramidal / Threshold. */
const FOCUS_BY_ZONE = ['Recovery', 'Base / Endurance', 'Tempo', 'Threshold', 'VO₂max', 'Anaerobic', 'Sprint / Neuro'];
const FOCUS_COLORS = ['#35c98b', '#7bc043', '#f5c518', '#f39c12', '#e67e22', '#e74c3c', '#c0392b'];
function sessionFocus(s) {
  const steps = (s && s.steps) || [];
  if (!steps.length) {
    if (s && s.sport === 'strength') return { label: 'Strength', color: '#b5179e' };
    if (s && s.sport === 'stretching') return { label: 'Mobility', color: '#43aa8b' };
    if (s && s.sport === 'injury') return { label: 'Prevention', color: '#f9c74f' };
    return { label: '—', color: '#8d99ae' };
  }
  const byZone = {}; let total = 0;
  steps.forEach(st => { byZone[st.z] = (byZone[st.z] || 0) + (Number(st.min) || 0); total += Number(st.min) || 0; });
  if (!total) return { label: '—', color: '#8d99ae' };
  const thr = Math.max(4, total * 0.08);
  let peak = 0;
  Object.keys(byZone).forEach(z => { if (byZone[z] >= thr && Number(z) > peak) peak = Number(z); });
  const idx = Math.min(peak, 6);
  const lit = (byZone[0] || 0) + (byZone[1] || 0), mod = (byZone[2] || 0);
  const hit = Object.keys(byZone).filter(z => Number(z) >= 3).reduce((n, z) => n + byZone[z], 0);
  return { label: FOCUS_BY_ZONE[idx], color: FOCUS_COLORS[idx], dist: { lit: Math.round(lit / total * 100), mod: Math.round(mod / total * 100), hit: Math.round(hit / total * 100) } };
}
function focusBadge(s) {
  const f = sessionFocus(s);
  if (f.label === '—') return '';
  return `<span class="badge" title="Training focus (from zones)" style="border:1px solid ${f.color};color:${f.color}"><span class="dot" style="background:${f.color}"></span>${f.label}</span>`;
}
function weeklyLoadBySport(aid, weeks) {
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const wk = weekKey(addDays(new Date(), -i * 7));
    const bySport = {};
    state.sessions.filter(s => s.athleteId === aid && weekKey(fromISO(s.date)) === wk)
      .forEach(s => { bySport[s.sport] = (bySport[s.sport] || 0) + (Number(s.load) || 0); });
    out.push({ wk, bySport, total: Object.values(bySport).reduce((n, v) => n + v, 0), label: fromISO(wk).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) });
  }
  return out;
}
function stackedLoadChart(data) {
  const W = 720, H = 200, pad = 30, n = data.length || 1;
  const max = Math.max(1, ...data.map(d => d.total));
  const gap = (W - pad * 2) / n, bw = Math.min(46, gap * 0.62);
  const order = Object.keys(SPORTS);
  let bars = '';
  data.forEach((d, i) => {
    const x = pad + i * gap + (gap - bw) / 2;
    let y = H - pad;
    order.forEach(sp => {
      const v = d.bySport[sp] || 0; if (!v) return;
      const h = (v / max) * (H - pad * 2); y -= h;
      bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="1" fill="${SPORTS[sp].color}"><title>${SPORTS[sp].label}: ${v} TSS (${d.label})</title></rect>`;
    });
    bars += `<text x="${(x + bw / 2).toFixed(1)}" y="${H - pad + 13}" fill="var(--muted)" font-size="9" text-anchor="middle">${d.label}</text>`;
    if (d.total) bars += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" fill="var(--text)" font-size="9" text-anchor="middle">${d.total}</text>`;
  });
  const totals = {};
  data.forEach(d => Object.entries(d.bySport).forEach(([sp, v]) => totals[sp] = (totals[sp] || 0) + v));
  const legend = order.filter(sp => totals[sp]).map(sp => `<span><i style="background:${SPORTS[sp].color}"></i>${SPORTS[sp].icon} ${SPORTS[sp].label} · ${totals[sp]} TSS</span>`).join('') || '<span class="sub">No load yet</span>';
  return `<div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" style="min-width:420px">${bars}</svg></div><div class="legend">${legend}</div>`;
}
function weekDistribution(aid, wk) {
  let lit = 0, mod = 0, hit = 0;
  state.sessions.filter(s => s.athleteId === aid && weekKey(fromISO(s.date)) === wk && (s.steps || []).length)
    .forEach(s => (s.steps || []).forEach(st => { const m = Number(st.min) || 0; if (st.z <= 1) lit += m; else if (st.z === 2) mod += m; else hit += m; }));
  const total = lit + mod + hit;
  if (!total) return null;
  const pLit = lit / total, pMod = mod / total, pHit = hit / total;
  let model;
  if (pHit >= 0.05 && pMod < 0.10 && pLit >= 0.6) model = 'Polarized';
  else if (pLit >= 0.6 && pMod >= pHit) model = 'Pyramidal';
  else if (pMod >= 0.30) model = 'Threshold';
  else model = 'Mixed';
  return { model, lit: Math.round(pLit * 100), mod: Math.round(pMod * 100), hit: Math.round(pHit * 100) };
}

// Workout profile graph (Intervals.icu-style stepped bars: width = time, height/colour = zone).
function workoutProfileSVG(steps) {
  const total = stepsDuration(steps);
  if (!total) return '';
  const W = 700, H = 120;
  let x = 0, bars = '';
  (steps || []).forEach(s => {
    const w = (Number(s.min) || 0) / total * W;
    const h = Math.max(6, ((s.z + 1) / 7) * (H - 6));
    bars += `<rect x="${x.toFixed(2)}" y="${(H - h).toFixed(2)}" width="${Math.max(0, w).toFixed(2)}" height="${h.toFixed(2)}" fill="${zoneColor(s.z)}"><title>Z${s.z + 1} · ${s.min}min</title></rect>`;
    x += w;
  });
  return `<div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="none" style="height:110px;display:block;background:var(--bg-2);border-radius:8px;min-width:260px">${bars}</svg></div>`;
}
// Time-in-zone breakdown rows (like the Intervals side panel).
function zoneDistHTML(steps) {
  const byZone = {}; let total = 0;
  (steps || []).forEach(s => { byZone[s.z] = (byZone[s.z] || 0) + (Number(s.min) || 0); total += Number(s.min) || 0; });
  if (!total) return '';
  return Object.keys(byZone).map(Number).sort((a, b) => a - b).map(z => {
    const m = byZone[z], pct = Math.round(m / total * 100);
    return `<div style="display:flex;align-items:center;gap:8px;font-size:12px;margin:3px 0">
      <span class="zbadge" style="background:${zoneColor(z)};color:#111;border:0;min-width:32px;text-align:center">Z${z + 1}</span>
      <span style="flex:1;height:7px;background:var(--line);border-radius:4px;overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:${zoneColor(z)}"></span></span>
      <span class="sub" style="min-width:78px;text-align:right;color:var(--text)">${m}m · ${pct}%</span>
    </div>`;
  }).join('');
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
  const f = sessionFocus(s);
  return `<div class="sess ${s.status === 'done' ? 'done' : ''}" draggable="true" data-sess="${s.id}" style="border-left-color:${sp.color}">
    <div class="t">${sp.icon} ${esc(s.name)} ${s.status === 'done' ? '<span class="check">✓</span>' : ''}</div>
    <div class="m">${s.duration || 0}min · ${s.load || 0} TSS${f.label !== '—' ? ` · <span style="color:${f.color}">${f.label}</span>` : ''}</div>
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
    <div id="focus-line" style="margin-top:8px"></div>
    <div id="profile-line" style="margin-top:10px"></div>
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
    const fl = $('#focus-line');
    if (fl) {
      const f = sessionFocus({ steps: stepsState, sport: $('#f-sport').value });
      fl.innerHTML = f.label === '—' ? '' : `<span class="sub">Training focus: </span><span class="badge" style="border:1px solid ${f.color};color:${f.color}"><span class="dot" style="background:${f.color}"></span>${f.label}</span>${f.dist ? ` <span class="sub">· ${f.dist.lit}/${f.dist.mod}/${f.dist.hit}% LIT/MOD/HIT</span>` : ''}`;
    }
    const pl = $('#profile-line');
    if (pl) pl.innerHTML = stepsState.length ? `<label>Workout profile</label>${workoutProfileSVG(stepsState)}<div style="margin-top:8px">${zoneDistHTML(stepsState)}</div>` : '';
  };
  mountStepBuilder('steps-block', stepsState, a, canEdit, syncTotals);
  syncTotals();
  renderStrengthEditor(strengthState, canEdit, strengthMeta);

  $('#f-sport').addEventListener('change', () => { renderStrengthEditor(strengthState, canEdit, strengthMeta); syncTotals(); });

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

const EXERCISE_TYPES = ['', 'Squat', 'Hinge / Deadlift', 'Push', 'Pull', 'Lunge / Single-leg', 'Core / Trunk', 'Olympic / Power', 'Plyometric', 'Carry', 'Mobility', 'Other'];
function renderStrengthEditor(list, canEdit, meta) {
  const block = $('#strength-block');
  if (!block) return;
  if ($('#f-sport').value !== 'strength') { block.innerHTML = ''; return; }
  meta = meta || {};
  const blankSet = () => ({ reps: '', weight: '', rest: '', rpe: '' });
  // normalise old {sets:n, reps, weight, rest} rows -> per-set rows
  list.forEach(ex => {
    if (!Array.isArray(ex.setRows)) {
      const n = Math.max(1, Number(ex.sets) || 1);
      ex.setRows = Array.from({ length: n }, () => ({ reps: ex.reps || '', weight: ex.weight || '', rest: ex.rest || '', rpe: ex.rpe || '' }));
    }
    if (!ex.setRows.length) ex.setRows.push(blankSet());
  });

  block.innerHTML = `
    <div class="inline">
      <div style="flex:2"><label>Focus of the training</label><input id="str-focus" value="${esc(meta.focus || '')}" ${canEdit ? '' : 'disabled'} placeholder="e.g. Max strength — legs & core"/></div>
      <div><label>Overall RPE (1–10)</label><input id="str-rpe" type="number" min="1" max="10" value="${esc(meta.targetRpe || '')}" ${canEdit ? '' : 'disabled'} placeholder="8"/></div>
    </div>
    <label style="margin-top:12px">Exercises</label>
    <div id="ex-list"></div>
    ${canEdit ? '<button class="btn sm primary" id="ex-add" style="margin-top:8px">+ Add exercise</button>' : ''}`;
  if ($('#str-focus')) $('#str-focus').addEventListener('input', e => { meta.focus = e.target.value; });
  if ($('#str-rpe')) $('#str-rpe').addEventListener('input', e => { meta.targetRpe = e.target.value; });

  const listEl = $('#ex-list');
  function draw() {
    listEl.innerHTML = list.length ? list.map((ex, i) => `
      <div class="ex-card">
        <div class="ex-head">
          <input class="ex-name" data-exi="${i}" value="${esc(ex.exercise || '')}" ${canEdit ? '' : 'disabled'} placeholder="Exercise — e.g. Back squat"/>
          <select class="ex-type" data-extype="${i}" ${canEdit ? '' : 'disabled'} title="Type of exercise">
            ${EXERCISE_TYPES.map(t => `<option value="${esc(t)}" ${(ex.type || '') === t ? 'selected' : ''}>${t === '' ? 'Type…' : esc(t)}</option>`).join('')}
          </select>
          ${canEdit ? `<button class="x" data-exdel="${i}" title="Remove exercise">&times;</button>` : ''}
        </div>
        <div style="overflow-x:auto">
        <table class="set-table"><thead><tr><th>Set</th><th>Reps</th><th>Weight</th><th>Rest</th><th>RPE</th>${canEdit ? '<th></th>' : ''}</tr></thead>
          <tbody>
            ${ex.setRows.map((s, si) => `<tr>
              <td class="setn">${si + 1}</td>
              <td><input data-exi="${i}" data-si="${si}" data-k="reps" value="${esc(s.reps)}" ${canEdit ? '' : 'disabled'} placeholder="8"/></td>
              <td><input data-exi="${i}" data-si="${si}" data-k="weight" value="${esc(s.weight)}" ${canEdit ? '' : 'disabled'} placeholder="60kg"/></td>
              <td><input data-exi="${i}" data-si="${si}" data-k="rest" value="${esc(s.rest)}" ${canEdit ? '' : 'disabled'} placeholder="2:00"/></td>
              <td><input data-exi="${i}" data-si="${si}" data-k="rpe" value="${esc(s.rpe)}" ${canEdit ? '' : 'disabled'} placeholder="8"/></td>
              ${canEdit ? `<td class="setacts"><button class="mini" data-dup="${i}:${si}" title="Duplicate this set">⧉</button><button class="mini" data-setdel="${i}:${si}" title="Remove set">&times;</button></td>` : ''}
            </tr>`).join('')}
          </tbody></table></div>
        ${canEdit ? `<div class="btn-row" style="margin-top:6px"><button class="btn sm ghost" data-addset="${i}">+ Add set</button><button class="btn sm ghost" data-dupset="${i}">⧉ Duplicate last set</button></div>` : ''}
      </div>`).join('') : `<div class="sub" style="padding:6px">No exercises yet.${canEdit ? ' Tap “+ Add exercise”.' : ''}</div>`;

    listEl.querySelectorAll('.ex-name').forEach(inp => inp.addEventListener('input', () => { list[inp.dataset.exi].exercise = inp.value; }));
    listEl.querySelectorAll('.ex-type').forEach(sel => sel.addEventListener('change', () => { list[sel.dataset.extype].type = sel.value; }));
    listEl.querySelectorAll('input[data-k]').forEach(inp => inp.addEventListener('input', () => { list[inp.dataset.exi].setRows[inp.dataset.si][inp.dataset.k] = inp.value; }));
    listEl.querySelectorAll('[data-exdel]').forEach(b => b.addEventListener('click', () => { list.splice(Number(b.dataset.exdel), 1); draw(); }));
    listEl.querySelectorAll('[data-setdel]').forEach(b => b.addEventListener('click', () => { const [i, si] = b.dataset.setdel.split(':').map(Number); list[i].setRows.splice(si, 1); if (!list[i].setRows.length) list[i].setRows.push(blankSet()); draw(); }));
    listEl.querySelectorAll('[data-dup]').forEach(b => b.addEventListener('click', () => { const [i, si] = b.dataset.dup.split(':').map(Number); list[i].setRows.splice(si + 1, 0, { ...list[i].setRows[si] }); draw(); }));
    listEl.querySelectorAll('[data-addset]').forEach(b => b.addEventListener('click', () => { list[Number(b.dataset.addset)].setRows.push(blankSet()); draw(); }));
    listEl.querySelectorAll('[data-dupset]').forEach(b => b.addEventListener('click', () => { const rows = list[Number(b.dataset.dupset)].setRows; rows.push({ ...(rows[rows.length - 1] || blankSet()) }); draw(); }));
  }
  draw();
  if ($('#ex-add')) $('#ex-add').addEventListener('click', () => { list.push({ exercise: '', setRows: [blankSet()] }); draw(); });
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
function refChip(key) {
  const r = SCIENCE_REFS[key]; if (!r) return '';
  return `<span class="badge" title="${esc(refCite(key))}">${esc(r.authors.split(',')[0])} ${r.year}</span>`;
}
function viewLibrary() {
  const tab = state.ui.libTab || 'mine';
  const goal = state.ui.libGoal || 'all';
  const actions = $('#topbar-actions');
  actions.innerHTML = tab === 'mine'
    ? `<button class="btn primary sm" id="add-lib">+ New workout</button>`
    : (state.role === 'coach' ? `<button class="btn primary sm" id="add-sci">+ Add workout</button>` : '');
  if (tab === 'mine' && $('#add-lib')) $('#add-lib').addEventListener('click', () => openLibModal(null));
  if (tab === 'science' && $('#add-sci')) $('#add-sci').addEventListener('click', () => openScienceModal(null));

  const v = $('#view');
  const tabs = `<div class="pill-tabs">
    <button data-libtab="mine" class="${tab === 'mine' ? 'active' : ''}">My templates</button>
    <button data-libtab="science" class="${tab === 'science' ? 'active' : ''}">🔬 Science library</button>
  </div>`;

  if (tab === 'mine') {
    v.innerHTML = tabs + `
      <p class="sub">Your reusable workout templates. Add one to an athlete's calendar with one click.</p>
      <div class="grid cols-2" style="margin-top:10px">
        ${state.library.map(w => {
          const sp = SPORTS[w.sport] || SPORTS.other;
          return `<div class="card">
            <div class="badge" style="border-left:3px solid ${sp.color}">${sp.icon} ${sp.label}</div> ${focusBadge(w)}
            <h3 style="margin-top:8px">${esc(w.name)}</h3>
            <div class="sub">${w.duration || 0} min · ${w.load || 0} TSS</div>
            <p class="sub" style="margin-top:8px">${esc(w.desc || '')}</p>
            <div class="btn-row" style="margin-top:10px">
              <button class="btn sm primary" data-sched="${w.id}">Add to calendar</button>
              <button class="btn sm" data-edit="${w.id}">Edit</button>
              <button class="btn sm danger" data-del="${w.id}">Delete</button>
            </div>
          </div>`;
        }).join('') || '<div class="empty">No templates yet. Add one, or copy from the Science library.</div>'}
      </div>`;
    $$('[data-edit]').forEach(b => b.addEventListener('click', () => openLibModal(b.dataset.edit)));
    $$('[data-del]').forEach(b => b.addEventListener('click', () => { state.library = state.library.filter(w => w.id !== b.dataset.del); save(); viewLibrary(); }));
    $$('[data-sched]').forEach(b => b.addEventListener('click', () => scheduleFromLib(b.dataset.sched)));
  } else {
    const goals = ['all', ...Object.keys(SCIENCE_GOALS)];
    const custom = state.scienceCustom.filter(w => goal === 'all' || w.goal === goal);
    const builtin = SCIENCE_CATALOG.filter(w => goal === 'all' || w.goal === goal);
    const list = [...custom, ...builtin];
    v.innerHTML = tabs + `
      <p class="sub">Evidence-based workouts & fitness tests. Built-in ones cite the literature (see the <b>References</b> tab); coaches can add their own too.</p>
      <div class="pill-tabs" style="margin-top:8px">
        ${goals.map(g => `<button data-libgoal="${g}" class="${goal === g ? 'active' : ''}">${g === 'all' ? 'All' : SCIENCE_GOALS[g]}</button>`).join('')}
      </div>
      <div class="grid cols-2" style="margin-top:6px">
        ${list.map(w => {
          const sp = SPORTS[w.sport] || SPORTS.other;
          return `<div class="card">
            <div class="badge" style="border-left:3px solid ${sp.color}">${sp.icon} ${sp.label}</div>
            ${w.cat === 'test' ? '<span class="badge" style="color:var(--yellow)">🧪 Fitness test</span>' : focusBadge(w)}
            ${w.custom ? '<span class="badge" style="color:var(--accent-2)">★ Team-added</span>' : ''}
            <h3 style="margin-top:8px">${esc(w.name)}</h3>
            <div class="sub">${w.duration || 0} min · ${w.load || 0} TSS${w.estimates ? ' · estimates ' + esc(w.estimates) : ''}${w.freq ? ' · ' + esc(w.freq) : ''}</div>
            ${(w.steps && w.steps.length) ? '<div style="margin-top:8px">' + workoutProfileSVG(w.steps) + '</div>' : ''}
            <p class="sub" style="margin-top:8px">${esc(w.desc)}</p>
            ${w.custom ? (w.refText ? `<p class="sub" style="margin-top:4px"><b style="color:var(--text)">Source:</b> ${esc(w.refText)}</p>` : '') : `<div style="margin-top:6px">${(w.refs || []).map(refChip).join(' ')}</div>`}
            <div class="btn-row" style="margin-top:10px">
              <button class="btn sm primary" data-scisched="${w.id}">Add to calendar</button>
              <button class="btn sm" data-scisave="${w.id}">Save to my templates</button>
              ${(w.custom && state.role === 'coach') ? `<button class="btn sm" data-sciedit="${w.id}">Edit</button><button class="btn sm danger" data-scidel="${w.id}">Delete</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>`;
    $$('[data-libgoal]').forEach(b => b.addEventListener('click', () => { state.ui.libGoal = b.dataset.libgoal; viewLibrary(); }));
    $$('[data-scisched]').forEach(b => b.addEventListener('click', () => scheduleCatalog(b.dataset.scisched)));
    $$('[data-sciedit]').forEach(b => b.addEventListener('click', () => openScienceModal(b.dataset.sciedit)));
    $$('[data-scidel]').forEach(b => b.addEventListener('click', () => { state.scienceCustom = state.scienceCustom.filter(x => x.id !== b.dataset.scidel); save(); viewLibrary(); toast('Removed from library'); }));
    $$('[data-scisave]').forEach(b => b.addEventListener('click', () => {
      const w = findCatalog(b.dataset.scisave); if (!w) return;
      state.library.push({ id: uid(), sport: w.sport, name: w.name, duration: w.duration, load: w.load, desc: w.desc, steps: clone(w.steps || []), strength: clone(w.strength || []), focus: w.focus || '', targetRpe: w.targetRpe || '' });
      save(); toast('Saved to your templates');
    }));
  }
  $$('[data-libtab]').forEach(b => b.addEventListener('click', () => { state.ui.libTab = b.dataset.libtab; viewLibrary(); }));
}
function findCatalog(id) { return state.scienceCustom.find(x => x.id === id) || SCIENCE_CATALOG.find(x => x.id === id); }
function scheduleCatalog(id) {
  const w = findCatalog(id); if (!w) return;
  const body = `<label>Add "<b>${esc(w.name)}</b>" to ${esc(currentAthlete().name)} on:</label><input id="sch-date" type="date" value="${todayISO()}"/>`;
  openModal('Add to calendar', body, `<button class="btn primary" id="sch-go">Add</button>`);
  $('#sch-go').addEventListener('click', () => {
    state.sessions.push({ id: uid(), athleteId: state.currentAthleteId, sport: w.sport, name: w.name, date: $('#sch-date').value, duration: w.duration, load: w.load, desc: w.desc, steps: clone(w.steps || []), strength: clone(w.strength || []), focus: w.focus || '', targetRpe: w.targetRpe || '', status: 'planned' });
    save(); closeModal(); toast('Added to calendar'); go('calendar');
  });
}
function openScienceModal(id) {
  const editing = id ? state.scienceCustom.find(w => w.id === id) : null;
  const w = editing || { custom: true, cat: 'workout', sport: 'biking', goal: 'threshold', name: '', duration: 60, load: 60, desc: '', steps: [], strength: [], focus: '', targetRpe: '', refText: '' };
  const a = currentAthlete();
  const sportOpts = Object.entries(SPORTS).map(([k, sp]) => `<option value="${k}" ${w.sport === k ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`).join('');
  const goalOpts = Object.entries(SCIENCE_GOALS).map(([k, l]) => `<option value="${k}" ${w.goal === k ? 'selected' : ''}>${l}</option>`).join('');
  const body = `
    <div class="inline">
      <div><label>Category</label><select id="sci-cat"><option value="workout" ${w.cat === 'workout' ? 'selected' : ''}>Workout</option><option value="test" ${w.cat === 'test' ? 'selected' : ''}>Fitness test</option></select></div>
      <div><label>Goal / group</label><select id="sci-goal">${goalOpts}</select></div>
    </div>
    <label>Sport</label><select id="f-sport">${sportOpts}</select>
    <label>Name</label><input id="sci-name" value="${esc(w.name)}" placeholder="e.g. My threshold builder"/>
    <div class="inline">
      <div><label>Duration (min)</label><input id="f-dur" type="number" value="${w.duration}"/></div>
      <div><label>Load (TSS)</label><input id="f-load" type="number" value="${w.load}"/></div>
    </div>
    <div id="steps-block" style="margin-top:12px"></div>
    <div id="focus-line" style="margin-top:8px"></div>
    <div id="profile-line" style="margin-top:10px"></div>
    <label>Description / rationale</label><textarea id="sci-desc" placeholder="What it does and how to execute it">${esc(w.desc)}</textarea>
    <label>Source / reference (optional)</label><input id="sci-ref" value="${esc(w.refText || '')}" placeholder="e.g. Seiler 2010, or your own note"/>
    <div id="strength-block"></div>`;
  const foot = `${editing ? '<button class="btn danger" id="sci-del">Delete</button>' : ''}<button class="btn primary" id="sci-save">Save to library</button>`;
  openModal(editing ? 'Edit library workout' : 'Add workout to Science library', body, foot);

  const stepsState = clone(w.steps || []);
  const strengthState = clone(w.strength || []);
  const strengthMeta = { focus: w.focus || '', targetRpe: w.targetRpe || '' };
  const syncTotals = () => {
    if (stepsState.length) { $('#f-dur').value = stepsDuration(stepsState); $('#f-load').value = stepsLoad(a, stepsState); }
    const fl = $('#focus-line');
    if (fl) { const f = sessionFocus({ steps: stepsState, sport: $('#f-sport').value }); fl.innerHTML = f.label === '—' ? '' : `<span class="sub">Training focus: </span><span class="badge" style="border:1px solid ${f.color};color:${f.color}"><span class="dot" style="background:${f.color}"></span>${f.label}</span>`; }
    const pl = $('#profile-line');
    if (pl) pl.innerHTML = stepsState.length ? `<label>Workout profile</label>${workoutProfileSVG(stepsState)}<div style="margin-top:8px">${zoneDistHTML(stepsState)}</div>` : '';
  };
  mountStepBuilder('steps-block', stepsState, a, true, syncTotals);
  renderStrengthEditor(strengthState, true, strengthMeta);
  $('#f-sport').addEventListener('change', () => { renderStrengthEditor(strengthState, true, strengthMeta); syncTotals(); });
  syncTotals();

  $('#sci-save').addEventListener('click', () => {
    const obj = { id: w.id || uid(), custom: true, cat: $('#sci-cat').value, goal: $('#sci-goal').value, sport: $('#f-sport').value, name: $('#sci-name').value.trim() || 'Untitled', duration: Number($('#f-dur').value) || 0, load: Number($('#f-load').value) || 0, desc: $('#sci-desc').value, refText: $('#sci-ref').value, steps: stepsState, strength: strengthState, focus: strengthMeta.focus, targetRpe: strengthMeta.targetRpe };
    if (editing) Object.assign(editing, obj); else state.scienceCustom.push(obj);
    save(); closeModal(); viewLibrary(); toast('Saved to Science library');
  });
  if ($('#sci-del')) $('#sci-del').addEventListener('click', () => { state.scienceCustom = state.scienceCustom.filter(x => x.id !== w.id); save(); closeModal(); viewLibrary(); toast('Removed'); });
}
function openLibModal(id) {
  const editing = id ? state.library.find(w => w.id === id) : null;
  const w = editing || { sport: 'biking', name: '', duration: 60, load: 50, desc: '', steps: [], strength: [], focus: '', targetRpe: '' };
  const a = currentAthlete();
  const sportOpts = Object.entries(SPORTS).map(([k, sp]) => `<option value="${k}" ${w.sport === k ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`).join('');
  const body = `
    <label>Sport</label><select id="f-sport">${sportOpts}</select>
    <label>Name</label><input id="l-name" value="${esc(w.name)}" placeholder="e.g. Threshold 2x20"/>
    <div class="inline">
      <div><label>Duration (min)</label><input id="f-dur" type="number" value="${w.duration}"/></div>
      <div><label>Load (TSS)</label><input id="f-load" type="number" value="${w.load}"/></div>
    </div>
    <div id="steps-block" style="margin-top:12px"></div>
    <div id="focus-line" style="margin-top:8px"></div>
    <div id="profile-line" style="margin-top:10px"></div>
    <label>Notes / extra instructions</label><textarea id="l-desc" placeholder="e.g. keep cadence high, fuel every 30min">${esc(w.desc)}</textarea>
    <div id="strength-block"></div>`;
  openModal(editing ? 'Edit workout' : 'New workout', body, `<button class="btn primary" id="l-save">Save</button>`);

  const stepsState = clone(w.steps || []);
  const strengthState = clone(w.strength || []);
  const strengthMeta = { focus: w.focus || '', targetRpe: w.targetRpe || '' };
  const syncTotals = () => {
    if (stepsState.length) { $('#f-dur').value = stepsDuration(stepsState); $('#f-load').value = stepsLoad(a, stepsState); }
    const fl = $('#focus-line');
    if (fl) { const f = sessionFocus({ steps: stepsState, sport: $('#f-sport').value }); fl.innerHTML = f.label === '—' ? '' : `<span class="sub">Training focus: </span><span class="badge" style="border:1px solid ${f.color};color:${f.color}"><span class="dot" style="background:${f.color}"></span>${f.label}</span>`; }
    const pl = $('#profile-line');
    if (pl) pl.innerHTML = stepsState.length ? `<label>Workout profile</label>${workoutProfileSVG(stepsState)}<div style="margin-top:8px">${zoneDistHTML(stepsState)}</div>` : '';
  };
  mountStepBuilder('steps-block', stepsState, a, true, syncTotals);
  renderStrengthEditor(strengthState, true, strengthMeta);
  $('#f-sport').addEventListener('change', () => { renderStrengthEditor(strengthState, true, strengthMeta); syncTotals(); });
  syncTotals();

  $('#l-save').addEventListener('click', () => {
    const obj = { id: w.id || uid(), sport: $('#f-sport').value, name: $('#l-name').value.trim() || 'Untitled', duration: Number($('#f-dur').value) || 0, load: Number($('#f-load').value) || 0, desc: $('#l-desc').value, steps: stepsState, strength: strengthState, focus: strengthMeta.focus, targetRpe: strengthMeta.targetRpe };
    if (editing) Object.assign(editing, obj); else state.library.push(obj);
    save(); closeModal(); viewLibrary(); toast('Saved');
  });
}
function scheduleFromLib(id) {
  const w = state.library.find(x => x.id === id);
  const body = `<label>Add "<b>${esc(w.name)}</b>" to ${esc(currentAthlete().name)} on:</label><input id="sch-date" type="date" value="${todayISO()}"/>`;
  openModal('Add to calendar', body, `<button class="btn primary" id="sch-go">Add</button>`);
  $('#sch-go').addEventListener('click', () => {
    state.sessions.push({ id: uid(), athleteId: state.currentAthleteId, sport: w.sport, name: w.name, date: $('#sch-date').value, duration: w.duration, load: w.load, desc: w.desc, steps: clone(w.steps || []), strength: clone(w.strength || []), focus: w.focus || '', targetRpe: w.targetRpe || '', status: 'planned' });
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
    ${state.role === 'coach' ? `<div class="prompt" style="margin-bottom:14px"><span class="icon">🧪</span><div class="grow"><b>Standardised test protocols</b><div class="sub">Ready-made, science-based fitness tests (20-min FTP, 5 km all-out, 3-min all-out…). Run a testing block every 6–8 weeks to track form.</div></div><button class="btn primary sm" id="go-scitests">Open</button></div>` : ''}

    ${summary.length ? `<div class="grid cols-4" style="margin-top:12px">
      ${summary.map(t => `<div class="card stat"><span class="l">${esc(t.type)}</span><span class="v">${esc(t.primary.value)}<small style="font-size:14px;color:var(--muted)"> ${esc(t.primary.unit)}</small></span><span class="sub">${fmtDate(t.date)}</span></div>`).join('')}
    </div>` : ''}

    <div class="section-title">Test history</div>
    <div class="list">
      ${tests.length ? tests.map(t => testRow(t, tests)).join('') : '<div class="empty">No tests recorded yet.' + (state.role === 'coach' ? ' Use “+ Add test”.' : '') + '</div>'}
    </div>`;

  $$('[data-test-open]').forEach(b => b.addEventListener('click', () => openTestModal(b.dataset.testOpen)));
  if ($('#go-scitests')) $('#go-scitests').addEventListener('click', () => { state.ui.libTab = 'science'; state.ui.libGoal = 'test'; go('library'); });
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
    </div>
    <div class="card" style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <h3 style="margin:0">Training load by sport — last 12 weeks</h3>
        ${(() => { const wd = weekDistribution(a.id, weekKey(new Date())); return wd ? `<span class="badge" title="This week's intensity distribution (Seiler)"><span class="dot" style="background:var(--accent)"></span>${wd.model} · ${wd.lit}/${wd.mod}/${wd.hit}% LIT/MOD/HIT</span>` : ''; })()}
      </div>
      ${stackedLoadChart(weeklyLoadBySport(a.id, 12))}
      <div class="sub" style="margin-top:6px">Total weekly load and its split across sports. LIT = easy (Z1–2), MOD = tempo (Z3), HIT = threshold+ (Z4+).</div>
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

/* ------------------------------ Scientific references ------------------- */
function viewReferences() {
  const v = $('#view');
  const keys = Object.keys(SCIENCE_REFS);
  v.innerHTML = `
    <p class="sub">The peer-reviewed literature behind the <b>Science library</b> workouts and fitness tests (Workouts tab → Science library). Each item there links back to these sources.</p>
    <div class="list" style="margin-top:10px">
      ${keys.map((k, i) => {
        const r = SCIENCE_REFS[k];
        const used = SCIENCE_CATALOG.filter(w => (w.refs || []).includes(k)).map(w => w.name);
        return `<div class="card">
          <div style="font-weight:600">${i + 1}. ${esc(r.authors)} (${r.year}).</div>
          <div style="margin-top:2px">${esc(r.title)}.</div>
          <div class="sub" style="margin-top:2px"><i>${esc(r.journal)}</i></div>
          ${used.length ? `<div class="sub" style="margin-top:8px">Used in: ${used.map(n => `<span class="badge">${esc(n)}</span>`).join(' ')}</div>` : ''}
        </div>`;
      }).join('')}
    </div>
    <p class="sub" style="margin-top:14px">These protocols are general, evidence-based guidance — individualise them to each athlete's level and health status. This is educational information, not medical advice.</p>`;
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
    <div class="list">${rpe.length ? rpe.map(s => { const ses = state.sessions.find(x => x.id === s.sessionId); return `<div class="row"><div class="grow"><div class="title">RPE ${s.rpe}/10 — ${esc(ses ? ses.name : 'session')} ${ses ? focusBadge(ses) : ''}</div><div class="meta">${fmtDate(s.date)}${s.note ? ' · ' + esc(s.note) : ''}</div></div></div>`; }).join('') : '<div class="empty">No session feedback.</div>'}</div>

    <div class="section-title">Weekly reflections</div>
    <div class="list">${weekly.length ? weekly.map(w => `<div class="row"><div class="grow"><div class="title">Training ${w.training}/10 · Self ${w.self}/10</div><div class="meta">Week of ${fmtDate(w.week)}${w.note ? ' · ' + esc(w.note) : ''}</div></div></div>`).join('') : '<div class="empty">No weekly reflections.</div>'}</div>`;
}

/* ------------------------------ Settings -------------------------------- */
function viewSettings() {
  const v = $('#view');
  const iv = state.settings.intervals;
  const nt = state.settings.notifications;
  const dualCoach = Cloud.user && Cloud.accountRole === 'coach';
  v.innerHTML = `
    ${Cloud.user ? `<div class="card" style="max-width:640px;margin-bottom:16px">
      <h3>Account</h3>
      <p class="sub">Signed in as <b style="color:var(--text)">${esc(Cloud.user.email)}</b>${dualCoach ? ' · coach account' : ' · athlete account'}.</p>
      ${dualCoach ? `<label>Mode</label>
        <div class="seg2" id="acct-mode">
          <button data-mode="coach" class="${state.role === 'coach' ? 'active' : ''}">🧑‍🏫 Coaching</button>
          <button data-mode="athlete" class="${state.role === 'athlete' ? 'active' : ''}">🏃 My training</button>
        </div>
        <div class="hint">Same account, both roles — coach your athletes and log your own training, just like Intervals.icu.</div>` : ''}
      ${(state.role === 'coach' && state.athletes.length) ? `<label style="margin-top:10px">Viewing athlete</label>
        <select id="acct-athlete">${state.athletes.map(a => `<option value="${a.id}" ${a.id === state.currentAthleteId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>` : ''}
      <div class="btn-row" style="margin-top:14px"><button class="btn danger" id="acct-logout">Log out</button></div>
    </div>` : ''}
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

    ${state.role === 'coach' ? `<div class="card" style="max-width:640px;margin-top:16px">
      <h3>Athlete reminders</h3>
      <p class="sub">Reminders you set here go to your athletes (e.g. morning sleep check-in, fill in a questionnaire). They fire on the athlete's phone at the chosen time. <b>Real push to a closed phone</b> also needs the one-time push setup (below the list).</p>
      <div class="list" id="rem-list"></div>
      <div class="btn-row" style="margin-top:10px"><button class="btn primary sm" id="rem-add">+ Add reminder</button></div>
      <div class="hint" style="margin-top:10px">Push delivery status: <b id="push-status">checking…</b></div>
    </div>` : ''}

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

  if ($('#acct-logout')) $('#acct-logout').addEventListener('click', () => Cloud.logout());
  $$('#acct-mode button').forEach(b => b.addEventListener('click', () => Cloud.setMode(b.dataset.mode)));
  if ($('#acct-athlete')) $('#acct-athlete').addEventListener('change', (e) => { state.currentAthleteId = e.target.value; save(); render(); });

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
      if (ok) {
        checkReminders();
        const pushed = await PushKit.enableForCurrentUser();
        toast(pushed ? 'Notifications + phone push on 🔔' : 'Notifications on (phone push not set up yet)');
      } else { e.target.checked = false; toast('Permission denied in browser'); }
    } else { nt.enabled = false; save(); toast('Notifications off'); }
  });
  $('#nt-test').addEventListener('click', async () => {
    const ok = Notification.permission === 'granted' ? true : await requestNotifPermission();
    if (ok) notify('Tour Against Cancer', 'Test notification — reminders are working ✅'); else toast('Enable notifications first');
  });

  $('#do-install').addEventListener('click', () => triggerInstall());

  // Coach: manage athlete reminders
  if (state.role === 'coach' && $('#rem-list')) {
    const FREQ = { daily: 'Every day', weekdays: 'Weekdays', sun: 'Sunday' };
    const drawRems = () => {
      const list = state.reminders || [];
      $('#rem-list').innerHTML = list.length ? list.map(r => {
        const who = (!r.target || r.target === 'all') ? 'All athletes' : ((state.athletes.find(x => x.id === r.target) || {}).name || 'Athlete');
        return `<div class="row">
          <label style="margin:0"><input type="checkbox" data-rtog="${r.id}" ${r.active ? 'checked' : ''} style="width:auto"/></label>
          <div class="grow"><div class="title">${esc(r.title || 'Reminder')}</div>
            <div class="meta">${esc(r.body || '')} · ⏰ ${esc(r.time || '07:00')} · ${FREQ[r.freq] || 'Every day'} · ${esc(who)}</div></div>
          <button class="btn sm" data-rsend="${r.id}" title="Send this now">Send now</button>
          <button class="btn sm" data-redit="${r.id}">Edit</button>
          <button class="btn sm danger" data-rdel="${r.id}">Delete</button>
        </div>`;
      }).join('') : '<div class="empty">No reminders yet.</div>';
      $$('[data-rtog]').forEach(b => b.addEventListener('change', () => { const r = state.reminders.find(x => x.id === b.dataset.rtog); r.active = b.checked; save(); }));
      $$('[data-redit]').forEach(b => b.addEventListener('click', () => openReminderModal(b.dataset.redit, drawRems)));
      $$('[data-rdel]').forEach(b => b.addEventListener('click', () => { state.reminders = state.reminders.filter(x => x.id !== b.dataset.rdel); save(); drawRems(); }));
      $$('[data-rsend]').forEach(b => b.addEventListener('click', async () => {
        const r = state.reminders.find(x => x.id === b.dataset.rsend);
        if (!Cloud.enabled || !Cloud.user) { toast('Sign in to send'); return; }
        try { await Cloud.db.collection('pushQueue').add({ title: r.title, body: r.body, target: r.target || 'all', createdAt: Date.now(), sent: false, by: Cloud.user.email }); toast('Queued — arrives on athletes’ phones within ~15 min'); }
        catch (e) { toast('Send failed: ' + (e.code || e.message)); }
      }));
    };
    drawRems();
    $('#rem-add').addEventListener('click', () => openReminderModal(null, drawRems));

    // push delivery status
    const ps = $('#push-status');
    if (ps) ps.textContent = (typeof PushKit !== 'undefined' && PushKit.configured()) ? 'Push configured ✅ (athletes enable it on their phone via Settings → notifications)' : 'Not set up yet — see the push setup guide';
  }
}

function openReminderModal(id, onSave) {
  const editing = id ? state.reminders.find(r => r.id === id) : null;
  const r = editing || { kind: 'sleep', title: 'Good morning 🌙', body: 'How did you sleep? Log your morning check-in.', time: '07:00', freq: 'daily', target: 'all', active: true };
  const presets = {
    sleep: { title: 'Good morning 🌙', body: 'How did you sleep? Log your morning check-in.' },
    questionnaire: { title: 'Questionnaire 📝', body: 'Your coach asked you to fill in a questionnaire.' },
    weekly: { title: 'Weekly reflection 📆', body: 'How did this week feel? Fill in your weekly check-in.' },
    custom: { title: '', body: '' }
  };
  const kindOpts = [['sleep', 'Morning — sleep'], ['questionnaire', 'Fill in questionnaire'], ['weekly', 'Weekly reflection'], ['custom', 'Custom message']].map(([k, l]) => `<option value="${k}" ${r.kind === k ? 'selected' : ''}>${l}</option>`).join('');
  const freqOpts = [['daily', 'Every day'], ['weekdays', 'Weekdays (Mon–Fri)'], ['sun', 'Sunday only']].map(([k, l]) => `<option value="${k}" ${r.freq === k ? 'selected' : ''}>${l}</option>`).join('');
  const athOpts = `<option value="all" ${r.target === 'all' ? 'selected' : ''}>All athletes</option>` + state.athletes.map(a => `<option value="${a.id}" ${r.target === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('');
  const body = `
    <label>Type</label><select id="r-kind">${kindOpts}</select>
    <label>Title</label><input id="r-title" value="${esc(r.title)}" placeholder="e.g. Good morning 🌙"/>
    <label>Message</label><textarea id="r-body" placeholder="What the athlete sees">${esc(r.body)}</textarea>
    <div class="inline">
      <div><label>Time</label><input id="r-time" type="time" value="${r.time || '07:00'}"/></div>
      <div><label>Repeat</label><select id="r-freq">${freqOpts}</select></div>
    </div>
    <label>Send to</label><select id="r-target">${athOpts}</select>`;
  openModal(editing ? 'Edit reminder' : 'New reminder', body, `<button class="btn primary" id="r-save">Save</button>`);
  $('#r-kind').addEventListener('change', () => {
    const p = presets[$('#r-kind').value]; if (p && ($('#r-title').value === '' || p.title)) { $('#r-title').value = p.title; $('#r-body').value = p.body; }
  });
  $('#r-save').addEventListener('click', () => {
    const obj = { id: r.id || uid(), kind: $('#r-kind').value, title: $('#r-title').value.trim() || 'Reminder', body: $('#r-body').value.trim(), time: $('#r-time').value, freq: $('#r-freq').value, target: $('#r-target').value, active: r.active !== false };
    if (editing) Object.assign(editing, obj); else state.reminders.push(obj);
    save(); closeModal(); toast('Reminder saved'); onSave && onSave();
  });
}

async function triggerInstall() {
  if (deferredInstall) {
    deferredInstall.prompt();
    const res = await deferredInstall.userChoice;
    if (res.outcome === 'accepted') toast('Installing…'); else toast('Install dismissed');
    deferredInstall = null;
  } else if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    toast('Already installed 🎉');
  } else {
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    toast(iOS ? 'iPhone: tap Share → “Add to Home Screen”' : 'Use your browser menu → “Install app” / “Add to Home Screen”');
  }
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

  // Coach-configured reminders — fire on the athlete's own device.
  if (state.role === 'athlete') {
    (state.reminders || []).forEach(r => {
      if (!r.active) return;
      if (r.target && r.target !== 'all' && r.target !== a.id) return;
      if (!dueToday(r.freq, now)) return;
      if (hhmm < (r.time || '07:00')) return;
      if (alreadyFired('cr_' + r.id)) return;
      notify(r.title || 'Reminder', r.body || 'Tap to open your app.');
      markFired('cr_' + r.id);
    });
  }
}
function dueToday(freq, now) {
  const d = now.getDay(); // 0=Sun..6=Sat
  if (freq === 'sun') return d === 0;
  if (freq === 'weekdays') return d >= 1 && d <= 5;
  return true; // 'daily'
}

/* ------------------------------ Cloud sync (Firebase) ------------------- */
/* Phase 2 — per-athlete privacy:
   - athletes/{aid}  : one doc per athlete (profile + their own sessions/tests/… + checkins)
   - shared/coach    : coach-managed content shared to everyone (coaches list, library, questionnaires)
   Coaches can read/write all athlete docs; an athlete can read/write only their own (aid == their uid).
*/
const Cloud = {
  enabled: false, auth: null, db: null, user: null, role: null, accountRole: null, myUid: null,
  applyingRemote: false, ready: false, saveTimer: null,
  pendingAthletes: null, sharedDirty: false, unsub: null, pendingSignup: null,

  PROFILE_KEYS: ['name', 'email', 'sport', 'ftp', 'maxHr', 'thresholdHr', 'thresholdPace', 'powerZones', 'hrZones', 'paceZones', 'coachIds', 'ownerUid'],
  ATH_COLLECTIONS: ['sessions', 'tests', 'cycles', 'messages', 'dayNotes', 'nutrition', 'goals', 'responses'],

  init() {
    if (!window.FIREBASE_CONFIG || typeof firebase === 'undefined') return false;
    try {
      firebase.initializeApp(window.FIREBASE_CONFIG);
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
      this.pendingAthletes = new Set();
      this.enabled = true;
      return true;
    } catch (e) { console.warn('Firebase init failed', e); return false; }
  },

  start() {
    this.auth.onAuthStateChanged((u) => {
      this.user = u;
      if (u) this.onLogin(); else { this.teardown(); showAuthScreen(); }
    });
  },

  teardown() { if (this.unsub) { this.unsub.forEach(f => f && f()); } this.unsub = null; this.ready = false; },

  async onLogin() {
    this.myUid = this.user.uid;
    this.ready = false;
    // determine role from users/{uid}, falling back to a pending signup choice
    const uref = this.db.collection('users').doc(this.myUid);
    let role = null;
    try { const s = await uref.get(); if (s.exists) role = s.data().role; } catch (e) {}
    if (!role && this.pendingSignup) role = this.pendingSignup.role;
    if (!role) role = 'coach';
    this.accountRole = role;                 // the account's base role (coaches may also train as athletes)
    try { await uref.set({ email: this.user.email, name: this.user.displayName || (this.pendingSignup && this.pendingSignup.name) || '', role, lastSeen: Date.now() }, { merge: true }); } catch (e) {}
    this.pendingSignup = null;

    // active mode: coaches can switch between coaching / their own training; athletes stay athletes
    let mode = role;
    if (role === 'coach' && (state.viewMode === 'coach' || state.viewMode === 'athlete')) mode = state.viewMode;
    if (role !== 'coach') mode = 'athlete';
    this.role = mode; state.role = mode; state.viewMode = mode;

    render(); // show shell immediately

    if (mode === 'coach') { await this.migrateIfNeeded(); this.subscribeCoach(); }
    else { await this.ensureAthleteDoc(); this.subscribeAthlete(); }

    checkReminders();
    if (!this._interval) { this._interval = setInterval(checkReminders, 5 * 60 * 1000); document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminders(); }); }
  },

  // switch between 'coach' (see all athletes) and 'athlete' (my own training) — coaches only
  setMode(mode) {
    if (mode === this.role) return;
    if (this.accountRole !== 'coach') { toast('Only coach accounts can switch mode'); return; }
    this.teardown();
    this.role = mode; state.role = mode; state.viewMode = mode;
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    render();
    if (mode === 'coach') { this.migrateIfNeeded().then(() => this.subscribeCoach()); }
    else { this.ensureAthleteDoc().then(() => this.subscribeAthlete()); }
    toast(mode === 'coach' ? 'Coaching mode' : 'My-training mode');
  },

  // ---- build helpers ----
  athleteDoc(a, aid) {
    const doc = {};
    this.PROFILE_KEYS.forEach(k => { if (a[k] !== undefined) doc[k] = a[k]; });
    this.ATH_COLLECTIONS.forEach(k => { doc[k] = (state[k] || []).filter(x => x.athleteId === aid); });
    doc.checkins = {
      sleep: state.checkins.sleep.filter(x => x.athleteId === aid),
      session: state.checkins.session.filter(x => x.athleteId === aid),
      weekly: state.checkins.weekly.filter(x => x.athleteId === aid)
    };
    doc._updatedAt = Date.now(); doc._updatedBy = (this.user && this.user.email) || '';
    return doc;
  },
  loadFromDocs(docs) {
    state.athletes = [];
    this.ATH_COLLECTIONS.forEach(k => state[k] = []);
    state.checkins = { sleep: [], session: [], weekly: [] };
    docs.forEach(({ id, data }) => {
      const prof = { id };
      this.PROFILE_KEYS.forEach(k => { if (data[k] !== undefined) prof[k] = data[k]; });
      prof.powerZones = prof.powerZones || clone(DEFAULT_POWER_ZONES);
      prof.hrZones = prof.hrZones || clone(DEFAULT_HR_ZONES);
      prof.paceZones = prof.paceZones || clone(DEFAULT_PACE_ZONES);
      state.athletes.push(prof);
      this.ATH_COLLECTIONS.forEach(k => (data[k] || []).forEach(item => state[k].push({ ...item, athleteId: id })));
      const ci = data.checkins || {};
      ['sleep', 'session', 'weekly'].forEach(kk => (ci[kk] || []).forEach(item => state.checkins[kk].push({ ...item, athleteId: id })));
    });
    migrate(state);
  },
  applyShared(d) {
    if (d.coaches) state.coaches = d.coaches;
    if (d.library) state.library = d.library;
    if (d.questionnaires) state.questionnaires = d.questionnaires;
    if (d.reminders) state.reminders = d.reminders;
    if (d.scienceCustom) state.scienceCustom = d.scienceCustom;
    if (!state.currentCoachId || !state.coaches.find(c => c.id === state.currentCoachId)) state.currentCoachId = (state.coaches[0] || {}).id;
  },
  reRender() { if (!document.querySelector('#modal-root .modal')) render(); },

  // ---- athlete (self) ----
  async ensureAthleteDoc() {
    const ref = this.db.collection('athletes').doc(this.myUid);
    let snap; try { snap = await ref.get(); } catch (e) { return; }
    if (!snap.exists) {
      const nm = this.user.displayName || this.user.email.split('@')[0];
      const a = { name: nm, email: this.user.email, sport: 'biking', ftp: 250, maxHr: 190, thresholdHr: 168, thresholdPace: 240, powerZones: clone(DEFAULT_POWER_ZONES), hrZones: clone(DEFAULT_HR_ZONES), paceZones: clone(DEFAULT_PACE_ZONES), coachIds: [], ownerUid: this.myUid };
      state.athletes = [{ id: this.myUid, ...a }];
      try { await ref.set(this.athleteDoc(a, this.myUid)); } catch (e) { toast('Sync error: ' + e.message); }
    }
  },
  subscribeAthlete() {
    const aRef = this.db.collection('athletes').doc(this.myUid);
    const u1 = aRef.onSnapshot(snap => {
      if (snap.metadata.hasPendingWrites || !snap.exists) return;
      this.applyingRemote = true;
      this.loadFromDocs([{ id: snap.id, data: snap.data() }]);
      state.currentAthleteId = this.myUid; state.role = 'athlete';
      this.applyingRemote = false; this.ready = true;
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      this.reRender();
    }, err => toast('Sync error: ' + err.message));
    const u2 = this.db.collection('shared').doc('coach').onSnapshot(s => {
      if (s.metadata.hasPendingWrites || !s.exists) return;
      this.applyingRemote = true; this.applyShared(s.data()); this.applyingRemote = false; this.reRender();
    }, () => {});
    this.unsub = [u1, u2];
  },

  // ---- coach (all athletes) ----
  subscribeCoach() {
    const u1 = this.db.collection('athletes').onSnapshot(qs => {
      if (qs.metadata.hasPendingWrites) return; // ignore our own write echoes
      this.applyingRemote = true;
      this.loadFromDocs(qs.docs.map(d => ({ id: d.id, data: d.data() })));
      if (!state.athletes.find(a => a.id === state.currentAthleteId)) state.currentAthleteId = (state.athletes[0] || {}).id;
      this.applyingRemote = false; this.ready = true;
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      this.reRender();
    }, err => toast('Sync error: ' + err.message));
    const u2 = this.db.collection('shared').doc('coach').onSnapshot(s => {
      if (s.metadata.hasPendingWrites || !s.exists) return;
      this.applyingRemote = true; this.applyShared(s.data()); this.applyingRemote = false; this.reRender();
    }, () => {});
    this.unsub = [u1, u2];
  },

  // ---- writes ----
  push() {
    if (!this.enabled || !this.user || this.applyingRemote || !this.ready) return;
    if (state.currentAthleteId) this.pendingAthletes.add(state.currentAthleteId);
    if (this.role === 'coach') this.sharedDirty = true;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.flush(), 700);
  },
  flush() {
    this.pendingAthletes.forEach(aid => {
      const a = state.athletes.find(x => x.id === aid);
      if (!a) { if (this.role === 'coach') this.db.collection('athletes').doc(aid).delete().catch(() => {}); return; }
      this.db.collection('athletes').doc(aid).set(this.athleteDoc(a, aid)).catch(e => toast('Sync error: ' + e.message));
    });
    this.pendingAthletes.clear();
    if (this.role === 'coach' && this.sharedDirty) {
      this.db.collection('shared').doc('coach').set({ coaches: state.coaches, library: state.library, questionnaires: state.questionnaires, reminders: state.reminders, scienceCustom: state.scienceCustom, _updatedAt: Date.now() }).catch(() => {});
      this.sharedDirty = false;
    }
  },

  // ---- one-time migration from the phase-1 team/main doc ----
  async migrateIfNeeded() {
    let col; try { col = await this.db.collection('athletes').limit(1).get(); } catch (e) { return; }
    if (!col.empty) return;
    let team; try { team = await this.db.collection('team').doc('main').get(); } catch (e) { return; }
    if (!team.exists) return;
    const t = team.data();
    try {
      const batch = this.db.batch();
      (t.athletes || []).forEach(a => {
        const aid = a.id; const doc = {};
        this.PROFILE_KEYS.forEach(k => { if (a[k] !== undefined) doc[k] = a[k]; });
        doc.coachIds = a.coachIds || []; doc.ownerUid = a.ownerUid || null;
        this.ATH_COLLECTIONS.forEach(k => { doc[k] = (t[k] || []).filter(x => x.athleteId === aid); });
        const ci = t.checkins || {};
        doc.checkins = { sleep: (ci.sleep || []).filter(x => x.athleteId === aid), session: (ci.session || []).filter(x => x.athleteId === aid), weekly: (ci.weekly || []).filter(x => x.athleteId === aid) };
        doc._updatedAt = Date.now(); doc._updatedBy = 'migration';
        batch.set(this.db.collection('athletes').doc(aid), doc);
      });
      batch.set(this.db.collection('shared').doc('coach'), { coaches: t.coaches || [], library: t.library || [], questionnaires: t.questionnaires || [], reminders: t.reminders || [], scienceCustom: t.scienceCustom || [], _updatedAt: Date.now() });
      await batch.commit();
    } catch (e) { console.warn('migration failed', e); }
  },

  logout() { this.teardown(); if (this.auth) this.auth.signOut(); }
};

/* ------------------------------ Push (FCM) client ----------------------- */
const PushKit = {
  messaging: null, swReg: null, inited: false,
  configured() { return !!window.FIREBASE_VAPID_KEY && typeof firebase !== 'undefined' && !!firebase.messaging; },
  async init() {
    if (this.inited) return !!this.messaging;
    this.inited = true;
    if (!this.configured()) return false;
    try {
      this.swReg = await navigator.serviceWorker.register('./firebase-messaging-sw.js', { scope: './fcm/' });
      this.messaging = firebase.messaging();
      this.messaging.onMessage((payload) => {
        const n = (payload && payload.notification) || (payload && payload.data) || {};
        if (n.title) notify(n.title, n.body || '');
      });
      return true;
    } catch (e) { console.warn('push init failed', e); return false; }
  },
  async enableForCurrentUser() {
    if (!(await this.init())) return false;
    if (Notification.permission !== 'granted') { const p = await Notification.requestPermission(); if (p !== 'granted') return false; }
    try {
      const token = await this.messaging.getToken({ vapidKey: window.FIREBASE_VAPID_KEY, serviceWorkerRegistration: this.swReg });
      if (!token) return false;
      await this.storeToken(token);
      return true;
    } catch (e) { console.warn('getToken failed', e); return false; }
  },
  async storeToken(token) {
    if (!Cloud.enabled || !Cloud.user) return;
    try {
      await Cloud.db.collection('pushTokens').doc(Cloud.myUid).set({
        uid: Cloud.myUid, role: Cloud.role || state.role, athleteId: Cloud.myUid,
        email: Cloud.user.email, updatedAt: Date.now(),
        tokens: firebase.firestore.FieldValue.arrayUnion(token)
      }, { merge: true });
    } catch (e) { console.warn('storeToken failed', e); }
  }
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
          <div class="role-pick">
            <button type="button" class="rolebtn active" data-arole="coach"><span class="ic">🧑‍🏫</span><b>Coach</b><small>Programs & follows athletes</small></button>
            <button type="button" class="rolebtn" data-arole="athlete"><span class="ic">🏃</span><b>Athlete</b><small>Follows my own plan</small></button>
          </div>
        </div>
        <label>Email</label><input id="au-email" type="email" autocomplete="email" placeholder="you@example.com"/>
        <label>Password</label><input id="au-pass" type="password" autocomplete="current-password" placeholder="At least 6 characters"/>
        <div id="au-err" style="color:var(--bad);font-size:13px;margin-top:10px;min-height:16px">${esc(msg || '')}</div>
        <button class="btn primary" id="au-go" style="width:100%;justify-content:center;margin-top:6px">Log in</button>
        <button class="btn ghost" id="au-install" style="width:100%;justify-content:center;margin-top:8px">📲 Install as an app</button>
        <p class="sub" style="text-align:center;margin-top:14px;font-size:12px">Your data is stored securely in your team's private cloud.</p>
      </div>
    </div>`;

  let mode = 'login';
  let signupRole = 'coach';
  const setMode = (m) => {
    mode = m;
    $$('.authseg').forEach(b => { const on = b.dataset.mode === m; b.classList.toggle('active', on); b.style.background = on ? 'var(--accent)' : 'transparent'; b.style.color = on ? 'var(--accent-ink)' : (on ? '#fff' : 'var(--muted)'); });
    $('#signup-fields').style.display = m === 'signup' ? 'block' : 'none';
    $('#au-go').textContent = m === 'signup' ? 'Create account' : 'Log in';
  };
  $$('.authseg').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  $$('.rolebtn').forEach(b => b.addEventListener('click', () => {
    signupRole = b.dataset.arole;
    $$('.rolebtn').forEach(x => x.classList.toggle('active', x === b));
  }));

  const go = async () => {
    const email = $('#au-email').value.trim(), pass = $('#au-pass').value;
    $('#au-err').textContent = '';
    if (!email || !pass) { $('#au-err').textContent = 'Enter your email and password.'; return; }
    $('#au-go').disabled = true;
    try {
      if (mode === 'signup') {
        const name = $('#au-name').value.trim() || email.split('@')[0];
        const role = signupRole;
        Cloud.pendingSignup = { role, name };   // onLogin picks this up before users-doc exists
        const cred = await Cloud.auth.createUserWithEmailAndPassword(email, pass);
        await cred.user.updateProfile({ displayName: name });
        await Cloud.db.collection('users').doc(cred.user.uid).set({ email, name, role, createdAt: Date.now() }, { merge: true });
      } else {
        await Cloud.auth.signInWithEmailAndPassword(email, pass);
      }
      // onAuthStateChanged / onLogin takes over from here
    } catch (e) {
      Cloud.pendingSignup = null;
      $('#au-go').disabled = false;
      $('#au-err').textContent = friendlyAuthError(e);
    }
  };
  $('#au-go').addEventListener('click', go);
  $('#au-pass').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  if ($('#au-install')) $('#au-install').addEventListener('click', () => triggerInstall());
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
