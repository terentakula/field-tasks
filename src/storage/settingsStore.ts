import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  demoNotifications: boolean;
  serverUrl: string;
  toggleDemoNotifications: () => void;
  setServerUrl: (url: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      demoNotifications: false,
      serverUrl: 'http://192.168.1.208:3001',
      toggleDemoNotifications: () => set((s) => ({ demoNotifications: !s.demoNotifications })),
      setServerUrl: (url) => set({ serverUrl: url.trim() }),
    }),
    { name: 'field-tasks-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);