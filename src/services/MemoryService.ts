import { loadProfile, saveProfile, PersonalProfile } from '../data/personalProfile';
import { buildMemoryContext } from './LearningEngine';

export { buildMemoryContext };

export async function getProfile(): Promise<PersonalProfile> {
  return loadProfile();
}

export async function addGoal(goal: string, targetAmount?: number): Promise<void> {
  const profile = await loadProfile();
  const exists = profile.financialGoals.some(g => g.goal === goal);
  if (!exists) {
    profile.financialGoals.push({
      id: Date.now().toString(),
      goal,
      targetAmount,
      detectedAt: Date.now(),
    });
    await saveProfile(profile);
  }
}

export async function recordAdviceAccepted(adviceId: string): Promise<void> {
  const profile = await loadProfile();
  const record = profile.adviceHistory.find(a => a.id === adviceId);
  if (record) {
    profile.decisionPatterns = [
      `Followed advice: ${record.advice.slice(0, 50)}`,
      ...profile.decisionPatterns,
    ].slice(0, 10);
    await saveProfile(profile);
  }
}

export async function recordAdviceRejected(advice: string): Promise<void> {
  const profile = await loadProfile();
  profile.decisionPatterns = [
    `Rejected: ${advice.slice(0, 50)}`,
    ...profile.decisionPatterns,
  ].slice(0, 10);
  await saveProfile(profile);
}

export async function incrementSavedAmount(amount: number): Promise<void> {
  const profile = await loadProfile();
  profile.savedAmount += amount;
  await saveProfile(profile);
}
