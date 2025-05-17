import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Search, FileText, Plus } from 'lucide-react-native';
import { fetchDatasets } from '../../../utils/api';
import { Dataset } from '../../../types/dataset';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ErrorMessage } from '../../../components/ErrorMessage';

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState<Dataset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchDatasets();
      if (response?.code === 0 && Array.isArray(response.data)) {
        setDocuments(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDocumentItem = ({ item }: { item: Dataset }) => (
    <TouchableOpacity
      style={styles.documentItem}
      onPress={() => router.push(`/document/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.documentIcon}>
        <FileText size={24} color="#3F51B5" />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.documentMeta}>
          Documents: {item.document_count} • Language: {item.language}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingIndicator message="Loading documents..." />;
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
        <Text style={styles.title}>Documents</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/document/new')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9E9E9E"
        />
      </View>

      <FlatList
        data={filteredDocuments}
        renderItem={renderDocumentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={48} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No Documents Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Add your first document to get started'}
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#212121',
  },
  addButton: {
    backgroundColor: '#3F51B5',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212121',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  listContent: {
    padding: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
        },
      },
    }),
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
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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