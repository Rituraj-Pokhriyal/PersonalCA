// ============================================================
// RITURAJ'S REAL FINANCIAL DATA — Loaded from live accounts
// Last synced: 22 March 2026
// ============================================================

export const USER_PROFILE = {
  name: 'Rituraj',
  profession: 'Full Stack .NET Developer',
  monthlySalary: 50000,
  monthlyRent: 12000,
  cibilScore: 759,
  cibilLastUpdated: '22 Mar 2026',
};

// ── ASSETS ───────────────────────────────────────────────────
export const ASSETS = {
  totalAssets: 88110,
  breakdown: {
    liquid: 38200,
    debt: 32200,
    indianEquity: 8500,
    globalEquity: 5960,
    gold: 3300,
  },
};

// ── LIABILITIES ──────────────────────────────────────────────
export const LIABILITIES = {
  totalLiabilities: 229000,
  loans: 180000,
  creditCards: 49030,
  creditCardCount: 4,
  cards: [
    { name: 'Ace Credit', last4: '0500', due: 14000, limit: 50000, interest: 42 },
    { name: 'AXIS Bank', last4: '5508', due: 12000, limit: 40000, interest: 36 },
    { name: 'SBI Card PULSE', last4: 'xx65', due: 13030, limit: 45000, interest: 40 },
    { name: 'Unknown Card', last4: '????', due: 10000, limit: 30000, interest: 36 },
  ],
};

export const NET_WORTH = ASSETS.totalAssets - LIABILITIES.totalLiabilities; // -140890

// ── GROWW STOCKS ─────────────────────────────────────────────
export const GROWW_STOCKS = {
  currentValue: 9912,
  investedValue: 9211,
  totalReturn: 701,
  totalReturnPct: 7.61,
  holdings: [
    {
      name: 'TATAGOLD',
      shares: 232,
      avgPrice: 10.86,
      marketPrice: 14.24,
      currentValue: 3303.68,
      investedValue: 2519.52,
      returnAmt: 784.16,
      returnPct: 31.12,
      category: 'Gold ETF',
      recommendation: 'hold',
    },
    {
      name: 'Cupid',
      shares: 30,
      avgPrice: 72.51,
      marketPrice: 79.60,
      currentValue: 2388.00,
      investedValue: 2175.30,
      returnAmt: 212.70,
      returnPct: 9.78,
      category: 'Small Cap',
      recommendation: 'hold',
    },
    {
      name: 'TATSILV',
      shares: 100,
      avgPrice: 21.78,
      marketPrice: 22.34,
      currentValue: 2234.00,
      investedValue: 2178.00,
      returnAmt: 56.00,
      returnPct: 2.57,
      category: 'Silver ETF',
      recommendation: 'hold',
    },
    {
      name: 'NIFTYBEES',
      shares: 7,
      avgPrice: 288.18,
      marketPrice: 262.07,
      currentValue: 1834.49,
      investedValue: 2017.26,
      returnAmt: -182.77,
      returnPct: -9.06,
      category: 'Nifty ETF',
      recommendation: 'hold',
    },
    {
      name: 'NIFTYCASE',
      shares: 2,
      avgPrice: 10.38,
      marketPrice: 9.21,
      currentValue: 18.42,
      investedValue: 20.76,
      returnAmt: -2.34,
      returnPct: -11.27,
      category: 'ETF',
      recommendation: 'monitor',
    },
    {
      name: 'Deep Diamond India',
      shares: 55,
      avgPrice: 5.45,
      marketPrice: 2.42,
      currentValue: 133.10,
      investedValue: 299.75,
      returnAmt: -166.65,
      returnPct: -55.60,
      category: 'Penny Stock',
      recommendation: 'exit',
    },
  ],
};

// ── GROWW MUTUAL FUNDS ───────────────────────────────────────
export const GROWW_MUTUAL_FUNDS = {
  currentValue: 91270,
  investedValue: 95524,
  totalReturn: -4253,
  totalReturnPct: -4.45,
  xirr: -9.81,
  funds: [
    {
      name: 'HDFC Retirement Savings Fund Equity',
      shortName: 'HDFC Retirement',
      currentValue: 27769,
      investedValue: 29199,
      returnAmt: -1430,
      returnPct: -4.90,
      xirr: -8.40,
      hasSIP: true,
      type: 'Equity',
      recommendation: 'hold',
    },
    {
      name: 'SBI Equity Hybrid Fund Direct Plan Growth',
      shortName: 'SBI Equity Hybrid',
      currentValue: 25222,
      investedValue: 26659,
      returnAmt: -1437,
      returnPct: -5.39,
      xirr: -24.07,
      hasSIP: true,
      type: 'Hybrid',
      recommendation: 'review',
    },
    {
      name: 'SBI Liquid Fund Direct Plan Growth',
      shortName: 'SBI Liquid Fund',
      currentValue: 17969,
      investedValue: 17555,
      returnAmt: 414,
      returnPct: 2.36,
      xirr: 5.99,
      hasSIP: false,
      type: 'Liquid',
      recommendation: 'redeem-for-debt',
    },
    {
      name: 'SBI Nifty Index Direct Plan Growth',
      shortName: 'SBI Nifty Index',
      currentValue: 14557,
      investedValue: 16112,
      returnAmt: -1555,
      returnPct: -9.65,
      xirr: -55.81,
      hasSIP: true,
      type: 'Index',
      recommendation: 'stop-sip',
    },
    {
      name: 'Aditya Birla SL Medium Term Direct Growth',
      shortName: 'ABSL Medium Term',
      currentValue: 3066,
      investedValue: 3000,
      returnAmt: 66,
      returnPct: 2.19,
      xirr: 5.96,
      hasSIP: true,
      type: 'Debt',
      recommendation: 'hold',
    },
    {
      name: 'HDFC NIFTY 50 Index Fund Direct Growth',
      shortName: 'HDFC Nifty 50',
      currentValue: 2689,
      investedValue: 3000,
      returnAmt: -311,
      returnPct: -10.36,
      xirr: -30.17,
      hasSIP: true,
      type: 'Index',
      recommendation: 'consolidate',
    },
  ],
};

