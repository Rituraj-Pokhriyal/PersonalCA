import { useState, useEffect, useCallback } from 'react';
import { generateScreenTip, getStaticTips } from '../services/AIBrainService';
import { buildMemoryContext } from '../services/LearningEngine';
import { loadAITip, saveAITip, getClaudeApiKey } from '../services/StorageService';
import { getClaudeApiKey as getKey } from '../services/StorageService';

type Screen = 'home' | 'budget' | 'debt' | 'investment' | 'tax';

export function useAITips(screen: Screen) {
  const [tip, setTip] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAI, setIsAI] = useState(false);

  const staticTips = getStaticTips(screen);

  const loadTip = useCallback(async () => {
    // 1. Check today's cache first
    const cached = await loadAITip(screen);
    if (cached) {
      setTip(cached);
      setIsAI(true);
      return;
    }

    // 2. Check if API key exists
    const key = await getKey();
    if (!key) {
      setTip(staticTips[0]);
      setIsAI(false);
      return;
    }

    // 3. Generate new AI tip
    setIsLoading(true);
    setTip(staticTips[0]); // Show static while loading
    try {
      const memCtx = await buildMemoryContext();
      const aiTip = await generateScreenTip(screen, memCtx || undefined);
      if (aiTip) {
        setTip(aiTip);
        setIsAI(true);
        await saveAITip(screen, aiTip);
      }
    } catch {
      setTip(staticTips[0]);
      setIsAI(false);
    } finally {
      setIsLoading(false);
    }
  }, [screen]);

  useEffect(() => {
    loadTip();
  }, [loadTip]);

  return {
    tip,
    isLoading,
    isAI,
    staticTips,
    refresh: loadTip,
  };
}
