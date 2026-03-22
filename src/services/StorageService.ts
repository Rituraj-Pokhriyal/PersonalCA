import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const PREFIX = '@personalca_';

// ── Secure Store (for API key only) ─────────────────────────────
export const SecureStorage = {
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(PREFIX + key, value);
  },
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(PREFIX + key);
  },
  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(PREFIX + key);
  },
};

// ── AsyncStorage wrapper (for cached data) ───────────────────────
export const Storage = {
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(PREFIX + key);
  },
  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const prefixed = keys.filter(k => k.startsWith(PREFIX));
    await AsyncStorage.multiRemove(prefixed);
  },
};

// ── API Key helpers ─────────────────────────────────────────────
export const API_KEY_STORE = 'claude_api_key';

export async function getClaudeApiKey(): Promise<string | null> {
  return SecureStorage.get(API_KEY_STORE);
}

export async function saveClaudeApiKey(key: string): Promise<void> {
  await SecureStorage.set(API_KEY_STORE, key.trim());
}

export async function clearClaudeApiKey(): Promise<void> {
  await SecureStorage.delete(API_KEY_STORE);
}

// ── Chat history ─────────────────────────────────────────────────
const CHAT_HISTORY_KEY = 'chat_history';
const MAX_HISTORY = 50;

export async function saveChatHistory(messages: any[]): Promise<void> {
  const trimmed = messages.slice(-MAX_HISTORY);
  await Storage.set(CHAT_HISTORY_KEY, trimmed);
}

export async function loadChatHistory(): Promise<any[]> {
  return (await Storage.get<any[]>(CHAT_HISTORY_KEY)) ?? [];
}

// ── Market cache ─────────────────────────────────────────────────
export async function saveMarketCache(data: any): Promise<void> {
  await Storage.set('market_cache', data);
}

export async function loadMarketCache(): Promise<any | null> {
  return Storage.get('market_cache');
}

// ── AI tips cache (per screen, per day) ─────────────────────────
export async function saveAITip(screen: string, tip: string): Promise<void> {
  const dateKey = new Date().toISOString().split('T')[0];
  await Storage.set(`ai_tip_${screen}_${dateKey}`, tip);
}

export async function loadAITip(screen: string): Promise<string | null> {
  const dateKey = new Date().toISOString().split('T')[0];
  return Storage.get<string>(`ai_tip_${screen}_${dateKey}`);
}
