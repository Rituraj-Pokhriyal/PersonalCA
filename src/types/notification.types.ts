export interface AlertRule {
  id: string;
  type: 'budget_overspend' | 'market_move' | 'bill_due' | 'itr_reminder' | 'sip_day';
  enabled: boolean;
  threshold?: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  screen?: string;
  data?: Record<string, string>;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  category: string;
  source: 'sms' | 'upi_notification' | 'manual';
  reason?: string;
  aiCategoryConfidence: number;
  timestamp: number;
  isPlanned: boolean;
}
