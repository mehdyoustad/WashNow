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

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
