import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import AICACard from '../components/AICACard';
import { LIABILITIES, CA_SHARMA, USER_PROFILE } from '../data/userData';

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

type Strategy = 'avalanche' | 'snowball';

export default function DebtPlannerScreen() {
  const [strategy, setStrategy] = useState<Strategy>('avalanche');

  const totalDebt = LIABILITIES.totalLiabilities;
  const monthlyPayment = 18000; // ₹10K loan EMI + ₹8K card payment
  const availableExtra = 3000;  // Extra from SBI Liquid Fund redemption

  // Avalanche = highest interest first, Snowball = lowest balance first
  const sortedCards = [...LIABILITIES.cards].sort((a, b) =>
    strategy === 'avalanche' ? b.interest - a.interest : a.due - b.due
  );

  // Payoff timeline calculation
  const calcMonthsToPayoff = (principal: number, interest: number, payment: number) => {
    if (payment <= 0) return 999;
    const monthlyRate = interest / 100 / 12;
    if (monthlyRate === 0) return Math.ceil(principal / payment);
    return Math.ceil(Math.log(payment / (payment - principal * monthlyRate)) / Math.log(1 + monthlyRate));
  };

  const totalInterestCost = LIABILITIES.cards.reduce((sum, card) => {
    const months = calcMonthsToPayoff(card.due, card.interest, 2500);
    const total = 2500 * months;
    return sum + total - card.due;
  }, 0);

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Running balance simulation
  let runningDebt = LIABILITIES.creditCards;
  const debtTimeline = months.map(m => {
    const interest = runningDebt * (0.38 / 12);
    const payment = 8000 + (m > 1 ? availableExtra : 0);
    runningDebt = Math.max(runningDebt + interest - payment, 0);
    return { month: m, balance: runningDebt };
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Debt Repayment Plan</Text>
          <Text style={styles.subtitle}>Your path to zero debt 🎯</Text>
        </View>

        {/* Total Debt Overview */}
        <View style={styles.debtOverview}>
          <View style={styles.debtMain}>
            <Text style={styles.debtLabel}>TOTAL DEBT</Text>
            <Text style={styles.debtValue}>{fmt(totalDebt)}</Text>
            <Text style={styles.debtSub}>Loans: {fmt(LIABILITIES.loans)} + Cards: {fmt(LIABILITIES.creditCards)}</Text>
          </View>
          <View style={styles.debtStats}>
            <View style={styles.debtStat}>
              <Text style={styles.debtStatValue}>{fmt(totalInterestCost)}</Text>
              <Text style={styles.debtStatLabel}>Est. interest if min payments</Text>
            </View>
            <View style={styles.debtStat}>
              <Text style={[styles.debtStatValue, { color: Colors.success }]}>6 mo</Text>
              <Text style={styles.debtStatLabel}>Est. to clear cards</Text>
            </View>
          </View>
        </View>

        {/* CA Sharma */}
        <AICACard screen="debt" staticTips={CA_SHARMA.tips.debt} />

        {/* Urgent Action */}
        <View style={styles.urgentCard}>
          <Text style={styles.urgentTitle}>⚡ Immediate Action — Do This First!</Text>
          <View style={styles.urgentRow}>
            <Ionicons name="arrow-forward-circle" size={20} color={Colors.accent} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.urgentText}>Redeem SBI Liquid Fund (₹17,969)</Text>
              <Text style={styles.urgentSub}>Pay directly to your highest-interest credit card</Text>
              <Text style={styles.urgentSaving}>Saves ~₹6,200/year in interest! 💰</Text>
            </View>
          </View>
        </View>

        {/* Strategy Toggle */}
        <View style={styles.strategyToggle}>
          <TouchableOpacity
            style={[styles.stratBtn, strategy === 'avalanche' && styles.stratBtnActive]}
            onPress={() => setStrategy('avalanche')}
          >
            <Text style={[styles.stratText, strategy === 'avalanche' && styles.stratTextActive]}>
              🔥 Avalanche (Save More)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stratBtn, strategy === 'snowball' && styles.stratBtnActive]}
            onPress={() => setStrategy('snowball')}
          >
            <Text style={[styles.stratText, strategy === 'snowball' && styles.stratTextActive]}>
              ⛄ Snowball (Stay Motivated)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.stratHint}>
          {strategy === 'avalanche'
            ? 'Avalanche: Pay highest interest card first. Saves maximum money overall.'
            : 'Snowball: Pay smallest balance first. Quick wins keep you motivated!'}
        </Text>

        {/* Credit Cards */}
        <Text style={styles.sectionTitle}>Credit Cards</Text>
        {sortedCards.map((card, idx) => {
          const months = calcMonthsToPayoff(card.due, card.interest, 4000 - idx * 500);
          const utilPct = ((card.due / card.limit) * 100).toFixed(0);
          return (
            <View key={card.last4} style={[styles.cardItem, idx === 0 && styles.cardItemPrimary]}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  {idx === 0 && <View style={styles.priorityBadge}><Text style={styles.priorityText}>PAY FIRST</Text></View>}
                  <Text style={styles.cardName}>{card.name} •{card.last4}</Text>
                  <Text style={styles.cardInterest}>{card.interest}% p.a. interest</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardDue}>{fmt(card.due)}</Text>
                  <Text style={styles.cardDueLabel}>outstanding</Text>
                </View>
              </View>
              <View style={styles.cardBar}>
                <View style={[styles.cardBarFill, { width: `${utilPct}%`, backgroundColor: parseInt(utilPct) > 50 ? Colors.danger : Colors.warning }]} />
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardUtil}>Utilisation: {utilPct}% of {fmt(card.limit)}</Text>
                <Text style={styles.cardMonths}>~{months} months to clear</Text>
              </View>
            </View>
          );
        })}

        {/* Loan */}
        <Text style={styles.sectionTitle}>Personal Loan</Text>
        <View style={styles.loanCard}>
          <View style={styles.loanRow}>
            <Text style={styles.loanLabel}>Outstanding Balance</Text>
            <Text style={styles.loanValue}>{fmt(LIABILITIES.loans)}</Text>
          </View>
          <View style={styles.loanRow}>
            <Text style={styles.loanLabel}>Assumed Monthly EMI</Text>
            <Text style={styles.loanValue}>{fmt(10000)}</Text>
          </View>
          <View style={styles.loanRow}>
            <Text style={styles.loanLabel}>Estimated Payoff</Text>
            <Text style={[styles.loanValue, { color: Colors.primaryLight }]}>~20 months</Text>
          </View>
          <Text style={styles.loanTip}>💡 Once credit cards are cleared (month 6), redirect ₹8K extra to loan repayment</Text>
        </View>

        {/* 12-Month Debt Timeline */}
        <Text style={styles.sectionTitle}>Credit Card Balance — 12 Month Projection</Text>
        <View style={styles.timelineCard}>
          {debtTimeline.map(({ month, balance }) => (
            <View key={month} style={styles.timelineRow}>
              <Text style={styles.timelineMonth}>M{month}</Text>
              <View style={styles.timelineBar}>
                <View style={[styles.timelineFill, {
                  width: `${(balance / LIABILITIES.creditCards) * 100}%`,
                  backgroundColor: balance === 0 ? Colors.success : Colors.danger,
                }]} />
              </View>
              <Text style={[styles.timelineValue, { color: balance === 0 ? Colors.success : Colors.text }]}>
                {balance === 0 ? '✅ CLEAR' : fmt(balance)}
              </Text>
            </View>
          ))}
          <Text style={styles.timelineNote}>Based on ₹8K/month payment + SBI Liquid Fund redemption</Text>
        </View>

        {/* Milestone Motivations */}
        <Text style={styles.sectionTitle}>🎯 Milestones</Text>
        <View style={styles.milestonesCard}>
          {[
            { month: 1, text: 'Redeem SBI Liquid Fund → reduce cards by ₹18K', done: false },
            { month: 3, text: 'First credit card fully cleared! 🎉', done: false },
            { month: 6, text: 'All credit cards cleared! Save ₹8K more/month 🚀', done: false },
            { month: 12, text: 'Loan reduced by ₹1.16L! Net worth turning positive 💚', done: false },
            { month: 18, text: 'Debt-FREE! Start wealth-building phase 🌟', done: false },
          ].map(m => (
            <View key={m.month} style={styles.milestone}>
              <View style={[styles.milestoneDot, m.done && styles.milestoneDotDone]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.milestoneMonth}>Month {m.month}</Text>
                <Text style={styles.milestoneText}>{m.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  debtOverview: {
    backgroundColor: '#C0392B', marginHorizontal: 16, borderRadius: 16,
    padding: 20, marginBottom: 16,
  },
  debtMain: { marginBottom: 16 },
  debtLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  debtValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
  debtSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
  debtStats: { flexDirection: 'row', gap: 12 },
  debtStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 10 },
  debtStatValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  debtStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  urgentCard: {
    backgroundColor: '#FEF9E7', borderRadius: 12, marginHorizontal: 16,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.accent,
  },
  urgentTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  urgentRow: { flexDirection: 'row', alignItems: 'flex-start' },
  urgentText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  urgentSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  urgentSaving: { fontSize: 12, color: Colors.success, fontWeight: '700', marginTop: 4 },
  strategyToggle: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8,
  },
  stratBtn: {
    flex: 1, padding: 10, borderRadius: 8, backgroundColor: Colors.card,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  stratBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stratText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  stratTextActive: { color: '#fff' },
  stratHint: { fontSize: 11, color: Colors.textSecondary, marginHorizontal: 16, marginBottom: 12, fontStyle: 'italic' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: Colors.text,
    marginHorizontal: 16, marginBottom: 8, marginTop: 8,
  },
  cardItem: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 14, marginBottom: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  cardItemPrimary: { borderWidth: 2, borderColor: Colors.danger },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  priorityBadge: {
    backgroundColor: Colors.danger, borderRadius: 4, paddingHorizontal: 6,
    paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4,
  },
  priorityText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  cardName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  cardInterest: { fontSize: 11, color: Colors.danger, marginTop: 2 },
  cardDue: { fontSize: 18, fontWeight: '800', color: Colors.danger },
  cardDueLabel: { fontSize: 10, color: Colors.textSecondary },
  cardBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  cardBarFill: { height: '100%', borderRadius: 3 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardUtil: { fontSize: 11, color: Colors.textSecondary },
  cardMonths: { fontSize: 11, color: Colors.primaryLight, fontWeight: '600' },
  loanCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 16, marginBottom: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  loanRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  loanLabel: { fontSize: 13, color: Colors.textSecondary },
  loanValue: { fontSize: 13, fontWeight: '700', color: Colors.text },
  loanTip: { fontSize: 12, color: Colors.primaryLight, fontStyle: 'italic', marginTop: 10 },
  timelineCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 16, marginBottom: 16,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  timelineMonth: { fontSize: 11, color: Colors.textSecondary, width: 24 },
  timelineBar: { flex: 1, height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden' },
  timelineFill: { height: '100%', borderRadius: 5 },
  timelineValue: { fontSize: 11, fontWeight: '600', width: 72, textAlign: 'right' },
  timelineNote: { fontSize: 10, color: Colors.textLight, marginTop: 6 },
  milestonesCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 16, marginBottom: 16,
  },
  milestone: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  milestoneDot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.border,
    marginRight: 12, marginTop: 3, borderWidth: 2, borderColor: Colors.primaryLight,
  },
  milestoneDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  milestoneMonth: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  milestoneText: { fontSize: 13, color: Colors.text, marginTop: 2 },
});
