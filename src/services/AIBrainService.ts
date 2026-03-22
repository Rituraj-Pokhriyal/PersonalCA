import Anthropic from '@anthropic-ai/sdk';
import { getClaudeApiKey } from './StorageService';
import { CA_SHARMA_SYSTEM_PROMPT, buildScreenContext, buildFullContext } from '../constants/aiPrompts';
import { ChatMessage } from '../types/ai.types';
import { CA_SHARMA } from '../data/userData';

let clientInstance: Anthropic | null = null;

async function getClient(): Promise<Anthropic | null> {
  const key = await getClaudeApiKey();
  if (!key) return null;
  if (!clientInstance) {
    clientInstance = new Anthropic({
      apiKey: key,
      dangerouslyAllowBrowser: true,
    });
  }
  return clientInstance;
}

// Reset client (call when API key changes)
export function resetClient(): void {
  clientInstance = null;
}

// ── Generate a screen-specific tip ──────────────────────────────
export async function generateScreenTip(
  screen: 'home' | 'budget' | 'debt' | 'investment' | 'tax',
  memoryContext?: string,
): Promise<string | null> {
  try {
    const client = await getClient();
    if (!client) return null;

    const userContent = buildScreenContext(screen) +
      (memoryContext ? `\n\n[MY PROFILE & PATTERNS]\n${memoryContext}` : '');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: CA_SHARMA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const block = response.content[0];
    return block.type === 'text' ? block.text : null;
  } catch (e) {
    console.error('AIBrainService.generateScreenTip error:', e);
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
    const client = await getClient();
    if (!client) {
      onError('No API key set. Please add your Claude API key in Settings.');
      return;
    }

    const financialContext = buildFullContext();
    const systemWithContext = CA_SHARMA_SYSTEM_PROMPT +
      '\n\n' + financialContext +
      (memoryContext ? '\n\n[WHAT I KNOW ABOUT RITURAJ FROM PREVIOUS SESSIONS]\n' + memoryContext : '');

    // Keep only last 8 messages for API call (token efficiency)
    const recentMessages = messages.slice(-8).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemWithContext,
      messages: recentMessages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        onChunk(chunk.delta.text);
      }
    }
    onDone();
  } catch (e: any) {
    console.error('AIBrainService.streamChatResponse error:', e);
    onError(e?.message ?? 'Something went wrong. Please try again.');
  }
}

// ── Extract learnings from a chat session ────────────────────────
export async function extractLearnings(
  conversationSummary: string,
): Promise<string[]> {
  try {
    const client = await getClient();
    if (!client) return [];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: 'You extract behavioral insights from financial conversations. Return a JSON array of strings, each being a specific learning about the user. Max 3 learnings. Example: ["Prefers paying off highest interest first", "Mentioned goal to buy a bike by December"]',
      messages: [{
        role: 'user',
        content: `Extract key learnings about Rituraj from this conversation:\n${conversationSummary}`,
      }],
    });

    const block = response.content[0];
    if (block.type !== 'text') return [];
    const text = block.text.trim();
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
    const client = await getClient();
    if (!client) return '';

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
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

    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  } catch {
    return '';
  }
}

// ── Fallback to static tips when AI unavailable ──────────────────
export function getStaticTips(screen: 'home' | 'budget' | 'debt' | 'investment' | 'tax'): string[] {
  return CA_SHARMA.tips[screen] ?? [CA_SHARMA.greeting];
}
