# Get a free public link with GitHub Pages

The app is already committed to a local git repo (`index.html` at the root). Follow these steps
once to publish it and get a permanent link like `https://YOURNAME.github.io/tac-coach/`.

## 1. Create a GitHub account (skip if you have one)
Go to https://github.com and sign up (free).

## 2. Create an empty repository
- Click **+ (top right) → New repository**.
- **Repository name:** `tac-coach`
- Visibility: **Public** (required for free Pages).
- **Do NOT** add a README, .gitignore, or license (the folder already has files).
- Click **Create repository**.

GitHub then shows a page with your repo URL: `https://github.com/YOURNAME/tac-coach.git`

## 3. Push the app (run these in this folder)
Replace `YOURNAME` with your GitHub username. Run each line in a terminal opened in this folder
(`EnduranceCoachApp`):

```bash
git remote add origin https://github.com/YOURNAME/tac-coach.git
```
```bash
git push -u origin main
```

The first push opens a browser window to log in to GitHub — approve it. (That's the account
sign-in only you can do.)

## 4. Turn on Pages
- In the repo on github.com: **Settings → Pages**.
- **Source:** "Deploy from a branch".
- **Branch:** `main`, folder `/ (root)` → **Save**.
- Wait ~1 minute, then refresh. Pages shows your live link:

  **https://YOURNAME.github.io/tac-coach/**

That's your app link. Open it on any phone or computer, then use "Add to Home Screen" /
"Install app" to get the free app on each device.

## 5. Updating the app later
After I change any files, from this folder:
```bash
git add -A && git commit -m "update" && git push
```
Pages redeploys automatically in ~1 minute. (Also bump the `CACHE` version in `sw.js` so devices
fetch the new version instead of the cached one.)
