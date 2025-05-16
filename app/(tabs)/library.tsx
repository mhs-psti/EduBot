import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  SafeAreaView, Platform, ActivityIndicator
} from 'react-native';
import { Search } from 'lucide-react-native';
import { BookCard } from '../../components/BookCard';
import { ClassLevelFilter } from '../../components/ClassLevelFilter';
import { EmptyState } from '../../components/EmptyState';
import { fetchDatasets } from '../../utils/api';
import { Dataset } from '../../types/dataset'; // type matching API response

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [books, setBooks] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const levels = ['All', 'VII', 'VIII', 'IX'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDatasets();
if (Array.isArray(response?.data)) {
  setBooks(response.data);
} else {
  console.warn("API response is not an array", response);
  setBooks([]); // prevent crash
}
      } catch (err) {
        console.error('Error loading datasets:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      // optional: use book.language or embed classLevel if available
      return matchesSearch;
    });
  }, [books, searchQuery]);

  const groupedBooks = useMemo(() => {
    return filteredBooks.reduce((acc, book) => {
      const subject = book.language || 'Uncategorized';
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(book);
      return acc;
    }, {} as Record<string, Dataset[]>);
  }, [filteredBooks]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text>Loading datasets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search & Filter */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#757575" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9E9E9E"
          />
        </View>
        <View style={styles.filterContainer}>
          <ClassLevelFilter
            selectedLevel={selectedLevel}
            levels={levels}
            onSelectLevel={setSelectedLevel}
          />
        </View>
      </View>

      {/* Results */}
      {Object.keys(groupedBooks).length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {Object.entries(groupedBooks).map(([subject, books]) => (
            <View key={subject} style={styles.section}>
              <Text style={styles.sectionTitle}>{subject}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.booksRow}>
                {books.map(book => (
                  <View key={book.id} style={styles.bookCard}>
                    <BookCard book={book} />
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState message="No books found" subMessage="Try adjusting your search or filters" />
      )}
    </SafeAreaView>
  );
}

// You can keep your styles definition unchanged

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
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
  filterContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
    marginBottom: 16,
  },
  booksRow: {
    paddingRight: 16,
  },
  bookCard: {
    marginRight: 16,
  },
});