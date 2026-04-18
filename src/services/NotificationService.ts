import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { LIABILITIES, DEFAULT_BUDGET } from '../data/userData';
import { getCachedStocks } from './MarketDataService';
import { GROWW_STOCKS } from '../data/userData';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  delaySeconds = 1,
  data?: Record<string, string>,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: data ?? {} },
    trigger: delaySeconds === 0
      ? null
      : ({ type: 'timeInterval', seconds: delaySeconds, repeats: false } as any),
  });
}

// ── Alert rules check (called from background task or on foreground) ──
export async function checkAlertRules(): Promise<void> {
  await Promise.allSettled([
    checkMarketMoves(),
    checkCreditCardDue(),
    checkITRReminder(),
    checkSIPDay(),
  ]);
}

async function checkMarketMoves(): Promise<void> {
  const stocks = getCachedStocks();
  for (const holding of GROWW_STOCKS.holdings) {
    const quote = stocks[holding.name];
    if (!quote) continue;
    const absChange = Math.abs(quote.changePercent);
    if (absChange >= 3) {
      const direction = quote.changePercent > 0 ? 'up' : 'down';
      await scheduleLocalNotification(
        `${holding.name} moved ${direction} ${absChange.toFixed(1)}%`,
        `Current: ₹${quote.price.toFixed(2)} (${direction} ₹${Math.abs(quote.change).toFixed(2)}) — CA Sharma has a suggestion`,
        1,
        { screen: 'Portfolio', stockName: holding.name },
      );
    }
  }
}

async function checkCreditCardDue(): Promise<void> {
  // Due dates stored as days from now (hardcoded; can be made configurable)
  const dueSoonCards = [
    { name: 'Ace Credit', daysLeft: 3, due: 14000 },
    { name: 'SBI Card PULSE', daysLeft: 7, due: 13030 },
  ];

  for (const card of dueSoonCards) {
    if (card.daysLeft <= 3) {
      await scheduleLocalNotification(
        `${card.name} bill due in ${card.daysLeft} days`,
        `₹${card.due.toLocaleString('en-IN')} outstanding. Pay now to avoid interest charges.`,
        2,
        { screen: 'Debt' },
      );
    }
  }
}

async function checkITRReminder(): Promise<void> {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  if (month >= 5 && month <= 7) {
    const deadline = new Date(now.getFullYear(), 6, 31); // July 31
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    await scheduleLocalNotification(
      `ITR Filing: ${daysLeft} days left`,
      `Deadline: 31 July ${now.getFullYear()}. CA Sharma recommends filing early to avoid last-minute rush.`,
      3,
      { screen: 'Tax' },
    );
  }
}

async function checkSIPDay(): Promise<void> {
  const now = new Date();
  if (now.getDate() === 1) {
    await scheduleLocalNotification(
      'SIP Day!',
      '₹5,000 SIP deduction today. Ensure your savings account has sufficient balance.',
      2,
      { screen: 'Portfolio' },
    );
  }
}

export function addNotificationListener(
  onResponse: (notification: Notifications.NotificationResponse) => void,
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(onResponse);
}
