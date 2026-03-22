import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Animated, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface FloatingChatButtonProps {
  onPress: () => void;
}

export default function FloatingChatButton({ onPress }: FloatingChatButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.avatar}>👨‍💼</Text>
        <Ionicons name="chatbubble-ellipses" size={14} color="#fff" style={styles.chatIcon} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    zIndex: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { fontSize: 26 },
  chatIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    padding: 1,
  },
});
