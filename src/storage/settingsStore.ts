import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  demoNotifications: boolean;
  toggleDemoNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      demoNotifications: false,
      toggleDemoNotifications: () => set((s) => ({ demoNotifications: !s.demoNotifications })),
    }),
    { name: 'field-tasks-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);