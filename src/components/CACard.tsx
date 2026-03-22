import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors, Typography } from '../theme/colors';

interface CACardProps {
  tips: string[];
  compact?: boolean;
}

export default function CACard({ tips, compact = false }: CACardProps) {
  const [tipIndex, setTipIndex] = useState(0);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % tips.length);
  };

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.header}>
        <Text style={styles.avatar}>👨‍💼</Text>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>CA Sharma</Text>
          <Text style={styles.exp}>50 years experience</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Your CA</Text>
        </View>
      </View>
      <Text style={styles.tip}>{tips[tipIndex]}</Text>
      {tips.length > 1 && (
        <TouchableOpacity onPress={nextTip} style={styles.nextBtn}>
          <Text style={styles.nextText}>Next tip →</Text>
        </TouchableOpacity>
      )}
      <View style={styles.dots}>
        {tips.map((_, i) => (
          <View key={i} style={[styles.dot, i === tipIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  compact: {
    padding: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    fontSize: 32,
    marginRight: 10,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  exp: {
    color: '#AED6F1',
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tip: {
    color: '#FDFEFE',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  nextBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  nextText: {
    color: Colors.accentLight,
    fontSize: 12,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 14,
  },
});
