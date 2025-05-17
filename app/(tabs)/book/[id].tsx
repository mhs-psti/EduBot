import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Dataset } from '../../../types/dataset';
import { Document } from '../../../types/document';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { getDocumentsByDatasetId } from '../../../utils/api';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await await getDocumentsByDatasetId({ datasetId: id });
        console.log(response);

        if (response?.code === 0 && Array.isArray(response.data.docs)) {
          setDocuments(response.data.docs);
        } else {
          console.log(response);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Document List</Text>
      {documents.map((doc) => (
        <View key={doc.id} style={styles.documentCard}>
          <Text style={styles.docTitle}>{doc.name}</Text>
          <Text style={styles.docMeta}>Type: {doc.type} | Size: {doc.size} KB</Text>
          <Text style={styles.docMeta}>Uploaded: {new Date(doc.create_date).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
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
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
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
