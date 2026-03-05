import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const light = {
  bg: '#f5f5f5',
  card: 'white',
  cardAlt: '#f5f5f5',
  header: '#0a0a0a',
  text: '#0a0a0a',
  textSub: '#999',
  textMuted: 'rgba(0,0,0,0.4)',
  border: '#e8e8e8',
  inputBg: '#f5f5f5',
  navBg: 'white',
  navBorder: '#e8e8e8',
};

const dark = {
  bg: '#111111',
  card: '#1e1e1e',
  cardAlt: '#2a2a2a',
  header: '#000000',
  text: '#f0f0f0',
  textSub: 'rgba(255,255,255,0.45)',
  textMuted: 'rgba(255,255,255,0.25)',
  border: '#333333',
  inputBg: '#2a2a2a',
  navBg: '#1a1a1a',
  navBorder: '#2a2a2a',
};

export type ThemeColors = typeof light;

const THEME_KEY = '@washnow_theme';

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeCtx {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

import { createElement } from 'react';

const ThemeContext = createContext<ThemeCtx>({
  colors: light,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: any }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(v => {
      if (v === 'light' || v === 'dark') setOverride(v);
    });
  }, []);

  const isDark = override !== null ? override === 'dark' : systemScheme === 'dark';

  const toggleTheme = useCallback(async () => {
    const next: 'light' | 'dark' = isDark ? 'light' : 'dark';
    setOverride(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  }, [isDark]);

  return createElement(
    ThemeContext.Provider,
    { value: { colors: isDark ? dark : light, isDark, toggleTheme } },
    children
  );
}

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}
