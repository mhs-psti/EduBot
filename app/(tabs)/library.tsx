import React, { useEffect, useState, useMemo } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  SafeAreaView, 
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions
} from 'react-native';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  BookOpen,
  Users,
  Clock,
  Star 
} from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { BookCard } from '../../components/BookCard';
import { ClassLevelFilter } from '../../components/ClassLevelFilter';
import { EmptyState } from '../../components/EmptyState';
import { fetchDatasets } from '../../utils/api';
import { Dataset } from '../../types/dataset';

const getNumColumns = (viewMode: 'grid' | 'list', screenWidth: number) => {
  if (viewMode === 'list') return 1;
  if (screenWidth >= 1200) return 3; // Very large screens - 3 columns max for better spacing
  if (screenWidth >= 768) return 3;  // Tablets - 3 columns
  return 2; // Phones - 2 columns
};

const getItemSpacing = (screenWidth: number) => {
  if (screenWidth >= 1024) return 24;
  if (screenWidth >= 768) return 20;
  return 16;
};

export default function LibraryScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.search as string) || '');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [books, setBooks] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  const levels = ['All', 'VII', 'VIII', 'IX'];

  // Listen to screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  // Calculate responsive values based on current screen size
  const responsiveValues = useMemo(() => {
    const currentWidth = screenData.width;
    const spacing = getItemSpacing(currentWidth);
    const numColumns = getNumColumns(viewMode, currentWidth);
    
    // Better spacing calculation for large screens
    const totalHorizontalSpacing = spacing * 2; // Left and right padding
    const gapBetweenItems = spacing * 0.8; // Gap between items (slightly smaller than padding)
    const totalGaps = (numColumns - 1) * gapBetweenItems;
    
    const itemWidth = viewMode === 'list' 
      ? currentWidth - totalHorizontalSpacing
      : (currentWidth - totalHorizontalSpacing - totalGaps) / numColumns;
    
    const isPhone = currentWidth < 768;
    const isTablet = currentWidth >= 768 && currentWidth < 1024;
    const isLargeScreen = currentWidth >= 1024;
    
    return {
      numColumns,
      spacing,
      itemWidth,
      gapBetweenItems,
      isPhone,
      isTablet,
      isLargeScreen,
      screenWidth: currentWidth,
      // Dynamic font sizes
      headerFontSize: isLargeScreen ? 36 : isTablet ? 32 : 28,
      searchHeight: isLargeScreen ? 56 : isTablet ? 52 : 48,
      // Dynamic padding
      horizontalPadding: isLargeScreen ? 48 : isTablet ? 40 : 20,
      verticalPadding: isLargeScreen ? 28 : isTablet ? 24 : 20,
    };
  }, [screenData.width, viewMode]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDatasets();
        if (Array.isArray(response?.data)) {
          setBooks(response.data);
        } else {
          console.warn("API response is not an array", response);
          setBooks([]);
        }
      } catch (err) {
        console.error('Error loading datasets:', err);
        setBooks([]);
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

      const matchesCategory = 
        selectedCategory === 'All' || 
        (book.language || 'Other').toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  const renderBookItem = ({ item, index }: { item: Dataset; index: number }) => {
    const { numColumns, gapBetweenItems, itemWidth } = responsiveValues;
    
    // Calculate position in row
    const columnIndex = index % numColumns;
    const isFirstInRow = columnIndex === 0;
    const isLastInRow = columnIndex === numColumns - 1;
    
    // Better margin calculation for consistent spacing
    let marginLeft = 0;
    let marginRight = 0;
    
    if (numColumns > 1) {
      if (isFirstInRow) {
        marginRight = gapBetweenItems / 2;
      } else if (isLastInRow) {
        marginLeft = gapBetweenItems / 2;
      } else {
        marginLeft = gapBetweenItems / 2;
        marginRight = gapBetweenItems / 2;
      }
    }
    
    return (
      <View style={[
        viewMode === 'grid' ? styles.gridItem : styles.listItem,
        {
          width: itemWidth,
          marginLeft,
          marginRight,
          marginBottom: responsiveValues.spacing * 0.8, // Consistent vertical spacing
        }
      ]}>
        <BookCard book={item} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F51B5" />
          <Text style={styles.loadingText}>Loading library...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header, 
        responsiveValues.isTablet && styles.headerTablet,
        responsiveValues.isLargeScreen && styles.headerLargeScreen,
        { paddingHorizontal: responsiveValues.horizontalPadding }
      ]}>
        <View style={styles.headerTop}>
          <Text style={[
            styles.headerTitle, 
            { fontSize: responsiveValues.headerFontSize }
          ]}>
            Library
          </Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.activeViewButton]}
              onPress={() => setViewMode('grid')}
            >
              <Grid size={responsiveValues.isLargeScreen ? 20 : 18} color={viewMode === 'grid' ? '#FFFFFF' : '#757575'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
              onPress={() => setViewMode('list')}
            >
              <List size={responsiveValues.isLargeScreen ? 20 : 18} color={viewMode === 'list' ? '#FFFFFF' : '#757575'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={[
          styles.searchContainer, 
          { 
            height: responsiveValues.searchHeight,
            borderRadius: responsiveValues.isLargeScreen ? 16 : 12,
            paddingHorizontal: responsiveValues.isLargeScreen ? 24 : 16 
          }
        ]}>
          <Search size={responsiveValues.isLargeScreen ? 22 : 20} color="#757575" style={styles.searchIcon} />
          <TextInput
            placeholder="Search books by subject ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.searchInput,
              { fontSize: responsiveValues.isLargeScreen ? 18 : 16 }
            ]}
            placeholderTextColor="#9E9E9E"
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[
          styles.filtersScroll,
          { 
            paddingHorizontal: responsiveValues.horizontalPadding,
            paddingVertical: responsiveValues.verticalPadding 
          }
        ]}>
          <View style={styles.filterGroup}>
            <ClassLevelFilter
              selectedLevel={selectedLevel}
              levels={levels}
              onSelectLevel={setSelectedLevel}
            />
          </View>
        </ScrollView>
      </View>

      {/* Results */}
      <View style={styles.resultsSection}>
        <View style={[
          styles.resultsHeader, 
          { 
            paddingHorizontal: responsiveValues.horizontalPadding,
            paddingVertical: responsiveValues.isLargeScreen ? 24 : responsiveValues.isTablet ? 20 : 16
          }
        ]}>
          <Text style={[
            styles.resultsCount,
            { fontSize: responsiveValues.isLargeScreen ? 18 : 16 }
          ]}>
            {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
          </Text>
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[
                styles.clearSearch,
                { fontSize: responsiveValues.isLargeScreen ? 16 : 14 }
              ]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredBooks.length > 0 ? (
          <FlatList
            data={filteredBooks}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            numColumns={responsiveValues.numColumns}
            key={`${viewMode}-${responsiveValues.numColumns}`} // Force re-render when view mode or columns change
            contentContainerStyle={[
              styles.booksContainer,
              { 
                paddingHorizontal: responsiveValues.spacing,
                paddingBottom: responsiveValues.spacing 
              }
            ]}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={viewMode === 'grid' && responsiveValues.numColumns > 1 ? styles.row : null}
          />
        ) : (
          <EmptyState 
            message="No books found" 
            subMessage={searchQuery ? "Try different search terms" : "Try adjusting your filters"} 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#3F51B5',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTablet: {
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  headerLargeScreen: {
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitleTablet: {
    fontSize: 32,
  },
  headerTitleLargeScreen: {
    fontSize: 36,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchContainerTablet: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  searchContainerLargeScreen: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 24,
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
  filtersSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filtersScrollTablet: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  filtersScrollLargeScreen: {
    paddingHorizontal: 48,
    paddingVertical: 24,
  },
  filterGroup: {
    marginRight: 24,
  },
  resultsSection: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsHeaderTablet: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  resultsHeaderLargeScreen: {
    paddingHorizontal: 48,
    paddingVertical: 24,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  clearSearch: {
    fontSize: 14,
    color: '#3F51B5',
    fontWeight: '500',
  },
  booksContainer: {
    paddingTop: 20,
  },
  row: {
    justifyContent: 'flex-start',
  },
  gridItem: {
    // Width and margins are set dynamically in renderBookItem
  },
  listItem: {
    // Width and margins are set dynamically in renderBookItem
  },
});