import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MessageCircle, FileQuestion, X } from 'lucide-react-native';
import { Document } from '../../../types/document';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { AlertModal } from '../../../components/AlertModal';
import { getDocumentsByDatasetId, fetchImageWithAuth, sendChatMessage, fetchChatAssistants, findChatAssistantByBookName, ChatAssistant } from '../../../utils/api';
import { formatFileSize } from '../../../utils/app';
import { ChatInterface } from '../../../components/ChatInterface';
import { QuizInterface } from '../../../components/QuizInterface';
import { getCurrentUserId } from '../../../utils/auth';
import { ChatMessage } from '@/types/chat';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_IMAGE_URL = `${API_URL}/v1/document/image`;

export default function BookDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatAssistant, setChatAssistant] = useState<ChatAssistant | null>(null);
  const [showNoAssistantModal, setShowNoAssistantModal] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [isQuizVisible, setIsQuizVisible] = useState(false);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getDocumentsByDatasetId({ datasetId: id });

        if (response?.code === 0 && Array.isArray(response.data.docs)) {
          setDocuments(response.data.docs);
        } else {
          throw new Error(response?.message || 'Unexpected response');
        }
      } catch (err: any) {
        console.error('Error loading documents:', err);
        setError(`Unable to load documents: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadDocuments();
    }
  }, [id]);

  useEffect(() => {
    const loadChatAssistant = async () => {
      if (!name) return;
      
      try {
        const assistants = await fetchChatAssistants();
        const assistant = findChatAssistantByBookName(name, assistants);
        
        if (assistant) {
          setChatAssistant(assistant);
          setChatId(assistant.id);
        } else {
          console.warn(`No assistant found for book: ${name}`);
          setChatAssistant(null);
          setChatId(null);
        }
      } catch (error) {
        console.error('Error loading chat assistant:', error);
        setChatAssistant(null);
        setChatId(null);
      }
    };

    loadChatAssistant();
  }, [name]);

  useEffect(() => {
    documents.forEach(async (doc) => {
      if (doc.thumbnail) {
        try {
          const imageUrl = `${BASE_IMAGE_URL}/${id}-${doc.thumbnail}`;
          const base64 = await fetchImageWithAuth(imageUrl);
          setThumbnails((prev) => ({
            ...prev,
            [doc.id]: base64,
          }));
        } catch (err) {
          console.warn(`Thumbnail failed for ${doc.name}`, err);
        }
      }
    });
  }, [documents]);

  const handleChatOpen = () => {
    if (!chatId) {
      setShowNoAssistantModal(true);
      return;
    }
    setShowFloatingMenu(false);
    setIsChatVisible(true);
  };

  const handleQuizOpen = () => {
    setShowFloatingMenu(false);
    setIsQuizVisible(true);
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!chatId) {
      console.error('No chat assistant available');
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
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
        chatId,
        question: userMessage,
        sessionId,
        userId,
      });

      const aiMsg = {
        id: Date.now().toString(),
        content: data.answer,
        isUser: false,
        timestamp: new Date(),
        references: data.reference?.chunks || []
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <LoadingIndicator message="Loading documents..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ErrorMessage message={error} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title}>{name || 'Document List'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            onPress={() =>
              router.navigate({
                pathname: "/document/preview/[id]",
                params: { id: doc.id, name: doc.name, dataset_id: id },
              })
            }
          >
            <View style={styles.documentCard}>
              {thumbnails[doc.id] ? (
                <Image source={{ uri: thumbnails[doc.id] }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 12, color: '#999' }}>Loading...</Text>
                </View>
              )}
              <View style={styles.documentInfo}>
                <Text style={styles.docTitle}>{doc.name}</Text>
                <Text style={styles.docMeta}>
                  Type: {doc.type} | Size: {formatFileSize(doc.size)}
                </Text>
                <Text style={styles.docMeta}>
                  Uploaded: {new Date(doc.create_date).toLocaleString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Menu */}
      <View style={styles.floatingMenu}>
        {showFloatingMenu && (
          <View style={styles.menuOptions}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleChatOpen}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.menuOptionText}>Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleQuizOpen}
            >
              <FileQuestion size={20} color="#FFFFFF" />
              <Text style={styles.menuOptionText}>Take Quiz</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.mainFab}
          onPress={() => setShowFloatingMenu(!showFloatingMenu)}
        >
          {showFloatingMenu ? (
            <X size={24} color="#FFFFFF" />
          ) : (
            <Text style={styles.fabText}>📚</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Chat Interface */}
      {chatId && (
        <ChatInterface
          visible={isChatVisible}
          onClose={() => setIsChatVisible(false)}
          onSendMessage={handleSendMessage}
          onSessionCreated={setSessionId}
          onMessagesUpdate={setMessages}
          title={chatAssistant?.name || `${name} Assistant`}
          messages={messages}
          sessionId={sessionId}
          chatId={chatId}
        />
      )}

      {/* No Assistant Modal */}
      <AlertModal
        visible={showNoAssistantModal}
        title="Chat Not Available"
        message={`Sorry, there is no AI assistant available for "${name}" at the moment. Please try again later.`}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowNoAssistantModal(false),
          },
        ]}
        onRequestClose={() => setShowNoAssistantModal(false        )}
      />

      {/* Quiz Interface */}
      <QuizInterface
        visible={isQuizVisible}
        onClose={() => setIsQuizVisible(false)}
        bookName={name}
        documentIds={documents.map(doc => doc.id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  documentCard: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 100,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 13,
    color: '#757575',
  },
  // Floating Menu Styles
  floatingMenu: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  menuOptions: {
    marginBottom: 10,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F51B5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginBottom: 8,
    minWidth: 120,
  },
  menuOptionText: {
    color: '#FFFFFF',
    fontFamily: 'System',
    fontWeight: '600',
    marginLeft: 8,
  },
  mainFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: {
    fontSize: 24,
  },
});