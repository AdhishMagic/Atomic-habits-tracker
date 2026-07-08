# Atomic Habits Tracker

A production-ready, cloud-synced Atomic Habits Tracker built with React 18, TypeScript, Vite, Tailwind CSS, Firebase Realtime Database, Recharts, and Lucide icons.

## Features

- Dashboard overview with completion rate, completed count, current streak, and longest streak
- Excel-style monthly habit tracker for every month
- Habit add, edit, delete, and protected edit mode
- Daily notes per tracked date
- Detailed statistics and analytics charts
- Streak, perfect-day, best-month, and habit-performance calculations
- Responsive desktop, tablet, and mobile layout
- Mobile sidebar navigation
- Firebase anonymous auth and Realtime Database cloud sync
- Local Storage fallback when Firebase is not configured or unavailable
- Offline JSON backup export
- Vercel-ready Vite build

## Screenshots

Add screenshots after deployment:

- `public/screenshots/dashboard.png`
- `public/screenshots/monthly-tracker.png`
- `public/screenshots/statistics.png`
- `public/screenshots/mobile.png`

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Firebase Authentication
- Firebase Realtime Database
- Recharts
- Lucide React

## Folder Structure

```text
/
├── public/
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
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.example
└── README.md
```

## Installation

```bash
npm install
npm run dev
```

The app will run locally at the URL printed by Vite, usually `http://localhost:5173`.

## Environment Variables

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

If Firebase variables are omitted, the app still runs with Local Storage fallback.

## Firebase Setup

1. Create a Firebase project.
2. Enable Anonymous Authentication in Firebase Authentication.
3. Create a Realtime Database instance and copy its database URL into `VITE_FIREBASE_DATABASE_URL`.
4. Add the Firebase web app config values to `.env`.
5. Configure Realtime Database rules for your deployment needs.

The app stores user data under:

```text
users/{anonymousUserId}/trackerData/{data,habits,lastUpdated}
```

Suggested starter Realtime Database rules:

```json
{
   "rules": {
      "users": {
         "$uid": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && auth.uid === $uid"
         }
      }
   }
}
```

If you need public read or a different access model, adjust the rules before deployment.

## Deployment

### Vercel

1. Import this repository into Vercel.
2. Set the Firebase environment variables in the Vercel project settings.
3. Use the default Vite settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy.

No additional Vercel configuration is required.

If you rotate Firebase credentials or move to a new Realtime Database instance, update the Vercel environment variables and redeploy.

## Build

```bash
npm run build
npm run preview
```
