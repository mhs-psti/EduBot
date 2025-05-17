import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, FileText, Download, Share2 } from 'lucide-react-native';
import { getDocumentsByDatasetId } from '../../../utils/api';
import { Document } from '../../../types/document';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { formatFileSize } from '../../../utils/app';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [id]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getDocumentsByDatasetId({ datasetId: id });
      if (response?.code === 0 && Array.isArray(response.data?.docs)) {
        setDocuments(response.data.docs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load document details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (document: Document) => {
    try {
      if (Platform.OS === 'web') {
        await navigator.share({
          title: document.name,
          text: `Check out this document: ${document.name}`,
          url: document.location,
        });
      } else {
        // Implement native sharing for mobile platforms
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading document details..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadDocuments}
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
        <Text style={styles.title}>Document Details</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {documents.map((doc) => (
          <View key={doc.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentIcon}>
                <FileText size={24} color="#3F51B5" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{doc.name}</Text>
                <Text style={styles.documentMeta}>
                  Type: {doc.type} • Size: {formatFileSize(doc.size)}
                </Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Chunks</Text>
                <Text style={styles.statValue}>{doc.chunk_count}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tokens</Text>
                <Text style={styles.statValue}>{doc.token_count}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={[styles.statValue, { color: doc.status === '1' ? '#4CAF50' : '#FF9800' }]}>
                  {doc.status === '1' ? 'Active' : 'Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => router.push(`/document/preview/${doc.id}`)}
              >
                <Text style={styles.actionButtonText}>Preview</Text>
              </TouchableOpacity>
              
              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={[styles.iconButton, { marginRight: 12 }]}
                  onPress={() => handleShare(doc)}
                >
                  <Share2 size={20} color="#3F51B5" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {/* Implement download */}}
                >
                  <Download size={20} color="#3F51B5" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#757575',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  primaryButton: {
    backgroundColor: '#3F51B5',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EEF1FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});