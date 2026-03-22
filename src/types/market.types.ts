export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
}

export interface MFNav {
  schemeCode: string;
  schemeName: string;
  nav: number;
  date: string;
  lastUpdated: number;
}

export interface GoldPrice {
  pricePerGram: number;
  currency: 'INR';
  lastUpdated: number;
}

export interface FXRate {
  usdInr: number;
  lastUpdated: number;
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface MarketCache {
  stocks: Record<string, StockQuote>;
  mfNavs: Record<string, MFNav>;
  gold?: GoldPrice;
  fx?: FXRate;
  news: NewsItem[];
  lastFullRefresh: number;
}
