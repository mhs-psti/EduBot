import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { ClassLevelFilter } from '../../components/ClassLevelFilter';
import { EmptyState } from '../../components/EmptyState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Dataset } from '../../types/dataset';
import { fetchDatasets } from '../../utils/api';

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const levels = useMemo(() => ['All', 'VII', 'VIII', 'IX'], []);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchDatasets();
      setDatasets(response.data);
    } catch (err) {
      setError('Failed to load datasets. Please try again later.');
      console.error('Error loading datasets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDatasets = useMemo(() => {
    return datasets.filter((dataset) => {
      const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dataset.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      // Note: We're keeping the level filter for UI consistency, but it doesn't affect the results
      // since the API doesn't provide class level information
      return matchesSearch;
    });
  }, [datasets, searchQuery]);

  const groupedDatasets = useMemo(() => {
    return filteredDatasets.reduce((acc, dataset) => {
      const category = dataset.language || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(dataset);
      return acc;
    }, {} as Record<string, Dataset[]>);
  }, [filteredDatasets]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading datasets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ErrorMessage 
          message={error} 
          onRetry={loadDatasets}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dataset Library</Text>
        <Text style={styles.subtitle}>
          Browse through available datasets by language and category
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#757575" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search datasets by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9E9E9E"
          />
        </View>
        <ClassLevelFilter
          selectedLevel={selectedLevel}
          levels={levels}
          onSelectLevel={setSelectedLevel}
        />
      </View>

      {filteredDatasets.length === 0 ? (
        <EmptyState
          message="No datasets found"
          subMessage="Try adjusting your search criteria"
        />
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedDatasets).map(([language, languageDatasets]) => (
            <View key={language} style={styles.section}>
              <Text style={styles.sectionTitle}>{language}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datasetsRow}
              >
                {languageDatasets.map((dataset) => (
                  <View key={dataset.id} style={styles.datasetCard}>
                    <View style={styles.card}>
                      <Text style={styles.datasetName}>{dataset.name}</Text>
                      <Text style={styles.datasetDescription}>
                        {dataset.description || 'No description available'}
                      </Text>
                      <View style={styles.statsContainer}>
                        <Text style={styles.statsText}>
                          Documents: {dataset.document_count}
                        </Text>
                        <Text style={styles.statsText}>
                          Chunks: {dataset.chunk_count}
                        </Text>
                      </View>
                      <Text style={styles.dateText}>
                        Updated: {new Date(dataset.update_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#757575',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#757575',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212121',
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
    marginBottom: 16,
  },
  datasetsRow: {
    paddingRight: 16,
  },
  datasetCard: {
    marginRight: 16,
    width: 300,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  datasetName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
    marginBottom: 8,
  },
  datasetDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#3F51B5',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9E9E9E',
  },
  bottomPadding: {
    height: 24,
  },
});