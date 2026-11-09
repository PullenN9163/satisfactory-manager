<div align="center">

# 🏭 Satisfactory Manager

### Plan smarter. Build cleaner. Stay efficient.

A factory-planning companion for **Satisfactory** that helps pioneers browse recipes, calculate production chains, organize factory builds, and track project progress.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge\&logo=html5\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge\&logo=css3\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-111111?style=for-the-badge\&logo=javascript\&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-FF6A00?style=for-the-badge\&logo=firebase\&logoColor=white)](https://firebase.google.com/)

![GitHub stars](https://img.shields.io/github/stars/PullenN9163/satisfactory-manager?style=flat-square\&color=FF6A00)
![GitHub forks](https://img.shields.io/github/forks/PullenN9163/satisfactory-manager?style=flat-square\&color=60A5FA)
![GitHub repo size](https://img.shields.io/github/repo-size/PullenN9163/satisfactory-manager?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/PullenN9163/satisfactory-manager?style=flat-square)

</div>

---

## 📡 FICSIT Employee Portal

**Satisfactory Manager** is a lightweight, mobile-friendly web application built to make factory planning less overwhelming.

Choose what you want to produce, enter your target production rate, and the app calculates the production chain needed to make it happen.

Whether you are setting up your first reinforced iron plate line or planning advanced manufacturing, Satisfactory Manager helps keep your operation organized and efficient.

> **FICSIT Reminder:** Inefficiency will not be tolerated. The factory must grow. 🏗️

---

## ✨ Features

### 🏠 HUB
Your home screen: current Space Elevator phase with live progress, the next objectives (tap to tick, or **Plan it**), recently touched factories, and empire-wide totals — buildings, power draw, open tasks and raw resource demand.

### 📖 Recipe Explorer
* ~100 **Satisfactory 1.0** recipes, including popular alternates (Cast Screw, Heavy Encased Frame, Diluted Fuel, Pure Ingots…)
* Search across names, inputs, outputs and machines
* Category, tier and standard/alternate filters, aware of your current phase
* Per-minute input/output rates on every card, favourites, and **Plan** straight from any recipe

### 🏗️ Factory Planner
* Pick an item + target rate, with a live preview of buildings and power before you create
* **Build list** in bottom-up order: machine count, clock %, power (using the in-game clock curve) and the belt/pipe tier each line needs
* Switch to alternate recipes per item; everything recalculates instantly
* Raw-resource bars, machine totals, byproducts and belt-capacity warnings
* Collapsible production tree and an interactive **graph** (zoom / fit)
* Edit, duplicate, and delete with undo

### ✅ Build Tasks
* Priorities, filters and progress, with a satisfying check-off
* **Generate from plan** — one tap creates a checklist of every machine to place, every node to tap and every byproduct to handle

### 🚀 Project Assembly
All five Space Elevator phases with real 1.0 deliverables, objectives (each with a one-tap factory suggestion) and an advance flow. Your phase controls which recipe tiers count as unlocked.

### ☁️ Sync & offline
* **Google sign-in** — factories, favourites, phase and objectives sync across iPad, phone and PC
* Per-user data, locked down by Realtime Database security rules
* Works offline (installable PWA with a service worker); a local-only mode needs no account
* JSON export / import backup

---

## 🧠 How the Planner Works

The application recursively follows every recipe required to produce your selected output.

For each production step, it calculates:

```text
Cycles per minute = 60 ÷ recipe craft time

Machine count =
target production rate ÷ output per machine per minute
```

It then repeats the process for every required ingredient until the chain reaches raw resources.

This produces a complete breakdown similar to:

```text
Target Output
│
├── Intermediate Component
│   ├── Basic Component
│   │   └── Raw Resource
│   └── Raw Resource
│
└── Intermediate Component
    └── Raw Resource
```

---

## 🛠️ Technology Stack

| Technology                     | Purpose                                         |
| ------------------------------ | ----------------------------------------------- |
| **HTML / CSS / Vanilla JS**    | ES modules, no framework, no build step         |
| **Firebase Auth**              | Google sign-in                                  |
| **Firebase Realtime Database** | Per-user cloud sync (`/users/{uid}`)            |
| **vis-network**                | Interactive production graphs (lazy-loaded)     |
| **Service worker + manifest**  | Offline use and "Add to Home Screen" on iPad    |

Designed iPad-first: a navigation rail with split-view factories in landscape, and a bottom tab bar in portrait or on phones.

---

## 📁 Project Structure

```text
satisfactory-manager/
├── index.html               app shell
├── manifest.webmanifest     PWA manifest
├── sw.js                    offline cache
├── database.rules.json      Firebase security rules
├── firebase.json / .firebaserc
├── icons/                   app icons
├── css/
│   ├── tokens.css           colours, type, spacing
│   ├── base.css             layout, navigation
│   ├── components.css       buttons, cards, sheets, toasts, rings…
│   └── views.css            per-screen styles
└── js/
    ├── app.js               boot, auth gate, routing
    ├── planner.js           production-chain maths
    ├── graph.js             vis-network wrapper
    ├── core/                firebase · store · router · ui helpers
    ├── data/                recipes · machines · phases
    └── views/               hub · recipes · factories · phases · settings · sign-in
```

---

## 🚀 Running the Project Locally

Because the project uses JavaScript modules, run it through a local web server instead of opening `index.html` directly.

### 1. Clone the repository

```bash
git clone https://github.com/PullenN9163/satisfactory-manager.git
cd satisfactory-manager
```

### 2. Start a local server

Using Python:

```bash
python -m http.server 8000
```

Alternatively, using Node.js:

```bash
npx serve .
```

### 3. Open the application

Visit:

```text
http://localhost:8000
```

No dependency installation or build command is required.

---

## 🔥 Using Your Own Firebase Project

The app uses Google sign-in and stores each user's data under `/users/{uid}`. **One-time setup in the Firebase Console** (project `satisfactory-manager-c75e7`, or your own — update `js/core/firebase.js`):

1. **Authentication → Sign-in method** → enable **Google**.
2. **Authentication → Settings → Authorized domains** → `satisfactory-manager-c75e7.web.app` and `.firebaseapp.com` are there by default. Add `pullenn9163.github.io` if you still use GitHub Pages, and `localhost` for local testing.
3. **Deploy the database rules** from this repo:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase deploy --only database
   ```
   Or paste `database.rules.json` into **Realtime Database → Rules** and publish.

> The old version wrote to the database root with no login. Those rules usually expire after 30 days, which is why the app showed "Offline" and couldn't save. The new rules allow signed-in users to *read* the old `/factories` and `/favourites` once, so on first sign-in the app offers to import them. After importing, you can delete those two keys from the rules.

### 🌐 Firebase Hosting (recommended for iPad home screen)

The app's address is **https://satisfactory-manager-c75e7.firebaseapp.com**. Install it from there (Safari → Share → **Add to Home Screen**). Browser visits to `…web.app` are forwarded to it automatically.

Why that address: Google sign-in always uses `satisfactory-manager-c75e7.firebaseapp.com` as its auth domain. That handler is already in the OAuth client's default redirect list, so it needs no Cloud Console setup. Serving the app from the *same* host keeps sign-in same-origin, which matters because Safari keeps a home-screen app's storage separate from other sites. In home-screen mode the app signs in by redirecting rather than opening a popup.

**Automatic deploys:** `.github/workflows/firebase-hosting.yml` deploys every push to `main`, and each PR gets a 7-day preview URL. One-time setup:

1. In Google Cloud Console → IAM → Service accounts (project `satisfactory-manager-c75e7`), create a service account with the role **Firebase Hosting Admin**, then create a JSON key for it.
   *Or* run `firebase init hosting:github` locally and let it create the account and secret for you. If it offers to write workflow files, decline, because this repo already has one.
2. In the GitHub repo → Settings → Secrets and variables → Actions, add a secret named **`FIREBASE_SERVICE_ACCOUNT_SATISFACTORY_MANAGER_C75E7`** containing the JSON key.

Until that secret exists, the workflow skips the deploy instead of failing.

**Manual deploy:** `firebase deploy --only hosting,database` (this also publishes the database rules).

Only app files are uploaded; `README.md`, the Firebase config files and all dot-folders (`.git`, `.github`) are excluded by `firebase.json`.

If Firebase can't be reached, the app falls back to **local mode** (data stays in that browser) and offers to upload it after you sign in.

---

## 🗺️ Potential Future Improvements

* [ ] Overclocking and underclocking support
* [ ] Production-efficiency recommendations
* [ ] Additional alternate recipes
* [ ] Expanded late-game phase tracking
* [ ] Shareable factory-plan links
* [ ] Factory comparison tools
* [ ] Improved resource-node planning

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add new feature"
```

4. Push the branch.

```bash
git push origin feature/new-feature
```

5. Open a pull request.

---

## 🐛 Reporting Problems

Found an incorrect recipe, calculation issue, or interface bug?

Open a GitHub issue and include:

* What you were trying to produce
* The selected output rate
* The recipe being used
* What result you expected
* What result the app displayed
* Browser and device information

---

## 🎮 About Satisfactory

**Satisfactory** is a first-person, open-world factory-building game centered on exploration, automation, logistics, and increasingly complicated production lines.

This project was created by a player who wanted a cleaner way to plan factories and track progress without leaving the production floor buried under spreadsheets.

---

## ⚠️ Disclaimer

This is an unofficial fan-made project.

Satisfactory, FICSIT, and related names and assets belong to their respective owners. This project is not affiliated with, endorsed by, or sponsored by Coffee Stain Studios.

---

<div align="center">

## 👷 Built by Nas

Designed for pioneers who would rather spend their time building factories than calculating machine ratios by hand.

[![GitHub](https://img.shields.io/badge/GitHub-PullenN9163-181717?style=for-the-badge\&logo=github)](https://github.com/PullenN9163)

### **Construct. Automate. Optimize. Repeat.**

🏭 ⚙️ 🧱 🚜 ⚡

</div>
