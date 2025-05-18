import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Document } from '../../../types/document';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { getDocumentsByDatasetId, fetchImageWithAuth } from '../../../utils/api';
import { formatFileSize } from '../../../utils/app';
import { FloatingActionButton } from '../../../components/FloatingActionButton';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_IMAGE_URL = `${API_URL}/v1/document/image`;

export default function BookDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

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
        const base64 = await fetchImageWithAuth(imageUrl); // your custom function
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
    <>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name || 'Document List'}</Text>
      {documents.map((doc) => (
  <TouchableOpacity key={doc.id} onPress={() => router.push({ pathname: `/document/preview/${doc.id}`, params: { name: doc.name } })}>
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
        <Text style={styles.docMeta}>Type: {doc.type} | Size: {formatFileSize(doc.size)}</Text>
        <Text style={styles.docMeta}>Uploaded: {new Date(doc.create_date).toLocaleString()}</Text>
      </View>
    </View>
  </TouchableOpacity>
))}
    </ScrollView>
      <FloatingActionButton
        onPress={() => {
    // Ganti dengan action yang kamu mau, contoh:
    alert('Floating Action Clicked!');
  }}
        title="Ask AI Assistant"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 16,
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