import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { PdfViewer } from '../../../../components/pdf-viewer/PdfViewer';
import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { ErrorMessage } from '../../../../components/ErrorMessage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_DOCUMENT_URL = `${API_URL}/v1/document/get`;

export default function DocumentPreviewScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const pdfUrl = `${BASE_DOCUMENT_URL}/${id}`;
      setPdfUrl(pdfUrl);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: Error) => {
    setError('Failed to load PDF: ' + error.message);
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading document..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadDocument}
      />
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
        <Text style={styles.title}>{name || 'Document Preview'}</Text>
      </View>

      <View style={styles.pdfContainer}>
        <PdfViewer
          uri={pdfUrl}
          onError={handleError}
        />
      </View>
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});