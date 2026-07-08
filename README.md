<p align="center">
  <img src="./public/logo.svg" alt="Atomic Habits Tracker logo" width="520" />
</p>

<h1 align="center">Atomic Habits Tracker</h1>

<p align="center">
  <strong>Small habits. Consistent progress. Visible growth.</strong>
</p>

<p align="center">
  <a href="#features">Features</a>
  ·
  <a href="#tech-stack">Tech Stack</a>
  ·
  <a href="#installation">Installation</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111827" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-Realtime_DB-FFCA28?style=for-the-badge&logo=firebase&logoColor=111827" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

---

## 🌍 Live Website

**[Habit_Tracker Check Here...](https://atomic-habits-tracker-phi.vercel.app/)**

---

## Project Story

Success is not built in a single day.

It is built through thousands of tiny decisions repeated consistently.

**Atomic Habits Tracker** is my digital proof that progress is measurable. Every completed habit, every streak, and every statistic represents a real commitment to becoming a better version of myself.

This is not just another habit tracker. It is a transparent record of discipline, consistency, and continuous learning.

## Why This Project

This project was inspired by James Clear's *Atomic Habits*.

Instead of keeping progress private inside an Excel sheet, I transformed it into a cloud-synced web application that anyone can view. Visitors can watch my learning journey in real time.

Every streak reflects consistency. Every chart reflects effort. Every completed task is evidence of growth.

## Features

<p>
  <img alt="Cloud Sync" src="https://img.shields.io/badge/Cloud_Sync-0EA5E9?style=flat-square&logo=icloud&logoColor=white" />
  <img alt="Firebase Realtime Database" src="https://img.shields.io/badge/Firebase_Realtime_Database-FFCA28?style=flat-square&logo=firebase&logoColor=111827" />
  <img alt="Responsive Design" src="https://img.shields.io/badge/Responsive_Design-16A34A?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Real-Time Updates" src="https://img.shields.io/badge/Real--Time_Updates-0891B2?style=flat-square&logo=socketdotio&logoColor=white" />
  <img alt="Dashboard" src="https://img.shields.io/badge/Dashboard-0F766E?style=flat-square&logo=googleanalytics&logoColor=white" />
  <img alt="Habit Analytics" src="https://img.shields.io/badge/Habit_Analytics-2563EB?style=flat-square&logo=chartdotjs&logoColor=white" />
  <img alt="Streak Tracking" src="https://img.shields.io/badge/Streak_Tracking-F97316?style=flat-square&logo=flame&logoColor=white" />
  <img alt="Charts" src="https://img.shields.io/badge/Charts-7C3AED?style=flat-square&logo=databricks&logoColor=white" />
  <img alt="PIN Protected Editing" src="https://img.shields.io/badge/PIN_Protected_Editing-111827?style=flat-square&logo=lock&logoColor=white" />
  <img alt="Public Read Only" src="https://img.shields.io/badge/Public_Read_Only-64748B?style=flat-square&logo=readthedocs&logoColor=white" />
  <img alt="Mobile Friendly" src="https://img.shields.io/badge/Mobile_Friendly-22C55E?style=flat-square&logo=android&logoColor=white" />
</p>

- Dashboard overview with completion rate, completed habits, current streak, and longest streak
- Excel-style monthly tracker for daily habit visibility
- Habit add, edit, delete, and PIN-protected edit mode
- Daily notes attached to tracked dates
- Analytics for streaks, perfect days, best months, and habit performance
- Firebase Realtime Database cloud sync with Local Storage fallback
- Public read-only experience for transparent progress sharing
- Offline JSON backup export
- Responsive layout for desktop, tablet, and mobile screens

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) |
| Styling | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white) |
| Database | ![Firebase](https://img.shields.io/badge/Firebase-Realtime_Database-FFCA28?logo=firebase&logoColor=111827) |
| Charts | ![Recharts](https://img.shields.io/badge/Recharts-Analytics-22C55E) |
| Tooling | ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white) |
| Deployment | ![Vercel](https://img.shields.io/badge/Vercel-Production-000000?logo=vercel&logoColor=white) |

## Screenshots

| Dashboard | Monthly Tracker |
| --- | --- |
| `public/screenshots/dashboard.png` | `public/screenshots/monthly-tracker.png` |

| Statistics | Mobile View |
| --- | --- |
| `public/screenshots/statistics.png` | `public/screenshots/mobile.png` |

| Cloud Sync |
| --- |
| `public/screenshots/cloud-sync.png` |

## My Journey

My progress is public because I believe consistency should be visible.

Anyone can open this dashboard and see my learning journey. Whether I study DSA, solve LeetCode problems, work on projects, apply for jobs, or exercise, every habit leaves a trace.

This tracker is not designed to impress with promises. It is designed to prove progress through action.

> "Motivation gets you started. Discipline keeps you moving. Consistency changes your life."

## Project Structure

```text
/
├── public/
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── logo.png
│   ├── logo.svg
│   ├── site.webmanifest
│   └── screenshots/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   ├── hooks/
│   │   └── useCloudSync.ts
│   ├── services/
│   │   └── firebase.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   └── storage.ts
│   ├── assets/
│   ├── types.ts
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## Installation

```bash
git clone https://github.com/AdhishMagic/Atomic-habits-tracker.git
cd Atomic-habits-tracker
npm install
npm run dev
```

The app runs locally at the URL printed by Vite, usually:

```text
http://localhost:5173
```

<details>
<summary><strong>Environment Variables</strong></summary>

Create a `.env` file from `.env.example` and add your Firebase project values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_APP_PIN=1812
```

`VITE_APP_PIN` is optional and defaults to `1812`.

If Firebase variables are omitted, the app still runs with the Local Storage fallback.

</details>

<details>
<summary><strong>Firebase Setup</strong></summary>

1. Create a Firebase project.
2. Create a Realtime Database instance.
3. Copy the database URL into `VITE_FIREBASE_DATABASE_URL`.
4. Add the Firebase web app config values to `.env`.
5. Configure Realtime Database rules for your deployment needs.

The app stores shared tracker data under:

```text
habitTracker/{data,habits,notes,lastUpdated}
```

Suggested starter Realtime Database rules:

```json
{
  "rules": {
    "habitTracker": {
      ".read": true,
      ".write": true
    }
  }
}
```

The app's PIN gate controls editing in the UI. If you need server-enforced writes, tighten the database rules before deployment.

</details>

## Deployment

### Vercel

1. Import this repository into Vercel.
2. Add the Firebase environment variables in **Project Settings → Environment Variables**.
3. Use the default Vite settings:

```text
Build Command: npm run build
Output Directory: dist
```

4. Deploy.

The favicon files live in `public/`, so Vercel serves them from the site root after deployment:

```text
/favicon.ico
/favicon.svg
/apple-touch-icon.png
```

## Build

```bash
npm run build
npm run preview
```

## License

This project is licensed under the [MIT License](./LICENSE).

## Author

**Built with dedication by Bala Adhish**

- GitHub: [@AdhishMagic](https://github.com/AdhishMagic)
- LinkedIn: Add your LinkedIn URL
- Portfolio: Add your portfolio URL

---

<p align="center">
  <strong>Atomic Habits Tracker</strong> turns private discipline into visible progress.
</p>
