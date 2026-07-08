import type { HabitData } from '../types';

const DATA_KEY = 'atomicHabitsData';
const HABITS_KEY = 'atomicHabitsList';

export const loadStoredData = (): HabitData | null => {
  const savedData = localStorage.getItem(DATA_KEY);
  return savedData ? (JSON.parse(savedData) as HabitData) : null;
};

export const loadStoredHabits = (): string[] | null => {
  const savedHabits = localStorage.getItem(HABITS_KEY);
  return savedHabits ? (JSON.parse(savedHabits) as string[]) : null;
};

export const saveStoredData = (data: HabitData) => {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
};

export const saveStoredHabits = (habits: string[]) => {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
};

export const clearStoredData = () => {
  localStorage.removeItem(DATA_KEY);
};
