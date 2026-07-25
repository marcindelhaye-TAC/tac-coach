# Tour Against Cancer — Coach

An endurance coaching & athlete-monitoring app that works as both a **website** and an
**installable app** (PWA) on MacBook, iPhone, HP/Windows, and Android. No accounts, no
build tools — everything is saved on the device. Includes an Export/Import backup.

## What it does
- **Calendar** (Intervals.icu-style) — schedule sessions; athletes **drag & drop** to reschedule.
- **Sports** — biking, running, walking, swimming, strength, injury prevention, stretching, other.
- **Workout builder** + reusable template library; **strength** with sets/reps/weight/rest.
- **Custom questionnaires** — build your own (scale / multiple-choice / text); review responses.
- **Testing** — log test moments & results per athlete (FTP, VO₂max, lactate, time trials, field
  tests…), with extra metrics, notes, and automatic progress vs. the previous test. Optionally
  push a result straight into the athlete's FTP / threshold HR.
- **Check-ins** — morning **sleep**, post-session **RPE (1–10) + how you felt**, weekly **reflection**.
- **Physiology zones** — editable Power / HR / Pace zones + FTP, threshold HR, max HR per athlete.
- **Monitoring** dashboard — sleep, RPE, and wellness trends.
- **Intervals.icu** — connection screen (athlete ID + API key) ready for live sync.
- Coach / Athlete role switch (top-left).

## Run it as a website (any computer)
From this folder:

```bash
python -m http.server 8791
```

Then open http://127.0.0.1:8791/index.html . (A local server is needed for install/offline;
double-clicking `index.html` also works for basic use.) To use it from phones, host the folder
on any static host (Netlify, GitHub Pages, your own server) — then open that URL.

## Install as an app
- **iPhone/iPad (Safari):** Share → “Add to Home Screen”.
- **Android (Chrome):** menu → “Install app”.
- **Mac/Windows (Chrome/Edge):** install icon in the address bar.

It then opens full-screen like a native app and works offline.

## Files
- `index.html`, `styles.css`, `app.js` — the app
- `manifest.webmanifest`, `sw.js` — makes it installable + offline
- `icons/logo.svg` — the Tour Against Cancer logo

## Notes / next steps
- Intervals.icu **live two-way sync** needs a tiny backend connector (browsers block direct
  cross-site API calls). The Settings screen already stores your credentials and the sync
  hook is stubbed and ready to wire up.
- For multi-user accounts with shared coach/athlete data across devices, a backend would be
  the next step.
