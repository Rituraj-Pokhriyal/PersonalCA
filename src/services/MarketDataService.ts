import { Storage, loadMarketCache, saveMarketCache } from './StorageService';
import {
  StockQuote, MFNav, GoldPrice, FXRate, NewsItem, MarketCache,
} from '../types/market.types';
import {
  YAHOO_FINANCE_BASE, MFAPI_BASE, STOCK_SYMBOL_MAP, MF_SCHEME_CODES,
  CACHE_TTL, isMarketOpen,
} from '../constants/marketApiConfig';

// ── In-memory cache ──────────────────────────────────────────────
let memCache: MarketCache = {
  stocks: {},
  mfNavs: {},
  news: [],
  lastFullRefresh: 0,
};

export async function initMarketCache(): Promise<void> {
  const saved = await loadMarketCache();
  if (saved) memCache = saved;
}

function isStale(lastUpdated: number): boolean {
  const ttl = isMarketOpen() ? CACHE_TTL.STOCKS_MARKET_HOURS : CACHE_TTL.STOCKS_OFF_HOURS;
  return Date.now() - lastUpdated > ttl;
}

// ── Fetch a single NSE stock quote ──────────────────────────────
export async function fetchStockPrice(stockName: string): Promise<StockQuote | null> {
  const nsSymbol = STOCK_SYMBOL_MAP[stockName];
  if (!nsSymbol) return null;

  const cached = memCache.stocks[stockName];
  if (cached && !isStale(cached.lastUpdated)) return cached;

  try {
    const url = `${YAHOO_FINANCE_BASE}/${nsSymbol}?interval=1d&range=2d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return cached ?? null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return cached ?? null;

    const quote: StockQuote = {
      symbol: nsSymbol,
      name: stockName,
      price: meta.regularMarketPrice ?? meta.previousClose,
      change: (meta.regularMarketPrice ?? 0) - (meta.previousClose ?? 0),
      changePercent: (((meta.regularMarketPrice ?? 0) - (meta.previousClose ?? 0)) /
        (meta.previousClose ?? 1)) * 100,
      lastUpdated: Date.now(),
    };

    memCache.stocks[stockName] = quote;
    await persistCache();
    return quote;
  } catch (e) {
    console.warn(`fetchStockPrice(${stockName}) failed:`, e);
    return cached ?? null;
  }
}

// ── Fetch all user's stocks ──────────────────────────────────────
export async function fetchAllStocks(): Promise<Record<string, StockQuote>> {
  await Promise.allSettled(
    Object.keys(STOCK_SYMBOL_MAP).map(name => fetchStockPrice(name))
  );
  return memCache.stocks;
}

// ── Fetch MF NAV from MFAPI.in ───────────────────────────────────
export async function fetchMFNav(fundName: string): Promise<MFNav | null> {
  const schemeCode = MF_SCHEME_CODES[fundName];
  if (!schemeCode) return null;

  const cached = memCache.mfNavs[fundName];
  if (cached && Date.now() - cached.lastUpdated < CACHE_TTL.MF_NAV) return cached;

  try {
    const res = await fetch(`${MFAPI_BASE}/${schemeCode}/latest`);
    if (!res.ok) return cached ?? null;
    const json = await res.json();
    const data = json?.data?.[0];
    if (!data) return cached ?? null;

    const nav: MFNav = {
      schemeCode,
      schemeName: json.meta?.scheme_name ?? fundName,
      nav: parseFloat(data.nav),
      date: data.date,
      lastUpdated: Date.now(),
    };

    memCache.mfNavs[fundName] = nav;
    await persistCache();
    return nav;
  } catch (e) {
    console.warn(`fetchMFNav(${fundName}) failed:`, e);
    return cached ?? null;
  }
}

// ── Fetch USD/INR rate ───────────────────────────────────────────
export async function fetchFXRate(): Promise<FXRate | null> {
  const cached = memCache.fx;
  if (cached && Date.now() - cached.lastUpdated < CACHE_TTL.GOLD_FX) return cached;

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) return cached ?? null;
    const json = await res.json();
    const rate: FXRate = {
      usdInr: json?.rates?.INR ?? 83.5,
      lastUpdated: Date.now(),
    };
    memCache.fx = rate;
    await persistCache();
    return rate;
  } catch {
    return cached ?? null;
  }
}

// ── Fetch financial news ─────────────────────────────────────────
export async function fetchNews(): Promise<NewsItem[]> {
  const cachedNews = memCache.news;
  const lastNewsUpdate = memCache.lastFullRefresh;
  if (cachedNews.length > 0 && Date.now() - lastNewsUpdate < CACHE_TTL.NEWS) {
    return cachedNews;
  }

  // Use MoneyControl RSS feed (free, no API key)
  try {
    const rssUrl = 'https://www.moneycontrol.com/rss/MCtopnews.xml';
    const res = await fetch(rssUrl);
    if (!res.ok) return cachedNews;
    const text = await res.text();

    const items: NewsItem[] = [];
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const itemText = match[1];
      const title = itemText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? itemText.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
      const desc = itemText.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? itemText.match(/<description>(.*?)<\/description>/)?.[1] ?? '';
      const pubDate = itemText.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
      if (title) {
        items.push({ title, description: desc, url: '', publishedAt: pubDate, source: 'MoneyControl' });
      }
      if (items.length >= 10) break;
    }

    if (items.length > 0) {
      memCache.news = items;
      memCache.lastFullRefresh = Date.now();
      await persistCache();
    }
    return items.length > 0 ? items : cachedNews;
  } catch {
    return cachedNews;
  }
}

// ── Refresh everything ───────────────────────────────────────────
export async function refreshAll(): Promise<void> {
  await Promise.allSettled([
    fetchAllStocks(),
    fetchFXRate(),
    fetchNews(),
  ]);
}

// ── Get cached market data synchronously ─────────────────────────
export function getCachedStocks(): Record<string, StockQuote> {
  return memCache.stocks;
}

export function getCachedFX(): FXRate | undefined {
  return memCache.fx;
}

export function getCachedNews(): NewsItem[] {
  return memCache.news;
}

export function getLastRefreshTime(): number {
  return memCache.lastFullRefresh;
}

async function persistCache(): Promise<void> {
  await saveMarketCache(memCache);
}
