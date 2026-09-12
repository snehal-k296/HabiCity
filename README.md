# 🌾 Life RPG — Your Habits, Your Village

Turn your real to‑do list into a growing village. Every category of task (a "domain" —
like Gym, Reading, Coding) is a plot of land. Complete quests (tasks) → earn XP and gold →
your plot levels up and visually grows, from an empty signpost to a fully decorated building.

This README explains everything in plain language, step by step, from "I have this folder"
to "my app is live on the internet."

---

## 1. What's inside this project (in plain words)

```
src/
  firebase.js          -> connects the app to your Firebase project
  lib/
    progression.js      -> the math: how much XP a level needs, streaks, etc. (no Firebase here)
    villageLayout.js     -> decides WHERE each domain's plot sits on the map (deterministic, never random on reload)
    archetypes.js        -> the "theme" for each domain type (Farm, Library, Dojo, Shrine...) and its 4 growth stages
    shopItems.js          -> the list of things you can buy in the shop
    gamedata.js           -> every single read/write to the database lives here
    auth.js               -> sign up / log in / log out
  hooks/
    useAuth.js             -> tells any component "who is logged in right now?"
  components/
    AuthPage.jsx            -> the login/signup screen
    Hud.jsx                  -> the little gold/streak bar at the top
    VillageMap.jsx            -> draws the grid of plots
    VillagePlot.jsx            -> a single plot (the building + its sprite)
    PlotPopover.jsx             -> the little window that opens when you click a plot
    TaskList.jsx                 -> add/complete/delete quests inside a domain
    NewDomainForm.jsx             -> the "create a new domain" form
    ShopPanel.jsx                  -> the shop
    VillageSkeleton.jsx             -> the loading placeholder
  App.jsx / App.css                 -> glues it all together + all the styling

firestore.rules   -> database security rules (so people can only see/edit their OWN data)
firebase.json     -> tells Firebase how to deploy this app
.env.example      -> template for your secret Firebase keys (copy this to .env)
```

**How the game logic works, in one paragraph:** every task has a difficulty (trivial → epic),
and each difficulty gives a fixed amount of XP and gold. A domain's level is never stored
directly — it's always *calculated* from its total XP (`deriveLevel` in `progression.js`), so
it can never get out of sync. Each level costs more XP than the last (that's the "non-linear"
requirement). Where a domain's plot sits on the grid is decided by a tiny seeded random-number
function — same inputs always give the same output, so your village layout never shuffles
around when you reload the page.

---

## 2. Install the tools you need (one-time)

1. Install **Node.js** (version 18 or higher) from https://nodejs.org — this gives you `npm`.
2. Make sure you have a free **Google account** — you'll use it for Firebase.
3. (Optional but recommended) Install **Git** from https://git-scm.com so you can push this to
   GitHub later.

Check both installed correctly by opening a terminal and running:
```bash
node -v
npm -v
```
You should see version numbers, not an error.

---

## 3. Create your Firebase project (step by step)

