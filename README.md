# HabiCity

### Turn your real-life habits into a living RPG village.

HabiCity is a gamified productivity and habit-tracking web application that transforms everyday tasks into a **persistent virtual village**.

Instead of managing habits through traditional lists, dashboards, and progress bars, every area of your life becomes a **domain represented by a plot of land**. Completing tasks earns XP, levels up that domain, and visually develops its plot from an empty patch of land into a fully developed structure.

The goal is simple:

> **Do something meaningful in real life. Watch your village grow.**

---

## Why HabiCity?

Traditional productivity apps often turn habits into another checklist of chores. The reward for studying, exercising, reading, or practicing a skill may not be visible for weeks or months.

HabiCity brings the immediate feedback loop of games into everyday productivity.

Every completed task can result in:

* XP for the associated domain
* Visual development of its village plot
* Gold that can be spent on cosmetics and decorations
* Progress toward a global activity streak
* Changes in the environment when a domain is neglected

The village itself becomes your progress dashboard.

There is no need to interpret a wall of statistics to understand how you're doing. **Your village tells the story.**

---

## Core Concept

Each user-created category, or **domain**, becomes a plot in their village.

For example:

| Real-Life Activity | Village Domain | Visual Representation      |
| ------------------ | -------------- | -------------------------- |
| 🏋️ Gym            | Strength       | Training yard / dojo       |
| 📚 Reading         | Knowledge      | Library / study cottage    |
| 💻 Coding          | Intellect      | Workshop / study building  |
| 🧘 Meditation      | Mind           | Shrine / meditation garden |
| 🎨 Art             | Creativity     | Artist workshop            |
| 🌱 Gardening       | Nature         | Farm / crop field          |

As XP accumulates, the corresponding plot develops through multiple visual stages.

### Plot Progression

**Level 0 → Level 1 → Level 2 → Level 3 → Level 4**

```text
Empty Plot
    ↓
Foundation / Sapling
    ↓
Basic Structure
    ↓
Developed Building
    ↓
Fully Decorated Plot
```

This makes progression tangible rather than reducing it to a number on a screen.

The underlying design intentionally treats the village as the primary interface rather than adding a conventional productivity dashboard.

---

# Features

## Village-Based Progression

The main screen is a village map containing:

* Central player house
* Individual domain plots
* Connecting paths
* Buildings and environmental decorations
* Domain-specific visual progression
* Interactive task popovers

Your village is effectively your character profile.

---

## Quests & Tasks

Tasks are attached directly to a domain.

For example:

```text
Coding
 ├── Complete React assignment
 ├── Solve 2 programming problems
 └── Study JavaScript for 30 minutes
```

Completing a quest rewards the associated domain with XP and gives the player Gold.

Tasks support multiple difficulty levels:

```text
Trivial   → 10 XP
Easy      → 25 XP
Medium    → 50 XP
Hard      → 100 XP
Epic      → 200 XP
```

Gold is generated according to task difficulty.

---

## Non-Linear RPG Progression

HabiCity uses a non-linear XP curve so that higher levels require progressively more effort.

The progression system uses:

```javascript
XP = 100 × level^1.5
```

Rather than storing the player's level as an independent source of truth, the current level is derived from accumulated XP.

This prevents inconsistencies between stored XP and level data.

---

## Global Streak

HabiCity tracks a village-wide activity streak.

Completing any task keeps the global streak alive.

The streak is represented **inside the world**, primarily through the player's house rather than a conventional dashboard counter.

For example:

```text
🔥 7
```

can appear as a badge on the house, accompanied by visual changes such as a lit window or chimney smoke.

This keeps the interface focused on the village while still providing meaningful feedback.

---

## Domain Weather & Decay

HabiCity has a second progression system independent of the global streak.

If a specific domain is neglected, its plot gradually changes.

| Neglect  | Effect                           |
| -------- | -------------------------------- |
| Healthy  | Clear weather, normal building   |
| Mild     | Light rain / overcast            |
| Moderate | Heavier rain + visible damage    |
| Severe   | Storm + damaged building + weeds |

For example, ignoring your Gym domain for several days could cause rain to appear over the training yard and eventually make the building look weathered.

### Recovery

A neglected plot can be restored by:

1. Completing a task in that domain
2. Using a **Streak Saver**

This means the weather itself becomes a visual notification system instead of requiring another notification panel.

---

## Gold & Economy

