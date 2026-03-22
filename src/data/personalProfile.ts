import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FinancialGoal {
  id: string;
  goal: string;
  targetAmount?: number;
  targetDate?: string;
  detectedAt: number;
  progress?: number;
}

export interface SpendingPattern {
  merchant: string;
  category: string;
  avgAmount: number;
  frequency: string; // e.g. "3-4x per week"
  lastSeen: number;
}

export interface AdviceRecord {
  id: string;
  advice: string;
  domain: string;
  givenAt: number;
  expectedOutcome: string;
  checkedAt?: number;
  outcome?: string;
}

export interface PersonalProfile {
  habits: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  financialGoals: FinancialGoal[];
  decisionPatterns: string[];
  spendingPatterns: SpendingPattern[];
  savedAmount: number; // Total ₹ saved due to CA Sharma's advice
  lastLearningUpdate: number;
  adviceHistory: AdviceRecord[];
  prefersConciseAdvice: boolean;
  weeklyInsightsSent: number;
}

export const DEFAULT_PROFILE: PersonalProfile = {
  habits: [],
  riskTolerance: 'moderate',
  financialGoals: [],
  decisionPatterns: [],
  spendingPatterns: [],
  savedAmount: 0,
  lastLearningUpdate: 0,
  adviceHistory: [],
  prefersConciseAdvice: true,
  weeklyInsightsSent: 0,
};

const PROFILE_KEY = '@personalca_profile';

export async function loadProfile(): Promise<PersonalProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(profile: PersonalProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}
