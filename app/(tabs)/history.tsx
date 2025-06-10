import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Search, Clock } from 'lucide-react-native';
import { fetchChatSessions, sendChatMessage, fetchChatAssistants, ChatAssistant } from '../../utils/api';
import { getCurrentUserId } from '../../utils/auth';
import { ChatMessage, ChatSession } from '../../types/chat';
import { ChatInterface } from '../../components/ChatInterface';
import { AlertModal } from '../../components/AlertModal';

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatAssistants, setChatAssistants] = useState<ChatAssistant[]>([]);
  const [showNoAssistantModal, setShowNoAssistantModal] = useState(false);

  useEffect(() => {
    const loadChatAssistants = async () => {
      try {
        const assistants = await fetchChatAssistants();
        setChatAssistants(assistants);
      } catch (error) {
        console.error('Failed to load chat assistants:', error);
      }
    };

    const loadChatSessions = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          console.error('User not authenticated');
          return;
        }

        const assistants = await fetchChatAssistants();
        const allSessions: ChatSession[] = [];

        // Load sessions from all assistants
        for (const assistant of assistants) {
          try {
            const response = await fetchChatSessions({
              chatId: assistant.id,
              userId
            });
            
            if (Array.isArray(response)) {
              const sessions = response.map((session: any) => ({
                id: session.id,
                name: session.name,
                timestamp: session.update_time,
                lastMessage: session.messages?.length > 0 
                  ? session.messages[session.messages.length - 1].content 
                  : 'No message yet',
                messages: session.messages,
                chatId: assistant.id, // Add chatId to session
                assistantName: assistant.name,
              }));
              allSessions.push(...sessions);
            }
          } catch (error) {
            console.warn(`Failed to load sessions for ${assistant.name}:`, error);
          }
        }

        // Sort all sessions by timestamp
        allSessions.sort((a, b) => b.timestamp - a.timestamp);
        setChatHistory(allSessions);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };

    loadChatAssistants();
    loadChatSessions();
  }, []);

  const filteredHistory = chatHistory.filter(session => {
    const searchLower = searchQuery.toLowerCase();
    return (session.lastMessage.toLowerCase().includes(searchLower));
  });

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const handleSessionPress = useCallback((session: ChatSession) => {
    console.log('Opening session:', session.name);
    
    // Clear messages first to prevent key conflicts
    setMessages([]);
    setCurrentSession(session);
    
    // Convert session messages to ChatInterface format with unique IDs
    const formattedMessages: ChatMessage[] = session.messages?.map((msg: any, index: number) => ({
      id: `session-${session.id}-msg-${index}-${msg.id || Date.now()}`,
      content: msg.content,
      isUser: msg.role === 'user' || msg.isUser,
      timestamp: new Date(msg.timestamp || session.timestamp),
      references: msg.reference || []
    })) || [];
    
    setMessages(formattedMessages);
    setIsChatVisible(true);
  }, []);

  const handleSendMessage = async (userMessage: string) => {
    if (!currentSession || !currentSession.chatId) {
      setShowNoAssistantModal(true);
      return;
    }

    // Generate unique ID with session prefix and random component
    const userMsgId = `session-${currentSession.id}-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      content: userMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const data = await sendChatMessage({
        chatId: currentSession.chatId,
        question: userMessage,
        sessionId: currentSession.id,
        userId,
      });

      const aiMsgId = `session-${currentSession.id}-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        content: data.answer,
        isUser: false,
        timestamp: new Date(),
        references: data.reference?.chunks || []
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Send failed:', error);
      
      // Add error message to chat with unique ID
      const errorMsgId = `session-${currentSession.id}-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const errorMsg: ChatMessage = {
        id: errorMsgId,
        content: "Sorry, I couldn't process your message. Please try again.",
        isUser: false,
        timestamp: new Date(),
        references: []
      };

      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleChatClose = () => {
    setIsChatVisible(false);
    setCurrentSession(null);
    // Clear messages to prevent key conflicts when opening new sessions
    setMessages([]);
  };

  const renderItem = ({ item: session }: { item: ChatSession }) => {
    return (
      <TouchableOpacity style={styles.historyItem} onPress={() => handleSessionPress(session)} activeOpacity={0.7}>
        <View style={styles.historyContent}>
          <Text style={styles.bookTitle}>{session.name}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(session.timestamp)}</Text>
        </View>
        {session.assistantName && (
          <Text style={styles.assistantName}>{session.assistantName}</Text>
        )}
        <Text style={styles.lastMessage} numberOfLines={2}>{session.lastMessage}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat History</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#757575" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9E9E9E"
          />
        </View>
      </View>

      {chatHistory.length > 0 ? (
        <>
          <FlatList
            data={filteredHistory}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Clock size={48} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No Chat History</Text>
          <Text style={styles.emptyText}>Your chat conversations with AI will appear here</Text>
        </View>
      )}

      {/* Chat Interface */}
      <ChatInterface
        visible={isChatVisible}
        onClose={handleChatClose}
        onSendMessage={handleSendMessage}
        onSessionCreated={() => {}} // Not needed for existing sessions
        onMessagesUpdate={setMessages}
        title={currentSession?.name || currentSession?.name || 'Chat'}
        subtitle={currentSession?.assistantName}
        messages={messages}
        sessionId={currentSession?.id}
      />

      {/* No Assistant Modal */}
      <AlertModal
        visible={showNoAssistantModal}
        title="Chat Not Available"
        message="Sorry, the AI assistant for this conversation is not available at the moment. Please try again later."
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowNoAssistantModal(false),
          },
        ]}
        onRequestClose={() => setShowNoAssistantModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'normal',
    color: '#212121',
    height: '100%',
  },
  listContent: { padding: 16 },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' },
    }),
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  timestamp: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#757575',
  },
  assistantName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3F51B5',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#616161',
    lineHeight: 20,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EEF1FF',
  },
  clearButton: { backgroundColor: '#FFEBEE' },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#3F51B5',
  },
  clearText: { color: '#F44336' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#616161',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#9E9E9E',
    textAlign: 'center',
  },
});