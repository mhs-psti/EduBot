import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { books } from '../../data/books';
import { BookCard } from '../../components/BookCard';
import { ClassLevelFilter } from '../../components/ClassLevelFilter';
import { EmptyState } from '../../components/EmptyState';

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const levels = useMemo(() => ['All', 'VII', 'VIII', 'IX'], []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel = selectedLevel === 'All' || book.classLevel === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, selectedLevel]);

  const groupedBooks = useMemo(() => {
    return filteredBooks.reduce((acc, book) => {
      if (!acc[book.subject]) {
        acc[book.subject] = [];
      }
      acc[book.subject].push(book);
      return acc;
    }, {} as Record<string, typeof books>);
  }, [filteredBooks]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>
          Browse through your textbooks by subject and class level
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#757575" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books by title or subject..."
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

      {filteredBooks.length === 0 ? (
        <EmptyState
          message="No books found"
          subMessage="Try adjusting your search criteria or class level filter"
        />
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedBooks).map(([subject, subjectBooks]) => (
            <View key={subject} style={styles.section}>
              <Text style={styles.sectionTitle}>{subject}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.booksRow}
              >
                {subjectBooks.map((book) => (
                  <View key={book.id} style={styles.bookCard}>
                    <BookCard book={book} />
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
  booksRow: {
    paddingRight: 16,
  },
  bookCard: {
    marginRight: 16,
    width: 280,
  },
  bottomPadding: {
    height: 24,
  },
});