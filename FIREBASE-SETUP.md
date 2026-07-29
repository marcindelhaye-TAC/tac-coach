# Firebase instellen (gedeelde cloud + logins)

Dit zet de gratis online database op zodat coaches en atleten vanaf verschillende toestellen
samen live kunnen werken, elk met een eigen login. Jij doet stappen 1–5 één keer; daarna plak
je mij de config en wire ik de app.

## 1. Project aanmaken
- Ga naar **https://console.firebase.google.com** en log in met je Google-account.
- Klik **Add project** → naam bv. `tac-coach` → **Continue**.
- Google Analytics mag je **uitzetten** (niet nodig) → **Create project** → wacht → **Continue**.

## 2. Logins aanzetten (e-mail + wachtwoord)
- Linkermenu: **Build → Authentication** → **Get started**.
- Tabblad **Sign-in method** → klik **Email/Password** → zet **Enable** aan → **Save**.

## 3. Database aanmaken
- Linkermenu: **Build → Firestore Database** → **Create database**.
- Kies locatie **eur3 (europe-west)** (of dichtstbij) → **Next**.
- Kies **Start in production mode** → **Create**. (De toegangsregels zet ik later met je op.)

## 4. Web-app registreren en config kopiëren
- Klik linksboven op het **tandwiel ⚙ → Project settings**.
- Scroll naar **Your apps** → klik het **web-icoon `</>`**.
- Nickname bv. `tac-coach web` → **Register app** (Hosting NIET aanvinken).
- Je krijgt een codeblok met `const firebaseConfig = { ... }`.

## 5. Plak die config in de chat
Kopieer het hele `firebaseConfig`-blok (apiKey, authDomain, projectId, enz.) en plak het hier
in de chat. Deze sleutels zijn **veilig om te delen** — het zijn publieke client-sleutels; de
beveiliging zit in de login + toegangsregels die ik daarna instel.

Voorbeeld van wat je plakt:
```js
const firebaseConfig = {
  apiKey: "AIza........",
  authDomain: "tac-coach.firebaseapp.com",
  projectId: "tac-coach",
  storageBucket: "tac-coach.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Wat er daarna gebeurt (door mij)
- Login/registratie-scherm in de app (elke coach/atleet maakt een eigen account).
- Alle data verhuist naar Firestore en synchroniseert realtime tussen toestellen.
- Toegangsregels: een atleet ziet enkel de eigen data; een coach ziet zijn/haar toegewezen
  atleten. Ik geef je de regels om in de Firebase-console te plakken.
- Testen en live zetten op dezelfde link.
