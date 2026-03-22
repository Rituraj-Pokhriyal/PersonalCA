import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { MARKET_REFRESH_TASK } from '../constants/backgroundTasks';
import { refreshAll } from './MarketDataService';
import { checkAlertRules } from './NotificationService';

// Define the task (must be called before registerTaskAsync)
TaskManager.defineTask(MARKET_REFRESH_TASK, async () => {
  try {
    await refreshAll();
    await checkAlertRules();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.error('Background task failed:', e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundTasks(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.warn('Background fetch is restricted/denied');
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(MARKET_REFRESH_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(MARKET_REFRESH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (e) {
    console.warn('Could not register background tasks:', e);
  }
}

export async function unregisterBackgroundTasks(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(MARKET_REFRESH_TASK);
  } catch { /* ignore */ }
}
