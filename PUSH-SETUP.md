# Gratis push-meldingen naar de gsm van atleten — setup

Doel: meldingen die je als coach instelt, komen echt op de telefoon van je atleten binnen,
ook als de app dicht is. We gebruiken **Firebase Cloud Messaging (FCM)** om te ontvangen en een
**gratis geplande GitHub-taak** om te versturen. Geen maandkost.

Jij doet stap A en B één keer. Daarna bouw ik de rest en testen we samen.

---

## Stap A — VAPID-sleutel (Web Push certificate)  ← geef deze aan mij
1. Firebase-console → **⚙ Project settings**.
2. Tabblad **Cloud Messaging**.
3. Scroll naar **Web Push certificates** → klik **Generate key pair**.
4. Er verschijnt een sleutel (een lange tekst die met `B...` begint).
5. **Kopieer die sleutel en plak ze in de chat.** (Deze is publiek/veilig — hij komt in de app.)

---

## Stap B — Service-account sleutel (voor de verzender)  ← GEHEIM, niet in chat
1. Firebase-console → **⚙ Project settings** → tabblad **Service accounts**.
2. Klik **Generate new private key** → **Generate**. Er downloadt een **.json**-bestand.
3. Dit is een **geheim** — plak het NIET in de chat. We zetten het veilig in GitHub:
   - Ga naar je repo: **https://github.com/marcindelhaye-TAC/tac-coach**
   - **Settings** (van de repo) → links **Secrets and variables → Actions**.
   - Klik **New repository secret**.
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Secret:** open het gedownloade .json-bestand met Kladblok, kopieer **de volledige inhoud**,
     en plak die in het veld.
   - Klik **Add secret**.

---

## Wat ik daarna bouw
- In de app: atleten (en coaches) krijgen een knop **"Meldingen op deze telefoon aanzetten"** die
  de telefoon aanmeldt voor push (FCM-token, opgeslagen bij de atleet).
- Een `firebase-messaging-sw.js` om meldingen op de achtergrond te tonen.
- Een **GitHub-taak** (draait automatisch elk kwartier) die kijkt welke reminders "due" zijn en
  ze naar de juiste telefoons stuurt — plus je "verstuur nu"-knop voor eenmalige meldingen.

## Belangrijk voor iPhone
Web-push werkt op iPhone alleen als:
- de app via Safari op het **beginscherm** staat ("Zet op beginscherm"), en
- iOS **16.4 of nieuwer** is, en
- de atleet toestemming voor meldingen geeft.
(Op Android/pc werkt het ook gewoon in de browser.)
