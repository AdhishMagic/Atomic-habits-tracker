import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { appId, auth, db } from '../services/firebase';
import type { HabitData, SyncStatus } from '../types';
import { saveStoredData, saveStoredHabits } from '../utils/storage';

type UseCloudSyncOptions = {
  setData: Dispatch<SetStateAction<HabitData>>;
  setHabits: Dispatch<SetStateAction<string[]>>;
};

export const useCloudSync = ({ setData, setHabits }: UseCloudSyncOptions) => {
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  useEffect(() => {
    if (!auth) return;
    const currentAuth = auth;

    const initAuth = async () => {
      try {
        await signInAnonymously(currentAuth);
      } catch (error) {
        console.error('Auth error:', error);
        setSyncStatus('offline');
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(currentAuth, currentUser => {
      setUser(currentUser);
      if (!currentUser) setSyncStatus('offline');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    setSyncStatus('syncing');
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'trackerData', 'main');

    const unsubscribe = onSnapshot(
      docRef,
      docSnap => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();

          if (cloudData.data) {
            const syncedData = cloudData.data as HabitData;
            setData(syncedData);
            saveStoredData(syncedData);
          }

          if (cloudData.habits) {
            const syncedHabits = cloudData.habits as string[];
            setHabits(syncedHabits);
            saveStoredHabits(syncedHabits);
          }
        }

        setSyncStatus('synced');
      },
      error => {
        console.error('Sync listener error:', error);
        setSyncStatus('offline');
      },
    );

    return () => unsubscribe();
  }, [setData, setHabits, user]);

  const pushToCloud = useCallback(
    async (newData: HabitData, newHabits: string[]) => {
      if (!user || !db) return;

      setSyncStatus('syncing');

      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'trackerData', 'main');
        await setDoc(
          docRef,
          {
            data: newData,
            habits: newHabits,
            lastUpdated: new Date().toISOString(),
          },
          { merge: true },
        );
        setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to push to cloud', error);
        setSyncStatus('offline');
      }
    },
    [user],
  );

  return { syncStatus, pushToCloud };
};