// ── US STOCKS (INDmoney) ──────────────────────────────────────
export const US_STOCKS = {
  currentValue: 5960,
  investedValue: 5960,
};

// ── BUDGET ────────────────────────────────────────────────────
export const DEFAULT_BUDGET = {
  income: 50000,
  categories: [
    { id: '1', name: 'Rent', amount: 12000, icon: 'home', color: '#E74C3C', isFixed: true },
    { id: '2', name: 'Food & Groceries', amount: 6000, icon: 'restaurant', color: '#F39C12', isFixed: false },
    { id: '3', name: 'Transport', amount: 3000, icon: 'car', color: '#3498DB', isFixed: false },
    { id: '4', name: 'Utilities & Phone', amount: 2000, icon: 'phone-portrait', color: '#9B59B6', isFixed: false },
    { id: '5', name: 'Credit Card EMI', amount: 8000, icon: 'card', color: '#E67E22', isFixed: true },
    { id: '6', name: 'Loan EMI', amount: 10000, icon: 'cash', color: '#C0392B', isFixed: true },
    { id: '7', name: 'SIP / Investments', amount: 5000, icon: 'trending-up', color: '#27AE60', isFixed: false },
    { id: '8', name: 'Emergency Fund', amount: 2000, icon: 'shield', color: '#1ABC9C', isFixed: false },
    { id: '9', name: 'Personal / Misc', amount: 2000, icon: 'person', color: '#95A5A6', isFixed: false },
  ],
};

// ── CA SHARMA PERSONA ─────────────────────────────────────────
export const CA_SHARMA = {
  name: 'CA Sharma',
  experience: 50,
  avatar: '👨‍💼',
  greeting: "Namaste Rituraj! I've been crunching numbers for 50 years, and I'm here to make yours work for you. Let's build that positive net worth together! 💪",
  tips: {
    home: [
      "Your net worth is -₹1.4L today, but that's just the starting point. Every ₹1 you save from debt is worth more than ₹5 invested. Let's fix the foundation first! 🏗️",
      "759 CIBIL score — not bad! But with 28 enquiries, you've been shopping around too much. Time to settle down with what you have. 😄",
      "Rituraj, ₹72K in mutual funds is a great habit. Keep those SIPs going — compounding is your best friend for the long run!",
    ],
    budget: [
      "Your rent is 24% of salary — that's healthy! But credit card + loan EMIs are eating 36% of your income. That's the real problem area.",
      "The 50-30-20 rule: 50% needs, 30% wants, 20% savings. Right now you're at 72% needs. Small changes, big impact!",
      "Once you clear those credit cards in 6 months, you'll have ₹8,000 extra per month. That's ₹96,000 per year to invest! 🎯",
    ],
    debt: [
      "Credit cards at 36-42% interest? That's the most expensive money you'll ever borrow. Pay these off FIRST — no debate! 🔥",
      "SBI Liquid Fund earning 6%, credit card costing 42%. The math is simple: redeem the liquid fund and kill that credit card debt!",
      "Debt snowball method: Pay off smallest card first for the psychological win, then attack the next one. You've got this! ⛄",
    ],
    investment: [
      "TATAGOLD at +31%? Brilliant! Gold and silver ETFs are your best performers. Hold on to these beauties. 🥇",
      "Two NIFTY index funds doing the same job? Consolidate! Keep HDFC NIFTY 50, stop SBI Nifty Index SIP. Less is more.",
      "Deep Diamond India is a penny stock down 55%. Cut your losses and move on — sometimes the bravest thing is to exit. 💎",
    ],
    tax: [
      "As a software engineer, you can save up to ₹1.5L under 80C. Your HDFC Retirement Fund SIP counts! Are you maximising it?",
      "HRA exemption on your ₹12,000 rent can save you thousands in tax. Make sure you're claiming this every year!",
      "New Tax Regime vs Old: With your salary and deductions, run the calculation — many software engineers do better in the Old Regime. Let's check!",
    ],
  },
};

// ── TAX DATA (FY 2025-26) ─────────────────────────────────────
export const TAX_DATA = {
  grossSalary: 600000, // ₹50K × 12
  standardDeduction: 50000,
  hraExemption: 72000, // ₹12K × 6 (approximate)
  section80C: {
    limit: 150000,
    investments: [
      { name: 'HDFC Retirement SIP (approx)', amount: 24000, eligible: true },
      { name: 'ELSS / Other 80C', amount: 0, eligible: true },
      { name: 'EPF (if applicable)', amount: 0, eligible: true },
    ],
    used: 24000,
    remaining: 126000,
  },
  section80D: {
    limit: 25000,
    premiumPaid: 0,
    remaining: 25000,
  },
  oldRegimeTax: {
    taxableIncome: 404000, // After deductions
    taxPayable: 7700,
    effectiveRate: 1.28,
  },
  newRegimeTax: {
    taxableIncome: 550000, // Only standard deduction
    taxPayable: 12500,
    effectiveRate: 2.08,
  },
  recommendation: 'old', // Old regime saves more for Rituraj
};
