import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  fetchAllStocks, fetchFXRate, fetchNews,
  getCachedStocks, getCachedFX, getCachedNews,
  initMarketCache, getLastRefreshTime,
} from '../services/MarketDataService';
import { StockQuote, FXRate, NewsItem } from '../types/market.types';

export function useMarketData() {
  const [stocks, setStocks] = useState<Record<string, StockQuote>>(getCachedStocks());
  const [fx, setFx] = useState<FXRate | undefined>(getCachedFX());
  const [news, setNews] = useState<NewsItem[]>(getCachedNews());
  const [lastUpdated, setLastUpdated] = useState<number>(getLastRefreshTime());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [stockData, fxData, newsData] = await Promise.allSettled([
        fetchAllStocks(),
        fetchFXRate(),
        fetchNews(),
      ]);
      if (stockData.status === 'fulfilled') setStocks({ ...stockData.value });
      if (fxData.status === 'fulfilled' && fxData.value) setFx(fxData.value);
      if (newsData.status === 'fulfilled') setNews(newsData.value);
      setLastUpdated(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    initMarketCache().then(refresh);

    // Refresh when app comes to foreground
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') refresh();
    });

    // Poll every 60 seconds when active
    const interval = setInterval(() => refresh(), 60 * 1000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [refresh]);

  function getStockForHolding(holdingName: string): StockQuote | undefined {
    return stocks[holdingName];
  }

  function minutesAgo(timestamp: number): number {
    return Math.floor((Date.now() - timestamp) / (1000 * 60));
  }

  return {
    stocks,
    fx,
    news,
    lastUpdated,
    isRefreshing,
    refresh,
    getStockForHolding,
    minutesAgo,
  };
}
