import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { BookCard } from '../../components/BookCard';
import { ClassLevelFilter } from '../../components/ClassLevelFilter';
import { EmptyState } from '../../components/EmptyState';
import { books } from '../../data/books';

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const levels = ['All', 'VII', 'VIII', 'IX'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || book.classLevel === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const groupedBooks = filteredBooks.reduce((acc, book) => {
    if (!acc[book.subject]) {
      acc[book.subject] = [];
    }
    acc[book.subject].push(book);
    return acc;
  }, {} as Record<string, typeof books>);

  return (
    <SafeAreaView style={styles.container}>
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

      {Object.keys(groupedBooks).length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {Object.entries(groupedBooks).map(([subject, subjectBooks]) => (
            <View key={subject} style={styles.section}>
              <Text style={styles.sectionTitle}>{subject}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.booksRow}
              >
                {subjectBooks.map(book => (
                  <View key={book.id} style={styles.bookCard}>
                    <BookCard book={book} />
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          message="No books found"
          subMessage="Try adjusting your search or filters"
        />
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