import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import AICACard from '../components/AICACard';
import { GROWW_STOCKS, GROWW_MUTUAL_FUNDS, US_STOCKS, CA_SHARMA } from '../data/userData';
import { useMarketData } from '../hooks/useMarketData';

const fmt = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};

type Tab = 'stocks' | 'mf' | 'us';

const RECOMMENDATION_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  'hold':             { color: Colors.success,      icon: 'checkmark-circle', label: '✅ Hold' },
  'exit':             { color: Colors.danger,        icon: 'close-circle',     label: '🚫 Exit' },
  'monitor':          { color: Colors.warning,       icon: 'eye',              label: '👁 Monitor' },
  'review':           { color: Colors.warning,       icon: 'refresh-circle',   label: '🔄 Review' },
  'redeem-for-debt':  { color: Colors.accent,        icon: 'arrow-up-circle',  label: '💡 Redeem for Debt' },
  'stop-sip':         { color: Colors.danger,        icon: 'stop-circle',      label: '🛑 Stop SIP' },
  'consolidate':      { color: Colors.primaryLight,  icon: 'git-merge',        label: '🔀 Consolidate' },
};

export default function InvestmentScreen() {
  const [tab, setTab] = useState<Tab>('stocks');
  const { getStockForHolding, isRefreshing, minutesAgo, lastUpdated } = useMarketData();

  const totalPortfolio = GROWW_STOCKS.currentValue + GROWW_MUTUAL_FUNDS.currentValue + US_STOCKS.currentValue;
  const totalInvested = GROWW_STOCKS.investedValue + GROWW_MUTUAL_FUNDS.investedValue + US_STOCKS.investedValue;
  const totalReturn = totalPortfolio - totalInvested;
  const totalReturnPct = ((totalReturn / totalInvested) * 100).toFixed(2);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Investment Portfolio</Text>
          <Text style={styles.subtitle}>Groww + INDmoney • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        </View>

        {/* Total Portfolio */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portLabel}>TOTAL PORTFOLIO</Text>
          <Text style={styles.portValue}>{fmt(totalPortfolio)}</Text>
          <View style={styles.portRow}>
            <View style={styles.portItem}>
              <Text style={styles.portItemLabel}>Invested</Text>
              <Text style={styles.portItemValue}>{fmt(totalInvested)}</Text>
            </View>
            <View style={styles.portDivider} />
            <View style={styles.portItem}>
              <Text style={styles.portItemLabel}>Returns</Text>
              <Text style={[styles.portItemValue, { color: totalReturn >= 0 ? Colors.success : Colors.danger }]}>
                {totalReturn >= 0 ? '+' : ''}{fmt(totalReturn)}
              </Text>
            </View>
            <View style={styles.portDivider} />
            <View style={styles.portItem}>
              <Text style={styles.portItemLabel}>Return %</Text>
              <Text style={[styles.portItemValue, { color: parseFloat(totalReturnPct) >= 0 ? Colors.success : Colors.danger }]}>
                {parseFloat(totalReturnPct) >= 0 ? '+' : ''}{totalReturnPct}%
              </Text>
            </View>
          </View>

          {/* Asset Allocation */}
          <Text style={styles.allocTitle}>Asset Allocation</Text>
          <AllocBar label="Mutual Funds" value={GROWW_MUTUAL_FUNDS.currentValue} total={totalPortfolio} color={Colors.primaryLight} />
          <AllocBar label="Stocks" value={GROWW_STOCKS.currentValue} total={totalPortfolio} color={Colors.accent} />
          <AllocBar label="US Stocks" value={US_STOCKS.currentValue} total={totalPortfolio} color={Colors.success} />
        </View>

        {/* AI CA Sharma */}
        <AICACard screen="investment" staticTips={CA_SHARMA.tips.investment} />

        {/* Tab Selector */}
        <View style={styles.tabRow}>
          {(['stocks', 'mf', 'us'] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'stocks' ? '📈 Stocks' : t === 'mf' ? '📊 Mutual Funds' : '🇺🇸 US Stocks'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'stocks' && (
          <>
            {/* Stocks Summary */}
            <View style={styles.summaryRow}>
              <MiniStat label="Current" value={fmt(GROWW_STOCKS.currentValue)} color={Colors.primary} />
              <MiniStat label="Invested" value={fmt(GROWW_STOCKS.investedValue)} color={Colors.textSecondary} />
              <MiniStat label="P&L" value={`+${fmt(GROWW_STOCKS.totalReturn)}`} color={Colors.success} />
              <MiniStat label="Return" value={`${GROWW_STOCKS.totalReturnPct}%`} color={Colors.success} />
            </View>
            {GROWW_STOCKS.holdings.map(stock => {
              const rec = RECOMMENDATION_CONFIG[stock.recommendation];
              const positive = stock.returnPct >= 0;
              return (
                <View key={stock.name} style={styles.holdingCard}>
                  <View style={styles.holdingTop}>
                    <View style={styles.holdingLeft}>
                      <Text style={styles.holdingName}>{stock.name}</Text>
                      <Text style={styles.holdingMeta}>{stock.shares} shares • avg ₹{stock.avgPrice}</Text>
                      <View style={[styles.recBadge, { backgroundColor: rec.color + '20' }]}>
                        <Text style={[styles.recText, { color: rec.color }]}>{rec.label}</Text>
                      </View>
                    </View>
                    <View style={styles.holdingRight}>
                      <Text style={styles.holdingCurrent}>{fmt(stock.currentValue)}</Text>
                      <Text style={styles.holdingInvested}>inv: {fmt(stock.investedValue)}</Text>
                      <Text style={[styles.holdingReturn, { color: positive ? Colors.success : Colors.danger }]}>
                        {positive ? '+' : ''}{fmt(stock.returnAmt)} ({positive ? '+' : ''}{stock.returnPct.toFixed(1)}%)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.holdingBar}>
                    <View style={[styles.holdingFill, {
                      width: `${Math.min(Math.abs(stock.returnPct) + 50, 100)}%`,
                      backgroundColor: positive ? Colors.success : Colors.danger,
                    }]} />
                  </View>
                  {(() => {
                    const liveQuote = getStockForHolding(stock.name);
                    return liveQuote ? (
                      <View style={styles.livePriceRow}>
                        <Text style={styles.livePriceLabel}>LIVE: ₹{liveQuote.price.toFixed(2)}</Text>
                        <Text style={[styles.livePriceChange, { color: liveQuote.changePercent >= 0 ? Colors.success : Colors.danger }]}>
                          {liveQuote.changePercent >= 0 ? '▲' : '▼'}{Math.abs(liveQuote.changePercent).toFixed(2)}% today
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.holdingPrice}>Avg Price: ₹{stock.marketPrice}</Text>
                    );
                  })()}
                </View>
              );
            })}
          </>
        )}

        {tab === 'mf' && (
          <>
            <View style={styles.summaryRow}>
              <MiniStat label="Current" value={fmt(GROWW_MUTUAL_FUNDS.currentValue)} color={Colors.primary} />
              <MiniStat label="Invested" value={fmt(GROWW_MUTUAL_FUNDS.investedValue)} color={Colors.textSecondary} />
              <MiniStat label="P&L" value={fmt(GROWW_MUTUAL_FUNDS.totalReturn)} color={Colors.danger} />
              <MiniStat label="XIRR" value={`${GROWW_MUTUAL_FUNDS.xirr}%`} color={Colors.danger} />
            </View>

            <View style={styles.alertBanner}>
              <Ionicons name="information-circle" size={16} color={Colors.primaryLight} />
              <Text style={styles.alertText}>
                Negative XIRR on most funds is due to recent SIP start dates. Index funds need 3+ years to show true performance.
              </Text>
            </View>

            {GROWW_MUTUAL_FUNDS.funds.map(fund => {
              const rec = RECOMMENDATION_CONFIG[fund.recommendation];
              const positive = fund.returnPct >= 0;
              return (
                <View key={fund.shortName} style={[styles.holdingCard, fund.recommendation === 'redeem-for-debt' && styles.holdingUrgent]}>
                  {fund.recommendation === 'redeem-for-debt' && (
                    <View style={styles.urgentBanner}>
                      <Text style={styles.urgentBannerText}>⚡ REDEEM THIS FIRST — Use to pay credit cards!</Text>
                    </View>
                  )}
                  <View style={styles.holdingTop}>
                    <View style={styles.holdingLeft}>
                      <Text style={styles.holdingName}>{fund.shortName}</Text>
                      <Text style={styles.holdingMeta}>{fund.type} Fund {fund.hasSIP ? '• SIP Active' : ''}</Text>
                      <View style={[styles.recBadge, { backgroundColor: rec.color + '20' }]}>
                        <Text style={[styles.recText, { color: rec.color }]}>{rec.label}</Text>
                      </View>
                    </View>
                    <View style={styles.holdingRight}>
                      <Text style={styles.holdingCurrent}>{fmt(fund.currentValue)}</Text>
                      <Text style={styles.holdingInvested}>inv: {fmt(fund.investedValue)}</Text>
                      <Text style={[styles.holdingReturn, { color: positive ? Colors.success : Colors.danger }]}>
                        {positive ? '+' : ''}{fmt(fund.returnAmt)} ({positive ? '+' : ''}{fund.returnPct.toFixed(1)}%)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.xirRow}>
                    <Text style={styles.xirLabel}>XIRR:</Text>
                    <Text style={[styles.xirValue, { color: fund.xirr >= 0 ? Colors.success : Colors.danger }]}>
                      {fund.xirr >= 0 ? '+' : ''}{fund.xirr}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === 'us' && (
          <View style={styles.usCard}>
            <Text style={styles.usTitle}>🇺🇸 US Stocks (via INDmoney)</Text>
            <View style={styles.usRow}>
              <Text style={styles.usLabel}>Current Value</Text>
              <Text style={styles.usValue}>{fmt(US_STOCKS.currentValue)}</Text>
            </View>
            <View style={styles.usRow}>
              <Text style={styles.usLabel}>Platform</Text>
              <Text style={styles.usValue}>INDmoney</Text>
            </View>
            <View style={styles.usTip}>
              <Ionicons name="globe" size={16} color={Colors.primaryLight} />
              <Text style={styles.usTipText}>
                US stocks provide good diversification and USD exposure. At ₹5.96K, this is a small position — consider growing it gradually once debt is cleared.
              </Text>
            </View>
          </View>
        )}

        {/* Investment Action Plan */}
        <Text style={styles.sectionTitle}>📋 Investment Action Plan</Text>
        <View style={styles.actionPlanCard}>
          {[
            { priority: '🔴 NOW', action: 'Redeem SBI Liquid Fund → Pay credit card dues', impact: 'Saves ₹6,200/yr interest' },
            { priority: '🔴 NOW', action: 'Sell Deep Diamond India (penny stock)', impact: 'Recover ₹133 before further loss' },
            { priority: '🟡 SOON', action: 'Stop SBI Nifty Index SIP (duplicate of HDFC Nifty 50)', impact: 'Save ₹X/month in fees' },
            { priority: '🟢 HOLD', action: 'Continue TATAGOLD + TATSILV ETFs', impact: 'Gold up +31%' },
            { priority: '🟢 HOLD', action: 'Continue HDFC Retirement Fund SIP', impact: 'Counts for 80C tax saving' },
            { priority: '🔵 LATER', action: 'After debt cleared: Increase HDFC Nifty 50 SIP', impact: 'Long-term wealth building' },
          ].map((item, i) => (
            <View key={i} style={styles.actionRow}>
              <Text style={styles.actionPriority}>{item.priority}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionText}>{item.action}</Text>
                <Text style={styles.actionImpact}>{item.impact}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function AllocBar({ label, value, total, color }: any) {
  const pct = ((value / total) * 100).toFixed(1);
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{label}</Text>
        <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>{fmt(value)} ({pct}%)</Text>
      </View>
      <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

function MiniStat({ label, value, color }: any) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  portfolioCard: {
    backgroundColor: Colors.primary, marginHorizontal: 16, borderRadius: 16,
    padding: 20, marginBottom: 16,
  },
  portLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  portValue: { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 4, marginBottom: 14 },
  portRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  portItem: { flex: 1, alignItems: 'center' },
  portDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  portItemLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  portItemValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  allocTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 6 },
  tabBtn: {
    flex: 1, padding: 8, borderRadius: 8, backgroundColor: Colors.card,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  summaryRow: { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 12 },
  miniStat: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 8, padding: 10,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  miniStatValue: { fontSize: 13, fontWeight: '700' },
  miniStatLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },
  holdingCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 14, marginBottom: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  holdingUrgent: { borderWidth: 2, borderColor: Colors.accent },
  urgentBanner: { backgroundColor: Colors.accent + '20', borderRadius: 6, padding: 6, marginBottom: 8 },
  urgentBannerText: { fontSize: 11, color: Colors.accent, fontWeight: '700' },
  holdingTop: { flexDirection: 'row', justifyContent: 'space-between' },
  holdingLeft: { flex: 1 },
  holdingRight: { alignItems: 'flex-end' },
  holdingName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  holdingMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, marginBottom: 6 },
  recBadge: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  recText: { fontSize: 10, fontWeight: '700' },
  holdingCurrent: { fontSize: 16, fontWeight: '800', color: Colors.text },
  holdingInvested: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  holdingReturn: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  holdingBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden', marginTop: 8, marginBottom: 4 },
  holdingFill: { height: '100%', borderRadius: 2 },
  holdingPrice: { fontSize: 10, color: Colors.textLight },
  livePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  livePriceLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  livePriceChange: { fontSize: 11, fontWeight: '600' },
  xirRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  xirLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  xirValue: { fontSize: 13, fontWeight: '700' },
  alertBanner: {
    flexDirection: 'row', backgroundColor: '#EBF5FB', borderRadius: 8,
    marginHorizontal: 16, padding: 10, marginBottom: 10, gap: 8, alignItems: 'flex-start',
  },
  alertText: { fontSize: 11, color: Colors.primaryLight, flex: 1, lineHeight: 16 },
  usCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 16, marginBottom: 16,
  },
  usTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  usRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  usLabel: { fontSize: 13, color: Colors.textSecondary },
  usValue: { fontSize: 13, fontWeight: '700', color: Colors.text },
  usTip: { flexDirection: 'row', marginTop: 12, gap: 8, alignItems: 'flex-start' },
  usTipText: { fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: Colors.text,
    marginHorizontal: 16, marginBottom: 8, marginTop: 8,
  },
  actionPlanCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 16, marginBottom: 16,
  },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
  actionPriority: { fontSize: 11, fontWeight: '700', width: 60 },
  actionText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  actionImpact: { fontSize: 11, color: Colors.success, marginTop: 2 },
});
