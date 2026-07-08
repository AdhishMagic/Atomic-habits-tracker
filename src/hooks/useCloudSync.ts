import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { get, onValue, ref, set, update, type Database } from 'firebase/database';
import { auth, db } from '../services/firebase';
import type { HabitData, SyncStatus } from '../types';
import { saveStoredData, saveStoredHabits } from '../utils/storage';

type UseCloudSyncOptions = {
  setData: Dispatch<SetStateAction<HabitData>>;
  setHabits: Dispatch<SetStateAction<string[]>>;
};

type TrackerCloudState = {
  data?: HabitData;
  habits?: string[];
  lastUpdated?: string;
};

const getTrackerRef = (database: Database, uid: string) => ref(database, `users/${uid}/trackerData`);

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
    const trackerRef = getTrackerRef(db, user.uid);

    const applyCloudState = (cloudData: TrackerCloudState | null | undefined) => {
      if (!cloudData) return;

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
    };

    const syncInitialCloudState = async () => {
      try {
        const snapshot = await get(trackerRef);
        if (snapshot.exists()) {
          applyCloudState(snapshot.val() as TrackerCloudState);
        }
      } catch (error) {
        console.error('Initial sync load error:', error);
      }
    };

    void syncInitialCloudState();

    const unsubscribe = onValue(
      trackerRef,
      snapshot => {
        if (snapshot.exists()) {
          applyCloudState(snapshot.val() as TrackerCloudState);
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
        const trackerRef = getTrackerRef(db, user.uid);
        const cloudPayload: TrackerCloudState = {
          data: newData,
          habits: newHabits,
          lastUpdated: new Date().toISOString(),
        };

        const existingSnapshot = await get(trackerRef);

        if (existingSnapshot.exists()) {
          await update(trackerRef, cloudPayload);
        } else {
          await set(trackerRef, cloudPayload);
        }

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
