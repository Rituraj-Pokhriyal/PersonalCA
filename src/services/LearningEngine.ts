import { PersonalProfile, loadProfile, saveProfile, FinancialGoal, SpendingPattern } from '../data/personalProfile';
import { Transaction } from '../types/notification.types';
import { extractLearnings } from './AIBrainService';
import { ChatMessage } from '../types/ai.types';

// ── Detect financial goals from chat messages ────────────────────
const GOAL_PATTERNS = [
  /(?:want to|going to|planning to|save for|buy a?|get a?)\s+(.+?)(?:\s+by\s+(\w+ \d{4}|\d{4}))?[.!,\n]/i,
  /(?:goal is|target is|aim to)\s+(.+)/i,
  /clear (?:all )?(?:my )?(?:debt|loan|credit card)/i,
];

export function detectGoalsFromMessage(text: string): string[] {
  const goals: string[] = [];
  for (const pattern of GOAL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      goals.push(match[0].trim());
    }
  }
  return goals;
}

// ── Process a completed chat session ────────────────────────────
export async function processCompletedChat(messages: ChatMessage[]): Promise<void> {
  if (messages.length < 2) return;

  const profile = await loadProfile();
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  // Extract AI-powered learnings
  const learnings = await extractLearnings(conversationText);
  for (const learning of learnings) {
    if (!profile.habits.includes(learning)) {
      profile.habits = [learning, ...profile.habits].slice(0, 20);
    }
  }

  // Detect goals from user messages
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  const detectedGoals = detectGoalsFromMessage(userMessages);
  for (const goalText of detectedGoals) {
    const exists = profile.financialGoals.some(g => g.goal.includes(goalText.slice(0, 20)));
    if (!exists) {
      const newGoal: FinancialGoal = {
        id: Date.now().toString(),
        goal: goalText,
        detectedAt: Date.now(),
      };
      profile.financialGoals.push(newGoal);
    }
  }

  profile.lastLearningUpdate = Date.now();
  await saveProfile(profile);
}

// ── Process a transaction to update spending patterns ────────────
export async function processTransaction(transaction: Transaction): Promise<void> {
  const profile = await loadProfile();

  const existing = profile.spendingPatterns.find(
    p => p.merchant.toLowerCase() === transaction.merchant.toLowerCase()
  );

  if (existing) {
    // Update average
    existing.avgAmount = Math.round((existing.avgAmount + transaction.amount) / 2);
    existing.lastSeen = Date.now();
  } else {
    const newPattern: SpendingPattern = {
      merchant: transaction.merchant,
      category: transaction.category,
      avgAmount: transaction.amount,
      frequency: 'occasional',
      lastSeen: Date.now(),
    };
    profile.spendingPatterns.push(newPattern);
  }

  // Infer frequency from how many times seen
  const merchantOccurrences = profile.spendingPatterns.filter(
    p => p.merchant.toLowerCase() === transaction.merchant.toLowerCase()
  );
  if (merchantOccurrences.length > 0) {
    const pattern = merchantOccurrences[0];
    const daysSinceFirst = (Date.now() - pattern.lastSeen) / (1000 * 60 * 60 * 24);
    if (daysSinceFirst < 7) pattern.frequency = 'weekly';
    else if (daysSinceFirst < 30) pattern.frequency = 'monthly';
  }

  await saveProfile(profile);
}

// ── Risk tolerance inference from portfolio behavior ─────────────
export async function updateRiskTolerance(): Promise<void> {
  const profile = await loadProfile();
  // Simple heuristic: check portfolio allocation
  // Will be enhanced with AI analysis over time
  profile.riskTolerance = 'moderate'; // Default for Rituraj based on his holdings
  await saveProfile(profile);
}

// ── Generate memory context string for AI prompts ────────────────
export async function buildMemoryContext(): Promise<string> {
  const profile = await loadProfile();
  const lines: string[] = [];

  if (profile.habits.length > 0) {
    lines.push('Observed patterns: ' + profile.habits.slice(0, 5).join('; '));
  }
  if (profile.financialGoals.length > 0) {
    lines.push('Mentioned goals: ' + profile.financialGoals.map(g => g.goal).join('; '));
  }
  if (profile.decisionPatterns.length > 0) {
    lines.push('Decision tendencies: ' + profile.decisionPatterns.slice(0, 3).join('; '));
  }
  if (profile.spendingPatterns.length > 0) {
    const top = profile.spendingPatterns.slice(0, 5);
    lines.push('Regular spending: ' + top.map(p => `${p.merchant} (${p.category}, avg ₹${p.avgAmount}, ${p.frequency})`).join('; '));
  }
  if (profile.savedAmount > 0) {
    lines.push(`Total saved due to CA Sharma's advice: ₹${profile.savedAmount.toLocaleString('en-IN')}`);
  }

  return lines.join('\n');
}