1. Go to https://console.firebase.google.com and click **"Add project."**
2. Give it a name (e.g. `life-rpg`), click through the prompts (you can disable Google
   Analytics if you don't need it), and click **Create project**.
3. Once inside your project, click the **`</>` (Web) icon** to register a web app.
   - Give it a nickname (e.g. `life-rpg-web`).
   - You do **not** need "Firebase Hosting" checked at this step (we'll do that later, either
     way is fine).
   - Click **Register app**. Firebase will show you a code block with a `firebaseConfig`
     object — **keep this tab open**, you need those values in the next step.
4. In the left sidebar, go to **Build → Authentication**. Click **Get started**. Under
   "Sign-in method," click **Email/Password**, enable the toggle, and click **Save**.
5. In the left sidebar, go to **Build → Firestore Database**. Click **Create database**.
   - Choose a location close to you.
   - Choose **Start in test mode** for now (we will lock it down properly in Step 6 below —
     don't skip that step later!).

---

## 4. Set up the project on your computer

1. Unzip this project folder and open a terminal inside it.
2. Install all the dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and fill it in:
   ```bash
   cp .env.example .env
   ```
   Open `.env` in any text editor and paste in the values from the `firebaseConfig` object
   Firebase showed you in Step 3.3. It should look like this when done:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=life-rpg-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=life-rpg-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=life-rpg-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```
   **Never commit `.env` to GitHub** — it's already listed in `.gitignore` so this happens
   automatically, but double-check before pushing.

4. Run the app locally:
   ```bash
   npm run dev
   ```
   Open the URL it prints (usually `http://localhost:5173`). You should see the login screen
   with no errors in the browser console (press F12 to check).

5. Try it out:
   - Sign up with any email/password (it doesn't need to be real — Firebase Auth just needs a
     valid-*looking* email and a 6+ character password).
   - Click any `+` empty tile on the grid to plant your first domain (e.g. "Gym" → Dojo).
   - Click the new plot, add a quest, and click the checkbox to complete it — watch your gold
     and XP bar update instantly.
   - Refresh the page — everything should still be there (this proves the database is really
     saving your data, not just pretending to in your browser's memory).

---

## 5. Lock down the database (do this before submitting/sharing!)

Right now Firestore is in "test mode," meaning **anyone** could read or write anyone's data.
`firestore.rules` in this project fixes that — it only lets a signed-in user read and write
their *own* data, and it blocks obvious cheating (gold going negative, XP going backwards).

Deploy the rules with the Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # when asked, point it at the existing firestore.rules file — say "no" to overwriting it
firebase deploy --only firestore:rules
```
Or, without the CLI: open the Firebase console → Firestore Database → **Rules** tab → paste in
the contents of `firestore.rules` → click **Publish**.

**Test it worked:** open your browser's dev tools while logged in, and try (in the console) to
read another random UID's data — it should fail with a "permission denied" error.

---

## 6. Deploy it live (so anyone can use it)

### Option A — Firebase Hosting (matches this project's `firebase.json`)
```bash
npm run build              # creates the production files in /dist
firebase init hosting      # choose "dist" as your public folder, say "yes" to single-page app rewrite
firebase deploy --only hosting
```
Firebase will print your live URL (something like `https://life-rpg-xxxxx.web.app`).

### Option B — Vercel (also very easy)
1. Push this project to a GitHub repo.
2. Go to https://vercel.com, click **New Project**, import your repo.
3. In the "Environment Variables" section, add the same six `VITE_FIREBASE_*` values from
   your `.env` file.
4. Click **Deploy**.

**Whichever you pick:** open the live URL in an incognito/private window, sign up fresh, add a
task, complete it, refresh the page — confirm it all still works with zero cached local data.

---

## 7. Before you submit — final checklist

- [ ] `firestore.rules` deployed (Step 5) — not still in test mode
- [ ] Live URL loads with no console errors, from a fresh incognito window
- [ ] Signup → create a domain → add a task → complete it → refresh → data survives
- [ ] `.env` is **not** committed to GitHub (check your repo on GitHub itself to be sure)
- [ ] At least 3 separate commits in your git history, not one giant commit
- [ ] Record your 90–180 second screen recording showing: signup/login, adding + completing a
      task, the level-up moment, and a page refresh proving persistence

---

## 8. How to extend this later (optional ideas)

- **Real pixel art instead of emoji:** each archetype's 4 growth stages are just an array of
  emoji strings in `src/lib/archetypes.js` (`stages: ["🌱","🌿","🚜","🌻🏡"]`). Swap any entry
  for `<img src="/assets/farm-stage-2.png" />`-style JSX instead — the rest of the app doesn't
  care what a "sprite" actually is.
- **More archetypes:** add another key to `ARCHETYPES` in `archetypes.js`.
- **Cloud Functions for full anti-cheat:** right now `firestore.rules` blocks the most obvious
  tampering (negative gold, decreasing XP) directly in the rules. Fully validating "did this
  XP amount match this task's difficulty" requires a Cloud Function, which is a good follow-up
  project but wasn't required for this scope.
