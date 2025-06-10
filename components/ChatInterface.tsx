// ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { Send, X } from 'lucide-react-native';
import { fetchInitialMessage, createChatSession } from '../utils/api';
import { getCurrentUserId } from '../utils/auth';
import { AnswerWithReferences } from './chat/AnswerWithReferences';
import { ChatMessage } from '@/types/chat';

interface ChatInterfaceProps {
  visible: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onSessionCreated: (sessionId: string) => void;
  onMessagesUpdate: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  title: string;
  subtitle?: string;
  sessionId?: string;
  messages: ChatMessage[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  visible,
  onClose,
  onSendMessage,
  onSessionCreated,
  onMessagesUpdate,
  title,
  subtitle,
  sessionId,
  messages,
}) => {
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 1000)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 1000,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!visible || sessionId) return;

      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          console.error('User not authenticated');
          return;
        }

        const res = await fetchInitialMessage({ name: title });
        const sessionRes = await createChatSession(res.data[0].id, 'new session', userId);

        if (sessionRes?.messages?.[0]?.content) {
          onMessagesUpdate([
            {
              id: Date.now().toString(),
              content: sessionRes.messages[0].content,
              isUser: false,
              timestamp: new Date(),
            },
          ]);
          onSessionCreated(sessionRes?.id);
        }
      } catch (e) {
        console.error('Failed to fetch or create session:', e);
      }
    };

    initializeChat();
  }, [visible, title, sessionId]);

  useEffect(() => {
    if (!visible) onMessagesUpdate([]);
  }, [visible]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage('');
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#212121" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageWrapper, msg.isUser ? styles.userMessageWrapper : styles.botMessageWrapper]}
          >
            <View style={[styles.message, msg.isUser ? styles.userMessage : styles.botMessage]}>
              {msg.isUser ? (
                <Text style={[styles.messageText, styles.userMessageText]}>{msg.content}</Text>
              ) : (
                <AnswerWithReferences answer={msg.content} references={msg.references || []} />
              )}
              <Text style={styles.timestamp}>{formatTime(msg.timestamp)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            placeholderTextColor="#9E9E9E"
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 24 },
      web: { boxShadow: '0px -3px 6px rgba(0, 0, 0, 0.1)' },
    }),
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    color: '#212121',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  botMessageWrapper: {
    alignSelf: 'flex-start',
  },
  message: {
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    backgroundColor: '#3F51B5',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#212121',
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#9E9E9E',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    color: '#212121',
    maxHeight: 100,
    minHeight: 48,
    ...Platform.select({
      web: {  },
    }),
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 },
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', cursor: 'pointer' },
    }),
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
});
