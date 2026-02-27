import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

// ===== BOUTON ANIMÉ =====
export function AnimatedButton({ onPress, style, children }: any) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ===== PULSE (pour le point vert du suivi) =====
export function PulseIndicator() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 750 }),
        withTiming(1, { duration: 750 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 750 }),
        withTiming(1, { duration: 750 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pulse, animatedStyle]} />
  );
}

// ===== SKELETON =====
export function Skeleton({ width, height, borderRadius = 8 }: any) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
      ]}
    />
  );
}

// ===== CARD ANIMÉE (apparition) =====
export function AnimatedCard({ children, style, index = 0 }: any) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

// ===== FADE IN UP =====
export function FadeUpView({ children, style, delay = 0 }: any) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pulse: {
    width: 10,
    height: 10,
    backgroundColor: '#00c853',
    borderRadius: 5,
  },
  skeleton: {
    backgroundColor: '#e8e8e8',
  },
});