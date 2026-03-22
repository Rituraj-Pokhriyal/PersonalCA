import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { ChatMessage } from '../types/ai.types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👨‍💼</Text>
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAssistant,
        message.isStreaming && styles.bubbleStreaming,
      ]}>
        {message.isStreaming && message.content === '' ? (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color={Colors.textSecondary} />
            <Text style={styles.typingText}>CA Sharma is typing...</Text>
          </View>
        ) : (
          <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
            {message.content}
          </Text>
        )}
        <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAssistant]}>
          {new Date(message.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 12, paddingHorizontal: 12 },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start', alignItems: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  avatarText: { fontSize: 18 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleStreaming: { opacity: 0.9 },
  text: { fontSize: 14, lineHeight: 20 },
  textUser: { color: '#fff' },
  textAssistant: { color: Colors.text },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { color: Colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  time: { fontSize: 9, marginTop: 4 },
  timeUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  timeAssistant: { color: Colors.textLight },
});
