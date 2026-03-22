import { useState, useEffect } from 'react';
import { PriorityAction } from '../types/ai.types';
import { generateRuleBasedActions, enhanceActionsWithAI } from '../services/DecisionEngine';
import { getClaudeApiKey } from '../services/StorageService';

export function useDecisionEngine() {
  const [actions, setActions] = useState<PriorityAction[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    // Step 1: Instant rule-based actions
    const ruleActions = generateRuleBasedActions();
    setActions(ruleActions);

    // Step 2: Enhance with AI async
    getClaudeApiKey().then(async (key) => {
      if (!key) return;
      setIsEnhancing(true);
      try {
        const enhanced = await enhanceActionsWithAI(ruleActions);
        setActions(enhanced);
      } finally {
        setIsEnhancing(false);
      }
    });
  }, []);

  return { actions, isEnhancing };
}