Completing quests earns Gold.

Gold can be spent through the player's house on:

### Character Cosmetics

Customize the player's character/avatar.

### Village Decorations

Purchase items such as:

* Fences
* Garden beds
* Banners
* Lanterns
* Other environmental decorations

### Streak Savers

A consumable item that can:

* Protect the global streak from a missed day
* Repair a neglected domain

The economy intentionally stays small rather than becoming a complicated inventory system.

---

# Procedural Village Generation

One of the key technical features of HabiCity is its **seeded procedural layout system**.

The application does not require a unique hand-drawn map for every possible user-created domain.

Instead, HabiCity separates:

> **Procedural composition from procedural art generation.**

A fixed library of visual assets is combined with a deterministic placement algorithm.

When a domain is created:

1. The application identifies the next available plot.
2. A seeded pseudo-random generator determines its position.
3. The plot coordinates are stored in Firestore.
4. The same village therefore produces the same layout after reloads.
5. Small decorative variations can be generated from the domain's own seed.

This allows users to create arbitrary domains such as:

```text
Guitar Practice
Job Hunting
Skincare
Photography
Cooking
Research
```

without requiring a unique building asset for every possible category.

The design uses a fixed grid around a central house, with deterministic placement and stored plot coordinates to keep villages stable across reloads.

---

# Building Archetypes

Instead of mapping every possible domain to a unique piece of artwork, HabiCity uses a small set of visual archetypes.

### 🌾 Nature

Farming, gardening, health habits

→ Farm / crop field

### 📚 Knowledge

Reading, coding, coursework

→ Library / study cottage

### 🥋 Body

Gym, sports, martial arts

→ Training yard / dojo

### 🧘 Mind

Meditation, journaling, mindfulness

→ Shrine / meditation garden

### 🎨 Creative

Art, music, writing

→ Workshop / atelier

### 🏪 Social / Miscellaneous

Other domains

→ Market stall / generic cottage

Users can choose an archetype when creating a domain, allowing the system to support unlimited domain names while maintaining a manageable visual asset library.

---

# Tech Stack

### Frontend

* **React**
* **Vite**
* **JavaScript**
* **CSS**
* **Framer Motion**

### Backend / Infrastructure

* **Firebase Authentication**
* **Cloud Firestore**
* **Firebase Hosting**

### Development Architecture

```text
React + Vite
     │
     ├── Authentication
     │      └── Firebase Auth
     │
     ├── Village UI
     │      ├── Village Map
     │      ├── Domain Plots
     │      ├── Quest Popovers
     │      └── Shop
     │
     ├── Game Logic
     │      ├── XP / Levels
     │      ├── Streaks
     │      ├── Weather / Decay
     │      └── Economy
     │
     └── Firebase
            └── Firestore
```

The project architecture was designed around React + Vite with Firebase Authentication and Firestore as the backend, with Firebase Hosting used for deployment.

---

# Data Architecture

HabiCity uses Firestore to persist player progression rather than relying on browser-only storage.

Simplified structure:

```text
users/{uid}
│
├── gold
├── streak
├── lastActiveDate
├── streakSavers
├── villageSeed
├── decorations
└── playerCosmetics
│
└── domains/{domainId}
    │
    ├── name
    ├── archetype
    ├── totalXp
    ├── plotX
    ├── plotY
    ├── plotSeed
    ├── lastActiveDate
    └── tasks/{taskId}
        ├── title
        ├── difficulty
        ├── completed
        └── completedAt
```

This structure separates:

* User-wide progression
* Individual domain progression
* Individual task history

It also allows each domain to maintain its own activity state and visual progression.

---

# Security

Firebase Authentication ensures that users have authenticated accounts, while Firestore security rules restrict access to user-owned data.

The application is designed so that a user can only access and modify their own:

* Profile
* Domains
* Tasks
* Progression
* Inventory
* Decorations

The Firestore rules also include basic safeguards against negative Gold and naive XP manipulation.

---

# Design Philosophy

HabiCity intentionally avoids the appearance of a conventional productivity SaaS application.

The design focuses on:

* Cozy pixel-art-inspired environments
* Village-first navigation
* RPG progression
* Immediate visual feedback
* Game-like economy
* Environmental consequences
* Minimal interface chrome
* Responsive interaction

The village is the interface.

Instead of:

```text
Dashboard
├── Statistics
├── Progress Bars
├── Task Tables
└── Charts
```

