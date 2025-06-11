import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { 
  Search, 
  BookOpen, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  Zap,
  Users,
  Award
} from 'lucide-react-native';
import { router } from 'expo-router';
import { BookCard } from '../../components/BookCard';
import { books } from '../../data/books';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentBooks] = useState(books.slice(0, 3)); // Recently viewed books
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Selamat Pagi');
    } else if (hour < 17) {
      setGreeting('Selamat Siang');
    } else {
      setGreeting('Selamat Malam');
    }
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/library',
        params: { search: searchQuery }
      });
    }
  };

  const statsData = [
    { icon: BookOpen, label: 'Books Read', value: '12', color: '#3F51B5' },
    { icon: MessageSquare, label: 'AI Chats', value: '28', color: '#FF9800' },
    { icon: Clock, label: 'Study Hours', value: '45h', color: '#4CAF50' },
    { icon: Award, label: 'Completed', value: '8', color: '#9C27B0' },
  ];

  const quickActions = [
    {
      icon: Search,
      title: 'Find Books',
      subtitle: 'Search library',
      color: '#3F51B5',
      onPress: () => router.push('/library')
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant',
      subtitle: 'Ask questions',
      color: '#FF9800',
      onPress: () => router.push('/history')
    },
    {
      icon: TrendingUp,
      title: 'Progress',
      subtitle: 'View stats',
      color: '#4CAF50',
      onPress: () => {} // Could implement progress screen
    },
    {
      icon: Users,
      title: 'Study Groups',
      subtitle: 'Join others',
      color: '#9C27B0',
      onPress: () => {} // Could implement study groups
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}! 👋</Text>
            <Text style={styles.subtitle}>Ready to learn something new?</Text>
          </View>
          <View style={styles.headerIcon}>
            <Zap size={24} color="#FF9800" />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#757575" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search books, topics, or ask AI..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholderTextColor="#9E9E9E"
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Learning Journey</Text>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                    <IconComponent size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.actionCard}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <IconComponent size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Continue Reading */}
        {recentBooks.length > 0 && (
          <View style={styles.recentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Reading</Text>
              <TouchableOpacity onPress={() => router.push('/library')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}
            >
              {recentBooks.map((book) => (
                <View key={book.id} style={styles.recentBookCard}>
                  <BookCard book={book} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Daily Tip */}
        <View style={styles.tipContainer}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipTitle}>💡 Study Tip of the Day</Text>
          </View>
          <Text style={styles.tipText}>
            Try the Feynman Technique: Explain concepts in simple terms as if teaching someone else. 
            Use the AI assistant to practice explaining topics from your textbooks!
          </Text>
          <TouchableOpacity style={styles.tipButton} onPress={() => router.push('/history')}>
            <Text style={styles.tipButtonText}>Try with AI Assistant</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    fontWeight: 'normal',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    fontWeight: 'normal',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#757575',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: (width - 52) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#757575',
    fontWeight: 'normal',
  },
  recentContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3F51B5',
    fontWeight: '500',
  },
  recentScrollContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  recentBookCard: {
    marginRight: 12,
  },
  tipContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tipHeader: {
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tipText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: 'normal',
  },
  tipButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  tipButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});