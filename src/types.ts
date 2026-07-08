export type AccessMode = 'view' | 'edit';

export type SyncStatus = 'offline' | 'syncing' | 'synced';

export type HabitDay = Record<string, boolean | string | undefined>;

export type HabitData = Record<string, HabitDay>;

export type HabitModalState = {
  isOpen: boolean;
  mode: 'add' | 'edit';
  habitName: string;
  inputValue: string;
};

export type ConfirmModalState = {
  isOpen: boolean;
  action: 'clear_all' | null;
  text: string;
};
