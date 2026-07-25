# Publishing TAC Coach to the App Store (and Google Play)

The app is already wrapped as a native project with **Capacitor**. The same web app becomes a
real iOS and Android binary. Follow these steps **on your MacBook** for iOS. Android can be
done on the Mac or your Windows PC.

> **What only you can do:** create the developer accounts, pay the fees, and submit under your
> own Apple/Google identity. Those steps require your identity and payment, so they can't be
> automated.

---

## 0. One-time accounts (do these first)
- **Apple Developer Program** — https://developer.apple.com/programs/ — ~€99/year. Needed to
  put anything in the Apple App Store. Sign up with your Apple ID.
- **Google Play Console** (optional, for Android) — https://play.google.com/console — ~€25 once.

---

## 1. Install tools on the MacBook
- **Xcode** — from the Mac App Store (free, large download).
- **Node.js LTS** — https://nodejs.org (the “LTS” button).
- **CocoaPods** — open Terminal and run:
  ```bash
  sudo gem install cocoapods
  ```

Copy this whole `EnduranceCoachApp` folder onto the MacBook (USB, AirDrop, cloud, or Git).

---

## 2. Build the iOS app
Open Terminal, `cd` into the folder, then:

```bash
npm install
npx cap add ios
npx capacitor-assets generate --iconBackgroundColor '#12141c'
npx cap sync ios
npx cap open ios
```

The last command opens the project in **Xcode**.

In Xcode:
1. Select the **App** target → **Signing & Capabilities** → set **Team** to your Apple
   Developer account (Xcode auto-creates the signing certificate).
2. Confirm **Bundle Identifier** is `be.touragainstcancer.coach` (change it if you prefer;
   it must be unique across the App Store).
3. Set a **Display Name** ("TAC Coach") and **Version** (1.0) / **Build** (1).
4. Pick **Any iOS Device** (top bar) → menu **Product → Archive**.
5. When the Organizer opens → **Distribute App → App Store Connect → Upload**.

---

## 3. Create the App Store listing
Go to **https://appstoreconnect.apple.com** → **Apps → +** → **New App**:
- Platform: iOS · Name: **TAC Coach** (or "Tour Against Cancer Coach") · Bundle ID: the one above.
- Fill in: description, keywords, support URL, **screenshots** (take them from the running app
  or the iOS Simulator), and a **privacy policy URL** (required — see note below).
- Under **Build**, select the build you uploaded in step 2.
- **App Privacy**: data is stored only on the device and not collected → answer accordingly.
- **Submit for Review**. Apple review typically takes 1–3 days.

**Privacy policy:** Apple requires a URL. Since the app stores everything locally and collects
nothing, a one-page policy saying that is enough. I can write it for you and we can host it free
(e.g. GitHub Pages) — just ask.

---

## 4. (Optional) Google Play — Android
On the Mac or Windows PC (needs **Android Studio** from https://developer.android.com/studio):

```bash
npm install
npx cap add android
npx capacitor-assets generate --iconBackgroundColor '#12141c'
npx cap sync android
npx cap open android
```

In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)** (create
a keystore when prompted and **keep it safe** — you need it for every future update). Then in the
**Play Console**: create the app, upload the `.aab`, fill in the listing, and roll out.

---

## Updating the app later
Whenever the web app (`www/`) changes:

```bash
npx cap sync
```

then re-archive in Xcode / re-build in Android Studio, bump the version, and upload again.

---

## Icons
`resources/icon-only.svg` is your logo. `capacitor-assets generate` turns it into every icon
size the stores need. For best results you can drop a **1024×1024 PNG** at `resources/icon.png`
before running that command (I can export one for you if you want a crisper icon).

## Faster free alternative (already working today)
If an App Store *listing* isn't essential, the app is **already installable** for free, right now,
on every device via "Add to Home Screen" / "Install app" (see `README.md`). That gets it onto
your athletes' phones today with no accounts, fees, or review — the store route just adds the
official listing and discoverability.
