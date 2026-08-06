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

### 📖 Recipe Explorer

Browse the app's collection of Satisfactory production recipes.

* Search by recipe, item, or machine
* Filter recipes by category
* Filter recipes by unlocked tier
* View recipe inputs, outputs, and craft times
* Save frequently used recipes as favorites
* Identify alternate recipes
* Flip recipe cards to reveal production details

### 🏗️ Factory Planner

Create and manage dedicated factory guides for your builds.

Enter:

* A factory name
* The item you want to produce
* Your target output per minute

The planner automatically calculates:

* The complete production chain
* Required items per minute
* Machines needed at every stage
* Total raw-resource requirements
* Dependencies between production steps

### 🔀 Alternate Recipe Support

Switch between available recipes directly inside a factory plan.

Changing a recipe automatically recalculates:

* Required machines
* Input materials
* Raw-resource demand
* The complete production chain
* The production graph

### 🕸️ Production Graphs

View each factory as an interactive production network.

The graph shows:

* Final output items
* Intermediate components
* Raw resources
* Material flow rates
* Relationships between production steps

### ✅ Factory To-Do Lists

Keep track of what still needs to be built.

* Add custom factory tasks
* Assign low, medium, or high priority
* Mark tasks as complete
* Filter active, completed, or all tasks
* Monitor factory completion percentage
* Delete tasks that are no longer needed

### 🚀 Project Phase Tracking

Track your progress through four major development phases:

1. **Structural Components**
2. **Industrial Expansion**
3. **Petroleum & Electronics**
4. **Advanced Manufacturing**

Each phase includes:

* Recommended objectives
* Completion tracking
* Phase-specific recipe tiers
* Progress percentages
* Unlock-aware recipe filtering

### ☁️ Real-Time Synchronization

Firebase Realtime Database keeps important app data synchronized, including:

* Saved factories
* Factory task lists
* Recipe selections
* Favorite recipes

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
| **HTML5**                      | Application structure                           |
| **CSS3**                       | FICSIT-inspired interface and responsive design |
| **Vanilla JavaScript**         | Application logic and user interactions         |
| **ES Modules**                 | Modular frontend architecture                   |
| **Firebase Realtime Database** | Cloud synchronization and persistence           |
| **vis-network**                | Interactive production-chain graphs             |
| **Local Storage**              | Local phase and objective tracking              |

The project has:

* No frontend framework
* No package installation requirement
* No build process
* No bundler
* No backend server requirement for basic hosting

---

## 📁 Project Structure

```text
satisfactory-manager/
│
├── index.html
├── ManlineSlabs.ttf
│
├── css/
│   └── app.css
│
└── js/
    ├── app.js
    ├── factories-tab.js
    ├── factory-detail.js
    ├── firebase.js
    ├── graph.js
    ├── phase-state.js
    ├── phases-tab.js
    ├── planner.js
    ├── recipes-tab.js
    │
    └── data/
        └── recipes.js
```

### Important Modules

| File                | Responsibility                                       |
| ------------------- | ---------------------------------------------------- |
| `app.js`            | Application startup, navigation, and synchronization |
| `planner.js`        | Production-chain calculations                        |
| `recipes-tab.js`    | Recipe search, filters, cards, and favorites         |
| `factories-tab.js`  | Factory creation and saved factory list              |
| `factory-detail.js` | Plans, alternate recipes, graphs, and tasks          |
| `phase-state.js`    | Phase definitions and local progress                 |
| `firebase.js`       | Firebase connection and data operations              |
| `recipes.js`        | Recipe and production data                           |

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

The repository currently includes a Firebase configuration in:

```text
js/firebase.js
```

To connect your own Firebase project:

1. Create a project in the Firebase Console.
2. Add a web application to the project.
3. Enable Firebase Realtime Database.
4. Replace the configuration inside `js/firebase.js`.
5. Configure appropriate Realtime Database security rules.
6. Restart the local development server.

> Firebase web configuration identifies the Firebase project, but database access must still be protected through properly configured security rules.

---

## 🗺️ Potential Future Improvements

* [ ] User accounts and private factory profiles
* [ ] Import and export factory plans
* [ ] Belt and pipe capacity warnings
* [ ] Power-consumption calculations
* [ ] Overclocking and underclocking support
* [ ] Production-efficiency recommendations
* [ ] Additional alternate recipes
* [ ] Expanded late-game phase tracking
* [ ] Offline Progressive Web App support
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
