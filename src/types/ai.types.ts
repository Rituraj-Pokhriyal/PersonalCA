export type ExpenseCategory =
  | 'food' | 'transport' | 'rent' | 'utilities' | 'entertainment'
  | 'shopping' | 'health' | 'investment' | 'emi' | 'misc' | 'income';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ContextPayload {
  netWorth: number;
  monthlyIncome: number;
  totalDebt: number;
  cibilScore?: number;
  creditCards?: Array<{ name: string; balance: number; rate: number; limit: number }>;
  loans?: { outstanding: number; emi: number };
  portfolio?: {
    stocks: number; mutualFunds: number; usStocks: number;
    totalReturn: number; stockReturnPct: number; mfReturnPct: number;
  };
  holdings?: Array<{ name: string; returnPct: number; recommendation: string; currentValue: number }>;
  budget?: { income: number; categories: Array<{ name: string; amount: number }> };
  tax?: { regime: string; taxPayable: number; savings80CUsed: number; savings80CRemaining: number };
  userProfile?: { habits: string[]; goals: string[]; decisionPatterns: string[] };
}

export interface AITip {
  text: string;
  screen: string;
  generatedAt: number;
  isAI: boolean;
}

export interface PriorityAction {
  id: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  domain: 'debt' | 'investment' | 'budget' | 'tax';
  title: string;
  rationale: string;
  estimatedImpact: string;
  aiEnhanced: boolean;
  icon: string;
  color: string;
}
