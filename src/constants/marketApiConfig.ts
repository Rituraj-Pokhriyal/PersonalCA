// Yahoo Finance v8 API (unofficial, free)
export const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// MFAPI.in — free, no API key needed
export const MFAPI_BASE = 'https://api.mfapi.in/mf';

// NSE India stock symbol mapping (Yahoo Finance uses .NS suffix)
export const STOCK_SYMBOL_MAP: Record<string, string> = {
  'TATAGOLD':           'TATAGOLD.NS',
  'Cupid':              'CUPID.NS',
  'TATSILV':            'TATSILV.NS',
  'NIFTYBEES':          'NIFTYBEES.NS',
  'NIFTYCASE':          'NIFTYCASE.NS',
  'Deep Diamond India': 'DEEPDIAM.NS',
};

// MFAPI.in scheme codes for Groww mutual funds
export const MF_SCHEME_CODES: Record<string, string> = {
  'HDFC Retirement':  '119023',  // HDFC Retirement Savings Fund Equity Plan Direct Growth
  'SBI Equity Hybrid': '119598', // SBI Equity Hybrid Fund Direct Plan Growth
  'SBI Liquid Fund':   '119551', // SBI Liquid Fund Direct Plan Growth
  'SBI Nifty Index':   '120716', // SBI Nifty Index Direct Plan Growth
  'ABSL Medium Term':  '119533', // Aditya Birla SL Medium Term Direct Growth
  'HDFC Nifty 50':     '120716', // HDFC NIFTY 50 Index Fund Direct Growth
};

// Cache TTLs in milliseconds
export const CACHE_TTL = {
  STOCKS_MARKET_HOURS: 60 * 1000,        // 1 minute during market hours
  STOCKS_OFF_HOURS: 15 * 60 * 1000,      // 15 minutes outside market hours
  MF_NAV: 24 * 60 * 60 * 1000,           // 24 hours (AMFI publishes once daily)
  GOLD_FX: 5 * 60 * 1000,                // 5 minutes
  NEWS: 15 * 60 * 1000,                  // 15 minutes
};

// NSE market hours (IST) — 9:15 AM to 3:30 PM
export function isMarketOpen(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset - now.getTimezoneOffset() * 60000);
  const day = ist.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const hour = ist.getHours();
  const min = ist.getMinutes();
  const mins = hour * 60 + min;
  return mins >= 9 * 60 + 15 && mins < 15 * 60 + 30;
}
