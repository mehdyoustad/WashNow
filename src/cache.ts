import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILE: 'cache_profile',
  VEHICLES: 'cache_vehicles',
  HISTORY: 'cache_history',
  CGU_ACCEPTED: 'cgu_accepted_v1',
  MAINTENANCE_CHECKED: 'maintenance_last_check',
};

export const Cache = {
  async set(key: string, data: unknown) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  },

  async get<T>(key: string, maxAgeMs = 24 * 60 * 60 * 1000): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > maxAgeMs) return null;
      return data as T;
    } catch {
      return null;
    }
  },

  async remove(key: string) {
    try { await AsyncStorage.removeItem(key); } catch {}
  },

  async clear() {
    try {
      const keys = Object.values(KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch {}
  },
};

export const CACHE_KEYS = KEYS;
