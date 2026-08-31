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
    scienceCustom: [],
    todos: [],        /* coordinator to-do tasks (shared collection) */
    comments: []      /* comments on workouts (shared collection) */
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
  sanmillan: { authors: 'San-Millán I, Brooks GA', year: 2018, title: 'Assessment of metabolic flexibility by blood lactate and substrate oxidation across the exercise intensity spectrum', journal: 'Sports Med 48(2):467–479' },
  costill: { authors: 'Costill DL, et al.', year: 1991, title: 'Adaptations to swimming training: influence of training volume', journal: 'Med Sci Sports Exerc 23(3):371–377' },
  faude: { authors: 'Faude O, Kindermann W, Meyer T', year: 2009, title: 'Lactate threshold concepts: how valid are they?', journal: 'Sports Med 39(6):469–490' },
  plews: { authors: 'Plews DJ, et al.', year: 2013, title: 'Training adaptation and heart rate variability in elite endurance athletes: opening the door to effective monitoring', journal: 'Sports Med 43(9):773–781' },
  daniels: { authors: 'Daniels J', year: 2013, title: "Daniels' Running Formula (3rd ed.)", journal: 'Human Kinetics' },
  maglischo: { authors: 'Maglischo EW', year: 2003, title: 'Swimming Fastest', journal: 'Human Kinetics' },
  olbrecht: { authors: 'Olbrecht J', year: 2000, title: 'The Science of Winning: Planning, Periodizing and Optimizing Swim Training', journal: 'Swimshop/Luton' },
  pyne: { authors: 'Pyne DB, Lee H, Swanwick KM', year: 2001, title: 'Monitoring the lactate threshold in world-ranked swimmers', journal: 'Med Sci Sports Exerc 33(2):291–297' },
  toussaint: { authors: 'Toussaint HM, Hollander AP', year: 1994, title: 'Energetics of competitive swimming: implications for training programmes', journal: 'Sports Med 18(6):384–405' }
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
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 0, min: 4 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 0, min: 4 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 0, min: 4 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 1, min: 4 }], refs: ['gibala'] },

  // ---- Swimming across the goals ----
  { id: 'sc_swimz2', cat: 'workout', sport: 'swimming', goal: 'base', name: 'Aerobic swim — long steady', duration: 45, load: 40,
    desc: 'Continuous 1200–2000 m at an easy, smooth pace (~CSS + 8–12 s/100 m), relaxed bilateral breathing. Builds swimming-specific aerobic base and stroke efficiency. Keep it comfortable.',
    steps: [], refs: ['costill', 'seiler'] },
  { id: 'sc_swimcss', cat: 'workout', sport: 'swimming', goal: 'threshold', name: 'CSS intervals 8×100', duration: 50, load: 62,
    desc: 'Warm-up 300–400 m; 8×100 m at Critical Swim Speed (threshold) pace on 10–15 s rest; easy cool-down. Develops the pace you can hold for ~30 min — the swim threshold.',
    steps: [], refs: ['costill', 'faude'] },
  { id: 'sc_swimvo2', cat: 'workout', sport: 'swimming', goal: 'vo2max', name: 'VO₂ swim 10×50 fast', duration: 45, load: 68,
    desc: 'Warm-up; 10×50 m fast (well above CSS, ~1500 m race effort) on 25–30 s rest, or 6×100 hard. Maximises time near VO₂max for aerobic power in the water.',
    steps: [], refs: ['laursen', 'costill'] },
  { id: 'sc_swimsprint', cat: 'workout', sport: 'swimming', goal: 'anaerobic', name: 'Sprint swim 8×25 all-out', duration: 35, load: 45,
    desc: 'Warm-up; 8×25 m ALL-OUT with full recovery (~60–75 s). Develops anaerobic power, stroke rate and speed. Very demanding — use sparingly.',
    steps: [], refs: ['gibala'] },

  // ---- Extra running coverage ----
  { id: 'sc_runtempo', cat: 'workout', sport: 'running', goal: 'threshold', name: 'Tempo run 2×15 min', duration: 60, load: 78,
    desc: 'Warm-up; 2×15 min at threshold — comfortably hard, roughly current 1-hour race pace — with 3 min easy jog between; cool-down. Raises lactate-threshold pace.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 3, min: 15 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 3, min: 15 }, { zt: 'hr', z: 1, min: 12 }], refs: ['seiler', 'billat'] },
  { id: 'sc_runhill', cat: 'workout', sport: 'running', goal: 'anaerobic', name: 'Hill sprints 8×15 s', duration: 35, load: 48,
    desc: 'Warm-up; 8×15 s maximal uphill sprints with full walk-down recovery; cool-down. Builds neuromuscular power, running economy and strength with low injury risk.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 4, min: 4 }, { zt: 'hr', z: 1, min: 16 }], refs: ['gibala', 'laursen'] },
  { id: 'sc_swimbase_run', cat: 'workout', sport: 'running', goal: 'base', name: 'Easy aerobic run + strides', duration: 50, load: 45,
    desc: '40–50 min easy Zone 2 running (conversational), finishing with 4–6×15 s relaxed strides. Aerobic base plus light neuromuscular touch without fatigue.',
    steps: [{ zt: 'hr', z: 1, min: 45 }, { zt: 'hr', z: 3, min: 1 }, { zt: 'hr', z: 1, min: 4 }], refs: ['seiler', 'stoggl'] },

  /* ===== Expanded library — ≥15 cycling / 15 running / 5 swimming across the goals ===== */
  // ---- BASE (bike) ----
  { id: 'sc_bk_long3h', cat: 'workout', sport: 'biking', goal: 'base', name: 'Long endurance ride 3 h', duration: 180, load: 120,
    desc: '2.5–3 h continuous in Zone 2, cadence 85–95. The single biggest driver of endurance adaptation — builds mitochondria, capillaries and fat oxidation. Fuel steadily.',
    steps: [{ zt: 'power', z: 1, min: 180 }], refs: ['seiler', 'sanmillan'] },
  { id: 'sc_bk_fatmax', cat: 'workout', sport: 'biking', goal: 'base', name: 'Fat-max Zone 2 ride 90 min', duration: 90, load: 60,
    desc: '90 min steady at the top of Zone 2 (just below the first lactate turnpoint), where fat oxidation peaks. Ideal metabolic-efficiency session; keep it strictly aerobic.',
    steps: [{ zt: 'power', z: 1, min: 90 }], refs: ['sanmillan'] },
  { id: 'sc_bk_cadence', cat: 'workout', sport: 'biking', goal: 'base', name: 'Cadence & endurance 75 min', duration: 75, load: 55,
    desc: 'Zone 2 ride with 6×2 min high-cadence (100–110 rpm) drills and 2 min normal between. Aerobic volume plus pedalling efficiency and neuromuscular smoothness.',
    steps: [{ zt: 'power', z: 1, min: 75 }], refs: ['seiler', 'coggan'] },
  // ---- BASE (run) ----
  { id: 'sc_rn_long', cat: 'workout', sport: 'running', goal: 'base', name: 'Long run 90–120 min', duration: 100, load: 80,
    desc: '90–120 min continuous easy Zone 2. Develops aerobic capacity, durability and fatigue resistance — the backbone of any distance program. Keep it conversational.',
    steps: [{ zt: 'hr', z: 1, min: 100 }], refs: ['seiler', 'stoggl'] },
  { id: 'sc_rn_recovery', cat: 'workout', sport: 'running', goal: 'base', name: 'Recovery run 30–40 min', duration: 35, load: 25,
    desc: '30–40 min very easy Zone 1 running. Promotes blood flow and recovery between key sessions without adding meaningful fatigue. Effort should feel almost too easy.',
    steps: [{ zt: 'hr', z: 1, min: 35 }], refs: ['seiler'] },
  { id: 'sc_rn_prog', cat: 'workout', sport: 'running', goal: 'base', name: 'Progression run 60 min', duration: 60, load: 58,
    desc: 'Start easy (Zone 2) and finish the last 15 min at steady/tempo (upper Zone 3). Teaches pacing and finishing strong on tired legs while staying largely aerobic.',
    steps: [{ zt: 'hr', z: 1, min: 40 }, { zt: 'hr', z: 2, min: 15 }, { zt: 'hr', z: 3, min: 5 }], refs: ['daniels', 'seiler'] },
  // ---- BASE (swim) ----
  { id: 'sc_sw_technique', cat: 'workout', sport: 'swimming', goal: 'base', name: 'Technique + aerobic 1500 m', duration: 45, load: 38,
    desc: '300 warm-up; 8×50 m drills (catch-up, single-arm, fingertip-drag) on 15 s rest; 600 m steady aerobic; 200 easy. Improves stroke efficiency while building base.',
    steps: [], refs: ['costill'] },

  // ---- THRESHOLD (bike) ----
  { id: 'sc_bk_3x15', cat: 'workout', sport: 'biking', goal: 'threshold', name: 'Threshold 3×15 min', duration: 75, load: 88,
    desc: 'Warm-up; 3×15 min at 95–100% FTP (Zone 4) with 5 min easy between; cool-down. A larger threshold dose than 2×20 at slightly lower intensity — excellent FTP builder.',
    steps: [{ zt: 'power', z: 1, min: 12 }, { zt: 'power', z: 3, min: 15 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 15 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 15 }, { zt: 'power', z: 1, min: 8 }], refs: ['coggan', 'seiler'] },
  // ---- THRESHOLD (run) ----
  { id: 'sc_rn_cruise', cat: 'workout', sport: 'running', goal: 'threshold', name: 'Cruise intervals 5×5 min', duration: 55, load: 74,
    desc: 'Warm-up; 5×5 min at threshold pace with 60 s jog between; cool-down. Daniels’ cruise intervals accumulate threshold time with brief breaks — raises lactate-threshold pace.',
    steps: [{ zt: 'hr', z: 1, min: 12 }, { zt: 'hr', z: 3, min: 5 }, { zt: 'hr', z: 0, min: 1 }, { zt: 'hr', z: 3, min: 5 }, { zt: 'hr', z: 0, min: 1 }, { zt: 'hr', z: 3, min: 5 }, { zt: 'hr', z: 0, min: 1 }, { zt: 'hr', z: 3, min: 5 }, { zt: 'hr', z: 0, min: 1 }, { zt: 'hr', z: 3, min: 5 }, { zt: 'hr', z: 1, min: 9 }], refs: ['daniels', 'billat'] },
  { id: 'sc_rn_tempo25', cat: 'workout', sport: 'running', goal: 'threshold', name: 'Continuous tempo 25 min', duration: 50, load: 72,
    desc: 'Warm-up; 25 min continuous at threshold — comfortably hard, ~1-hour race effort; cool-down. Classic sustained tempo that lifts the pace you can hold before lactate accumulates.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 3, min: 25 }, { zt: 'hr', z: 1, min: 10 }], refs: ['seiler', 'faude'] },
  { id: 'sc_rn_thr2x12', cat: 'workout', sport: 'running', goal: 'threshold', name: 'Threshold 2×12 min', duration: 55, load: 73,
    desc: 'Warm-up; 2×12 min at threshold with 3 min jog between; cool-down. A manageable threshold dose for build phases — pace should be even and controlled, not a race.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 3, min: 12 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 3, min: 12 }, { zt: 'hr', z: 1, min: 13 }], refs: ['daniels', 'seiler'] },

  // ---- VO₂MAX (bike) ----
  { id: 'sc_bk_5x5', cat: 'workout', sport: 'biking', goal: 'vo2max', name: 'VO₂max 5×5 min', duration: 60, load: 88,
    desc: 'Warm-up; 5×5 min at 106–115% FTP (Zone 5) with 2.5 min easy recovery; cool-down. Long VO₂max intervals maximise time at high oxygen uptake — a potent aerobic-power stimulus.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 4, min: 5 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 5 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 5 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 5 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 5 }, { zt: 'power', z: 1, min: 8 }], refs: ['laursen', 'buchheit'] },
  { id: 'sc_bk_4020', cat: 'workout', sport: 'biking', goal: 'vo2max', name: 'Rønnestad 3×13×40/20 s', duration: 58, load: 85,
    desc: 'Warm-up; 3 sets of 13×(40 s hard ~106–110% FTP / 20 s easy) with 3 min between sets. Short on/off intervals hold more time near VO₂max at lower RPE — Rønnestad’s protocol.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 4, min: 13 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 13 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 13 }, { zt: 'power', z: 1, min: 5 }], refs: ['ronnestad', 'buchheit'] },
  // ---- VO₂MAX (run) ----
  { id: 'sc_rn_400s', cat: 'workout', sport: 'running', goal: 'vo2max', name: '10×400 m @ 3 km pace', duration: 50, load: 74,
    desc: 'Warm-up; 10×400 m at ~3 km race pace with 90 s jog recovery; cool-down. Sharp VO₂max/vVO₂max stimulus and running economy work. Keep reps even, not all-out.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 4, min: 12 }, { zt: 'hr', z: 1, min: 15 }], refs: ['billat'] },
  { id: 'sc_rn_1000s', cat: 'workout', sport: 'running', goal: 'vo2max', name: '5×1000 m @ 5 km pace', duration: 55, load: 78,
    desc: 'Warm-up; 5×1000 m at ~5 km race pace with 2 min jog; cool-down. Longer VO₂max reps that build aerobic power and race-specific strength for 5–10 km.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 4, min: 20 }, { zt: 'hr', z: 1, min: 12 }], refs: ['billat', 'daniels'] },
  { id: 'sc_rn_yasso', cat: 'workout', sport: 'running', goal: 'vo2max', name: 'Yasso 800s — 6×800 m', duration: 55, load: 76,
    desc: 'Warm-up; 6×800 m hard (~5 km effort) with equal-time jog recovery; cool-down. A popular VO₂max/tempo staple and marathon predictor — build the number of reps over weeks.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 4, min: 18 }, { zt: 'hr', z: 1, min: 12 }], refs: ['daniels'] },

  // ---- ANAEROBIC (bike) ----
  { id: 'sc_bk_torque', cat: 'workout', sport: 'biking', goal: 'anaerobic', name: 'Big-gear torque 6×1 min', duration: 45, load: 58,
    desc: 'Warm-up; 6×1 min low-cadence (50–60 rpm) big-gear max efforts with 5 min easy between; cool-down. Builds anaerobic strength, torque and neuromuscular power. Protect the knees.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 6, min: 1 }, { zt: 'power', z: 1, min: 12 }], refs: ['ronnestad', 'gibala'] },
  // ---- ANAEROBIC (run) ----
  { id: 'sc_rn_200s', cat: 'workout', sport: 'running', goal: 'anaerobic', name: '8×200 m fast', duration: 40, load: 52,
    desc: 'Warm-up; 8×200 m fast (mile-to-1500 effort) with full walk/jog recovery; cool-down. Develops anaerobic power, speed and running economy. Prioritise good form over max speed.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 4, min: 8 }, { zt: 'hr', z: 1, min: 15 }], refs: ['gibala', 'laursen'] },

  /* ===== Library expansion to ≥20 per sport (cycling 20 · running 20 · swimming 20) ===== */
  // ---- CYCLING (+5) ----
  { id: 'sc_bk_recovery', cat: 'workout', sport: 'biking', goal: 'base', name: 'Recovery spin 45 min', duration: 45, load: 25,
    desc: '45 min very easy Zone 1, high cadence, flat. Flushes the legs and speeds recovery between hard days without adding training stress. Should feel almost effortless.',
    steps: [{ zt: 'power', z: 0, min: 45 }], refs: ['seiler'] },
  { id: 'sc_bk_thrpyr', cat: 'workout', sport: 'biking', goal: 'threshold', name: 'Threshold pyramid 5-10-15-10-5', duration: 80, load: 90,
    desc: 'Warm-up; 5–10–15–10–5 min at 95–100% FTP with 5 min easy between; cool-down. A varied threshold session that accumulates ~45 min at FTP — strong stimulus for the 1-hour power.',
    steps: [{ zt: 'power', z: 1, min: 12 }, { zt: 'power', z: 3, min: 5 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 10 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 15 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 10 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 3, min: 5 }, { zt: 'power', z: 1, min: 3 }], refs: ['coggan', 'seiler'] },
  { id: 'sc_bk_3x3', cat: 'workout', sport: 'biking', goal: 'vo2max', name: 'VO₂max 3×3 min @ 118% FTP', duration: 45, load: 78,
    desc: 'Warm-up; 3×3 min at ~115–120% FTP (Zone 5) with 3 min easy recovery; cool-down. Short, sharp VO₂max intervals — excellent for raising maximal aerobic power on limited time.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 4, min: 3 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 3 }, { zt: 'power', z: 0, min: 3 }, { zt: 'power', z: 4, min: 3 }, { zt: 'power', z: 1, min: 12 }], refs: ['laursen', 'buchheit'] },
  { id: 'sc_bk_3030', cat: 'workout', sport: 'biking', goal: 'vo2max', name: 'VO₂ 2×10×30/30 s', duration: 50, load: 78,
    desc: 'Warm-up; 2 sets of 10×(30 s hard ~110–120% FTP / 30 s easy) with 5 min between sets. Classic 30/30 on–offs sustain a large fraction of the session near VO₂max at moderate RPE.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 4, min: 10 }, { zt: 'power', z: 0, min: 5 }, { zt: 'power', z: 4, min: 10 }, { zt: 'power', z: 1, min: 10 }], refs: ['ronnestad', 'buchheit'] },
  { id: 'sc_bk_stomp', cat: 'workout', sport: 'biking', goal: 'anaerobic', name: 'Standing-start stomps 8×15 s', duration: 40, load: 50,
    desc: 'Warm-up; 8×15 s max efforts from a near-standstill in a big gear, ~5 min easy between; cool-down. Builds peak power, torque and neuromuscular recruitment. Keep the core braced.',
    steps: [{ zt: 'power', z: 1, min: 15 }, { zt: 'power', z: 6, min: 2 }, { zt: 'power', z: 1, min: 23 }], refs: ['gibala', 'ronnestad'] },

  // ---- RUNNING (+5) ----
  { id: 'sc_rn_fartlek', cat: 'workout', sport: 'running', goal: 'base', name: 'Aerobic fartlek 45 min', duration: 45, load: 50,
    desc: '45 min easy Zone 2 with 8×1 min gently floated surges (upper Zone 3) spread through the run, easy jog between. Adds variety and light stimulus while staying largely aerobic.',
    steps: [{ zt: 'hr', z: 1, min: 20 }, { zt: 'hr', z: 2, min: 8 }, { zt: 'hr', z: 1, min: 17 }], refs: ['seiler', 'daniels'] },
  { id: 'sc_rn_2x15', cat: 'workout', sport: 'running', goal: 'threshold', name: 'Threshold 2×15 min', duration: 60, load: 80,
    desc: 'Warm-up; 2×15 min at threshold with 3 min jog between; cool-down. A larger continuous threshold dose than 2×12 for athletes with a solid base — even, controlled effort.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 3, min: 15 }, { zt: 'hr', z: 0, min: 3 }, { zt: 'hr', z: 3, min: 15 }, { zt: 'hr', z: 1, min: 12 }], refs: ['daniels', 'seiler'] },
  { id: 'sc_rn_vvo2', cat: 'workout', sport: 'running', goal: 'vo2max', name: 'vVO₂max 6×3 min', duration: 50, load: 78,
    desc: 'Warm-up; 6×3 min at the velocity at VO₂max (~3 km race pace) with 2 min jog recovery; cool-down. Maximises time at VO₂max — one of the most effective sessions for aerobic power.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 4, min: 18 }, { zt: 'hr', z: 1, min: 12 }], refs: ['billat', 'laursen'] },
  { id: 'sc_rn_3030', cat: 'workout', sport: 'running', goal: 'vo2max', name: 'VO₂ 20×30/30 s', duration: 45, load: 70,
    desc: 'Warm-up; 20×(30 s at vVO₂max / 30 s easy jog); cool-down. Billat’s 30/30 intervals let you spend a long total time near VO₂max at a controlled effort. Keep the fast reps even.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 4, min: 20 }, { zt: 'hr', z: 1, min: 10 }], refs: ['billat', 'buchheit'] },
  { id: 'sc_rn_flying', cat: 'workout', sport: 'running', goal: 'anaerobic', name: 'Flying sprints 6×80 m', duration: 35, load: 42,
    desc: 'Warm-up; 6×80 m with a rolling build to near-max speed over the middle 40 m, full walk-back recovery; cool-down. Develops top-end speed, coordination and economy at low injury risk.',
    steps: [{ zt: 'hr', z: 1, min: 15 }, { zt: 'hr', z: 5, min: 4 }, { zt: 'hr', z: 1, min: 16 }], refs: ['gibala', 'laursen'] },

  // ---- SWIMMING (+15) ----
  // base / technique
  { id: 'sc_sw_endur2k', cat: 'workout', sport: 'swimming', goal: 'base', name: 'Aerobic endurance 2000 m', duration: 50, load: 55,
    desc: '2000 m continuous freestyle at a smooth aerobic pace, negative-split (second half slightly faster). Builds swimming-specific aerobic capacity and pacing discipline.',
    steps: [], refs: ['maglischo', 'costill'] },
  { id: 'sc_sw_pull', cat: 'workout', sport: 'swimming', goal: 'base', name: 'Pull set 8×200', duration: 55, load: 55,
    desc: '300 warm-up; 8×200 m with pull-buoy (and light paddles) at a steady aerobic effort on 20 s rest; 200 easy. Develops upper-body aerobic endurance and a strong, long stroke.',
    steps: [], refs: ['maglischo'] },
  { id: 'sc_sw_recovery', cat: 'workout', sport: 'swimming', goal: 'base', name: 'Recovery swim 1000 m', duration: 30, load: 22,
    desc: '1000 m very easy, mixing strokes and 4×50 drills. Promotes recovery, mobility and technique between hard sessions without meaningful load.',
    steps: [], refs: ['maglischo'] },
  { id: 'sc_sw_drills', cat: 'workout', sport: 'swimming', goal: 'base', name: 'Technique 12×50 drills', duration: 40, load: 32,
    desc: '300 warm-up; 12×50 m stroke drills (catch-up, single-arm, fingertip-drag, sculling, fist) on 15 s rest; 300 easy swim focusing on the feel you built. Improves efficiency and economy.',
    steps: [], refs: ['toussaint', 'maglischo'] },
  { id: 'sc_sw_kick', cat: 'workout', sport: 'swimming', goal: 'base', name: 'Kick set 10×50', duration: 35, load: 35,
    desc: '10×50 m kick with board (moderate, steady) on 20 s rest, interspersed with 100 easy swim. Builds leg endurance, ankle mobility and body position.',
    steps: [], refs: ['maglischo'] },
  // threshold (CSS)
  { id: 'sc_sw_css5x200', cat: 'workout', sport: 'swimming', goal: 'threshold', name: 'CSS 5×200', duration: 55, load: 68,
    desc: 'Warm-up 400; 5×200 m at Critical Swim Speed (threshold) on 20 s rest; 200 easy. The core threshold session for swimmers — raises the pace you can hold for ~30 min.',
    steps: [], refs: ['pyne', 'faude'] },
  { id: 'sc_sw_brokencss', cat: 'workout', sport: 'swimming', goal: 'threshold', name: 'Broken threshold 3×300', duration: 55, load: 70,
    desc: 'Warm-up; 3×300 m at CSS with 30 s rest; easy cool-down. Longer threshold reps that build sustained lactate-clearance capacity for open-water and distance events.',
    steps: [], refs: ['pyne'] },
  { id: 'sc_sw_pyramid', cat: 'workout', sport: 'swimming', goal: 'threshold', name: 'Threshold pyramid 100-200-300-200-100', duration: 55, load: 68,
    desc: 'Warm-up; 100-200-300-200-100 m at CSS with 15–20 s rest; cool-down. A varied threshold ladder that keeps focus while accumulating quality distance at race-relevant pace.',
    steps: [], refs: ['olbrecht'] },
  { id: 'sc_sw_20x50', cat: 'workout', sport: 'swimming', goal: 'threshold', name: '20×50 @ CSS on tight rest', duration: 45, load: 66,
    desc: 'Warm-up; 20×50 m at CSS on short rest (~5–10 s), holding an even pace throughout; cool-down. Race-pace threshold work that trains rhythm and pace-holding under fatigue.',
    steps: [], refs: ['pyne', 'olbrecht'] },
  // VO2max
  { id: 'sc_sw_10x100', cat: 'workout', sport: 'swimming', goal: 'vo2max', name: 'VO₂ 10×100 @ 1500 pace', duration: 50, load: 74,
    desc: 'Warm-up; 10×100 m at ~1500 m race pace (faster than CSS) on 15–20 s rest; cool-down. Sustains a high fraction of VO₂max — a key aerobic-power set for middle-distance swimmers.',
    steps: [], refs: ['olbrecht', 'laursen'] },
  { id: 'sc_sw_broken400', cat: 'workout', sport: 'swimming', goal: 'vo2max', name: 'Broken 400s (4×[4×100])', duration: 55, load: 76,
    desc: 'Warm-up; 4 rounds of 4×100 m descending 1→4 (last fastest) on 15 s rest, 45 s between rounds; cool-down. Progressive high-intensity aerobic set targeting VO₂max and pace control.',
    steps: [], refs: ['maglischo'] },
  { id: 'sc_sw_50sfast', cat: 'workout', sport: 'swimming', goal: 'vo2max', name: '16×50 fast on 1:00', duration: 40, load: 68,
    desc: 'Warm-up; 16×50 m fast (above CSS) leaving on 1:00 so faster swims earn more rest; cool-down. High-aerobic-power set that builds speed endurance and VO₂max.',
    steps: [], refs: ['maglischo', 'laursen'] },
  { id: 'sc_sw_hypoxic', cat: 'workout', sport: 'swimming', goal: 'vo2max', name: 'Breath-control 8×75', duration: 40, load: 58,
    desc: 'Warm-up; 8×75 m at strong aerobic effort breathing every 5 / 7 / 9 strokes (by 25) on 20 s rest; cool-down. Controlled hypoventilation that challenges CO₂ tolerance and stroke rhythm. Stop if lightheaded.',
    steps: [], refs: ['toussaint'] },
  // anaerobic / sprint
  { id: 'sc_sw_25s', cat: 'workout', sport: 'swimming', goal: 'anaerobic', name: 'Sprint 12×25 all-out', duration: 35, load: 45,
    desc: 'Warm-up; 12×25 m ALL-OUT with full recovery (~45–60 s); generous cool-down. Develops maximal swimming speed, stroke power and turnover. Quality over quantity — rest fully.',
    steps: [], refs: ['maglischo', 'gibala'] },
  { id: 'sc_sw_lactate', cat: 'workout', sport: 'swimming', goal: 'anaerobic', name: 'Lactate production 6×50 max', duration: 40, load: 55,
    desc: 'Warm-up; 6×50 m at maximal effort with 2–3 min rest to allow near-full recovery; long easy cool-down. Trains anaerobic capacity and lactate tolerance — use sparingly, 1×/week max.',
    steps: [], refs: ['olbrecht'] }
];

/* Top up the library so EVERY sport has ≥ TARGET_PER_GOAL templates in EACH goal group.
   The 60 hand-written workouts above stay the "featured" set; these fill the rest with
   evidence-based variations (rep/duration progressions) so coaches have a deep menu. */
const TARGET_PER_GOAL = 15;
(function buildGeneratedCatalog() {
  const sports = ['biking', 'running', 'swimming'];
  const goals = ['base', 'threshold', 'vo2max', 'anaerobic'];
  const zt = { biking: 'power', running: 'hr', swimming: null };
  const zi = { base: 1, threshold: 3, vo2max: 4, anaerobic: 5 };
  const word = { biking: 'ride', running: 'run', swimming: 'swim' };
  const baseDurs = { biking: [60, 75, 90, 105, 120, 135, 150, 165, 180, 210], running: [40, 50, 60, 70, 80, 90, 100, 110, 120, 135], swimming: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75] };
  const goalBlurb = {
    base: 'Aerobic Zone 2 work — builds the endurance base; keep it controlled and conversational.',
    threshold: 'Threshold work near your 1-hour power/pace — raises the output you can sustain.',
    vo2max: 'VO₂max intervals — maximise time at high aerobic power; hard but evenly paced.',
    anaerobic: 'Anaerobic / sprint work — short maximal efforts with full recovery; use sparingly.'
  };
  const refBy = (sport, goal) => ({
    base: ['seiler', 'sanmillan'],
    threshold: sport === 'swimming' ? ['pyne', 'faude'] : (sport === 'running' ? ['daniels', 'seiler'] : ['coggan', 'seiler']),
    vo2max: sport === 'swimming' ? ['olbrecht', 'laursen'] : (sport === 'running' ? ['billat', 'laursen'] : ['laursen', 'buchheit']),
    anaerobic: sport === 'swimming' ? ['maglischo', 'gibala'] : ['gibala', 'laursen']
  }[goal]);
  const specs = (sport, goal) => {
    const w = word[sport];
    if (goal === 'base') {
      const arr = baseDurs[sport].map(d => ['Zone 2 endurance ' + w + ' — ' + d + ' min', d, Math.round(d * 0.6)]);
      arr.push(['Recovery ' + w + ' (very easy)', sport === 'swimming' ? 25 : 35, 20]);
      arr.push(['Steady aerobic ' + w + ' — fat-max', sport === 'swimming' ? 55 : 100, 60]);
      arr.push(['Aerobic ' + w + ' + technique/cadence', sport === 'swimming' ? 45 : 75, 52]);
      arr.push(['Progression ' + w + ' (easy → tempo)', sport === 'swimming' ? 50 : 70, 60]);
      return arr;
    }
    if (goal === 'threshold') {
      const combos = [[2, 12], [2, 15], [2, 20], [3, 8], [3, 10], [3, 12], [3, 15], [4, 8], [4, 10], [5, 6], [5, 8], [1, 25]];
      const arr = combos.map(([r, l]) => ['Threshold ' + w + ' ' + r + '×' + l + ' min', 20 + r * l + (r - 1) * 3, Math.round(r * l * 1.5) + 25]);
      arr.push(['Sweet-spot ' + w + ' 3×12 min', 65, 72]);
      arr.push(['Over-unders ' + w + ' 4×8 min', 62, 80]);
      arr.push(['Threshold pyramid ' + w, 75, 86]);
      return arr;
    }
    if (goal === 'vo2max') {
      const combos = [[4, 4], [5, 4], [6, 3], [8, 3], [5, 5], [6, 4], [10, 2], [3, 3]];
      const arr = combos.map(([r, l]) => ['VO₂max ' + w + ' ' + r + '×' + l + ' min', 25 + r * l + (r - 1) * 3, Math.round(r * l * 2) + 25]);
      arr.push(['VO₂ ' + w + ' 30/30 ×2 sets', 48, 74]);
      arr.push(['VO₂ ' + w + ' 30/30 ×3 sets', 52, 78]);
      arr.push(['VO₂ ' + w + ' 40/20 ×3 sets', 55, 80]);
      arr.push(['VO₂ ' + w + ' 15/15 ×2 sets', 45, 70]);
      return arr;
    }
    const combos = [[5, 30], [8, 20], [10, 30], [6, 45], [4, 60], [8, 15], [12, 15], [6, 90], [10, 20]];
    const arr = combos.map(([r, s]) => ['Sprints ' + w + ' ' + r + '×' + s + ' s all-out', 30 + Math.ceil(r * s / 60) + 8, 40 + r]);
    arr.push(['Tabata ' + w + ' 8×20/10 s', 24, 40]);
    arr.push(['Speed-endurance ' + w + ' 4×2 min', 40, 60]);
    arr.push(['Neuromuscular ' + w + ' 8×15 s max', 38, 48]);
    return arr;
  };
  sports.forEach(sport => goals.forEach(goal => {
    const have = SCIENCE_CATALOG.filter(x => x.cat !== 'test' && x.sport === sport && x.goal === goal).length;
    const need = Math.max(0, TARGET_PER_GOAL - have);
    specs(sport, goal).slice(0, need).forEach((sp, i) => {
      const [name, dur, load] = sp;
      const steps = zt[sport]
        ? (goal === 'base' ? [{ zt: zt[sport], z: 1, min: dur }]
          : [{ zt: zt[sport], z: 0, min: 12 }, { zt: zt[sport], z: zi[goal], min: Math.max(6, Math.round(dur * 0.45)) }, { zt: zt[sport], z: 0, min: 10 }])
        : [];
      SCIENCE_CATALOG.push({ id: 'gen_' + sport + '_' + goal + '_' + i, cat: 'workout', sport, goal, name, duration: dur, load, desc: name + '. ' + goalBlurb[goal], steps, refs: refBy(sport, goal), generated: true });
    });
  }));
})();
const SCIENCE_GOALS = { test: 'Fitness tests', base: 'Base / endurance', threshold: 'Threshold (1-hour max)', vo2max: 'VO₂max', anaerobic: 'Anaerobic / sprint' };
function refCite(key) { const r = SCIENCE_REFS[key]; return r ? `${r.authors} (${r.year}). ${r.title}. ${r.journal}.` : key; }

// Macrocycle training goals → which catalog goal-groups make up its matching workout library.
const MACRO_GOALS = {
  base:      'Aerobic base (Z1/Z2)',
  threshold: 'Threshold / FTP',
  vo2max:    'VO₂max',
  anaerobic: 'Anaerobic / sprint',
  race:      'Race prep / peak',
  general:   'General fitness'
};
// Each macro goal draws a broad library — its primary group plus adjacent intensities,
// since every block still rests on aerobic base + neighbouring stimuli (≥20 workouts each).
function macroGoalCatalogGoals(goal) {
  // Even an aerobic-base block keeps some VO₂max work (polarized training), so base includes it too.
  if (goal === 'base') return ['base', 'threshold', 'vo2max'];
  return ['base', 'threshold', 'vo2max', 'anaerobic']; // every other block → the whole spread
}
// Best-guess goal for a cycle that predates the goal field (reads zones/focus text).
function inferMacroGoal(c) {
  if (c && c.goal) return c.goal;
  const t = (((c && c.zones) || []).join(' ') + ' ' + ((c && c.focus) || '')).toLowerCase();
  if (/z6|z7|sprint|anaerob|neuromusc/.test(t)) return 'anaerobic';
  if (/vo2|vo₂|z5/.test(t)) return 'vo2max';
  if (/threshold|drempel|ftp|tempo|z4/.test(t)) return 'threshold';
  if (/z1|z2|base|basis|aeroob|aerobic|endurance|uithouding/.test(t)) return 'base';
  if (/race|wedstrijd|peak|taper/.test(t)) return 'race';
  return 'base';
}
// Workouts (built-in + team-added) that match a cycle's goal, grouped by sport.
function macroLibraryFor(c) {
  const goals = macroGoalCatalogGoals(inferMacroGoal(c));
  const items = [...(state.scienceCustom || []), ...SCIENCE_CATALOG].filter(w => w.cat !== 'test' && goals.includes(w.goal));
  const bySport = {};
  items.forEach(w => { (bySport[w.sport] = bySport[w.sport] || []).push(w); });
  return bySport;
}

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
  if (!Array.isArray(s.wellness)) s.wellness = [];
  if (!Array.isArray(s.todos)) s.todos = [];
  if (!Array.isArray(s.comments)) s.comments = [];
  if (!s.settings) s.settings = {};
  if (!s.settings.notifications) s.settings.notifications = { enabled: false, morning: true, postSession: true, sundayEve: true, morningTime: '07:00', eveningTime: '20:00' };
  s.sessions.forEach(x => { if (!Array.isArray(x.steps)) x.steps = []; });
  // Coaches (2 coaches per athlete support)
  if (!Array.isArray(s.coaches) || !s.coaches.length) s.coaches = [{ id: uid(), name: 'Coach 1' }, { id: uid(), name: 'Coach 2' }];
  if (!s.currentCoachId || !s.coaches.find(c => c.id === s.currentCoachId)) s.currentCoachId = s.coaches[0].id;
  s.athletes.forEach(a => { if (!Array.isArray(a.coachIds)) a.coachIds = [s.coaches[0].id]; if (!Array.isArray(a.coachUids)) a.coachUids = []; if (!Array.isArray(a.viewers)) a.viewers = []; });
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

// Coach roster: which athletes a coach sees. By default only athletes linked to this coach
// (coachUids contains their uid); a "show all" toggle reveals everyone. Falls back to all when
// nothing is linked yet, so a new coach never sees an empty app.
function rosterAthletes() {
  if (state.role !== 'coach') return state.athletes;
  if (state.ui.rosterAll || !Cloud.myUid) return state.athletes;
  const mine = state.athletes.filter(a => (a.coachUids || []).includes(Cloud.myUid));
  return mine.length ? mine : state.athletes;
}
// list of real coach accounts (for the athlete's "connect to your coach" picker)
async function fetchCoachUsers() {
  if (!Cloud.enabled || !Cloud.db) return [];
  try { const qs = await Cloud.db.collection('users').where('role', 'in', ['coach', 'both']).get(); return qs.docs.map(d => ({ uid: d.id, name: d.data().name || d.data().email, email: d.data().email })); }
  catch (e) { return []; }
}
// everyone with an account (team hub + to-do assignee picker)
async function fetchAllUsers() {
  if (!Cloud.enabled || !Cloud.db) return [];
  try { const qs = await Cloud.db.collection('users').get(); return qs.docs.map(d => ({ uid: d.id, name: d.data().name || (d.data().email || '').split('@')[0], email: d.data().email || '', role: d.data().role || 'athlete', title: d.data().title || '', bio: d.data().bio || '' })); }
  catch (e) { return []; }
}

// The app owner — kept as coach+athlete automatically, never has to re-pick a role.
const OWNER_EMAIL = 'marcin.delhaye@telenet.be';
// Roles: coach (programs), athlete (trains), both (coach & athlete), crew (supports the team).
// "Team" roles can see everyone's training.
const ROLES = {
  coach:       { label: 'Coach',       icon: '🧑‍🏫', sub: 'Programs & follows athletes' },
  athlete:     { label: 'Athlete',     icon: '🏃',   sub: 'Follows my own plan' },
  both:        { label: 'Coach & athlete', icon: '🧑‍🏫', sub: 'Coaches and trains' },
  crew:        { label: 'Crew',        icon: '🤝',   sub: 'Supports the team (medewerker)' },
  staff:       { label: 'Crew',        icon: '🤝',   sub: 'Supports the team (medewerker)' },
  coordinator: { label: 'Crew',        icon: '🤝',   sub: 'Plans tasks & deadlines' }
};
function roleLabel(r) { return (ROLES[r] || {}).label || r; }
function isTeamRole(r) { return r === 'coach' || r === 'staff' || r === 'coordinator' || r === 'crew'; }
function canCoordinate(r) { return r === 'coach' || r === 'coordinator' || r === 'crew'; }
// One account can hold several profiles (roles). These map legacy single-role accounts to a list,
// give a legacy label, choose a default active profile, and label the switcher buttons.
function rolesFromLegacy(role) {
  if (role === 'both') return ['coach', 'athlete'];
  if (role === 'staff' || role === 'coordinator') return ['crew'];
  return [role || 'coach'];
}
function accountRoleLabel(roles) { return (roles.includes('coach') && roles.includes('athlete')) ? 'both' : (roles[0] || 'coach'); }
function primaryMode(roles) { return roles.includes('coach') ? 'coach' : roles.includes('athlete') ? 'athlete' : (roles[0] || 'coach'); }
function modeLabel(r) { return r === 'coach' ? 'Coaching' : r === 'athlete' ? 'My training' : r === 'crew' ? 'Crew' : roleLabel(r); }
const TODO_STATUS = {
  todo:   { label: 'To do',        color: '#8d99ae', icon: '⬜' },
  doing:  { label: 'In progress',  color: '#4cc9f0', icon: '🔵' },
  atrisk: { label: 'Deadline at risk', color: '#f5c518', icon: '⚠️' },
  done:   { label: 'Done',         color: '#35c98b', icon: '✅' }
};
// the signed-in person's own uid + display name (for authoring todos/comments)
function myUid() { return Cloud.myUid || null; }
function myName() { return (Cloud.user && (Cloud.user.displayName || (Cloud.user.email || '').split('@')[0])) || 'Me'; }

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
  { id: 'dashboard',      label: 'Dashboard',      icon: '📊', roles: ['coach', 'athlete', 'crew'] },
  { id: 'calendar',       label: 'Calendar',       icon: '📅', roles: ['coach', 'athlete', 'crew'] },
  { id: 'todos',          label: 'To-do',          icon: '✅', roles: ['coach', 'athlete', 'staff', 'coordinator', 'crew'] },
  { id: 'sharedcal',      label: 'Shared Calendar', icon: '🗓️', roles: ['coach', 'athlete', 'staff', 'coordinator', 'crew'] },
  { id: 'planning',       label: 'Planning',       icon: '📆', roles: ['coach', 'athlete', 'crew'] },
  { id: 'library',        label: 'Workouts',       icon: '📚', roles: ['coach'] },
  { id: 'fitness',        label: 'Fitness',        icon: '📈', roles: ['coach', 'athlete', 'crew'] },
  { id: 'recovery',       label: 'Recovery',       icon: '🔋', roles: ['coach', 'athlete', 'crew'] },
  { id: 'testing',        label: 'Testing',        icon: '🧪', roles: ['coach', 'athlete', 'crew'] },
  { id: 'nutrition',      label: 'Nutrition',      icon: '🥗', roles: ['coach', 'athlete', 'crew'] },
  { id: 'goals',          label: 'Goals',          icon: '🎯', roles: ['coach', 'athlete', 'crew'] },
  { id: 'questionnaires', label: 'Questionnaires', icon: '📝', roles: ['coach', 'athlete', 'crew'] },
  { id: 'references',     label: 'References',     icon: '📖', roles: ['coach', 'athlete', 'crew'] },
  { id: 'team',           label: 'Team',           icon: '👥', roles: ['coach', 'athlete', 'staff', 'coordinator', 'crew'] },
  { id: 'messages',       label: 'Messages',       icon: '💬', roles: ['coach', 'athlete', 'staff', 'coordinator', 'crew'] },
  { id: 'athletes',       label: 'Athletes & Zones', icon: '⚙️', roles: ['coach'] },
  { id: 'monitor',        label: 'Monitoring',     icon: '❤️', roles: ['coach'] },
  { id: 'settings',       label: 'Settings',       icon: '🔌', roles: ['coach', 'athlete', 'staff', 'coordinator', 'crew'] }
];
function navForRole() { return NAV.filter(n => n.roles.includes(state.role)); }
function go(view) { state.ui.view = view; save(); render(); window.scrollTo(0, 0); }

/* ============================================================================
   RENDER
   ============================================================================ */
function render() {
  const nav = navForRole();
  // crew with no approved athletes yet → keep them on the non-athlete tabs (Team to request access)
  const ATH_VIEWS = ['dashboard', 'calendar', 'planning', 'fitness', 'recovery', 'testing', 'nutrition', 'goals', 'questionnaires', 'references', 'monitor', 'library', 'athletes'];
  if (state.role === 'crew' && !(state.athletes || []).length && ATH_VIEWS.includes(state.ui.view)) state.ui.view = 'team';
  if (!nav.find(n => n.id === state.ui.view)) state.ui.view = (nav[0] && nav[0].id) || 'dashboard';
  const view = state.ui.view;
  if (state.role === 'coach' || state.role === 'crew') { const r = rosterAthletes(); if (r.length && !r.find(a => a.id === state.currentAthleteId)) state.currentAthleteId = r[0].id; }

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
          ${(Cloud.user && Cloud.accountRoles && Cloud.accountRoles.length > 1) ? `<div class="seg" style="margin-bottom:8px;flex-wrap:wrap;gap:3px">
            ${Cloud.accountRoles.map(r => `<button data-mode="${r}" class="${state.role === r ? 'active' : ''}">${modeLabel(r)}</button>`).join('')}
          </div>` : ''}
          ${((state.role === 'coach' || state.role === 'crew') && rosterAthletes().length) ? `<div class="who">
            My athletes
            <select data-athlete-select>
              ${rosterAthletes().map(a => `<option value="${a.id}" ${a.id === state.currentAthleteId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
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
            ${((state.role === 'coach' || state.role === 'crew') && rosterAthletes().length) ? `<select class="topbar-athlete" data-athlete-top title="Switch athlete">
              ${rosterAthletes().map(a => `<option value="${a.id}" ${a.id === state.currentAthleteId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
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
  if ($('#logout-btn')) $('#logout-btn').addEventListener('click', () => Cloud.logout());

  const views = {
    dashboard: viewDashboard, calendar: viewCalendar, planning: viewPlanning, library: viewLibrary,
    fitness: viewFitness, testing: viewTesting, nutrition: viewNutrition, goals: viewGoals,
    questionnaires: viewQuestionnaires, references: viewReferences, messages: viewMessages, athletes: viewAthletes, monitor: viewMonitor, settings: viewSettings,
    todos: viewTodos, sharedcal: viewSharedCal, team: viewTeam, recovery: viewRecovery
  };
  (views[view] || viewTodos)();
}

/* ------------------------------ Dashboard ------------------------------- */
function viewDashboard() {
  const v = $('#view');
  const a = currentAthlete();
  const me = state.role;
  const today = todayISO();

  // things to fill in (RPE today / questionnaire / morning / weekly)
  const prompts = pendingPrompts(a);
  // messages that came in from other people
  const inbound = state.messages.filter(m => m.athleteId === a.id && m.from !== me).sort((x, y) => (y.ts || 0) - (x.ts || 0));
  const recentInbound = inbound.filter(m => (Date.now() - (m.ts || 0)) < 3 * 864e5);
  const myComments = (state.comments || []).filter(c => c.athleteId === a.id && c.authorUid !== myUid()).sort((x, y) => (y.ts || 0) - (x.ts || 0)).slice(0, 3);
  // next 2 trainings
  const upcoming = athleteSessions(a.id).filter(s => s.date >= today && s.status !== 'done').sort((x, y) => x.date.localeCompare(y.date)).slice(0, 2);
  // next to-do tasks for this person
  const tasks = (state.todos || []).filter(t => t.assigneeUid === a.id && t.status !== 'done').sort((x, y) => (x.due || '9999-99-99').localeCompare(y.due || '9999-99-99')).slice(0, 4);
  // today's training readiness score
  const rec = computeReadiness(a.id, 30);
  const rd = rec.days.find(d => d.date === today) || rec.days[rec.days.length - 1];

  v.innerHTML = `
    ${(prompts.length || recentInbound.length) ? `<div class="grid" style="margin-bottom:16px;gap:10px">
      ${prompts.map(p => p.html).join('')}
      ${recentInbound.length ? `<div class="prompt"><span class="icon">💬</span><div class="grow"><b>New messages</b><div class="sub">${recentInbound.length} new message(s) from your ${me === 'athlete' ? 'coach / crew' : 'athlete'}.</div></div><button class="btn primary sm" data-prompt="messages">Open</button></div>` : ''}
    </div>` : ''}

    ${rd ? readinessDashCard(rd) : `<div class="card"><h3>Training readiness</h3><div class="empty">No readiness data yet — connect Intervals.icu (HRV) or log a morning check-in.</div></div>`}

    <div class="grid cols-2" style="margin-top:16px">
      <div class="card">
        <h3>Next 2 trainings</h3>
        <div class="list">${upcoming.length ? upcoming.map(s => dashSessionRow(s)).join('') : '<div class="empty">Nothing planned.</div>'}</div>
        <div class="btn-row" style="margin-top:8px"><button class="btn sm" data-goto="calendar">Open calendar</button></div>
      </div>
      <div class="card">
        <h3>Next tasks</h3>
        <div class="list">${tasks.length ? tasks.map(t => { const st = TODO_STATUS[t.status] || TODO_STATUS.todo; const overdue = t.due && t.due < today; return `<div class="row" style="border-left:3px solid ${st.color}"><div class="grow"><div class="title">📋 ${esc(t.title)}</div><div class="meta">${t.due ? `<span style="color:${overdue ? 'var(--bad)' : 'var(--muted)'}">${overdue ? '⚠️ ' : '🎯 '}${fmtDate(t.due)}</span>` : 'no deadline'} · ${st.label}</div></div></div>`; }).join('') : '<div class="empty">No open tasks.</div>'}</div>
        <div class="btn-row" style="margin-top:8px"><button class="btn sm" data-goto="todos">Open to-do list</button></div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <h3 style="margin:0">Training load by sport — last 4 weeks</h3>
        ${(() => { const wd = weekDistribution(a.id, weekKey(new Date())); return wd ? `<span class="badge" title="Intensity distribution this week (Seiler)"><span class="dot" style="background:var(--accent)"></span>${wd.model} · ${wd.lit}/${wd.mod}/${wd.hit}% LIT/MOD/HIT</span>` : ''; })()}
      </div>
      ${stackedLoadChart(weeklyLoadBySport(a.id, 4))}
    </div>

    ${(inbound.length || myComments.length) ? `<div class="card" style="margin-top:16px">
      <h3>Recent messages &amp; comments</h3>
      <div class="list">
        ${inbound.slice(0, 3).map(m => `<div class="row"><div class="grow"><div class="title">💬 ${esc(m.text.slice(0, 90))}${m.text.length > 90 ? '…' : ''}</div><div class="meta">${m.from === 'coach' ? 'Coach / crew' : esc(a.name)} · ${fmtDate(m.date)}</div></div></div>`).join('')}
        ${myComments.map(c => `<div class="row"><div class="grow"><div class="title">🗒️ ${esc(c.text.slice(0, 90))}${c.text.length > 90 ? '…' : ''}</div><div class="meta">${esc(c.authorName || '')} · comment on a workout</div></div></div>`).join('')}
      </div>
      <div class="btn-row" style="margin-top:8px"><button class="btn sm" data-goto="messages">Open messages</button></div>
    </div>` : ''}`;

  $$('[data-open-session]').forEach(b => b.addEventListener('click', () => openSessionModal(b.dataset.openSession)));
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
  bindPromptButtons();
}
// Training readiness summary card for the dashboard, with a "full gas / recover" call.
function readinessDashCard(rd) {
  const b = rd.band;
  const advice = b.key === 'green' ? 'Full gas — a key or hard session is well-placed today.'
    : b.key === 'yellow' ? 'Train smart — moderate work, keep something in reserve.'
    : 'Recovery is the priority today — easy Z1–Z2 or rest.';
  return `<div class="card" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
    <div class="ring-wrap"><div class="ring" style="--p:${rd.score};background:conic-gradient(${b.color} calc(${rd.score}*1%), var(--line) 0)"><b>${rd.score}</b></div></div>
    <div style="flex:1;min-width:200px">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)">Training readiness score</div>
      <div style="font-size:22px;font-weight:800;color:${b.color}">${b.label}</div>
      <div class="sub" style="margin-top:4px">${advice}</div>
    </div>
    <button class="btn sm" data-goto="recovery">Details</button>
  </div>`;
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

  // Post-session RPE — only for a session done TODAY (no nagging about past sessions)
  const pending = athleteSessions(a.id).filter(s => s.status === 'done' && s.rpe == null && s.date === today);
  if (pending.length) out.push({ html: `
    <div class="prompt"><span class="icon">✅</span>
      <div class="grow"><b>Today's session</b><div class="sub">How was your training today? Add your RPE & how you felt.</div></div>
      <button class="btn primary sm" data-prompt="rpe" data-sid="${pending[0].id}">Answer</button></div>` });

  // Weekly reflection (on/after Sunday, once per week)
  const wk = weekKey(new Date());
  const hasWeekly = state.checkins.weekly.some(w => w.athleteId === a.id && w.week === wk);
  const isSunday = new Date().getDay() === 0;
  if (isSunday && !hasWeekly) out.push({ html: `
    <div class="prompt"><span class="icon">📆</span>
      <div class="grow"><b>Weekly reflection</b><div class="sub">How did this week's training feel?</div></div>
      <button class="btn primary sm" data-prompt="weekly">Answer</button></div>` });

  // Questionnaires still to fill in
  const unfilled = state.questionnaires.filter(q => !state.responses.some(r => r.qid === q.id && r.athleteId === a.id));
  if (unfilled.length) out.push({ html: `
    <div class="prompt"><span class="icon">📝</span>
      <div class="grow"><b>Questionnaire</b><div class="sub">${unfilled.length} questionnaire(s) still to fill in.</div></div>
      <button class="btn primary sm" data-prompt="quest" data-qid="${unfilled[0].id}">Open</button></div>` });

  return out;
}
function bindPromptButtons() {
  $$('[data-prompt]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.prompt === 'sleep') openSleepModal();
    if (b.dataset.prompt === 'rpe') openRpeModal(b.dataset.sid);
    if (b.dataset.prompt === 'weekly') openWeeklyModal();
    if (b.dataset.prompt === 'quest') { state.role === 'athlete' && b.dataset.qid ? openQFill(b.dataset.qid) : go('questionnaires'); }
    if (b.dataset.prompt === 'messages') go('messages');
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

// Intervals-style dashboard row: header + the workout graph underneath, whole row opens the session.
function dashSessionRow(s) {
  const sp = SPORTS[s.sport] || SPORTS.other;
  const g = workoutMiniSVG(s, 48);
  return `<div class="row" style="flex-direction:column;align-items:stretch;gap:6px;cursor:pointer" data-open-session="${s.id}">
    <div style="display:flex;align-items:center;gap:10px">
      <span class="dot" style="background:${sp.color}"></span>
      <div class="grow"><div class="title">${sp.icon} ${esc(s.name)} ${focusBadge(s)}</div>
        <div class="meta">${fmtDate(s.date)} · ${sp.label} · ${s.duration || 0} min · ${s.load || 0} TSS${s.rpe != null ? ' · RPE ' + s.rpe : ''}</div></div>
      ${s.status === 'done' ? '<span class="badge"><span class="dot" style="background:var(--ok)"></span>Done</span>' : ''}
    </div>
    ${g ? `<div>${g}</div>` : ''}
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
// Compact Intervals-style graph for a session, for calendar chips & dashboard rows.
// Completed sessions show the ACTUAL power/HR curve (from Intervals streams); planned sessions
// show the stepped zone profile. Returns '' when there's nothing structured to draw.
function workoutMiniSVG(s, h) {
  h = h || 28;
  const W = 300;
  // 1) completed with real data → actual power (or HR) line
  if (s && s.status === 'done' && s.streams) {
    const st = s.streams;
    const usePower = st.watts && st.watts.some(v => v != null);
    const series = usePower ? st.watts : (st.hr && st.hr.some(v => v != null) ? st.hr : null);
    if (series) {
      const vals = series.filter(v => v != null && !isNaN(v));
      if (vals.length > 1) {
        const mn = Math.min(...vals), mx = Math.max(...vals), n = series.length;
        const x = i => (i / (n - 1 || 1)) * W, y = v => h - ((v - mn) / ((mx - mn) || 1)) * (h - 2) - 1;
        let d = '', pen = false;
        series.forEach((v, i) => { if (v == null || isNaN(v)) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `; pen = true; });
        return `<svg viewBox="0 0 ${W} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block;border-radius:4px;background:var(--bg-2)"><path d="${d.trim()}" fill="none" stroke="${usePower ? '#3b30e6' : '#e50914'}" stroke-width="1.4"/></svg>`;
      }
    }
  }
  // 2) planned (or done without streams) → stepped zone profile
  const steps = (s && s.steps) || [];
  const total = stepsDuration(steps);
  if (total) {
    let x = 0, bars = '';
    steps.forEach(st => {
      const w = (Number(st.min) || 0) / total * W;
      const bh = Math.max(3, ((st.z + 1) / 7) * h);
      bars += `<rect x="${x.toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${bh.toFixed(1)}" fill="${zoneColor(st.z)}"/>`;
      x += w;
    });
    return `<svg viewBox="0 0 ${W} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block;border-radius:4px;background:var(--bg-2)">${bars}</svg>`;
  }
  return '';
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
    const dayTodos = (state.todos || []).filter(t => t.assigneeUid === a.id && t.due === iso);
    cells += `
      <div class="cal-cell ${inMonth ? '' : 'dim'} ${isToday ? 'today' : ''}" data-day="${iso}">
        <div class="d"><span>${d.getDate()} ${dayNotes.length ? '<span class="note-dot" title="' + esc(dayNotes.map(n => n.text).join(' · ')) + '"></span>' : ''}</span>${dayLoad ? `<span class="load">${dayLoad} TSS</span>` : ''}</div>
        ${daySessions.map(s => sessionChip(s)).join('')}
        ${dayTodos.map(t => todoChip(t)).join('')}
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
  const cc = sessionComments(s.id).length;
  const g = workoutMiniSVG(s, 24);
  return `<div class="sess ${s.status === 'done' ? 'done' : ''}" draggable="true" data-sess="${s.id}" style="border-left-color:${sp.color}">
    <div class="t">${sp.icon} ${esc(s.name)} ${cc ? `<span class="check" title="${cc} comment(s)">💬${cc}</span>` : ''}${s.status === 'done' ? '<span class="check">✓</span>' : ''}</div>
    ${g ? `<div style="margin:3px 0 1px">${g}</div>` : ''}
    <div class="m">${s.duration || 0}min · ${s.load || 0} TSS${f.label !== '—' ? ` · <span style="color:${f.color}">${f.label}</span>` : ''}</div>
  </div>`;
}
// Task chip shown on the assignee's calendar (📋), coloured by status.
function todoChip(t) {
  const st = TODO_STATUS[t.status] || TODO_STATUS.todo;
  return `<div class="sess todo-chip" data-todo="${t.id}" style="border-left-color:${st.color};cursor:pointer">
    <div class="t">📋 ${esc(t.title)} <span class="check">${st.icon}</span></div>
    <div class="m" style="color:${st.color}">${st.label}${t.createdByName ? ' · ' + esc(t.createdByName) : ''}</div>
  </div>`;
}
function sessionComments(sid) { return (state.comments || []).filter(c => c.sessionId === sid); }

let dragId = null;
function bindCalendarDnD() {
  $$('.sess').forEach(el => {
    el.addEventListener('dragstart', (e) => { dragId = el.dataset.sess; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => el.style.opacity = '.4', 0); });
    el.addEventListener('dragend', () => { el.style.opacity = '1'; dragId = null; });
    el.addEventListener('click', (e) => { e.stopPropagation(); openSessionModal(el.dataset.sess); });
  });
  $$('.todo-chip').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); openTodoModal(el.dataset.todo); }));
  $$('.cal-cell').forEach(cell => {
    cell.addEventListener('dragover', (e) => { e.preventDefault(); cell.classList.add('drop-hover'); });
    cell.addEventListener('dragleave', () => cell.classList.remove('drop-hover'));
    cell.addEventListener('drop', (e) => {
      e.preventDefault(); cell.classList.remove('drop-hover');
      if (!dragId || state.role === 'crew') return;   // crew is read-only
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
    <div id="postwork-block"></div>
    ${editing ? '<div id="comments-block"></div>' : ''}
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
  if (editing) { renderPostWorkout(s, (state.wellness || []).filter(w => w.athleteId === s.athleteId)); renderCommentsBlock('comments-block', s); }

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
function scheduleCatalog(id, presetDate) {
  const w = findCatalog(id); if (!w) return;
  const body = `<label>Add "<b>${esc(w.name)}</b>" to ${esc(currentAthlete().name)} on:</label><input id="sch-date" type="date" value="${presetDate || todayISO()}"/>`;
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
  const inRoster = a && Cloud.myUid && (a.coachUids || []).includes(Cloud.myUid);
  const v = $('#view');
  v.innerHTML = `
    ${Cloud.user ? `<div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div><h3 style="margin:0">My roster</h3><div class="sub">${rosterAthletes().length} athlete(s) shown · athletes connect to you from their Settings → Your coach</div></div>
        <label style="display:flex;align-items:center;gap:8px;margin:0"><input type="checkbox" id="roster-all" style="width:auto" ${state.ui.rosterAll ? 'checked' : ''}/> <span>Show all athletes</span></label>
      </div>
      ${(a && Cloud.myUid) ? `<div class="btn-row" style="margin-top:10px"><button class="btn ${inRoster ? 'danger' : 'primary'} sm" id="roster-toggle">${inRoster ? '− Remove ' + esc(a.name) + ' from my roster' : '+ Add ' + esc(a.name) + ' to my roster'}</button></div>` : ''}
    </div>` : ''}
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

  if ($('#roster-all')) $('#roster-all').addEventListener('change', (e) => { state.ui.rosterAll = e.target.checked; render(); });
  if ($('#roster-toggle')) $('#roster-toggle').addEventListener('click', () => {
    a.coachUids = a.coachUids || [];
    if (a.coachUids.includes(Cloud.myUid)) a.coachUids = a.coachUids.filter(u => u !== Cloud.myUid);
    else a.coachUids.push(Cloud.myUid);
    save(); render();
  });

  $('#a-save').addEventListener('click', () => {
    a.name = $('#a-name').value; a.email = $('#a-email').value;
    a.ftp = Number($('#a-ftp').value) || 0; a.thresholdHr = Number($('#a-thr').value) || 0;
    a.maxHr = Number($('#a-max').value) || 0; a.thresholdPace = Number($('#a-pace').value) || 0;
    save(); render(); toast('Profile saved');
  });
  if ($('#a-del')) $('#a-del').addEventListener('click', async () => {
    if (state.athletes.length <= 1) { toast('You need at least one athlete'); return; }
    if (!confirm('Remove ' + a.name + '? This permanently deletes their profile and training data.')) return;
    const aid = a.id;
    if (Cloud.enabled && Cloud.user) await Cloud.deletePerson(aid);   // actually deletes the server doc
    state.athletes = state.athletes.filter(x => x.id !== aid);
    if (!state.athletes.find(x => x.id === state.currentAthleteId)) state.currentAthleteId = (state.athletes[0] || {}).id;
    save(); render(); toast('Athlete removed');
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
  $$('[data-cycle-lib]').forEach(b => b.addEventListener('click', () => openMacroLibrary(b.dataset.cycleLib)));
}
// A whole science-based workout library matched to a cycle's training goal (bike / run / swim).
function openMacroLibrary(cycleId) {
  const c = state.cycles.find(x => x.id === cycleId); if (!c) return;
  const goal = inferMacroGoal(c);
  const bySport = macroLibraryFor(c);
  const canEdit = state.role === 'coach';
  const preset = (todayISO() >= c.start && todayISO() <= c.end) ? todayISO() : c.start;
  const order = Object.keys(SPORTS).filter(sp => bySport[sp]);
  const body = `
    <div class="sub" style="margin-bottom:12px">Evidence-based workouts that build toward <b style="color:var(--text)">${esc(MACRO_GOALS[goal] || goal)}</b> — the goal of “${esc(c.name)}”. ${canEdit ? 'Add any to ' + esc(currentAthlete().name) + '’s calendar (defaults to a date inside this block).' : ''} Citations link to the <b>References</b> tab.</div>
    ${order.length ? order.map(sp => `
      <div class="section-title">${SPORTS[sp].icon} ${SPORTS[sp].label}</div>
      <div class="list">
        ${bySport[sp].map(w => `<div class="row">
          <div class="grow">
            <div class="title">${esc(w.name)} ${focusBadge(w)}</div>
            <div class="meta">${w.duration || 0} min · ${w.load || 0} TSS · ${esc((w.desc || '').slice(0, 96))}${(w.desc || '').length > 96 ? '…' : ''}</div>
            <div style="margin-top:3px">${(w.refs || []).map(refChip).join(' ')}${w.custom ? '<span class="badge" style="color:var(--accent-2)">★ Team-added</span>' : ''}</div>
          </div>
          ${canEdit ? `<button class="btn sm primary" data-maclib="${w.id}">Add</button>` : ''}
        </div>`).join('')}
      </div>`).join('') : '<div class="empty">No matching workouts for this goal yet.</div>'}`;
  openModal('Workout library — ' + (MACRO_GOALS[goal] || goal), body, '');
  $$('[data-maclib]').forEach(b => b.addEventListener('click', () => { closeModal(); scheduleCatalog(b.dataset.maclib, preset); }));
}
function cycleBar(c, canEdit) {
  const sp = SPORTS[c.sport] || SPORTS.other;
  const zones = (c.zones || []).map(z => `<span class="zbadge">${esc(z)}</span>`).join('');
  const goal = inferMacroGoal(c);
  return `<div class="cycle-bar ${c.type}">
    <div class="ttl"><span>${esc(c.name)}</span><span class="btn-row" style="gap:6px">
      <button class="btn sm" data-cycle-lib="${c.id}" title="Science-based workouts for this goal">📚 Library</button>
      ${canEdit ? `<button class="btn sm" data-cycle-edit="${c.id}">Edit</button>` : ''}
    </span></div>
    <div class="rng">${fmtDate(c.start)} → ${fmtDate(c.end)} · ${sp.icon} ${sp.label} · <span class="badge" style="color:var(--accent)">🎯 ${esc(MACRO_GOALS[goal] || goal)}</span></div>
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
    <label>Training goal <span class="sub">(picks the matching 📚 workout library — bike / run / swim)</span></label>
    <select id="c-goal">${Object.entries(MACRO_GOALS).map(([k, l]) => `<option value="${k}" ${inferMacroGoal(c) === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <div class="inline">
      <div><label>Start</label><input id="c-start" type="date" value="${c.start}"/></div>
      <div><label>End</label><input id="c-end" type="date" value="${c.end}"/></div>
    </div>
    <label>Target zones (comma separated, e.g. Z1, Z2)</label>
    <input id="c-zones" value="${esc((c.zones || []).join(', '))}" placeholder="Z1, Z2"/>
    <label>Notes / focus for this block</label>
    <textarea id="c-focus" placeholder="e.g. Aerobic base — Z1/Z2 running volume">${esc(c.focus || '')}</textarea>`;
  const foot = `${editing ? '<button class="btn danger" id="c-del">Delete</button>' : ''}<button class="btn primary" id="c-save">Save</button>`;
  openModal(editing ? 'Edit cycle' : 'New cycle', body, foot);
  $('#c-save').addEventListener('click', () => {
    const obj = {
      id: c.id || uid(), athleteId: state.currentAthleteId, type: $('#c-type').value,
      name: $('#c-name').value.trim() || CYCLE_TYPES[$('#c-type').value], sport: $('#c-sport').value,
      goal: $('#c-goal').value,
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
        const used = SCIENCE_CATALOG.filter(w => !w.generated && (w.refs || []).includes(k)).map(w => w.name);
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
  const wellness = (state.wellness || []).filter(w => w.athleteId === a.id).sort((x, y) => x.date.localeCompare(y.date)).slice(-30);
  const hrvArr = wellness.filter(w => w.hrv != null);
  const rhrArr = wellness.filter(w => w.restingHR != null);
  const lastHrv = hrvArr[hrvArr.length - 1], lastRhr = rhrArr[rhrArr.length - 1];

  v.innerHTML = `
    ${(hrvArr.length || rhrArr.length) ? `<div class="grid cols-2" style="margin-bottom:14px">
      <div class="card"><h3>HRV — last 30 days <span class="badge" style="color:var(--accent-2)">Intervals.icu</span></h3>${hrvArr.length ? sparkline(hrvArr.map(w => w.hrv)) + `<div class="sub" style="margin-top:8px">Latest ${lastHrv.hrv} ms (${fmtDate(lastHrv.date)}) · avg ${(hrvArr.reduce((n, w) => n + w.hrv, 0) / hrvArr.length).toFixed(0)} ms</div>` : '<div class="empty">No HRV data</div>'}</div>
      <div class="card"><h3>Resting HR — last 30 days <span class="badge" style="color:var(--accent-2)">Intervals.icu</span></h3>${rhrArr.length ? sparkline(rhrArr.map(w => w.restingHR)) + `<div class="sub" style="margin-top:8px">Latest ${lastRhr.restingHR} bpm (${fmtDate(lastRhr.date)}) · avg ${(rhrArr.reduce((n, w) => n + w.restingHR, 0) / rhrArr.length).toFixed(0)} bpm</div>` : '<div class="empty">No resting-HR data</div>'}</div>
    </div>` : ''}
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

/* ============================================================================
   RECOVERY / TRAINING READINESS  (HRV + resting HR + subjective feel + day notes)
   A daily training readiness score. Higher = more ready to train hard.
   ============================================================================ */
function readinessBand(s) {
  return s >= 67 ? { key: 'green', label: 'Ready to train', color: '#35c98b' }
    : s >= 34 ? { key: 'yellow', label: 'Moderate — train smart', color: '#f5c518' }
    : { key: 'red', label: 'Prioritise recovery', color: '#e50914' };
}
// Scan a day's notes for lifestyle factors that move readiness (bilingual EN/NL keywords).
function readinessNotesPenalty(text) {
  const t = (text || '').toLowerCase();
  const rules = [
    { re: /(alcohol|beer|bier|wine|wijn|drinks?|drank|dronk|pint|cava|cocktail|hangover|kater|pils)/, pen: 15, label: '🍺 alcohol' },
    { re: /(sick|ill\b|ziek|fever|koorts|flu|griep|\bcold\b|verkouden|infection|infectie)/, pen: 25, label: '🤒 illness' },
    { re: /(stress|stressed|gestrest|gestresseerd|anxious|angst|burn-?out|overwhelmed|druk)/, pen: 10, label: '😰 stress' },
    { re: /(travel|reizen|jetlag|flight|vlucht|airport|luchthaven)/, pen: 8, label: '✈️ travel' },
    { re: /(bad sleep|poor sleep|slecht geslapen|insomnia|niet geslapen|weinig geslapen|woke up|wakker)/, pen: 10, label: '🌙 poor sleep' },
    { re: /(late|laat|party|feest|uit geweest|out late|nachtje)/, pen: 6, label: '🕛 late night' }
  ];
  let pen = 0; const hits = [];
  rules.forEach(r => { if (r.re.test(t)) { pen += r.pen; hits.push(r.label); } });
  return { penalty: Math.min(35, pen), hits };
}
// Build a daily readiness score for the last `daysBack` days.
function computeReadiness(aid, daysBack = 30) {
  const wellness = (state.wellness || []).filter(w => w.athleteId === aid);
  const byW = {}; wellness.forEach(w => byW[w.date] = w);
  const bySleep = {}; state.checkins.sleep.filter(s => s.athleteId === aid).forEach(s => bySleep[s.date] = s);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const mean = a => a.length ? a.reduce((n, v) => n + v, 0) / a.length : null;
  const sd = (a, m) => a.length > 1 ? Math.sqrt(a.reduce((n, v) => n + (v - m) * (v - m), 0) / (a.length - 1)) : 0;
  const hVals = wellness.filter(w => w.hrv != null).map(w => w.hrv);
  const rVals = wellness.filter(w => w.restingHR != null).map(w => w.restingHR);
  const hMean = mean(hVals), hSd = sd(hVals, hMean || 0);
  const rMean = mean(rVals), rSd = sd(rVals, rMean || 0);

  const out = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = toISO(addDays(new Date(), -i));
    const w = byW[d], s = bySleep[d];
    const notes = state.dayNotes.filter(n => n.athleteId === aid && n.date === d);
    const np = readinessNotesPenalty(notes.map(n => n.text).join(' '));
    const parts = {}; const comps = [];
    if (w && w.hrv != null && hSd > 0) { const z = (w.hrv - hMean) / hSd; const sc = clamp(50 + 20 * z, 0, 100); parts.hrv = { value: w.hrv, base: Math.round(hMean), score: Math.round(sc), z }; comps.push({ score: sc, weight: 0.40 }); }
    if (w && w.restingHR != null && rSd > 0) { const z = (w.restingHR - rMean) / rSd; const sc = clamp(50 - 20 * z, 0, 100); parts.rhr = { value: w.restingHR, base: Math.round(rMean), score: Math.round(sc), z }; comps.push({ score: sc, weight: 0.25 }); }
    if (s) { const feel = Number(s.feel) || 0, qual = Number(s.quality) || 0, hrs = Number(s.hours) || 0; const hoursScore = clamp((hrs - 4) / 4 * 100, 0, 100); const subj = 0.5 * feel * 10 + 0.3 * qual * 10 + 0.2 * hoursScore; parts.subj = { feel, quality: qual, hours: hrs, score: Math.round(subj) }; comps.push({ score: subj, weight: 0.35 }); }
    if (!comps.length && !notes.length) continue;
    let score;
    if (comps.length) { const wsum = comps.reduce((n, c) => n + c.weight, 0); score = comps.reduce((n, c) => n + c.score * c.weight, 0) / wsum; }
    else score = 65; // notes-only day → mildly-positive default, then penalised
    score = clamp(score - np.penalty, 0, 100);
    parts.notes = { penalty: np.penalty, hits: np.hits, list: notes.map(n => n.text) };
    out.push({ date: d, score: Math.round(score), band: readinessBand(clamp(score, 0, 100)), parts, conf: parts.hrv ? 'high' : (comps.length ? 'medium' : 'low'), scored: comps.length > 0 });
  }
  return { days: out, hMean, rMean, hasHrv: hVals.length > 0, hasRhr: rVals.length > 0 };
}
function readinessArrow(good) { return good ? '<span style="color:var(--ok)">▲</span>' : '<span style="color:var(--bad)">▼</span>'; }

function viewRecovery() {
  const a = currentAthlete();
  const r = computeReadiness(a.id, 30);
  const v = $('#view');
  const today = todayISO();
  const todayEntry = r.days.find(d => d.date === today);
  const latest = todayEntry || r.days[r.days.length - 1];
  const hasSleepToday = state.checkins.sleep.some(s => s.athleteId === a.id && s.date === today);

  const intro = `<p class="sub">A daily <b style="color:var(--text)">Training Readiness</b> score (0–100) for ${esc(a.name)}, built from <b>HRV</b> and <b>resting HR</b> (from Intervals.icu), your <b>morning feeling &amp; sleep</b>, and that day's <b>notes</b> (e.g. alcohol, illness, stress lower it). A simple green / yellow / red readiness score.</p>`;

  if (!latest) {
    v.innerHTML = intro + `
      <div class="card" style="margin-top:12px">
        <h3>No readiness data yet</h3>
        <p class="sub">Readiness needs at least one of: HRV/resting-HR from Intervals.icu (Settings → connect), or a morning check-in.</p>
        ${!hasSleepToday ? `<div class="btn-row" style="margin-top:8px"><button class="btn primary" id="rec-checkin">Log this morning</button></div>` : ''}
      </div>`;
    if ($('#rec-checkin')) $('#rec-checkin').addEventListener('click', () => openSleepModal());
    return;
  }

  const b = latest.band;
  const p = latest.parts;
  const isToday = latest.date === today;
  const ringDeg = latest.score;
  const compRows = [];
  if (p.hrv) compRows.push(`<div class="row"><div class="grow"><div class="title">💓 HRV ${readinessArrow(p.hrv.z >= 0)} ${p.hrv.value} ms</div><div class="meta">baseline ${p.hrv.base} ms · ${p.hrv.z >= 0 ? 'above' : 'below'} your normal · sub-score ${p.hrv.score}/100</div></div></div>`);
  if (p.rhr) compRows.push(`<div class="row"><div class="grow"><div class="title">❤️ Resting HR ${readinessArrow(p.rhr.z <= 0)} ${p.rhr.value} bpm</div><div class="meta">baseline ${p.rhr.base} bpm · ${p.rhr.z <= 0 ? 'at/below' : 'elevated vs'} your normal · sub-score ${p.rhr.score}/100</div></div></div>`);
  if (p.subj) compRows.push(`<div class="row"><div class="grow"><div class="title">😌 Feeling &amp; sleep · ${p.subj.score}/100</div><div class="meta">felt ${p.subj.feel}/10 · sleep quality ${p.subj.quality}/10 · ${p.subj.hours}h</div></div></div>`);
  else compRows.push(`<div class="row"><div class="grow"><div class="title">😌 Feeling &amp; sleep</div><div class="meta">No morning check-in ${isToday ? 'today yet' : 'that day'}.</div></div>${isToday ? '<button class="btn sm primary" id="rec-checkin">Log now</button>' : ''}</div>`);
  if (p.notes && (p.notes.penalty || p.notes.list.length)) compRows.push(`<div class="row" style="border-left:3px solid ${p.notes.penalty ? 'var(--bad)' : 'var(--line)'}"><div class="grow"><div class="title">📌 Day notes ${p.notes.penalty ? `<span style="color:var(--bad)">−${p.notes.penalty}</span>` : ''}</div><div class="meta">${p.notes.list.length ? esc(p.notes.list.join(' · ')) : 'none'}${p.notes.hits.length ? ' · ' + p.notes.hits.join(', ') : ''}</div></div></div>`);

  // 30-day trend bars
  const trend = r.days.slice(-30);
  const bars = trend.map(d => `<span title="${fmtDate(d.date)}: ${d.score} (${d.band.label})" style="flex:1;min-width:4px;height:${Math.max(4, d.score)}%;background:${d.band.color};border-radius:3px 3px 0 0;opacity:${d.scored ? 1 : 0.5}"></span>`).join('');

  v.innerHTML = intro + `
    <div class="grid cols-2" style="margin:12px 0;align-items:stretch">
      <div class="card" style="display:flex;align-items:center;gap:18px">
        <div class="ring-wrap"><div class="ring" style="--p:${ringDeg};background:conic-gradient(${b.color} calc(${ringDeg}*1%), var(--line) 0)"><b>${latest.score}</b></div></div>
        <div>
          <div style="font-size:20px;font-weight:800;color:${b.color}">${b.label}</div>
          <div class="sub">${isToday ? 'Today' : fmtDate(latest.date)} · readiness ${latest.score}/100</div>
          <div class="sub" style="margin-top:6px">${b.key === 'green' ? 'Body is ready — a key/hard session is well-placed today.' : b.key === 'yellow' ? 'Train, but hold something back — aerobic or technique work over max efforts.' : 'Recovery day, easy Z1–Z2 or rest. Pushing hard now adds fatigue, not fitness.'}</div>
          <div class="sub" style="margin-top:6px;opacity:.8">Confidence: ${latest.conf}${latest.conf !== 'high' ? ' — connect Intervals.icu (HRV) for a sharper score' : ''}.</div>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:6px">Readiness bands</h3>
        <div class="list">
          <div class="row" style="border-left:3px solid #35c98b"><div class="grow"><div class="title" style="color:#35c98b">Green · 67–100</div><div class="meta">Recovered — ready to push</div></div></div>
          <div class="row" style="border-left:3px solid #f5c518"><div class="grow"><div class="title" style="color:#f5c518">Yellow · 34–66</div><div class="meta">Moderate — train smart</div></div></div>
          <div class="row" style="border-left:3px solid #e50914"><div class="grow"><div class="title" style="color:#e50914">Red · 0–33</div><div class="meta">Strained — prioritise recovery</div></div></div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>What drives ${isToday ? "today's" : 'this'} score</h3>
      <div class="list">${compRows.join('')}</div>
    </div>

    <div class="card" style="margin-top:16px">
      <h3>Readiness — last 30 days</h3>
      <div class="spark" style="height:120px;align-items:flex-end">${bars || '<span class="sub">No data</span>'}</div>
      <div class="legend" style="margin-top:8px">
        <span><i style="background:#35c98b"></i>Ready</span>
        <span><i style="background:#f5c518"></i>Moderate</span>
        <span><i style="background:#e50914"></i>Recovery</span>
        <span class="sub">faded bars = feeling/notes only (no HRV that day)</span>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <h3>How it's calculated</h3>
      <p class="sub">Readiness weights <b>HRV ~40%</b> (vs your rolling baseline — higher is better), <b>resting HR ~25%</b> (lower is better), and <b>morning feeling + sleep ~35%</b>, then subtracts a penalty for day-note factors (alcohol −15, illness −25, stress −10, poor sleep −10, travel −8, late night −6). Missing inputs are re-weighted across what's available. HRV/RHR baselines follow the approach validated for endurance monitoring ${refChip('plews')}.</p>
    </div>`;

  if ($('#rec-checkin')) $('#rec-checkin').addEventListener('click', () => openSleepModal());
}

/* Athlete → coach invitation: connect/disconnect the athlete to real coach accounts. */
async function renderCoachInvite() {
  const host = document.getElementById('coach-invite-body');
  if (!host) return;
  const a = currentAthlete(); if (!a) return;
  const coaches = await fetchCoachUsers();
  if (!document.getElementById('coach-invite-body')) return; // view changed while loading
  const linked = a.coachUids || [];
  const myLinked = coaches.filter(c => linked.includes(c.uid));
  const available = coaches.filter(c => !linked.includes(c.uid));
  host.innerHTML = `
    ${myLinked.length ? `<div style="margin-bottom:10px"><b style="color:var(--text)">Connected:</b> ${myLinked.map(c => `<span class="badge" style="margin:2px 4px">✅ ${esc(c.name)} <button class="x" data-disc="${c.uid}" title="Disconnect" style="font-size:16px;margin-left:2px">&times;</button></span>`).join('')}</div>` : '<div class="sub" style="margin-bottom:10px">Not connected to a coach yet.</div>'}
    ${available.length ? `<label>Connect with a coach</label>
      <div class="inline"><select id="coach-pick">${available.map(c => `<option value="${c.uid}">${esc(c.name)} · ${esc(c.email)}</option>`).join('')}</select>
      <button class="btn primary" id="coach-connect" style="flex:0 0 auto">Connect</button></div>` : (myLinked.length ? '' : '<div class="empty">No coaches have signed up yet.</div>')}`;
  const conn = document.getElementById('coach-connect');
  if (conn) conn.addEventListener('click', () => {
    const uid = document.getElementById('coach-pick').value;
    a.coachUids = a.coachUids || [];
    if (!a.coachUids.includes(uid)) a.coachUids.push(uid);
    save(); toast('Connected with your coach'); renderCoachInvite();
  });
  host.querySelectorAll('[data-disc]').forEach(b => b.addEventListener('click', () => {
    a.coachUids = (a.coachUids || []).filter(u => u !== b.dataset.disc);
    save(); toast('Disconnected'); renderCoachInvite();
  }));
}

/* ============================================================================
   TO-DO LISTS (coordinator) + SHARED CALENDAR + TEAM HUB
   ============================================================================ */
let USER_CACHE = [];               // cached {uid,name,email,role,title,bio}
function cacheUsers(list) { if (Array.isArray(list) && list.length) USER_CACHE = list; return list; }
function userName(uid) {
  const u = USER_CACHE.find(x => x.uid === uid); if (u) return u.name;
  const a = state.athletes.find(x => x.id === uid); if (a) return a.name;
  return uid === myUid() ? myName() : 'Someone';
}
// everyone who can be assigned a task / appears in the team hub (users + local athletes, de-duped)
function teamPeople() {
  const map = {};
  USER_CACHE.forEach(u => { map[u.uid] = { uid: u.uid, name: u.name, email: u.email, role: u.role, title: u.title, bio: u.bio }; });
  state.athletes.forEach(a => { if (!map[a.id]) map[a.id] = { uid: a.id, name: a.name, email: a.email || '', role: 'athlete', title: '', bio: '' }; });
  return Object.values(map).sort((x, y) => (x.name || '').localeCompare(y.name || ''));
}
function fmtTs(ts) { if (!ts) return ''; const d = new Date(ts); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' ' + d.toTimeString().slice(0, 5); }

/* ------------------------------ To-do view ------------------------------ */
function viewTodos() {
  const v = $('#view');
  const actions = $('#topbar-actions');
  const canCreate = isTeamRole(state.role);          // coach / coordinator / staff can assign tasks
  actions.innerHTML = canCreate ? `<button class="btn primary sm" id="add-todo">+ New task</button>` : '';
  // warm the user cache for names / assignee picker
  fetchAllUsers().then(list => { if (cacheUsers(list) && state.ui.view === 'todos') drawTodos(); });

  const me = myUid();
  function drawTodos() {
    const all = (state.todos || []).slice().sort((a, b) => (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99') || (b.ts || 0) - (a.ts || 0));
    const mine = all.filter(t => t.assigneeUid === me);
    const board = all;
    const openCount = all.filter(t => t.status !== 'done').length;

    v.innerHTML = `
      <p class="sub">${canCreate ? 'Create tasks with a deadline and assign them to anyone on the team. Each task also appears on that person’s calendar and on the <b>Shared Calendar</b>.' : 'Your tasks from the coordinator. Update your status so everyone can follow along.'}</p>

      <div class="section-title">My tasks ${mine.length ? `· ${mine.filter(t => t.status !== 'done').length} open` : ''}</div>
      <div class="list">
        ${mine.length ? mine.map(t => todoRow(t, true)).join('') : '<div class="empty">No tasks assigned to you 🎉</div>'}
      </div>

      ${canCreate ? `
      <div class="section-title" style="margin-top:22px">All tasks · ${openCount} open</div>
      <div class="list">
        ${board.length ? board.map(t => todoRow(t, t.assigneeUid === me)).join('') : '<div class="empty">No tasks yet. Tap “+ New task”.</div>'}
      </div>` : ''}`;

    bindTodoRows();
  }
  function bindTodoRows() {
    $$('[data-todo-open]').forEach(b => b.addEventListener('click', () => openTodoModal(b.dataset.todoOpen)));
    $$('[data-todo-status]').forEach(sel => sel.addEventListener('change', () => setTodoStatus(sel.dataset.todoStatus, sel.value)));
    $$('[data-todo-del]').forEach(b => b.addEventListener('click', () => { if (confirm('Delete this task?')) { Cloud.deleteTodo(b.dataset.todoDel); state.todos = (state.todos || []).filter(t => t.id !== b.dataset.todoDel); drawTodos(); } }));
  }
  drawTodos();
  if (canCreate && $('#add-todo')) $('#add-todo').addEventListener('click', () => openTodoModal(null, drawTodos));
  viewTodos._redraw = drawTodos;
}
function todoRow(t, canStatus) {
  const st = TODO_STATUS[t.status] || TODO_STATUS.todo;
  const canEdit = isTeamRole(state.role) || t.createdByUid === myUid();
  const overdue = t.status !== 'done' && t.due && t.due < todayISO();
  const statusSel = canStatus
    ? `<select data-todo-status="${t.id}" style="width:auto;padding:6px 8px;font-size:12px">${Object.entries(TODO_STATUS).map(([k, s]) => `<option value="${k}" ${t.status === k ? 'selected' : ''}>${s.icon} ${s.label}</option>`).join('')}</select>`
    : `<span class="badge" style="color:${st.color};border:1px solid ${st.color}">${st.icon} ${st.label}</span>`;
  return `<div class="row" style="border-left:3px solid ${st.color}">
    <div class="grow">
      <div class="title" style="${t.status === 'done' ? 'text-decoration:line-through;opacity:.7' : ''}">📋 ${esc(t.title)}</div>
      <div class="meta">${t.assigneeUid === myUid() ? 'You' : esc(t.assigneeName || userName(t.assigneeUid))}${t.due ? ` · <span style="color:${overdue ? 'var(--bad)' : 'var(--muted)'}">${overdue ? '⚠️ ' : '🎯 '}${fmtDate(t.due)}</span>` : ' · no deadline'}${t.createdByName ? ' · by ' + esc(t.createdByName) : ''}${t.desc ? ' · ' + esc(t.desc.slice(0, 60)) + (t.desc.length > 60 ? '…' : '') : ''}</div>
    </div>
    ${statusSel}
    ${canEdit ? `<button class="btn sm" data-todo-open="${t.id}">Edit</button><button class="btn sm danger" data-todo-del="${t.id}">×</button>` : ''}
  </div>`;
}
function setTodoStatus(id, status) {
  const t = (state.todos || []).find(x => x.id === id); if (!t) return;
  t.status = status; t.ts = t.ts || Date.now();
  Cloud.saveTodo(t);
  if (viewTodos._redraw) viewTodos._redraw();
  toast('Status: ' + (TODO_STATUS[status] || {}).label);
}
function openTodoModal(id, onDone) {
  const editing = id ? (state.todos || []).find(t => t.id === id) : null;
  const canEdit = !editing || isTeamRole(state.role) || editing.createdByUid === myUid();
  const t = editing || { id: uid(), title: '', desc: '', assigneeUid: myUid(), assigneeName: myName(), due: todayISO(), status: 'todo' };
  const dis = canEdit ? '' : 'disabled';
  const people = teamPeople();
  const opts = people.map(p => `<option value="${p.uid}" ${t.assigneeUid === p.uid ? 'selected' : ''}>${esc(p.name)}${p.role && p.role !== 'athlete' ? ' · ' + roleLabel(p.role) : ''}</option>`).join('')
    || `<option value="${t.assigneeUid}">${esc(t.assigneeName || 'Me')}</option>`;
  const body = `
    <label>Task</label>
    <input id="td-title" value="${esc(t.title)}" ${dis} placeholder="e.g. Book the sports hall for Saturday"/>
    <label>Details (optional)</label>
    <textarea id="td-desc" ${dis} placeholder="Any extra info…">${esc(t.desc || '')}</textarea>
    <div class="inline">
      <div><label>Assign to</label><select id="td-who" ${isTeamRole(state.role) ? '' : 'disabled'}>${opts}</select></div>
      <div><label>Deadline</label><input id="td-due" type="date" value="${t.due || ''}" ${dis}/></div>
    </div>
    <label>Status</label>
    <select id="td-status">${Object.entries(TODO_STATUS).map(([k, s]) => `<option value="${k}" ${t.status === k ? 'selected' : ''}>${s.icon} ${s.label}</option>`).join('')}</select>`;
  const foot = `${editing && canEdit ? '<button class="btn danger" id="td-del">Delete</button>' : ''}${canEdit ? '<button class="btn primary" id="td-save">Save task</button>' : ''}`;
  openModal(editing ? 'Task' : 'New task', body, foot);

  if ($('#td-save')) $('#td-save').addEventListener('click', () => {
    const whoSel = $('#td-who');
    const assigneeUid = whoSel ? whoSel.value : t.assigneeUid;
    const person = people.find(p => p.uid === assigneeUid);
    const obj = {
      id: t.id, title: $('#td-title').value.trim() || 'Task', desc: $('#td-desc').value.trim(),
      assigneeUid, assigneeName: person ? person.name : (t.assigneeName || userName(assigneeUid)),
      due: $('#td-due').value, status: $('#td-status').value,
      createdByUid: t.createdByUid || myUid(), createdByName: t.createdByName || myName(),
      createdByRole: t.createdByRole || state.role, ts: t.ts || Date.now()
    };
    if (editing) Object.assign(editing, obj); else (state.todos = state.todos || []).push(obj);
    Cloud.saveTodo(obj);
    save(); closeModal();
    if (onDone) onDone(); else render();
    toast('Task saved');
  });
  if ($('#td-del')) $('#td-del').addEventListener('click', () => {
    Cloud.deleteTodo(t.id); state.todos = (state.todos || []).filter(x => x.id !== t.id);
    save(); closeModal(); if (onDone) onDone(); else render(); toast('Task deleted');
  });
}

/* ------------------------------ Shared Calendar ------------------------- */
/* All to-do deadlines from the whole team on one calendar. No trainings here. */
function viewSharedCal() {
  const actions = $('#topbar-actions');
  actions.innerHTML = isTeamRole(state.role) ? `<button class="btn primary sm" id="add-todo-sc">+ New task</button>` : '';
  fetchAllUsers().then(list => { if (cacheUsers(list) && state.ui.view === 'sharedcal') drawSharedCal(); });
  if (state.ui.scMonth == null) { const t = new Date(); state.ui.scMonth = t.getMonth(); state.ui.scYear = t.getFullYear(); }
  drawSharedCal();
  if ($('#add-todo-sc')) $('#add-todo-sc').addEventListener('click', () => openTodoModal(null, drawSharedCal));
}
function drawSharedCal() {
  const v = $('#view');
  const m = state.ui.scMonth, y = state.ui.scYear;
  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const gridStart = addDays(first, -startOffset);
  const todos = (state.todos || []);

  let cells = '';
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const iso = toISO(d);
    const inMonth = d.getMonth() === m;
    const isToday = iso === todayISO();
    const day = todos.filter(t => t.due === iso).sort((a, b) => (a.assigneeName || '').localeCompare(b.assigneeName || ''));
    cells += `
      <div class="cal-cell ${inMonth ? '' : 'dim'} ${isToday ? 'today' : ''}">
        <div class="d"><span>${d.getDate()}</span></div>
        ${day.map(t => { const st = TODO_STATUS[t.status] || TODO_STATUS.todo; return `<div class="sess todo-chip" data-todo="${t.id}" style="border-left-color:${st.color};cursor:pointer"><div class="t">📋 ${esc(t.title)} <span class="check">${st.icon}</span></div><div class="m" style="color:${st.color}">${esc(t.assigneeName || userName(t.assigneeUid))}</div></div>`; }).join('')}
      </div>`;
  }

  v.innerHTML = `
    <p class="sub">Shared deadlines for the whole team — every to-do task on one calendar. Trainings are not shown here.</p>
    <div class="cal-head">
      <div class="btn-row">
        <button class="btn sm" id="sc-prev">‹</button>
        <button class="btn sm" id="sc-today">Today</button>
        <button class="btn sm" id="sc-next">›</button>
      </div>
      <h3 style="margin:0">${MONTHS[m]} ${y}</h3>
      <div class="btn-row">${Object.entries(TODO_STATUS).map(([k, s]) => `<span class="badge" style="color:${s.color}">${s.icon} ${s.label}</span>`).join('')}</div>
    </div>
    <div class="cal-grid">${DOW.map(d => `<div class="cal-dow">${d}</div>`).join('')}</div>
    <div class="cal-grid">${cells}</div>`;

  $('#sc-prev').addEventListener('click', () => { let mm = state.ui.scMonth - 1, yy = state.ui.scYear; if (mm < 0) { mm = 11; yy--; } state.ui.scMonth = mm; state.ui.scYear = yy; drawSharedCal(); });
  $('#sc-next').addEventListener('click', () => { let mm = state.ui.scMonth + 1, yy = state.ui.scYear; if (mm > 11) { mm = 0; yy++; } state.ui.scMonth = mm; state.ui.scYear = yy; drawSharedCal(); });
  $('#sc-today').addEventListener('click', () => { const t = new Date(); state.ui.scMonth = t.getMonth(); state.ui.scYear = t.getFullYear(); drawSharedCal(); });
  $$('.todo-chip').forEach(el => el.addEventListener('click', () => openTodoModal(el.dataset.todo, drawSharedCal)));
}

/* ------------------------------ Team hub -------------------------------- */
function viewTeam() {
  const v = $('#view');
  const actions = $('#topbar-actions');
  actions.innerHTML = '';
  v.innerHTML = `<p class="sub">Loading team…</p>`;
  fetchAllUsers().then(list => { cacheUsers(list); if (state.ui.view === 'team') drawTeam(); });
  drawTeam();
}
async function drawTeam() {
  const v = $('#view'); if (!v) return;
  const me = myUid();
  const people = teamPeople();
  const team = people.filter(p => isTeamRole(p.role));
  const athletes = people.filter(p => p.role === 'athlete');
  const canSeeAll = state.role === 'coach';   // only coaches see every athlete automatically

  // incoming access requests (people who want to see MY training)
  let incoming = [];
  try { incoming = await Cloud.myShareRequests(); } catch (e) {}

  v.innerHTML = `
    <p class="sub">Everyone on the team. ${canSeeAll ? 'Open an athlete to see all their trainings, add comments, and send them a notification.' : 'Request access to an athlete — once they approve, you can see their full training (calendar, recovery, everything they see) from the tabs on the left.'}</p>

    ${(state.role === 'staff' || state.role === 'coordinator' || state.role === 'crew') ? `<div class="card" style="margin-bottom:16px">
      <h3>My profile</h3>
      <div class="sub" style="margin-bottom:8px">${roleLabel(state.role)} · ${esc((Cloud.user && Cloud.user.email) || '')}</div>
      <div id="staff-profile"></div>
    </div>` : ''}

    ${incoming.length ? `<div class="card" style="margin-bottom:16px;border-color:var(--accent)">
      <h3>Access requests</h3>
      <p class="sub">These people asked to follow your training.</p>
      <div class="list">${incoming.map(r => `<div class="row"><div class="grow"><div class="title">${esc(r.fromName || userName(r.fromUid))}</div><div class="meta">${(r.fromRole === 'coach' || r.fromRole === 'both') ? 'wants to be your coach' : 'wants to see your workouts'}</div></div>
        <button class="btn sm primary" data-approve="${r.id}" data-fromuid="${r.fromUid}" data-fromrole="${esc(r.fromRole || '')}">Approve</button>
        <button class="btn sm danger" data-deny="${r.id}">Deny</button></div>`).join('')}</div>
    </div>` : ''}

    ${team.length ? `<div class="section-title">Coaches & staff</div>
    <div class="grid cols-3">${team.map(p => personCard(p, false)).join('')}</div>` : ''}

    <div class="section-title" style="margin-top:18px">Athletes</div>
    <div class="grid cols-3">${athletes.length ? athletes.map(p => {
      const canView = canSeeAll || p.uid === me || state.athletes.some(a => a.id === p.uid); // loaded = approved
      let canRequest = false;
      if (p.uid !== me) {
        if (state.role === 'coach') { const ath = state.athletes.find(a => a.id === p.uid); canRequest = !(ath && (ath.coachUids || []).includes(me)); } // coach: connect if not linked yet
        else canRequest = !canView;   // crew/athlete: request when not yet approved
      }
      return personCard(p, true, canView, canRequest);
    }).join('') : '<div class="empty">No athletes yet.</div>'}</div>`;

  // staff profile editor
  if ($('#staff-profile')) renderStaffProfile();

  $$('[data-view-ath]').forEach(b => b.addEventListener('click', () => {
    const uid = b.dataset.viewAth;
    if (state.role === 'coach' || state.role === 'crew') { state.currentAthleteId = uid; go('dashboard'); }  // full read-only view via the tabs
    else openAthletePanel(uid);   // athlete-to-athlete quick view
  }));
  $$('[data-req-ath]').forEach(b => b.addEventListener('click', async () => { await Cloud.requestAccess(b.dataset.reqAth); toast('Request sent'); }));
  $$('[data-del-person]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Remove ' + (b.dataset.delName || 'this person') + ' from the team? This deletes their profile and training data. This cannot be undone.')) return;
    await Cloud.deletePerson(b.dataset.delPerson);
    toast('Removed'); drawTeam();
  }));
  $$('[data-approve]').forEach(b => b.addEventListener('click', async () => { await Cloud.approveAccess(b.dataset.fromuid, b.dataset.approve, b.dataset.fromrole); toast('Approved'); drawTeam(); }));
  $$('[data-deny]').forEach(b => b.addEventListener('click', async () => { await Cloud.denyAccess(b.dataset.deny); toast('Denied'); drawTeam(); }));
}
function personCard(p, isAthlete, canView, canRequest) {
  const r = ROLES[p.role] || ROLES.athlete;
  const canRemove = state.role === 'coach' && p.uid && p.uid !== myUid();   // coaches manage the roster
  const btns = [];
  if (isAthlete) {
    if (canView) btns.push(`<button class="btn sm primary" data-view-ath="${p.uid}">View training</button>`);
    if (canRequest) btns.push(`<button class="btn sm" data-req-ath="${p.uid}">Request access</button>`);
  }
  if (canRemove) btns.push(`<button class="btn sm danger" data-del-person="${p.uid}" data-del-name="${esc(p.name)}">Remove</button>`);
  return `<div class="card">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:42px;height:42px;border-radius:50%;background:var(--panel-2);display:flex;align-items:center;justify-content:center;font-size:20px">${r.icon}</div>
      <div style="min-width:0"><div style="font-weight:700;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</div><div class="sub">${roleLabel(p.role)}${p.title ? ' · ' + esc(p.title) : ''}</div></div>
    </div>
    ${p.bio ? `<p class="sub" style="margin-top:8px">${esc(p.bio)}</p>` : ''}
    ${btns.length ? `<div class="btn-row" style="margin-top:10px">${btns.join('')}</div>` : ''}
  </div>`;
}
function renderStaffProfile() {
  const host = $('#staff-profile'); if (!host) return;
  const meP = USER_CACHE.find(u => u.uid === myUid()) || { name: myName(), title: '', bio: '' };
  host.innerHTML = `
    <div class="inline"><div><label>Name</label><input id="sp-name" value="${esc(meP.name || '')}"/></div>
      <div><label>Function / title</label><input id="sp-title" value="${esc(meP.title || '')}" placeholder="e.g. Physio, Team manager"/></div></div>
    <label>Short bio (optional)</label><textarea id="sp-bio" placeholder="What you do for the team…">${esc(meP.bio || '')}</textarea>
    <div class="btn-row" style="margin-top:10px"><button class="btn primary sm" id="sp-save">Save profile</button></div>`;
  $('#sp-save').addEventListener('click', async () => {
    const name = $('#sp-name').value.trim() || myName();
    const title = $('#sp-title').value.trim(), bio = $('#sp-bio').value.trim();
    await Cloud.saveMyProfile({ name, title, bio });
    const u = USER_CACHE.find(x => x.uid === myUid()); if (u) { u.name = name; u.title = title; u.bio = bio; } else USER_CACHE.push({ uid: myUid(), name, title, bio, role: state.role, email: (Cloud.user && Cloud.user.email) || '' });
    toast('Profile saved');
  });
}
// Read-only view of another person's training (team roles, or an approved athlete).
async function openAthletePanel(aid) {
  openModal('Training', '<div class="sub">Loading…</div>', '');
  let profile = null, sessions = [], wellness = [];
  const local = state.athletes.find(a => a.id === aid);
  if (local && athleteSessions(aid).length) { profile = local; sessions = athleteSessions(aid); wellness = (state.wellness || []).filter(w => w.athleteId === aid); }
  else {
    const doc = await Cloud.fetchAthleteDoc(aid);
    if (!doc) { const b = $('#modal-root .mbody'); if (b) b.innerHTML = '<div class="empty">No access to this athlete’s training, or nothing to show.</div>'; return; }
    profile = { id: aid, name: doc.name || userName(aid) };
    sessions = (doc.sessions || []).map(s => ({ ...s, athleteId: aid }));
    wellness = (doc.wellness || []).map(w => ({ ...w, athleteId: aid }));
    // stash so read-only session detail can find them
    state._panel = { aid, sessions, wellness };
  }
  const today = todayISO();
  const upcoming = sessions.filter(s => s.date >= today && s.status !== 'done').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  const recent = sessions.filter(s => s.status === 'done').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  const body = `
    <div class="sub" style="margin-bottom:8px">${esc(profile.name)}</div>
    <div class="section-title">Upcoming</div>
    <div class="list">${upcoming.length ? upcoming.map(s => panelSessionRow(s, aid)).join('') : '<div class="empty">Nothing planned.</div>'}</div>
    <div class="section-title">Recent (done)</div>
    <div class="list">${recent.length ? recent.map(s => panelSessionRow(s, aid)).join('') : '<div class="empty">No completed sessions.</div>'}</div>`;
  const b = $('#modal-root .mbody'); if (b) b.innerHTML = body;
  const h = $('#modal-root .mhead h3'); if (h) h.textContent = profile.name;
  $$('[data-panel-sess]').forEach(x => x.addEventListener('click', () => openReadonlySession(x.dataset.panelSess, aid, sessions, wellness)));
}
function panelSessionRow(s, aid) {
  const sp = SPORTS[s.sport] || SPORTS.other;
  const cc = sessionComments(s.id).length;
  return `<div class="row" style="cursor:pointer" data-panel-sess="${s.id}">
    <span class="dot" style="background:${sp.color}"></span>
    <div class="grow"><div class="title">${sp.icon} ${esc(s.name)} ${cc ? `💬${cc}` : ''} ${s.status === 'done' ? '<span class="badge" style="color:var(--ok)">✓</span>' : ''}</div>
    <div class="meta">${fmtDate(s.date)} · ${s.duration || 0} min · ${s.load || 0} TSS${s.rpe != null ? ' · RPE ' + s.rpe : ''}</div></div>
  </div>`;
}
function openReadonlySession(sid, aid, sessions, wellness) {
  const s = (sessions || []).find(x => x.id === sid) || state.sessions.find(x => x.id === sid); if (!s) return;
  const sp = SPORTS[s.sport] || SPORTS.other;
  const body = `
    <div class="sub" style="margin-bottom:8px">${sp.icon} ${esc(s.name)} · ${fmtDate(s.date)} · ${s.duration || 0} min · ${s.load || 0} TSS${s.rpe != null ? ' · RPE ' + s.rpe : ''}</div>
    ${s.desc ? `<p class="sub">${esc(s.desc)}</p>` : ''}
    ${(s.steps && s.steps.length) ? `<label>Workout profile</label>${workoutProfileSVG(s.steps)}<div style="margin-top:8px">${zoneDistHTML(s.steps)}</div>` : ''}
    <div id="postwork-block"></div>
    <div id="comments-block"></div>`;
  openModal(s.name || 'Session', body, '');
  renderPostWorkout(s, wellness);
  renderCommentsBlock('comments-block', s);
}

/* ------------------------------ Comments on a workout ------------------- */
function renderCommentsBlock(hostId, s) {
  const host = document.getElementById(hostId); if (!host) return;
  const draw = () => {
    const list = sessionComments(s.id).sort((a, b) => (a.ts || 0) - (b.ts || 0));
    host.innerHTML = `
      <label style="margin-top:14px">Comments — notes to complete during the session</label>
      <div class="list" style="margin-bottom:8px">
        ${list.length ? list.map(c => {
          const mine = c.authorUid === myUid();
          const canTick = state.role === 'athlete' || mine;
          return `<div class="row" style="border-left:3px solid ${c.done ? 'var(--ok)' : 'var(--accent)'}">
            <button class="btn sm" data-c-done="${c.id}" title="Mark done" ${canTick ? '' : 'disabled'} style="flex:0 0 auto">${c.done ? '✅' : '⬜'}</button>
            <div class="grow"><div class="title" style="${c.done ? 'text-decoration:line-through;opacity:.7' : ''}">${esc(c.text)}</div>
              <div class="meta">${esc(c.authorName || userName(c.authorUid))}${c.authorRole ? ' · ' + roleLabel(c.authorRole) : ''} · ${fmtTs(c.ts)}</div></div>
            ${mine || isTeamRole(state.role) ? `<button class="btn sm danger" data-c-del="${c.id}" style="flex:0 0 auto">×</button>` : ''}
          </div>`;
        }).join('') : '<div class="sub" style="padding:6px">No comments yet.</div>'}
      </div>
      <div class="chat-input"><input id="c-text" placeholder="Add a comment (e.g. ‘do 3rd interval at 300W’)…"/><button class="btn primary" id="c-send">Send</button></div>`;
    const send = () => {
      const t = ($('#c-text').value || '').trim(); if (!t) return;
      const c = { id: uid(), sessionId: s.id, athleteId: s.athleteId, text: t, authorUid: myUid(), authorName: myName(), authorRole: state.role, ts: Date.now(), done: false };
      (state.comments = state.comments || []).push(c); Cloud.saveComment(c); draw();
      // notify the athlete a comment landed on their workout
      if (isTeamRole(state.role) && s.athleteId && s.athleteId !== myUid()) Cloud.sendPush(s.athleteId, 'New comment on your workout 💬', myName() + ': ' + t.slice(0, 80));
    };
    $('#c-send').addEventListener('click', send);
    $('#c-text').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    host.querySelectorAll('[data-c-done]').forEach(b => b.addEventListener('click', () => { const c = state.comments.find(x => x.id === b.dataset.cDone); if (c) { c.done = !c.done; Cloud.saveComment(c); draw(); } }));
    host.querySelectorAll('[data-c-del]').forEach(b => b.addEventListener('click', () => { state.comments = state.comments.filter(x => x.id !== b.dataset.cDel); Cloud.deleteComment(b.dataset.cDel); draw(); }));
  };
  draw();
}

/* ------------------------------ Post-workout graphs --------------------- */
/* Renders Power / Speed / Altitude / HR streams (from Intervals.icu) + the day's HRV/RHR. */
function renderPostWorkout(s, wellness) {
  const host = document.getElementById('postwork-block'); if (!host) return;
  const st = s.streams || null;
  const w = (wellness || (state.wellness || [])).find(x => x.date === s.date && (x.athleteId === s.athleteId || !x.athleteId));
  const charts = [];
  if (st) {
    if (st.watts && st.watts.some(v => v != null)) charts.push(lineChartSVG(st.watts, '#3b30e6', 'Power', 'W', v => Math.round(v)));
    if (st.hr && st.hr.some(v => v != null)) charts.push(lineChartSVG(st.hr, '#e50914', 'Heart rate', 'bpm', v => Math.round(v)));
    if (st.speed && st.speed.some(v => v != null)) charts.push(lineChartSVG(st.speed.map(v => v == null ? null : v * 3.6), '#4cc9f0', 'Speed', 'km/h', v => v.toFixed(1)));
    if (st.alt && st.alt.some(v => v != null)) charts.push(lineChartSVG(st.alt, '#90be6d', 'Altitude', 'm', v => Math.round(v)));
  }
  const hrvLine = (w && (w.hrv != null || w.restingHR != null))
    ? `<div class="legend" style="margin-top:6px">${w.hrv != null ? `<span><i style="background:var(--accent)"></i>HRV ${w.hrv} ms</span>` : ''}${w.restingHR != null ? `<span><i style="background:var(--accent-2)"></i>Resting HR ${w.restingHR} bpm</span>` : ''} <span class="sub">(that day, from Intervals.icu)</span></div>` : '';
  if (!charts.length && !hrvLine) {
    host.innerHTML = s.status === 'done'
      ? `<div class="hint" style="margin-top:10px">📉 Power / speed / altitude / HR graphs appear here once Intervals.icu has synced this activity’s data.</div>`
      : '';
    return;
  }
  host.innerHTML = `<label style="margin-top:12px">Session data</label>${charts.join('')}${hrvLine}`;
}
// A single labelled line chart over a downsampled series (nulls allowed = gaps).
function lineChartSVG(series, color, label, unit, fmt) {
  const vals = series.filter(v => v != null && !isNaN(v));
  if (!vals.length) return '';
  const min = Math.min(...vals), max = Math.max(...vals), avg = vals.reduce((n, v) => n + v, 0) / vals.length;
  const W = 700, H = 90, pad = 6;
  const n = series.length;
  const x = i => pad + (i / (n - 1 || 1)) * (W - pad * 2);
  const y = v => H - pad - ((v - min) / ((max - min) || 1)) * (H - pad * 2);
  let d = '', pen = false;
  series.forEach((v, i) => { if (v == null || isNaN(v)) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `; pen = true; });
  return `<div style="margin-top:8px">
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><b style="color:var(--text)">${label}</b><span>avg ${fmt(avg)} · max ${fmt(max)} ${unit}</span></div>
    <div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="none" style="height:${H}px;display:block;background:var(--bg-2);border-radius:8px;min-width:260px"><path d="${d.trim()}" fill="none" stroke="${color}" stroke-width="1.6"/></svg></div>
  </div>`;
}

/* ------------------------------ Settings -------------------------------- */
function viewSettings() {
  const v = $('#view');
  const ivAthlete = currentAthlete();
  if (ivAthlete && !ivAthlete.intervals) ivAthlete.intervals = { athleteId: '', apiKey: '', lastSync: null };
  const iv = (ivAthlete && ivAthlete.intervals) || { athleteId: '', apiKey: '', lastSync: null };
  const nt = state.settings.notifications;
  const acctRoles = Cloud.accountRoles || (Cloud.accountRole ? rolesFromLegacy(Cloud.accountRole) : [state.role]);
  const addableRoles = ['coach', 'athlete', 'crew'].filter(r => !acctRoles.includes(r));
  v.innerHTML = `
    ${Cloud.user ? `<div class="card" style="max-width:640px;margin-bottom:16px">
      <h3>Account</h3>
      <p class="sub">Signed in as <b style="color:var(--text)">${esc(Cloud.user.email)}</b>.</p>
      <label>Your profiles</label>
      <div style="margin:2px 0 8px">${acctRoles.map(r => `<span class="badge" style="margin:2px 4px 2px 0">${(ROLES[r] || {}).icon || ''} ${esc(modeLabel(r))}</span>`).join('')}</div>
      ${acctRoles.length > 1 ? `<label>Active profile</label>
        <div class="seg2" id="acct-mode" style="flex-wrap:wrap">
          ${acctRoles.map(r => `<button data-mode="${r}" class="${state.role === r ? 'active' : ''}">${(ROLES[r] || {}).icon || ''} ${esc(modeLabel(r))}</button>`).join('')}
        </div>
        <div class="hint">One account, several profiles — switch anytime.</div>` : ''}
      ${addableRoles.length ? `<label style="margin-top:12px">Add another profile</label>
        <div class="btn-row">${addableRoles.map(r => `<button class="btn sm" data-addrole="${r}">+ ${esc(modeLabel(r))}</button>`).join('')}</div>
        <div class="hint">e.g. also become crew/coordinator, or start logging your own training.</div>` : ''}
      ${((state.role === 'coach' || state.role === 'crew') && rosterAthletes().length) ? `<label style="margin-top:12px">Viewing athlete</label>
        <select id="acct-athlete">${rosterAthletes().map(a => `<option value="${a.id}" ${a.id === state.currentAthleteId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>` : ''}
      <div class="btn-row" style="margin-top:14px"><button class="btn danger" id="acct-logout">Log out</button></div>
    </div>` : ''}
    ${(state.role === 'athlete' && Cloud.user) ? `<div class="card" style="max-width:640px;margin-bottom:16px">
      <h3>Your coach</h3>
      <p class="sub">Connect with your coach so they can see your training and program for you. Pick your coach below.</p>
      <div id="coach-invite-body" class="sub">Loading coaches…</div>
    </div>` : ''}
    <div class="card" style="max-width:640px">
      <h3>Intervals.icu connection — ${esc(ivAthlete ? ivAthlete.name : '')}</h3>
      <p class="sub">Full two-way sync, automatically every ~30 min: planned workouts ⇄ Intervals calendar, completed activities ← Intervals (marks sessions done with real load & zones), plus daily <b>HRV</b> and <b>resting HR</b> ← Intervals (shown in Monitoring). Create an API key in Intervals.icu → Settings → Developer, and find the Athlete ID there too (e.g. i12345).</p>
      <label>Athlete ID</label><input id="iv-id" value="${esc(iv.athleteId || '')}" placeholder="i12345"/>
      <label>API key</label><input id="iv-key" type="password" value="${esc(iv.apiKey || '')}" placeholder="Paste your API key"/>
      <div class="hint">Stored securely in your team's private cloud so the sync server can use it. TAC ⇄ Intervals.icu.</div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn primary" id="iv-save">Save connection</button>
      </div>
      <div class="sub" style="margin-top:10px">${iv.apiKey ? '✅ Connected — syncs automatically.' : 'Not connected yet.'} ${iv.lastSync ? '· Last sync: ' + esc(iv.lastSync) : ''}</div>
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
  $$('[data-addrole]').forEach(b => b.addEventListener('click', () => Cloud.addRole(b.dataset.addrole)));
  if ($('#acct-athlete')) $('#acct-athlete').addEventListener('change', (e) => { state.currentAthleteId = e.target.value; save(); render(); });
  if ($('#coach-invite-body')) renderCoachInvite();

  $('#iv-save').addEventListener('click', () => {
    if (!ivAthlete) return;
    ivAthlete.intervals = { athleteId: $('#iv-id').value.trim(), apiKey: $('#iv-key').value.trim(), lastSync: iv.lastSync || null };
    save(); viewSettings(); toast('Intervals connection saved');
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
  // Post-session: a session completed TODAY still missing RPE (never nags about past days)
  if (nt.postSession && !alreadyFired('post')) {
    const pending = athleteSessions(a.id).some(s => s.status === 'done' && s.rpe == null && s.date === todayISO());
    if (pending) { notify('How was your training? 💪', 'Add your RPE and how you felt after today\'s session.'); markFired('post'); }
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
  enabled: false, auth: null, db: null, user: null, role: null, accountRole: null, accountRoles: null, myUid: null,
  applyingRemote: false, ready: false, saveTimer: null,
  pendingAthletes: null, sharedDirty: false, unsub: null, pendingSignup: null,

  PROFILE_KEYS: ['name', 'email', 'sport', 'ftp', 'maxHr', 'thresholdHr', 'thresholdPace', 'powerZones', 'hrZones', 'paceZones', 'coachIds', 'coachUids', 'viewers', 'ownerUid', 'intervals'],
  ATH_COLLECTIONS: ['sessions', 'tests', 'cycles', 'messages', 'dayNotes', 'nutrition', 'goals', 'responses', 'wellness'],

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
    // an account can hold several profiles (roles); read the list (or derive from the legacy role)
    const uref = this.db.collection('users').doc(this.myUid);
    let roles = null;
    try { const s = await uref.get(); if (s.exists) { const d = s.data(); roles = (Array.isArray(d.roles) && d.roles.length) ? d.roles.slice() : (d.role ? rolesFromLegacy(d.role) : null); } } catch (e) {}
    if (!roles && this.pendingSignup) roles = rolesFromLegacy(this.pendingSignup.role);
    if (!roles) roles = ['coach'];
    if (this.user.email === OWNER_EMAIL) roles = Array.from(new Set([...roles, 'coach', 'athlete'])); // owner is always coach+athlete
    this.accountRoles = roles;
    this.accountRole = accountRoleLabel(roles);           // legacy label for older checks
    try { await uref.set({ email: this.user.email, name: this.user.displayName || (this.pendingSignup && this.pendingSignup.name) || '', roles, role: this.accountRole, lastSeen: Date.now() }, { merge: true }); } catch (e) {}
    this.pendingSignup = null;

    const mode = (state.viewMode && roles.includes(state.viewMode)) ? state.viewMode : primaryMode(roles);
    await this.switchTo(mode);

    checkReminders();
    if (!this._interval) { this._interval = setInterval(checkReminders, 5 * 60 * 1000); document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminders(); }); }
  },

  // switch the ACTIVE profile: coach (all athletes) / athlete (own) / crew (approved athletes only)
  async switchTo(mode) {
    this.teardown();
    this.role = mode; state.role = mode; state.viewMode = mode;
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    render();
    if (mode === 'coach') { await this.migrateIfNeeded(); this.subscribeCoach(); }
    else if (mode === 'crew') { this.subscribeCrew(); }
    else { await this.ensureAthleteDoc(); this.subscribeAthlete(); }
  },
  setMode(mode) {
    if (mode === this.role) return;
    if (!this.accountRoles || !this.accountRoles.includes(mode)) { toast('That profile isn’t on this account'); return; }
    this.switchTo(mode);
    toast(mode === 'coach' ? 'Coaching mode' : mode === 'crew' ? 'Crew mode' : 'My-training mode');
  },
  // add another profile (role) to this account — e.g. a coach also becoming crew/coordinator
  async addRole(r) {
    if (!this.enabled || !this.user) return;
    this.accountRoles = Array.from(new Set([...(this.accountRoles || []), r]));
    this.accountRole = accountRoleLabel(this.accountRoles);
    try { await this.db.collection('users').doc(this.myUid).set({ roles: this.accountRoles, role: this.accountRole }, { merge: true }); }
    catch (e) { toast('Error: ' + (e.code || e.message)); return; }
    if (r === 'athlete') { try { await this.ensureAthleteDoc(); } catch (e) {} }
    toast('Added ' + modeLabel(r) + ' profile'); render();
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
    // remember which server-synced items we've loaded, so a local save never wipes items the
    // sync server added behind our back (e.g. Intervals imports).
    this.knownIds = { sessions: new Set(state.sessions.map(x => x.id)), wellness: new Set((state.wellness || []).map(x => x.id)) };
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
    this.unsub = [u1, u2, ...this.subExtras()];
  },

  // ---- crew (medewerker): sees ONLY athletes who approved them (viewers array-contains my uid) ----
  subscribeCrew() {
    const q = this.db.collection('athletes').where('viewers', 'array-contains', this.myUid);
    const u1 = q.onSnapshot(qs => {
      if (qs.metadata.hasPendingWrites) return;
      this.applyingRemote = true;
      this.loadFromDocs(qs.docs.map(d => ({ id: d.id, data: d.data() })));
      if (!state.athletes.find(a => a.id === state.currentAthleteId)) state.currentAthleteId = (state.athletes[0] || {}).id;
      this.applyingRemote = false; this.ready = true;
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      this.reRender();
    }, err => { this.ready = true; this.reRender(); });
    const u2 = this.db.collection('shared').doc('coach').onSnapshot(s => {
      if (s.metadata.hasPendingWrites || !s.exists) return;
      this.applyingRemote = true; this.applyShared(s.data()); this.applyingRemote = false; this.reRender();
    }, () => {});
    this.unsub = [u1, u2, ...this.subExtras()];
  },

  // ---- shared team collections: todos + workout comments (everyone reads) ----
  subExtras() {
    const uT = this.db.collection('todos').onSnapshot(qs => {
      if (qs.metadata.hasPendingWrites) return;
      state.todos = qs.docs.map(d => ({ id: d.id, ...d.data() }));
      this.reRender();
    }, () => {});
    const uC = this.db.collection('comments').onSnapshot(qs => {
      if (qs.metadata.hasPendingWrites) return;
      state.comments = qs.docs.map(d => ({ id: d.id, ...d.data() }));
      this.reRender();
    }, () => {});
    return [uT, uC];
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
    this.unsub = [u1, u2, ...this.subExtras()];
  },

  // ---- writes ----
  push() {
    if (!this.enabled || !this.user || this.applyingRemote || !this.ready) return;
    // Only coach & athlete modes own athlete-doc writes; staff/coordinator are read-only on athletes.
    const canWriteAthlete = this.role === 'coach' || this.role === 'athlete';
    if (canWriteAthlete && state.currentAthleteId) this.pendingAthletes.add(state.currentAthleteId);
    if (this.role === 'coach') this.sharedDirty = true;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.flush(), 700);
  },
  flush() {
    this.pendingAthletes.forEach(aid => {
      const a = state.athletes.find(x => x.id === aid);
      const ref = this.db.collection('athletes').doc(aid);
      if (!a) { if (this.role === 'coach') ref.delete().catch(() => {}); return; }
      const base = this.athleteDoc(a, aid);
      // merge-write in a transaction: keep any server-added sessions/wellness we never loaded
      this.db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists) {
          const rem = snap.data();
          // Sessions: keep the local copy, but never lose feedback/sync fields already set remotely,
          // and keep any server-added session we never loaded.
          base.sessions = base.sessions || [];
          const remSess = {}; (rem.sessions || []).forEach(x => { if (x && x.id) remSess[x.id] = x; });
          const localIds = new Set();
          base.sessions = base.sessions.map(local => {
            localIds.add(local.id);
            const r = remSess[local.id]; if (!r) return local;
            const m = { ...local };
            if (m.rpe == null && r.rpe != null) m.rpe = r.rpe;
            if (!m.feltNote && r.feltNote) m.feltNote = r.feltNote;
            if ((!m.actual || !m.actual.length) && r.actual && r.actual.length) m.actual = r.actual;
            if (!m.intervalsActivityId && r.intervalsActivityId) m.intervalsActivityId = r.intervalsActivityId;
            if (!m.intervalsEventId && r.intervalsEventId) m.intervalsEventId = r.intervalsEventId;
            if (!m.streams && r.streams) m.streams = r.streams;   // server-fetched activity graphs
            if (!m.streamsChecked && r.streamsChecked) m.streamsChecked = r.streamsChecked;
            if (r.status === 'done' && m.status !== 'done') m.status = 'done';
            return m;
          });
          const knownS = (this.knownIds && this.knownIds.sessions) || new Set();
          (rem.sessions || []).forEach(item => { if (item && item.id && !localIds.has(item.id) && !knownS.has(item.id)) base.sessions.push(item); });
          // Wellness: keep any server-added entry we never loaded.
          base.wellness = base.wellness || [];
          const localW = new Set(base.wellness.map(x => x.id));
          const knownW = (this.knownIds && this.knownIds.wellness) || new Set();
          (rem.wellness || []).forEach(item => { if (item && item.id && !localW.has(item.id) && !knownW.has(item.id)) base.wellness.push(item); });
          // Check-ins are append-only logs (sleep / RPE feedback / weekly) — union by id so none are lost.
          if (rem.checkins) {
            base.checkins = base.checkins || { sleep: [], session: [], weekly: [] };
            ['sleep', 'session', 'weekly'].forEach(kk => {
              base.checkins[kk] = base.checkins[kk] || [];
              const have = new Set(base.checkins[kk].map(x => x.id));
              (rem.checkins[kk] || []).forEach(item => { if (item && item.id && !have.has(item.id)) base.checkins[kk].push(item); });
            });
          }
        }
        tx.set(ref, base);
      }).catch(e => toast('Sync error: ' + e.message));
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

  // ---- todos (shared collection) ----
  saveTodo(t) {
    if (!this.enabled || !this.user) return;
    const { id, ...rest } = t;
    this.db.collection('todos').doc(id).set(rest, { merge: true }).catch(e => toast('Task sync error: ' + (e.code || e.message)));
    // let the assignee know a new/updated task landed on their plate
    if (t.assigneeUid && t.assigneeUid !== this.myUid && t.createdByUid === this.myUid) {
      this.sendPush(t.assigneeUid, '📋 New task: ' + (t.title || 'Task'), (t.due ? 'Deadline ' + t.due + ' · ' : '') + 'from ' + (t.createdByName || myName()));
    }
  },
  deleteTodo(id) { if (this.enabled && this.user) this.db.collection('todos').doc(id).delete().catch(() => {}); },

  // ---- workout comments (shared collection) ----
  saveComment(c) {
    if (!this.enabled || !this.user) return;
    const { id, ...rest } = c;
    this.db.collection('comments').doc(id).set(rest, { merge: true }).catch(e => toast('Comment sync error: ' + (e.code || e.message)));
  },
  deleteComment(id) { if (this.enabled && this.user) this.db.collection('comments').doc(id).delete().catch(() => {}); },

  // ---- read another athlete's doc (team roles, or an approved viewer) ----
  async fetchAthleteDoc(aid) {
    if (!this.enabled || !this.user) return null;
    try { const s = await this.db.collection('athletes').doc(aid).get(); return s.exists ? s.data() : null; }
    catch (e) { return null; }
  },

  // ---- athlete ↔ athlete access requests ----
  async requestAccess(toUid) {
    if (!this.enabled || !this.user) return;
    const id = this.myUid + '_' + toUid;
    const asCoach = this.role === 'coach';
    try {
      await this.db.collection('shareRequests').doc(id).set({ fromUid: this.myUid, fromName: myName(), fromRole: this.role, toUid, ts: Date.now(), status: 'pending' });
      this.sendPush(toUid, '👀 Access request', myName() + (asCoach ? ' would like to coach you.' : ' wants to follow your training.'));
    } catch (e) { toast('Request failed: ' + (e.code || e.message)); }
  },
  async myShareRequests() {
    if (!this.enabled || !this.user) return [];
    try { const qs = await this.db.collection('shareRequests').where('toUid', '==', this.myUid).where('status', '==', 'pending').get(); return qs.docs.map(d => ({ id: d.id, ...d.data() })); }
    catch (e) { return []; }
  },
  async approveAccess(fromUid, reqId, fromRole) {
    const a = state.athletes.find(x => x.id === this.myUid);
    if (a) {
      a.viewers = a.viewers || []; if (!a.viewers.includes(fromUid)) a.viewers.push(fromUid);
      // a coach requester also becomes one of the athlete's coaches (shows in their roster)
      if (fromRole === 'coach' || fromRole === 'both') { a.coachUids = a.coachUids || []; if (!a.coachUids.includes(fromUid)) a.coachUids.push(fromUid); }
      save();
    }
    try { await this.db.collection('shareRequests').doc(reqId).set({ status: 'approved' }, { merge: true }); } catch (e) {}
    this.sendPush(fromUid, '✅ Access granted', myName() + ' approved your request.');
  },
  async denyAccess(reqId) { try { await this.db.collection('shareRequests').doc(reqId).set({ status: 'denied' }, { merge: true }); } catch (e) {} },

  // ---- staff / coordinator profile (stored on the users doc) ----
  async saveMyProfile(p) {
    if (!this.enabled || !this.user) return;
    try { await this.db.collection('users').doc(this.myUid).set({ name: p.name, title: p.title || '', bio: p.bio || '', role: this.accountRole || state.role, email: this.user.email, lastSeen: Date.now() }, { merge: true }); if (this.user.displayName !== p.name) this.user.updateProfile({ displayName: p.name }).catch(() => {}); }
    catch (e) { toast('Profile error: ' + (e.code || e.message)); }
  },

  // ---- notifications (any direction) via the push queue ----
  sendPush(target, title, body) {
    if (!this.enabled || !this.user) return;
    this.db.collection('pushQueue').add({ title, body, target: target || 'all', createdAt: Date.now(), sent: false, byUid: this.myUid, byName: myName(), byRole: state.role }).catch(() => {});
  },

  // ---- coach removes a person from the team (deletes their athlete + user docs) ----
  async deletePerson(uid) {
    if (!this.enabled || !this.user || !uid) return;
    try { await this.db.collection('athletes').doc(uid).delete(); } catch (e) {}
    try { await this.db.collection('users').doc(uid).delete(); } catch (e) { toast('Profile needs updated rules to delete: ' + (e.code || e.message)); }
    state.athletes = (state.athletes || []).filter(a => a.id !== uid);
    if (typeof USER_CACHE !== 'undefined') USER_CACHE = USER_CACHE.filter(u => u.uid !== uid);
    if (state.currentAthleteId === uid) state.currentAthleteId = (state.athletes[0] || {}).id;
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
          <div class="role-pick" style="flex-wrap:wrap">
            <button type="button" class="rolebtn active" data-arole="coach" style="flex:1 1 45%"><span class="ic">🧑‍🏫</span><b>Coach</b><small>Programs & follows athletes</small></button>
            <button type="button" class="rolebtn" data-arole="athlete" style="flex:1 1 45%"><span class="ic">🏃</span><b>Athlete</b><small>Follows my own plan</small></button>
            <button type="button" class="rolebtn" data-arole="both" style="flex:1 1 45%"><span class="ic">🧑‍🏫🏃</span><b>Coach & athlete</b><small>Coaches and trains</small></button>
            <button type="button" class="rolebtn" data-arole="crew" style="flex:1 1 45%"><span class="ic">🤝</span><b>Crew</b><small>Supports the team</small></button>
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
