import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Share,
  Platform,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Clock, Download, Trash2 } from 'lucide-react-native';
import { books } from '../../data/books';
import { fetchChatSessions } from '../../utils/api';
import { ChatSession } from '../../types/chat';

const CHAT_ID = 'cf90a7b4334611f080d1ea5f1b3df08c';

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  useEffect(() => {
    const loadChatSessions = async () => {
      try {
        const response = await fetchChatSessions({
          chatId: CHAT_ID
        });
        console.log(response);
        if (Array.isArray(response)) {
          const sessions = response.map((session: any) => ({
            id: session.id,
            bookId: '1', // if you can infer this dynamically, replace here
            timestamp: session.update_time,
            lastMessage: session.messages?.[0]?.content || 'No message yet',
            messages: session.messages,
          }));
          console.log(sessions);
          setChatHistory(sessions);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };
    loadChatSessions();
  }, []);

  const filteredHistory = chatHistory.filter(session => {
    const book = books.find(b => b.id === session.bookId);
    const searchLower = searchQuery.toLowerCase();
    return (
      book?.title.toLowerCase().includes(searchLower) ||
      session.lastMessage.toLowerCase().includes(searchLower)
    );
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
    router.navigate({ pathname: '/(tabs)/book/[id]', params: { id: session.bookId, chatSessionId: session.id } });
  }, []);

  const renderItem = ({ item: session }: { item: ChatSession }) => {
    const book = books.find(b => b.id === session.bookId);
    return (
      <TouchableOpacity style={styles.historyItem} onPress={() => handleSessionPress(session)} activeOpacity={0.7}>
        <View style={styles.historyContent}>
          <Text style={styles.bookTitle}>{book?.title}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(session.timestamp)}</Text>
        </View>
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Regular',
    color: '#212121',
    height: '100%',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
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
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#757575',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Inter-SemiBold',
    color: '#616161',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9E9E9E',
    textAlign: 'center',
  },
});