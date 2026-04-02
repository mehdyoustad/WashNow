import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

type Tab = 'home' | 'booking' | 'tracking' | 'profile';

interface Props {
  active: Tab;
}

const TABS: {
  key: Tab;
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'home',     label: 'Accueil',  route: '/home',     icon: 'home-outline',     iconActive: 'home' },
  { key: 'booking',  label: 'Réserver', route: '/booking',  icon: 'add-circle-outline', iconActive: 'add-circle' },
  { key: 'tracking', label: 'Suivi',    route: '/tracking', icon: 'location-outline', iconActive: 'location' },
  { key: 'profile',  label: 'Profil',   route: '/profile',  icon: 'person-outline',   iconActive: 'person' },
];

export default function TabBar({ active }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const pb = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.navBg,
        borderTopColor: colors.navBorder,
        paddingBottom: pb,
      },
    ]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? colors.primary : colors.textSub;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => !isActive && router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            {isActive && (
              <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />
            )}
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={22}
              color={color}
            />
            <Text style={[styles.label, { color }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 4,
    position: 'relative',
    minHeight: 50,
  },
  activeBar: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 2,
    borderRadius: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
