import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { getClaudeApiKey, saveClaudeApiKey } from './src/services/StorageService';
import { resetClient } from './src/services/AIBrainService';
import { initMarketCache, refreshAll } from './src/services/MarketDataService';
import { requestNotificationPermissions } from './src/services/NotificationService';
import { registerBackgroundTasks } from './src/services/BackgroundTaskManager';
import { Colors } from './src/theme/colors';

export default function App() {
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      // Init market data cache
      await initMarketCache();

      // Request notification permissions
      await requestNotificationPermissions();

      // Register background tasks
      await registerBackgroundTasks();

      // Check if API key exists
      const key = await getClaudeApiKey();
      if (!key) {
        setApiKeyModalVisible(true);
      }

      // Start background market refresh
      refreshAll().catch(() => {});

      setIsReady(true);
    }
    init();
  }, []);

  async function handleSaveApiKey() {
    if (!apiKeyInput.trim().startsWith('sk-ant-')) {
      Alert.alert('Invalid Key', 'Claude API keys start with "sk-ant-". Please check your key.');
      return;
    }
    await saveClaudeApiKey(apiKeyInput.trim());
    resetClient();
    setApiKeyModalVisible(false);
    setApiKeyInput('');
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />

      {/* API Key Setup Modal */}
      <Modal
        visible={apiKeyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setApiKeyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>👨‍💼 Welcome to Personal CA</Text>
            <Text style={styles.modalSubtitle}>
              CA Sharma needs your Claude API key to give you AI-powered financial advice.
            </Text>
            <Text style={styles.modalNote}>
              🔒 Your key is stored securely on this device only. It never goes to any server except Anthropic's API.
            </Text>
            <Text style={styles.modalLabel}>Claude API Key</Text>
            <TextInput
              style={styles.modalInput}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-ant-api03-..."
              placeholderTextColor={Colors.textLight}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.modalBtn, !apiKeyInput.trim() && styles.modalBtnDisabled]}
              onPress={handleSaveApiKey}
              disabled={!apiKeyInput.trim()}
            >
              <Text style={styles.modalBtnText}>Start with CA Sharma</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSkip}
              onPress={() => setApiKeyModalVisible(false)}
            >
              <Text style={styles.modalSkipText}>Skip — use static tips for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  modalNote: {
    fontSize: 12,
    color: Colors.success,
    backgroundColor: Colors.success + '15',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
    backgroundColor: Colors.background,
  },
  modalBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnDisabled: { backgroundColor: Colors.textLight },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalSkip: { alignItems: 'center', paddingVertical: 8 },
  modalSkipText: { color: Colors.textSecondary, fontSize: 13 },
});
