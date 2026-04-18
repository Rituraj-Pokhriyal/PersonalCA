import { getClaudeApiKey } from './StorageService';
import { CA_SHARMA_SYSTEM_PROMPT, buildScreenContext, buildFullContext } from '../constants/aiPrompts';
import { ChatMessage } from '../types/ai.types';
import { CA_SHARMA } from '../data/userData';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

// Reset client (kept for API compatibility — no-op with fetch approach)
export function resetClient(): void {}

async function post(apiKey: string, body: object): Promise<Response> {
  return fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// ── Generate a screen-specific tip ──────────────────────────────
export async function generateScreenTip(
  screen: 'home' | 'budget' | 'debt' | 'investment' | 'tax',
  memoryContext?: string,
): Promise<string | null> {
  try {
    const apiKey = await getClaudeApiKey();
    if (!apiKey) return null;

    const userContent = buildScreenContext(screen) +
      (memoryContext ? `\n\n[MY PROFILE & PATTERNS]\n${memoryContext}` : '');

    const res = await post(apiKey, {
      model: MODEL,
      max_tokens: 200,
      system: CA_SHARMA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.content?.[0]?.text ?? null;
  } catch (e) {
    console.error('generateScreenTip error:', e);
    return null;
  }
}

// ── Stream a chat response ───────────────────────────────────────
export async function streamChatResponse(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  memoryContext?: string,
): Promise<void> {
  try {
    const apiKey = await getClaudeApiKey();
    if (!apiKey) {
      onError('No API key set. Please add your Claude API key in Settings.');
      return;
    }

    const financialContext = buildFullContext();
    const systemWithContext = CA_SHARMA_SYSTEM_PROMPT +
      '\n\n' + financialContext +
      (memoryContext ? '\n\n[WHAT I KNOW ABOUT RITURAJ FROM PREVIOUS SESSIONS]\n' + memoryContext : '');

    const recentMessages = messages.slice(-8).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        stream: true,
        system: systemWithContext,
        messages: recentMessages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      onError(`API error ${res.status}: ${errText.slice(0, 100)}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) { onError('Stream unavailable'); return; }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
            onChunk(parsed.delta.text);
          }
        } catch { /* skip malformed lines */ }
      }
    }
    onDone();
  } catch (e: any) {
    console.error('streamChatResponse error:', e);
    onError(e?.message ?? 'Something went wrong. Please try again.');
  }
}

// ── Extract learnings from a chat session ────────────────────────
export async function extractLearnings(
  conversationSummary: string,
): Promise<string[]> {
  try {
    const apiKey = await getClaudeApiKey();
    if (!apiKey) return [];

    const res = await post(apiKey, {
      model: MODEL,
      max_tokens: 300,
      system: 'You extract behavioral insights from financial conversations. Return a JSON array of strings, each being a specific learning about the user. Max 3 learnings. Example: ["Prefers paying off highest interest first", "Mentioned goal to buy a bike by December"]',
      messages: [{
        role: 'user',
        content: `Extract key learnings about Rituraj from this conversation:\n${conversationSummary}`,
      }],
    });

    if (!res.ok) return [];
    const json = await res.json();
    const text: string = json.content?.[0]?.text?.trim() ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]) as string[];
  } catch {
    return [];
  }
}

// ── Generate weekly insight summary ─────────────────────────────
export async function generateWeeklySummary(
  weeklyStats: {
    totalSpent: number;
    categorySummary: string;
    netWorthChange: number;
    adviceFollowed: number;
  },
): Promise<string> {
  try {
    const apiKey = await getClaudeApiKey();
    if (!apiKey) return '';

    const res = await post(apiKey, {
      model: MODEL,
      max_tokens: 250,
      system: CA_SHARMA_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate a warm, brief weekly financial review for Rituraj.
Weekly stats: Spent ₹${weeklyStats.totalSpent} total. ${weeklyStats.categorySummary}
Net worth change this week: ₹${weeklyStats.netWorthChange}
Pieces of advice followed: ${weeklyStats.adviceFollowed}
Keep it under 100 words, use a Hindi greeting, be encouraging.`,
      }],
    });

    if (!res.ok) return '';
    const json = await res.json();
    return json.content?.[0]?.text ?? '';
  } catch {
    return '';
  }
}

// ── Fallback to static tips when AI unavailable ──────────────────
export function getStaticTips(screen: 'home' | 'budget' | 'debt' | 'investment' | 'tax'): string[] {
  return CA_SHARMA.tips[screen] ?? [CA_SHARMA.greeting];
}
