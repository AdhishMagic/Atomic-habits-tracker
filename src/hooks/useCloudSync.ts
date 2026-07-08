import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';
import { get, onValue, ref, set, update, type Database } from '@firebase/database';
import { db } from '../services/firebase';
import type { HabitData, SyncStatus } from '../types';
import { saveStoredData, saveStoredHabits } from '../utils/storage';

type UseCloudSyncOptions = {
  setData: Dispatch<SetStateAction<HabitData>>;
  setHabits: Dispatch<SetStateAction<string[]>>;
};

type TrackerCloudState = {
  data?: HabitData;
  habits?: string[];
  notes?: Record<string, string>;
  lastUpdated?: string;
};

const extractNotes = (data: HabitData) =>
  Object.entries(data).reduce<Record<string, string>>((notes, [date, dayData]) => {
    if (typeof dayData.notes === 'string') {
      notes[date] = dayData.notes;
    }

    return notes;
  }, {});

const hydrateDataWithNotes = (data: HabitData, notes?: Record<string, string>) => {
  if (!notes) return data;

  return Object.entries(notes).reduce<HabitData>(
    (hydratedData, [date, note]) => ({
      ...hydratedData,
      [date]: {
        ...(hydratedData[date] || {}),
        notes: note,
      },
    }),
    { ...data },
  );
};

export const useCloudSync = ({ setData, setHabits }: UseCloudSyncOptions) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  useEffect(() => {
    if (!db) return;

    const database: Database = db;
    const trackerRef = ref(database, 'habitTracker');

    const applyCloudState = (cloudData: TrackerCloudState | null | undefined) => {
      if (!cloudData) return;

      if (cloudData.data || cloudData.notes) {
        const syncedData = hydrateDataWithNotes((cloudData.data || {}) as HabitData, cloudData.notes);
        setData(syncedData);
        saveStoredData(syncedData);
      }

      if (cloudData.habits) {
        const syncedHabits = cloudData.habits as string[];
        setHabits(syncedHabits);
        saveStoredHabits(syncedHabits);
      }
    };

    setSyncStatus('syncing');

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
  }, [setData, setHabits]);

  const pushToCloud = useCallback(
    async (newData: HabitData, newHabits: string[]) => {
      if (!db) return;

      setSyncStatus('syncing');

      try {
        const database: Database = db;
        const trackerRef = ref(database, 'habitTracker');
        const cloudPayload: TrackerCloudState = {
          data: newData,
          habits: newHabits,
          notes: extractNotes(newData),
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
    [],
  );

  return { syncStatus, pushToCloud };
};
