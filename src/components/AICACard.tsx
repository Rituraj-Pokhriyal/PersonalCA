import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAITips } from '../hooks/useAITips';

type Screen = 'home' | 'budget' | 'debt' | 'investment' | 'tax';

interface AICACardProps {
  screen: Screen;
  compact?: boolean;
  staticTips?: string[];
}

export default function AICACard({ screen, compact = false, staticTips = [] }: AICACardProps) {
  const { tip, isLoading, isAI, staticTips: fallbackTips, refresh } = useAITips(screen);
  const [staticIndex, setStaticIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // When tip changes, fade in smoothly
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [tip]);

  const displayTip = isAI ? tip : (staticTips[staticIndex] || fallbackTips[staticIndex] || fallbackTips[0]);
  const availableTips = isAI ? [tip] : (staticTips.length > 0 ? staticTips : fallbackTips);

  const nextStaticTip = () => {
    if (!isAI) {
      setStaticIndex(prev => (prev + 1) % availableTips.length);
    }
  };

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.header}>
        <Text style={styles.avatar}>👨‍💼</Text>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>CA Sharma</Text>
          <Text style={styles.exp}>50 years experience</Text>
        </View>
        <View style={styles.rightHeader}>
          {isAI && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Your CA</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
          <Text style={styles.loadingText}>CA Sharma is thinking...</Text>
        </View>
      ) : (
        <Animated.Text style={[styles.tip, { opacity: fadeAnim }]}>
          {displayTip}
        </Animated.Text>
      )}

      <View style={styles.footer}>
        {!isAI && availableTips.length > 1 && (
          <TouchableOpacity onPress={nextStaticTip}>
            <Text style={styles.nextText}>Next tip →</Text>
          </TouchableOpacity>
        )}
        {isAI && (
          <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>↻ Fresh advice</Text>
          </TouchableOpacity>
        )}
        <View style={styles.dots}>
          {!isAI && availableTips.map((_, i) => (
            <View key={i} style={[styles.dot, i === staticIndex && styles.dotActive]} />
          ))}
        </View>
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
  compact: { padding: 12, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { fontSize: 32, marginRight: 10 },
  nameBlock: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  exp: { color: '#AED6F1', fontSize: 11, marginTop: 1 },
  rightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiBadge: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aiBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  tip: { color: '#FDFEFE', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontStyle: 'italic' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  nextText: { color: Colors.accentLight, fontSize: 12, fontWeight: '600' },
  refreshBtn: {},
  refreshText: { color: Colors.accentLight, fontSize: 11, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: Colors.accent, width: 14 },
});
