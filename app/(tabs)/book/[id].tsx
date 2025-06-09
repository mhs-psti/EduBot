import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Document } from '../../../types/document';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { getDocumentsByDatasetId, fetchImageWithAuth, sendChatMessage } from '../../../utils/api';
import { formatFileSize } from '../../../utils/app';
import { FloatingActionButton } from '../../../components/FloatingActionButton';
import { ChatInterface, Message } from '../../../components/ChatInterface';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_IMAGE_URL = `${API_URL}/v1/document/image`;

export default function BookDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [chatId] = useState('cf90a7b4334611f080d1ea5f1b3df08c');

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

  const handleSendMessage = async (userMessage: string) => {
    const userMsg = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await sendChatMessage({
        chatId,
        question: userMessage,
        sessionId,
      });

      const aiMsg = {
        id: Date.now().toString(),
        text: data.answer,
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

      <FloatingActionButton
        onPress={() => setIsChatVisible(true)}
        title="Ask AI Assistant"
        absolute
      />

      {/* Chat Interface */}
      <ChatInterface
  visible={isChatVisible}
  onClose={() => setIsChatVisible(false)}
  onSendMessage={handleSendMessage}
        onSessionCreated={setSessionId}
        onMessagesUpdate={setMessages}
  title={`${name} Assistant`}
        messages={messages}
        sessionId={sessionId}
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 13,
    color: '#757575',
  },
});