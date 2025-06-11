import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Platform,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { Dataset } from '../types/dataset';
import { extractClassFromName } from '../utils/classExtractor';

interface BookCardProps {
  book: Dataset;
}

const { width } = Dimensions.get('window');
const cardWidth = width < 500 ? (width - 40) / 2 : (width - 60) / 3;

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const handlePress = () => {
    router.navigate({
      pathname: `/(tabs)/book/[id]`,
      params: { id: book.id, name: book.name }
    });
  };

  const bookClass = extractClassFromName(book.name);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <Image 
          source={{ uri: book.avatar }} 
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Jumlah BAB: {book.document_count}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>{book.name}</Text>
          <Text style={styles.classLevel}>{bookClass}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {book.description || 'No description'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
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
  coverImage: {
    width: '100%',
    height: cardWidth * 1.25,
    backgroundColor: '#F5F5F5',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(63, 81, 181, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#212121',
  },
  classLevel: {
    fontSize: 14,
    color: '#3F51B5',
    fontWeight: '500',
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 18,
  },
});
