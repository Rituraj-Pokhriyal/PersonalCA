import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import AICACard from '../components/AICACard';
import { TAX_DATA, USER_PROFILE, CA_SHARMA } from '../data/userData';

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

type Regime = 'old' | 'new';

export default function TaxPlannerScreen() {
  const [regime, setRegime] = useState<Regime>('old');
  const [show80C, setShow80C] = useState(false);

  const currentTax = regime === 'old' ? TAX_DATA.oldRegimeTax : TAX_DATA.newRegimeTax;
  const savings = TAX_DATA.newRegimeTax.taxPayable - TAX_DATA.oldRegimeTax.taxPayable;

  const deductionItems = [
    { label: 'Standard Deduction', amount: TAX_DATA.standardDeduction, section: 'Auto', used: true },
    { label: 'HRA (Rent ₹12K/mo)', amount: TAX_DATA.hraExemption, section: '10(13A)', used: true },
    { label: 'HDFC Retirement SIP', amount: 24000, section: '80C', used: true },
    { label: 'Balance 80C Remaining', amount: TAX_DATA.section80C.remaining, section: '80C', used: false },
    { label: 'Health Insurance', amount: TAX_DATA.section80D.limit, section: '80D', used: false },
  ];

  const suggestions80C = [
    { name: 'ELSS Mutual Fund', recommended: true, returns: '12-15%', lock: '3 years', amount: 50000 },
    { name: 'PPF (Public Provident Fund)', recommended: true, returns: '7.1%', lock: '15 years', amount: 50000 },
    { name: 'NPS (Tier 1)', recommended: false, returns: '10-12%', lock: 'Till retirement', amount: 26000 },
  ];

  const taxSlabs = regime === 'old'
    ? [
        { slab: 'Up to ₹2.5L', rate: '0%', applicable: false },
        { slab: '₹2.5L – ₹5L', rate: '5%', applicable: true },
        { slab: '₹5L – ₹10L', rate: '20%', applicable: false },
        { slab: 'Above ₹10L', rate: '30%', applicable: false },
      ]
    : [
        { slab: 'Up to ₹3L', rate: '0%', applicable: false },
        { slab: '₹3L – ₹6L', rate: '5%', applicable: true },
        { slab: '₹6L – ₹9L', rate: '10%', applicable: false },
        { slab: '₹9L – ₹12L', rate: '15%', applicable: false },
      ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Tax Planner (ITR)</Text>
          <Text style={styles.subtitle}>FY 2025–26 • AY 2026–27</Text>
        </View>

        {/* Salary Overview */}
        <View style={styles.salaryCard}>
          <View style={styles.salaryRow}>
            <View style={styles.salaryItem}>
              <Text style={styles.salaryLabel}>Gross Salary</Text>
              <Text style={styles.salaryValue}>{fmt(TAX_DATA.grossSalary)}</Text>
            </View>
            <View style={styles.salaryItem}>
              <Text style={styles.salaryLabel}>Profession</Text>
              <Text style={[styles.salaryValue, { fontSize: 12 }]}>{USER_PROFILE.profession}</Text>
            </View>
          </View>
        </View>

        {/* Regime Comparison */}
        <Text style={styles.sectionTitle}>New vs Old Tax Regime</Text>
        <View style={styles.regimeCompare}>
          <TouchableOpacity
            style={[styles.regimeCard, regime === 'old' && styles.regimeCardActive]}
            onPress={() => setRegime('old')}
          >
            {TAX_DATA.recommendation === 'old' && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>⭐ Recommended</Text>
              </View>
            )}
            <Text style={styles.regimeName}>Old Regime</Text>
            <Text style={[styles.regimeTax, { color: Colors.success }]}>
              {fmt(TAX_DATA.oldRegimeTax.taxPayable)}
            </Text>
            <Text style={styles.regimeRate}>Effective: {TAX_DATA.oldRegimeTax.effectiveRate}%</Text>
            <Text style={styles.regimeNote}>With all deductions</Text>
          </TouchableOpacity>

          <View style={styles.vsBox}>
            <Text style={styles.vsText}>VS</Text>
            <Text style={[styles.vsSavings, { color: savings > 0 ? Colors.success : Colors.danger }]}>
              Save {fmt(Math.abs(savings))}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.regimeCard, regime === 'new' && styles.regimeCardActive]}
            onPress={() => setRegime('new')}
          >
            <Text style={styles.regimeName}>New Regime</Text>
            <Text style={[styles.regimeTax, { color: Colors.danger }]}>
              {fmt(TAX_DATA.newRegimeTax.taxPayable)}
            </Text>
            <Text style={styles.regimeRate}>Effective: {TAX_DATA.newRegimeTax.effectiveRate}%</Text>
            <Text style={styles.regimeNote}>Fewer deductions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.regimeAdvice}>
          <Ionicons name="bulb" size={16} color={Colors.accent} />
          <Text style={styles.regimeAdviceText}>
            Old Regime saves you {fmt(savings)} more this year! Maximize your 80C + HRA to keep it that way.
          </Text>
        </View>

        {/* CA Sharma */}
        <AICACard screen="tax" staticTips={CA_SHARMA.tips.tax} />

        {/* Tax Calculation */}
        <Text style={styles.sectionTitle}>Your Tax Calculation ({regime === 'old' ? 'Old' : 'New'} Regime)</Text>
        <View style={styles.calcCard}>
          <CalcRow label="Gross Salary" value={fmt(TAX_DATA.grossSalary)} />
          {regime === 'old' && (
            <>
              <CalcRow label="Less: Standard Deduction" value={`- ${fmt(TAX_DATA.standardDeduction)}`} type="deduction" />
              <CalcRow label="Less: HRA Exemption" value={`- ${fmt(TAX_DATA.hraExemption)}`} type="deduction" />
              <CalcRow label="Less: 80C (HDFC Retirement SIP)" value={`- ${fmt(24000)}`} type="deduction" />
            </>
          )}
          {regime === 'new' && (
            <CalcRow label="Less: Standard Deduction" value={`- ${fmt(TAX_DATA.standardDeduction)}`} type="deduction" />
          )}
          <View style={styles.calcDivider} />
          <CalcRow label="Taxable Income" value={fmt(currentTax.taxableIncome)} bold />
          <CalcRow label="Tax Payable" value={fmt(currentTax.taxPayable)} bold color={Colors.danger} />
          <CalcRow label="Effective Tax Rate" value={`${currentTax.effectiveRate}%`} bold color={Colors.primaryLight} />
        </View>

        {/* Tax Slabs */}
        <Text style={styles.sectionTitle}>Tax Slabs ({regime === 'old' ? 'Old' : 'New'} Regime)</Text>
        <View style={styles.slabCard}>
          {taxSlabs.map((slab, i) => (
            <View key={i} style={[styles.slabRow, slab.applicable && styles.slabRowActive]}>
              <Text style={[styles.slabSlab, slab.applicable && { color: Colors.primary, fontWeight: '700' }]}>{slab.slab}</Text>
              <Text style={[styles.slabRate, slab.applicable && { color: Colors.primary, fontWeight: '700' }]}>{slab.rate}</Text>
              {slab.applicable && <View style={styles.slabDot} />}
            </View>
          ))}
        </View>

        {/* Deductions */}
        <TouchableOpacity onPress={() => setShow80C(!show80C)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Deductions & 80C Status</Text>
          <Ionicons name={show80C ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.deductionCard}>
          {deductionItems.map((item, i) => (
            <View key={i} style={styles.deductionRow}>
              <Ionicons
                name={item.used ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={item.used ? Colors.success : Colors.border}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.deductionName}>{item.label}</Text>
                <Text style={styles.deductionSection}>Section {item.section}</Text>
              </View>
              <Text style={[styles.deductionAmount, { color: item.used ? Colors.success : Colors.danger }]}>
                {item.used ? '' : '⚠️ '}{fmt(item.amount)}
              </Text>
            </View>
          ))}

          {/* 80C Progress */}
          <View style={styles.c80Progress}>
            <View style={styles.c80Header}>
              <Text style={styles.c80Title}>80C Limit Used</Text>
              <Text style={styles.c80Amount}>{fmt(TAX_DATA.section80C.used)} / {fmt(TAX_DATA.section80C.limit)}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${(TAX_DATA.section80C.used / TAX_DATA.section80C.limit) * 100}%`,
                backgroundColor: Colors.warning,
              }]} />
            </View>
            <Text style={styles.c80Remaining}>
              ⚠️ You can still invest {fmt(TAX_DATA.section80C.remaining)} more under 80C to save ~{fmt(TAX_DATA.section80C.remaining * 0.05)} in tax!
            </Text>
          </View>
        </View>

        {/* 80C Investment Suggestions */}
        <Text style={styles.sectionTitle}>💡 Suggested 80C Investments (Remaining ₹1.26L)</Text>
        {suggestions80C.map((item, i) => (
          <View key={i} style={[styles.suggCard, item.recommended && styles.suggCardRec]}>
            {item.recommended && <View style={styles.recBadge}><Text style={styles.recText}>CA Recommended</Text></View>}
            <Text style={styles.suggName}>{item.name}</Text>
            <View style={styles.suggDetails}>
              <View style={styles.suggDetail}>
                <Ionicons name="trending-up" size={12} color={Colors.success} />
                <Text style={styles.suggDetailText}>Returns: {item.returns}</Text>
              </View>
              <View style={styles.suggDetail}>
                <Ionicons name="lock-closed" size={12} color={Colors.warning} />
                <Text style={styles.suggDetailText}>Lock-in: {item.lock}</Text>
              </View>
              <View style={styles.suggDetail}>
                <Ionicons name="cash" size={12} color={Colors.primaryLight} />
                <Text style={styles.suggDetailText}>Invest: {fmt(item.amount)}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Software Engineer Specific Tips */}
        <Text style={styles.sectionTitle}>💻 Tips for Software Engineers</Text>
        <View style={styles.tipsCard}>
          {[
            { icon: '🏠', tip: 'Claim HRA on your ₹12K rent — submit rent receipts to HR before March!' },
            { icon: '💻', tip: 'Work-from-home expenses: Internet, furniture may be claimable if employer provides LTA/other allowances.' },
            { icon: '📚', tip: 'Professional development courses/certifications under employer reimbursement are tax-free up to ₹1L.' },
            { icon: '🔐', tip: 'NPS Tier 1 gives extra ₹50K deduction under 80CCD(1B) over and above 80C limit.' },
            { icon: '📱', tip: 'Phone + internet reimbursement from employer is exempt from tax. Check if your employer offers this.' },
            { icon: '🎁', tip: 'LTA (Leave Travel Allowance) can be claimed twice in 4 years — plan your travel accordingly!' },
          ].map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{t.icon}</Text>
              <Text style={styles.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>

        {/* ITR Deadline Reminder */}
        <View style={styles.deadlineCard}>
          <Ionicons name="calendar" size={20} color={Colors.accent} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.deadlineTitle}>ITR Filing Deadline</Text>
            <Text style={styles.deadlineDate}>31st July 2026</Text>
            <Text style={styles.deadlineNote}>File early to avoid last-minute rush. Documents needed: Form 16, Bank statements, Investment proofs</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CalcRow({ label, value, bold, color, type }: {
  label: string; value: string; bold?: boolean; color?: string; type?: string;
}) {
  return (
    <View style={styles.calcRow}>
      <Text style={[styles.calcLabel, bold && { fontWeight: '700', color: Colors.text }, type === 'deduction' && { color: Colors.success }]}>
        {label}
      </Text>
      <Text style={[styles.calcValue, bold && { fontWeight: '700' }, color && { color }, type === 'deduction' && { color: Colors.success }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  salaryCard: {
    backgroundColor: Colors.primary, marginHorizontal: 16, borderRadius: 12,
    padding: 16, marginBottom: 16,
  },
  salaryRow: { flexDirection: 'row' },
  salaryItem: { flex: 1 },
  salaryLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  salaryValue: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginHorizontal: 16, marginBottom: 8, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 16 },
  regimeCompare: { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 8, alignItems: 'center' },
  regimeCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  regimeCardActive: { borderColor: Colors.primary, borderWidth: 2 },
  recommendedBadge: { backgroundColor: Colors.accent + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  recommendedText: { fontSize: 9, color: Colors.accent, fontWeight: '700' },
  regimeName: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  regimeTax: { fontSize: 20, fontWeight: '800' },
  regimeRate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  regimeNote: { fontSize: 10, color: Colors.textLight, marginTop: 2 },
  vsBox: { alignItems: 'center', width: 48 },
  vsText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  vsSavings: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  regimeAdvice: {
    flexDirection: 'row', backgroundColor: '#FEF9E7', borderRadius: 8, marginHorizontal: 16,
    padding: 10, marginBottom: 12, gap: 8, alignItems: 'flex-start',
  },
  regimeAdviceText: { fontSize: 12, color: Colors.text, flex: 1, lineHeight: 18 },
  calcCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 12,
  },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  calcLabel: { fontSize: 13, color: Colors.textSecondary },
  calcValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  calcDivider: { height: 2, backgroundColor: Colors.border, marginVertical: 4 },
  slabCard: { backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 12 },
  slabRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderRadius: 6 },
  slabRowActive: { backgroundColor: Colors.primary + '10', paddingHorizontal: 8 },
  slabSlab: { fontSize: 13, color: Colors.textSecondary },
  slabRate: { fontSize: 13, color: Colors.textSecondary },
  slabDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, alignSelf: 'center' },
  deductionCard: { backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 12 },
  deductionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  deductionName: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  deductionSection: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  deductionAmount: { fontSize: 13, fontWeight: '700' },
  c80Progress: { backgroundColor: Colors.background, borderRadius: 8, padding: 12, marginTop: 12 },
  c80Header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  c80Title: { fontSize: 12, fontWeight: '600', color: Colors.text },
  c80Amount: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  progressBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 4 },
  c80Remaining: { fontSize: 11, color: Colors.warning, fontWeight: '500' },
  suggCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  suggCardRec: { borderColor: Colors.success, borderWidth: 1.5 },
  recBadge: { backgroundColor: Colors.success + '20', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  recText: { fontSize: 9, color: Colors.success, fontWeight: '700' },
  suggName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  suggDetails: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  suggDetail: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  suggDetailText: { fontSize: 11, color: Colors.textSecondary },
  tipsCard: { backgroundColor: Colors.card, marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  tipIcon: { fontSize: 16, marginRight: 10, marginTop: 1 },
  tipText: { fontSize: 13, color: Colors.text, flex: 1, lineHeight: 19 },
  deadlineCard: {
    backgroundColor: '#FFF3CD', borderRadius: 12, marginHorizontal: 16,
    padding: 16, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: Colors.accent,
  },
  deadlineTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  deadlineDate: { fontSize: 18, fontWeight: '800', color: Colors.accent, marginTop: 2 },
  deadlineNote: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, lineHeight: 16 },
});
