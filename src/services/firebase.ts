import { initializeApp } from '@firebase/app';
import { getDatabase } from '@firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;

export const appId = firebaseConfig.appId || firebaseConfig.projectId || 'atomic-habits-tracker';
export const db = firebaseApp ? getDatabase(firebaseApp) : null;
export const isFirebaseConfigured = hasFirebaseConfig;