HabiCity uses:

```text
             🏡
          Your House

    🌾 Farm       📚 Library

       🥋 Dojo       🎨 Workshop

              🧘 Shrine
```

Clicking the world reveals the functionality needed at that location.

---

# User Flow

```text
Sign Up / Login
       ↓
   Enter Village
       ↓
Create a Domain
       ↓
Choose Archetype
       ↓
Domain Plot Appears
       ↓
Add Quests
       ↓
Complete Quest
       ↓
   Earn XP + Gold
       ↓
   Plot Levels Up
       ↓
Building Visually Grows
       ↓
Spend Gold on Cosmetics
```

If a domain is neglected:

```text
No Activity
    ↓
Light Rain
    ↓
Weather + Damage
    ↓
Storm / Severe Decay
    ↓
Complete Quest OR Use Streak Saver
    ↓
Plot Restored
```

---

# Project Structure

A simplified project structure:

```text
HabiCity/
│
├── src/
│   ├── assets/
│   │   └── village/
│   │
│   ├── components/
│   │   ├── AuthPage.jsx
│   │   ├── VillageMap.jsx
│   │   ├── VillagePlot.jsx
│   │   ├── TaskList.jsx
│   │   ├── PlotPopover.jsx
│   │   └── ShopPanel.jsx
│   │
│   ├── lib/
│   │   ├── auth.js
│   │   ├── gamedata.js
│   │   ├── progression.js
│   │   └── villageLayout.js
│   │
│   ├── App.jsx
│   └── App.css
│
├── firestore.rules
├── .env.example
├── package.json
└── README.md
```

---

# Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/snehal-k296/HabiCity.git
cd HabiCity
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure Firebase

Create a Firebase project and enable:

* Firebase Authentication
* Email/Password authentication
* Cloud Firestore

Create a `.env` file based on `.env.example`.

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Do not commit your `.env` file.**

## 4. Start the development server

```bash
npm run dev
```

The application should then be available through the local Vite development URL.

---

# Deployment

HabiCity can be deployed using Firebase Hosting.

Build the production application:

```bash
npm run build
```

Then deploy through Firebase:

```bash
firebase deploy
```

Make sure the Firebase environment variables and Firestore security rules are configured correctly in the deployment environment.

---

# Accessibility & Responsiveness

The application is designed to support:

* Responsive layouts from mobile to desktop
* Keyboard navigation
* Tab navigation
* Enter / Space activation
* Semantic interactive elements
* Screen-reader-friendly structure
* Loading and error states

Accessibility and responsive behavior are part of the project's required functionality rather than an optional visual enhancement.

---

# What Makes HabiCity Different?

HabiCity is not simply a to-do list with XP added to it.

The core interaction is:

```text
Real-world action
       ↓
      XP
       ↓
Domain progression
       ↓
Visual world changes
       ↓
Motivation to return
```

The reward is therefore part of the environment itself.

A user who spends time coding does not simply see:

```text
Coding: Level 3
```

They see their **Coding building physically developed inside their village**.

Similarly, neglect is communicated through the world:

```text
Neglected Gym
      ↓
     Rain
      ↓
Damaged Building
```

The interface communicates progress and failure visually rather than relying entirely on numerical statistics.

---

# Project Goals

HabiCity was built to demonstrate how game design principles can be applied to productivity software.

The project focuses on:

* Gamification
* Full-stack web development
* Persistent cloud data
* Authentication
* Non-linear progression
* Procedural layout generation
* Responsive UI
* Accessibility
* Visual feedback
* Interactive world design

These directly address the core requirements of the Life RPG project, including authentication, database-backed CRUD operations, RPG progression, streaks, attributes, rewards, responsiveness, and accessibility.

---

# Future Improvements

Potential future additions include:

* More building archetypes
* Seasonal village environments
* More character cosmetics
* Companion pets
* Expanded decoration placement
* Additional weather events
* More detailed achievement systems
* Social or multiplayer villages
* Cloud Functions for stronger server-side progression validation
* More advanced procedural village generation

The current architecture intentionally keeps these additions possible without making the initial system unnecessarily complex.

---

# License

This project is developed as an academic/hackathon project.

The application uses original project code and assets or appropriately licensed assets. It does not reproduce proprietary game assets from existing commercial games.

---

## HabiCity

**Your habits build your village.
Your village tells your story.**
