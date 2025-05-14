import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { BookCard } from '../../components/BookCard';
import { books } from '../../data/books';

export default function HomeScreen() {
  // Featured books - showing just a few for the home screen
  const featuredBooks = books.slice(0, 4);
  
  // Recent books - could be based on user's history in a real app
  const recentBooks = books.slice(4, 8);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BookOpen size={28} color="#3F51B5" />
          <Text style={styles.title}>School Book Library</Text>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to your virtual library</Text>
          <Text style={styles.welcomeText}>
            Access all your school books in one place. Read, learn, and get AI assistance
            whenever you need it.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Books</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {featuredBooks.map((book) => (
  <View key={book.id} style={{ marginRight: 12 }}>
    <BookCard book={book} />
  </View>
))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Books</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {recentBooks.map((book) => (
              <View key={book.id} style={{ marginRight: 12 }}>
                <BookCard book={book} />
              </View>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1</Text>
            <Text style={styles.tipText}>
              Use the AI assistant to ask questions about any page in your textbook.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2</Text>
            <Text style={styles.tipText}>
              Books are automatically cached for offline reading when you first open them.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3</Text>
            <Text style={styles.tipText}>
              Explore the library tab to see all available books organized by class level.
            </Text>
          </View>
        </View>
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
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#3F51B5',
    marginLeft: 8,
  },
  welcomeContainer: {
    backgroundColor: '#3F51B5',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 8,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
    marginBottom: 16,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  tipsContainer: {
    margin: 16,
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipNumber: {
    backgroundColor: '#FF9800',
    color: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#424242',
    lineHeight: 20,
  },
});