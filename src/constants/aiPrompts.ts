import {
  USER_PROFILE, ASSETS, LIABILITIES, NET_WORTH,
  GROWW_STOCKS, GROWW_MUTUAL_FUNDS, DEFAULT_BUDGET, TAX_DATA,
} from '../data/userData';
import { ContextPayload } from '../types/ai.types';

export const CA_SHARMA_SYSTEM_PROMPT = `You are CA Sharma, a Chartered Accountant with 50 years of experience advising Indian middle-class professionals. You are speaking directly to Rituraj, a Full Stack .NET Developer earning ₹50,000/month living in India.

Personality:
- Warm, direct, and caring like a trusted family advisor
- Use Hindi phrases naturally: "Namaste", "Theek hai", "Bahut accha", "Suno Rituraj", "Arre yaar"
- Financially grounded in Indian tax law (FY 2025-26), NSE/BSE market context, Indian banking
- Give SPECIFIC actionable advice — never generic tips
- Always use ₹ symbol for Indian rupees
- When recommending actions, rank by financial impact (interest saved, tax saved, returns gained)
- Respond as if you know Rituraj personally and care deeply about his financial wellbeing

Rules:
- Tip mode: under 150 words, conversational
- Chat mode: up to 400 words, thorough but focused
- Format: plain conversational text, no markdown headers or bullet points unless listing steps
- If market data is provided, reference it specifically ("TATAGOLD is up 3% today")
- If learning profile is provided, reference past patterns ("Last month you overspent on food...")
- Be proactive — don't just answer, suggest next steps`;

export function buildFullContext(includeProfile = false): string {
  const totalPortfolio = GROWW_STOCKS.currentValue + GROWW_MUTUAL_FUNDS.currentValue;
  const cards = LIABILITIES.cards.map(c => `${c.name}: ₹${c.due} due @ ${c.interest}% interest`).join(', ');
  const topStocks = GROWW_STOCKS.holdings
    .map(h => `${h.name} ${h.returnPct > 0 ? '+' : ''}${h.returnPct.toFixed(1)}% (${h.recommendation})`)
    .join(', ');

  return `
RITURAJ'S COMPLETE FINANCIAL PICTURE:
Salary: ₹${USER_PROFILE.monthlySalary.toLocaleString('en-IN')}/month | Profession: ${USER_PROFILE.profession}
Net Worth: ₹${NET_WORTH.toLocaleString('en-IN')} (NEGATIVE — ₹${Math.abs(NET_WORTH / 100000).toFixed(2)}L in the red)
Total Assets: ₹${ASSETS.totalAssets.toLocaleString('en-IN')} | Total Liabilities: ₹${LIABILITIES.totalLiabilities.toLocaleString('en-IN')}
CIBIL Score: ${USER_PROFILE.cibilScore}

DEBT (URGENT):
Credit Cards (4 cards, total ₹${LIABILITIES.creditCards.toLocaleString('en-IN')}): ${cards}
Personal Loan: ₹${LIABILITIES.loans.toLocaleString('en-IN')} outstanding

PORTFOLIO (₹${totalPortfolio.toLocaleString('en-IN')} total):
Stocks: ₹${GROWW_STOCKS.currentValue.toLocaleString('en-IN')} (+${GROWW_STOCKS.totalReturnPct}%) — ${topStocks}
Mutual Funds: ₹${GROWW_MUTUAL_FUNDS.currentValue.toLocaleString('en-IN')} (${GROWW_MUTUAL_FUNDS.totalReturnPct}%)
SBI Liquid Fund: ₹17,969 (earning ~6% — SHOULD REDEEM TO PAY CARDS)
US Stocks (INDmoney): ₹5,960

MONTHLY BUDGET:
Income: ₹50,000 | Rent: ₹12,000 | CC EMI: ₹8,000 | Loan EMI: ₹10,000 | SIP: ₹5,000
Fixed costs consuming ${Math.round((30000 / 50000) * 100)}% of salary before food/transport

TAX (FY 2025-26):
Old Regime tax: ₹${TAX_DATA.oldRegimeTax.taxPayable.toLocaleString('en-IN')} | New Regime: ₹${TAX_DATA.newRegimeTax.taxPayable.toLocaleString('en-IN')}
Old Regime recommended (saves ₹${(TAX_DATA.newRegimeTax.taxPayable - TAX_DATA.oldRegimeTax.taxPayable).toLocaleString('en-IN')})
80C used: ₹${TAX_DATA.section80C.used.toLocaleString('en-IN')} / ₹1,50,000 (₹${TAX_DATA.section80C.remaining.toLocaleString('en-IN')} remaining!)`.trim();
}

export function buildScreenContext(screen: 'home' | 'budget' | 'debt' | 'investment' | 'tax'): string {
  const full = buildFullContext();
  const prompts: Record<string, string> = {
    home: `${full}\n\nGive me ONE sharp priority tip for today — the single most impactful thing I should do right now for my finances.`,
    budget: `${full}\n\nAnalyze my monthly budget and tell me specifically where I can save money this month and how to handle the credit card burden.`,
    debt: `${full}\n\nTell me exactly which credit card to pay first this month and why. Give me a specific payment plan for the next 3 months.`,
    investment: `${full}\n\nReview my portfolio and give me specific buy/hold/exit recommendations for each holding with reasoning.`,
    tax: `${full}\n\nWhat should I do RIGHT NOW to maximize my tax savings for FY 2025-26? I have ₹${TAX_DATA.section80C.remaining.toLocaleString('en-IN')} 80C space remaining.`,
  };
  return prompts[screen];
}

export const CHAT_QUICK_REPLIES = [
  'Which credit card should I pay first?',
  'What is my tax liability this year?',
  'Should I exit Deep Diamond India?',
  'Rate my investment portfolio',
  'How to reach positive net worth faster?',
  'Should I redeem my liquid fund now?',
];
