import { PriorityAction } from '../types/ai.types';
import { Colors } from '../theme/colors';
import {
  LIABILITIES, GROWW_STOCKS, GROWW_MUTUAL_FUNDS, TAX_DATA,
  DEFAULT_BUDGET,
} from '../data/userData';
import { getClaudeApiKey } from './StorageService';
import { CA_SHARMA_SYSTEM_PROMPT, buildFullContext } from '../constants/aiPrompts';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// ── Rule-based actions (instant, no API) ─────────────────────────
export function generateRuleBasedActions(): PriorityAction[] {
  const actions: PriorityAction[] = [];

  // Sort cards by interest rate descending
  const sortedCards = [...LIABILITIES.cards].sort((a, b) => b.interest - a.interest);
  const topCard = sortedCards[0];
  if (topCard && topCard.due > 5000) {
    actions.push({
      id: 'pay-top-card',
      urgency: 'critical',
      domain: 'debt',
      title: `Pay ${topCard.name} first (${topCard.interest}% interest)`,
      rationale: `Highest interest rate card. Costs ₹${Math.round(topCard.due * topCard.interest / 1200)}/month in interest.`,
      estimatedImpact: `Saves ~₹${Math.round(topCard.due * topCard.interest / 100)}/year`,
      aiEnhanced: false,
      icon: 'alert-circle',
      color: Colors.danger,
    });
  }

  // Liquid fund vs credit card
  const liquidFund = GROWW_MUTUAL_FUNDS.funds.find(f => f.recommendation === 'redeem-for-debt');
  if (liquidFund && LIABILITIES.creditCards > 0) {
    actions.push({
      id: 'redeem-liquid',
      urgency: 'critical',
      domain: 'debt',
      title: `Redeem ${liquidFund.shortName} → Pay credit cards`,
      rationale: `Liquid fund earns ~6%. Credit cards cost 36-42%. Net loss: 30-36% per year on ₹${liquidFund.currentValue.toLocaleString('en-IN')}.`,
      estimatedImpact: `Saves ₹${Math.round(liquidFund.currentValue * 0.30 / 12).toLocaleString('en-IN')}/month in interest`,
      aiEnhanced: false,
      icon: 'alert-circle',
      color: Colors.danger,
    });
  }

  // Exit penny stocks
  const pennyStocks = GROWW_STOCKS.holdings.filter(h => h.recommendation === 'exit' || h.returnPct < -40);
  for (const stock of pennyStocks) {
    actions.push({
      id: `exit-${stock.name}`,
      urgency: 'high',
      domain: 'investment',
      title: `Exit ${stock.name} (${stock.returnPct.toFixed(1)}%)`,
      rationale: `Down ${Math.abs(stock.returnPct).toFixed(0)}%. Further holding won't recover ₹${Math.abs(stock.returnAmt).toFixed(0)} loss faster than paying off 42% interest debt.`,
      estimatedImpact: `Recover ₹${stock.currentValue.toFixed(0)} to put towards debt`,
      aiEnhanced: false,
      icon: 'trending-down',
      color: Colors.warning,
    });
  }

  // 80C tax saving opportunity
  if (TAX_DATA.section80C.remaining > 50000) {
    actions.push({
      id: 'tax-80c',
      urgency: 'medium',
      domain: 'tax',
      title: `₹${TAX_DATA.section80C.remaining.toLocaleString('en-IN')} 80C space remaining`,
      rationale: `You've used only ₹${TAX_DATA.section80C.used.toLocaleString('en-IN')} of ₹1,50,000 80C limit. ELSS or PPF investment can reduce taxable income.`,
      estimatedImpact: `Can save up to ₹${Math.round(TAX_DATA.section80C.remaining * 0.05).toLocaleString('en-IN')} in tax`,
      aiEnhanced: false,
      icon: 'document-text',
      color: Colors.primaryLight,
    });
  }

  // Stop duplicate SIP
  const stopSipFunds = GROWW_MUTUAL_FUNDS.funds.filter(f => f.recommendation === 'stop-sip');
  if (stopSipFunds.length > 0) {
    actions.push({
      id: 'stop-sip',
      urgency: 'medium',
      domain: 'investment',
      title: `Stop SIP in ${stopSipFunds.map(f => f.shortName).join(', ')}`,
      rationale: `Duplicate index funds tracking same benchmark. Consolidate into HDFC NIFTY 50.`,
      estimatedImpact: 'Free up SIP amount for debt repayment',
      aiEnhanced: false,
      icon: 'pause-circle',
      color: Colors.warning,
    });
  }

  return actions;
}

// ── AI-enhanced actions (async) ───────────────────────────────────
export async function enhanceActionsWithAI(
  ruleActions: PriorityAction[],
): Promise<PriorityAction[]> {
  try {
    const apiKey = await getClaudeApiKey();
    if (!apiKey) return ruleActions;

    const context = buildFullContext();
    const actionsSummary = ruleActions.map(a =>
      `${a.urgency.toUpperCase()}: ${a.title} — ${a.rationale}`
    ).join('\n');

    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: CA_SHARMA_SYSTEM_PROMPT + '\n\n' + context,
        messages: [{
          role: 'user',
          content: `Here are the rule-based priority actions I generated for Rituraj. Review them, add any missed items, and rank them by financial impact. Return as JSON array with same structure but improved rationale and estimatedImpact. Max 6 items.\n\n${actionsSummary}\n\nReturn ONLY valid JSON array.`,
        }],
      }),
    });

    if (!res.ok) return ruleActions;
    const json = await res.json();
    const text: string = json.content?.[0]?.text?.trim() ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return ruleActions;

    const aiActions = JSON.parse(match[0]) as Partial<PriorityAction>[];
    return aiActions.map((a, i) => ({
      ...ruleActions[i],
      ...a,
      aiEnhanced: true,
      icon: ruleActions[i]?.icon ?? 'star',
      color: ruleActions[i]?.color ?? Colors.primary,
    }));
  } catch {
    return ruleActions;
  }
}
