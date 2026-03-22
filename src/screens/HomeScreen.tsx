import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  StatusBar, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import AICACard from '../components/AICACard';
import MarketTickerBar from '../components/MarketTickerBar';
import DecisionCard from '../components/DecisionCard';
import {
  USER_PROFILE, ASSETS, LIABILITIES, NET_WORTH,
  GROWW_STOCKS, GROWW_MUTUAL_FUNDS, US_STOCKS,
} from '../data/userData';
import { useDecisionEngine } from '../hooks/useDecisionEngine';

const fmt = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

export default function HomeScreen() {
  const totalPortfolio = GROWW_STOCKS.currentValue + GROWW_MUTUAL_FUNDS.currentValue + US_STOCKS.currentValue;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const { actions, isEnhancing } = useDecisionEngine();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste, {USER_PROFILE.name}! 🙏</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.cibilBadge}>
            <Text style={styles.cibilScore}>{USER_PROFILE.cibilScore}</Text>
            <Text style={styles.cibilLabel}>CIBIL</Text>
          </View>
        </View>

        {/* ── LIVE MARKET TICKER ── */}
        <MarketTickerBar />

        {/* ── NET WORTH CARD ── */}
        <View style={styles.networthCard}>
          <Text style={styles.networthLabel}>NET WORTH</Text>
          <Text style={[styles.networthValue, { color: NET_WORTH < 0 ? Colors.danger : Colors.success }]}>
            {NET_WORTH < 0 ? '-' : ''}₹{Math.abs(NET_WORTH / 100000).toFixed(2)}L
          </Text>
          <View style={styles.networthRow}>
            <View style={styles.networthItem}>
              <Ionicons name="trending-up" size={14} color={Colors.success} />
              <Text style={styles.networthItemText}>Assets {fmt(ASSETS.totalAssets)}</Text>
            </View>
            <View style={styles.networthDivider} />
            <View style={styles.networthItem}>
              <Ionicons name="trending-down" size={14} color={Colors.danger} />
              <Text style={styles.networthItemText}>Liabilities {fmt(LIABILITIES.totalLiabilities)}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${Math.min((ASSETS.totalAssets / LIABILITIES.totalLiabilities) * 100, 100)}%`,
              backgroundColor: Colors.primaryLight,
            }]} />
          </View>
          <Text style={styles.progressLabel}>Assets cover {((ASSETS.totalAssets / LIABILITIES.totalLiabilities) * 100).toFixed(0)}% of liabilities</Text>
        </View>

        {/* ── AI CA SHARMA ── */}
        <AICACard screen="home" />

        {/* ── QUICK STATS ── */}
        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          <StatCard label="Monthly Salary" value={fmt(USER_PROFILE.monthlySalary)} icon="cash" color={Colors.success} sub="After rent: ₹38K" />
          <StatCard label="Total Portfolio" value={fmt(totalPortfolio)} icon="bar-chart" color={Colors.primaryLight} sub="+Stocks & MFs" />
          <StatCard label="Credit Card Due" value={fmt(LIABILITIES.creditCards)} icon="card" color={Colors.danger} sub={`${LIABILITIES.creditCardCount} cards`} />
          <StatCard label="Total Loans" value={fmt(LIABILITIES.loans)} icon="cash" color={Colors.warning} sub="Outstanding" />
          <StatCard label="CIBIL Score" value={`${USER_PROFILE.cibilScore}`} icon="shield-checkmark" color={Colors.primaryLight} sub="Good range" />
        </ScrollView>

        {/* ── PORTFOLIO SUMMARY ── */}
        <Text style={styles.sectionTitle}>Portfolio Snapshot</Text>
        <View style={styles.portfolioCard}>
          <PortfolioRow label="Groww Stocks" value={GROWW_STOCKS.currentValue} returnPct={GROWW_STOCKS.totalReturnPct} positive />
          <PortfolioRow label="Mutual Funds" value={GROWW_MUTUAL_FUNDS.currentValue} returnPct={GROWW_MUTUAL_FUNDS.totalReturnPct} positive={false} />
          <PortfolioRow label="US Stocks (INDmoney)" value={US_STOCKS.currentValue} returnPct={0} positive />
          <View style={styles.portfolioDivider} />
          <PortfolioRow label="Total" value={totalPortfolio} returnPct={0} positive bold />
        </View>

        {/* ── AI DECISION CARD (replaces static action list) ── */}
        <DecisionCard actions={actions} isEnhancing={isEnhancing} />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PortfolioRow({ label, value, returnPct, positive, bold }: {
  label: string; value: number; returnPct: number; positive: boolean; bold?: boolean;
}) {
  return (
    <View style={styles.portfolioRow}>
      <Text style={[styles.portfolioLabel, bold && { fontWeight: '700', color: Colors.text }]}>{label}</Text>
      <View style={styles.portfolioRight}>
        <Text style={[styles.portfolioValue, bold && { fontWeight: '700' }]}>{fmt(value)}</Text>
        {returnPct !== 0 && (
          <Text style={[styles.portfolioReturn, { color: returnPct > 0 ? Colors.success : Colors.danger }]}>
            {returnPct > 0 ? '+' : ''}{returnPct.toFixed(2)}%
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
  date: { color: '#AED6F1', fontSize: 12, marginTop: 4 },
  cibilBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  cibilScore: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cibilLabel: { color: '#AED6F1', fontSize: 10, marginTop: 2 },
  networthCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  networthLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 1 },
  networthValue: { fontSize: 36, fontWeight: '800', marginTop: 4 },
  networthRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  networthItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  networthItemText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
  networthDivider: { width: 1, height: 16, backgroundColor: Colors.border, marginHorizontal: 12 },
  progressBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, color: Colors.textLight, marginTop: 4 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: Colors.text,
    marginHorizontal: 16, marginBottom: 10, marginTop: 8,
  },
  statsRow: { marginBottom: 8 },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    width: 130,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statSub: { fontSize: 10, color: Colors.textLight, marginTop: 3 },
  portfolioCard: {
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
  portfolioRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  portfolioLabel: { fontSize: 13, color: Colors.textSecondary },
  portfolioRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  portfolioValue: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  portfolioReturn: { fontSize: 11, fontWeight: '600' },
  portfolioDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
});
