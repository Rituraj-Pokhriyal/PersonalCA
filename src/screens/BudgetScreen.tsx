import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import AICACard from '../components/AICACard';
import { USER_PROFILE, DEFAULT_BUDGET, CA_SHARMA } from '../data/userData';

type Category = {
  id: string;
  name: string;
  amount: number;
  icon: string;
  color: string;
  isFixed: boolean;
  spent?: number;
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function BudgetScreen() {
  const [categories, setCategories] = useState<Category[]>(
    DEFAULT_BUDGET.categories.map(c => ({ ...c, spent: Math.floor(c.amount * (0.4 + Math.random() * 0.7)) }))
  );
  const [salary] = useState(USER_PROFILE.monthlySalary);

  const totalBudgeted = categories.reduce((s, c) => s + c.amount, 0);
  const totalSpent = categories.reduce((s, c) => s + (c.spent || 0), 0);
  const savings = salary - totalSpent;
  const savingsPct = ((savings / salary) * 100).toFixed(1);

  const debtCategories = categories.filter(c => c.name.includes('EMI') || c.name.includes('Card') || c.name.includes('Loan'));
  const debtTotal = debtCategories.reduce((s, c) => s + c.amount, 0);
  const debtPct = ((debtTotal / salary) * 100).toFixed(0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Budget Tracker</Text>
          <Text style={styles.subtitle}>March 2026</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard label="Monthly Income" value={fmt(salary)} color={Colors.success} icon="arrow-down-circle" />
          <SummaryCard label="Budgeted" value={fmt(totalBudgeted)} color={Colors.primaryLight} icon="list" />
          <SummaryCard label="Savings" value={fmt(Math.max(savings, 0))} color={savings > 0 ? Colors.success : Colors.danger} icon="save" />
        </View>

        {/* Savings Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Monthly Savings Rate</Text>
            <Text style={[styles.savingsPct, { color: savings > 0 ? Colors.success : Colors.danger }]}>
              {savingsPct}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${Math.min(Math.max(parseFloat(savingsPct), 0), 100)}%`,
              backgroundColor: savings > 0 ? Colors.success : Colors.danger,
            }]} />
          </View>
          <Text style={styles.progressHint}>Target: 20% savings rate (₹10,000/month)</Text>

          {/* 50-30-20 breakdown */}
          <View style={styles.ruleBox}>
            <Text style={styles.ruleTitle}>50-30-20 Analysis</Text>
            <RuleRow label="Needs (50% = ₹25K)" actual={totalBudgeted - 5000 - 7000} target={25000} />
            <RuleRow label="Wants (30% = ₹15K)" actual={5000} target={15000} />
            <RuleRow label="Savings/Invest (20% = ₹10K)" actual={7000} target={10000} />
          </View>
        </View>

        {/* Debt Burden */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: Colors.danger }]}>
          <Text style={styles.cardTitle}>⚠️ Debt Burden</Text>
          <Text style={styles.debtWarning}>
            Your EMIs + Credit Cards = {fmt(debtTotal)} ({debtPct}% of salary)
          </Text>
          <Text style={styles.debtHint}>
            Recommended: Keep total debt payments below 30% of salary
          </Text>
        </View>

        {/* CA Sharma */}
        <AICACard screen="budget" staticTips={CA_SHARMA.tips.budget} />

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        <View style={styles.card}>
          {categories.map((cat) => {
            const pct = cat.amount > 0 ? Math.min(((cat.spent || 0) / cat.amount) * 100, 100) : 0;
            const overBudget = (cat.spent || 0) > cat.amount;
            return (
              <View key={cat.id} style={styles.catRow}>
                <View style={[styles.catIconBox, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                </View>
                <View style={styles.catInfo}>
                  <View style={styles.catTitleRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    {cat.isFixed && <View style={styles.fixedBadge}><Text style={styles.fixedText}>Fixed</Text></View>}
                  </View>
                  <View style={styles.catProgressBar}>
                    <View style={[styles.catProgressFill, {
                      width: `${pct}%`,
                      backgroundColor: overBudget ? Colors.danger : cat.color,
                    }]} />
                  </View>
                  <View style={styles.catAmounts}>
                    <Text style={styles.catSpent}>{fmt(cat.spent || 0)} spent</Text>
                    <Text style={[styles.catBudget, { color: overBudget ? Colors.danger : Colors.textSecondary }]}>
                      / {fmt(cat.amount)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Monthly Plan */}
        <Text style={styles.sectionTitle}>6-Month Savings Projection</Text>
        <View style={styles.card}>
          {[1, 2, 3, 4, 5, 6].map(month => {
            const projected = salary - totalBudgeted + (month >= 2 ? 2000 * (month - 1) : 0);
            return (
              <View key={month} style={styles.projRow}>
                <Text style={styles.projMonth}>Month {month}</Text>
                <View style={styles.projBar}>
                  <View style={[styles.projFill, { width: `${Math.min((projected / salary) * 100, 100)}%`, backgroundColor: Colors.success }]} />
                </View>
                <Text style={styles.projValue}>{fmt(Math.max(projected, 0))}</Text>
              </View>
            );
          })}
          <Text style={styles.projNote}>* Assumes ₹2K/month improvement as debt reduces</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value, color, icon }: any) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function RuleRow({ label, actual, target }: { label: string; actual: number; target: number }) {
  const pct = Math.min((actual / target) * 100, 100);
  const ok = actual <= target;
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: 11, color: ok ? Colors.success : Colors.danger, fontWeight: '600' }}>
          ₹{actual.toLocaleString('en-IN')} {ok ? '✓' : '↑'}
        </Text>
      </View>
      <View style={[styles.progressBar, { marginTop: 3 }]}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: ok ? Colors.success : Colors.danger }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 12, padding: 12,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  summaryValue: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 16, marginBottom: 12, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  savingsPct: { fontSize: 22, fontWeight: '800' },
  progressBar: {
    height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressHint: { fontSize: 11, color: Colors.textLight },
  ruleBox: { backgroundColor: Colors.background, borderRadius: 10, padding: 12, marginTop: 12 },
  ruleTitle: { fontSize: 12, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  debtWarning: { fontSize: 14, fontWeight: '600', color: Colors.danger, marginBottom: 4 },
  debtHint: { fontSize: 12, color: Colors.textSecondary },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: Colors.text,
    marginHorizontal: 16, marginBottom: 8, marginTop: 4,
  },
  catRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  catIconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 },
  catInfo: { flex: 1 },
  catTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  catName: { fontSize: 13, fontWeight: '600', color: Colors.text, flex: 1 },
  fixedBadge: { backgroundColor: Colors.border, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  fixedText: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600' },
  catProgressBar: { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 3 },
  catProgressFill: { height: '100%', borderRadius: 3 },
  catAmounts: { flexDirection: 'row', gap: 4 },
  catSpent: { fontSize: 11, color: Colors.text, fontWeight: '600' },
  catBudget: { fontSize: 11 },
  projRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  projMonth: { fontSize: 12, color: Colors.textSecondary, width: 56 },
  projBar: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  projFill: { height: '100%', borderRadius: 3 },
  projValue: { fontSize: 12, fontWeight: '600', color: Colors.success, width: 60, textAlign: 'right' },
  projNote: { fontSize: 10, color: Colors.textLight, marginTop: 4 },
});
