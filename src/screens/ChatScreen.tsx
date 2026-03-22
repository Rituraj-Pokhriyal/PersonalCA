import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import ChatBubble from '../components/ChatBubble';
import { ChatMessage } from '../types/ai.types';
import { streamChatResponse } from '../services/AIBrainService';
import { buildMemoryContext, processCompletedChat } from '../services/LearningEngine';
import { saveChatHistory, loadChatHistory } from '../services/StorageService';
import { CHAT_QUICK_REPLIES } from '../constants/aiPrompts';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const streamingIdRef = useRef<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory().then(history => {
      if (history.length > 0) {
        const restored = history.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
      } else {
        // Welcome message
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: "Namaste Rituraj! 🙏 Main CA Sharma hun — tumhara personal financial advisor. I know your complete financial picture. Kya puchna hai? Ask me anything about your money!",
          timestamp: new Date(),
        }]);
      }
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const streamingId = `ai-${Date.now()}`;
    streamingIdRef.current = streamingId;

    const streamingMsg: ChatMessage = {
      id: streamingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    const newMessages = [...messages, userMsg, streamingMsg];
    setMessages(newMessages);
    setInputText('');
    setIsStreaming(true);
    scrollToBottom();

    const memCtx = await buildMemoryContext();

    let fullResponse = '';
    await streamChatResponse(
      [...messages, userMsg],
      (chunk) => {
        fullResponse += chunk;
        setMessages(prev => prev.map(m =>
          m.id === streamingId ? { ...m, content: fullResponse } : m
        ));
        scrollToBottom();
      },
      async () => {
        // Done
        const finalMessages = newMessages.map(m =>
          m.id === streamingId ? { ...m, content: fullResponse, isStreaming: false } : m
        );
        setMessages(finalMessages);
        setIsStreaming(false);
        // Save history
        await saveChatHistory(finalMessages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })));
        // Process for learning (async, don't await)
        processCompletedChat(finalMessages).catch(() => {});
      },
      (err) => {
        setError(err);
        setMessages(prev => prev.filter(m => m.id !== streamingId));
        setIsStreaming(false);
      },
      memCtx || undefined,
    );
  }, [messages, isStreaming, scrollToBottom]);

  const handleQuickReply = (reply: string) => sendMessage(reply);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerAvatar}>👨‍💼</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>CA Sharma</Text>
          <Text style={styles.headerSub}>
            {isStreaming ? 'Typing...' : 'Your Personal Financial Advisor'}
          </Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          onContentSizeChange={scrollToBottom}
        />

        {/* Quick replies (only when not streaming and few messages) */}
        {messages.length <= 3 && !isStreaming && (
          <View style={styles.quickReplies}>
            <Text style={styles.quickRepliesLabel}>Quick questions:</Text>
            <View style={styles.quickRepliesRow}>
              {CHAT_QUICK_REPLIES.slice(0, 3).map(reply => (
                <TouchableOpacity
                  key={reply}
                  style={styles.quickReply}
                  onPress={() => handleQuickReply(reply)}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorBar}>
            <Ionicons name="warning" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask CA Sharma anything..."
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={500}
            editable={!isStreaming}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isStreaming) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isStreaming}
          >
            {isStreaming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  flex: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerAvatar: { fontSize: 32 },
  headerInfo: { flex: 1 },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSub: { color: '#AED6F1', fontSize: 11, marginTop: 1 },
  aiBadge: {
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  messageList: { flex: 1 },
  messageContent: { paddingVertical: 16 },
  quickReplies: { paddingHorizontal: 12, paddingBottom: 8 },
  quickRepliesLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 6 },
  quickRepliesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickReply: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  quickReplyText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEDEC',
    margin: 12,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  errorText: { flex: 1, fontSize: 12, color: Colors.danger },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.textLight },
});
