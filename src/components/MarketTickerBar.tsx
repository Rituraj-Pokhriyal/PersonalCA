import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { useMarketData } from '../hooks/useMarketData';
import { GROWW_STOCKS } from '../data/userData';

interface MarketTickerBarProps {
  onPress?: () => void;
}

export default function MarketTickerBar({ onPress }: MarketTickerBarProps) {
  const { stocks, fx, isRefreshing, minutesAgo, lastUpdated } = useMarketData();

  const tickerItems = GROWW_STOCKS.holdings.map(h => {
    const live = stocks[h.name];
    return {
      name: h.name,
      price: live?.price ?? h.marketPrice,
      changePercent: live?.changePercent ?? 0,
      isLive: !!live,
    };
  });

  const mins = lastUpdated ? minutesAgo(lastUpdated) : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.container}>
        <View style={styles.liveIndicator}>
          <View style={[styles.dot, isRefreshing && styles.dotPulsing]} />
          <Text style={styles.liveText}>
            {isRefreshing ? 'Updating...' : mins !== null ? `${mins}m ago` : 'LIVE'}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {tickerItems.map(item => (
            <View key={item.name} style={styles.tickerItem}>
              <Text style={styles.symbol}>{item.name}</Text>
              <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
              <Text style={[
                styles.change,
                { color: item.changePercent >= 0 ? Colors.success : Colors.danger },
              ]}>
                {item.changePercent >= 0 ? '▲' : '▼'}{Math.abs(item.changePercent).toFixed(2)}%
              </Text>
            </View>
          ))}
          {fx && (
            <View style={styles.tickerItem}>
              <Text style={styles.symbol}>USD/INR</Text>
              <Text style={styles.price}>₹{fx.usdInr.toFixed(2)}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  dotPulsing: { backgroundColor: Colors.accent },
  liveText: { color: '#AED6F1', fontSize: 9, fontWeight: '700' },
  scroll: { flex: 1 },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  symbol: { color: '#AED6F1', fontSize: 11, fontWeight: '600' },
  price: { color: '#fff', fontSize: 11, fontWeight: '700' },
  change: { fontSize: 10, fontWeight: '600' },
});
