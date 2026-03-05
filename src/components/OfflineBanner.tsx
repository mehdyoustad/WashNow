import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { isConnected, wasOffline } = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const show = !isConnected || wasOffline;
  const isBack = wasOffline && isConnected;

  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -60, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [show]);

  return (
    <Animated.View style={[
      styles.banner,
      isBack ? styles.bannerBack : styles.bannerOffline,
      { transform: [{ translateY }], opacity },
    ]}>
      <Text style={styles.icon}>{isBack ? '✅' : '📵'}</Text>
      <Text style={styles.text}>
        {isBack ? 'Connexion rétablie' : 'Pas de connexion internet'}
      </Text>
      {!isConnected && <Text style={styles.sub}>Certaines données peuvent être en cache</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
  },
  bannerOffline: { backgroundColor: '#1a1a1a' },
  bannerBack: { backgroundColor: '#00c853' },
  icon: { fontSize: 16 },
  text: { color: 'white', fontWeight: '700', fontSize: 13, flex: 1 },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
});
