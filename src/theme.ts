import AsyncStorage from '@react-native-async-storage/async-storage';
import { createElement } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

const light = {
  bg: '#F7F8FA',
  card: '#FFFFFF',
  cardAlt: '#F3F4F6',
  header: '#0D0D0D',
  text: '#0D0D0D',
  textSub: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#F3F4F6',
  navBg: '#FFFFFF',
  navBorder: '#E5E7EB',
  primary: '#1558E7',
  success: '#16A34A',
  danger: '#DC2626',
};

const dark = {
  bg: '#111111',
  card: '#1C1C1E',
  cardAlt: '#2C2C2E',
  header: '#000000',
  text: '#F2F2F7',
  textSub: '#8E8E93',
  textMuted: '#6C6C70',
  border: '#38383A',
  inputBg: '#2C2C2E',
  navBg: '#1C1C1E',
  navBorder: '#38383A',
  primary: '#3B7FFF',
  success: '#30D158',
  danger: '#FF453A',
};

export type ThemeColors = typeof light;

const THEME_KEY = '@washnow_theme';

interface ThemeCtx {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

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
