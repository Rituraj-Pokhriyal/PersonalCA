import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PriorityAction } from '../types/ai.types';

interface DecisionCardProps {
  actions: PriorityAction[];
  isEnhancing: boolean;
}

const URGENCY_COLORS: Record<string, string> = {
  critical: Colors.danger,
  high: Colors.warning,
  medium: Colors.primaryLight,
  low: Colors.success,
};

export default function DecisionCard({ actions, isEnhancing }: DecisionCardProps) {
  if (actions.length === 0 && !isEnhancing) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>CA Sharma's To-Do List 📋</Text>
        {isEnhancing && (
          <View style={styles.enhancingRow}>
            <ActivityIndicator size="small" color={Colors.primaryLight} />
            <Text style={styles.enhancingText}>AI refining...</Text>
          </View>
        )}
      </View>

      {actions.map(action => (
        <ActionRow key={action.id} action={action} />
      ))}
    </View>
  );
}

function ActionRow({ action }: { action: PriorityAction }) {
  const urgencyColor = URGENCY_COLORS[action.urgency] ?? Colors.neutral;
  const isUrgent = action.urgency === 'critical' || action.urgency === 'high';

  return (
    <View style={[styles.actionItem, isUrgent && { backgroundColor: urgencyColor + '12' }]}>
      <View style={[styles.urgencyBar, { backgroundColor: urgencyColor }]} />
      <Ionicons
        name={action.icon as any}
        size={16}
        color={urgencyColor}
        style={styles.icon}
      />
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: isUrgent ? urgencyColor : Colors.text }]}>
          {action.title}
        </Text>
        <Text style={styles.actionRationale}>{action.rationale}</Text>
        <Text style={styles.actionImpact}>💰 {action.estimatedImpact}</Text>
      </View>
      {action.aiEnhanced && (
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>AI</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '700', color: Colors.text },
  enhancingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  enhancingText: { fontSize: 10, color: Colors.textSecondary, fontStyle: 'italic' },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
    gap: 8,
  },
  urgencyBar: { width: 3, borderRadius: 2, alignSelf: 'stretch' },
  icon: { marginTop: 1 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  actionRationale: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  actionImpact: { fontSize: 11, color: Colors.success, marginTop: 2, fontWeight: '600' },
  aiTag: {
    backgroundColor: Colors.success + '22',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  aiTagText: { fontSize: 9, color: Colors.success, fontWeight: '800' },
});
