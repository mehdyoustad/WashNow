import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function WashNowLogo({ size = 'md', variant = 'light' }: Props) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1;
  const iconSize = Math.round(52 * scale);
  const textSize = Math.round(26 * scale);
  const subSize = Math.round(11 * scale);
  const radius = Math.round(14 * scale);

  const textColor = variant === 'dark' ? '#FFFFFF' : '#0D0D0D';
  const subColor = variant === 'dark' ? 'rgba(255,255,255,0.45)' : '#6B7280';

  return (
    <View style={styles.wrapper}>
      {/* Icône */}
      <View style={[
        styles.iconBox,
        { width: iconSize, height: iconSize, borderRadius: radius },
      ]}>
        {/* Fond bleu dégradé simulé avec deux couches */}
        <View style={[StyleSheet.absoluteFillObject, styles.iconBg1, { borderRadius: radius }]} />
        <View style={[StyleSheet.absoluteFillObject, styles.iconBg2, { borderRadius: radius }]} />

        {/* W stylisé */}
        <View style={styles.iconContent}>
          <Text style={[styles.iconW, { fontSize: Math.round(22 * scale) }]}>W</Text>
          {/* Goutte d'eau */}
          <View style={[styles.drop, {
            width: Math.round(5 * scale),
            height: Math.round(7 * scale),
            borderRadius: Math.round(3 * scale),
            top: Math.round(4 * scale),
            right: Math.round(8 * scale),
          }]} />
        </View>
      </View>

      {/* Texte */}
      <View style={styles.textBlock}>
        <Text style={[styles.brandName, { fontSize: textSize, color: textColor }]}>
          Wash<Text style={[styles.brandAccent, { fontSize: textSize }]}>Now</Text>
        </Text>
        <Text style={[styles.tagline, { fontSize: subSize, color: subColor }]}>
          Lavage à domicile
        </Text>
      </View>
    </View>
  );
}

export function WashNowMark({ size = 44 }: { size?: number }) {
  const radius = Math.round(size * 0.27);
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: radius }]}>
      <View style={[StyleSheet.absoluteFillObject, styles.iconBg1, { borderRadius: radius }]} />
      <View style={[StyleSheet.absoluteFillObject, styles.iconBg2, { borderRadius: radius }]} />
      <Text style={[styles.markW, { fontSize: Math.round(size * 0.42) }]}>W</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  iconBg1: {
    backgroundColor: '#1558E7',
  },
  iconBg2: {
    backgroundColor: 'transparent',
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    // Simule un léger dégradé angulaire
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  iconContent: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconW: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  drop: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  textBlock: {
    gap: 1,
  },
  brandName: {
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: undefined,
  },
  brandAccent: {
    color: '#1558E7',
    fontWeight: '800',
  },
  tagline: {
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  mark: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  markW: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
});
