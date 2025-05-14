import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { books } from '../../../data/books';
import { Book } from '../../../types/book';
import { downloadPdf } from '../../../utils/downloadPdf';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { FloatingActionButton } from '../../../components/FloatingActionButton';
import { ChatView } from '../../../components/ChatView';
import { PdfViewerWeb } from '../../../components/PdfViewerWeb';

const { width, height } = Dimensions.get('window');

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    const foundBook = books.find(b => b.id === id);
    if (foundBook) {
      setBook(foundBook);
      loadPdf(foundBook);
    } else {
      setError('Book not found');
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
  if (book?.pdfUrl) {
    const timeout = setTimeout(() => {
      const proxyUrl = `/pdf-proxy?url=${encodeURIComponent(book.pdfUrl)}`;
      setPdfUri(proxyUrl);
    }, 100); // delay load just a bit
    return () => clearTimeout(timeout);
  }
}, [book]);

  const loadPdf = async (book: Book) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (book?.pdfUrl) {
        const proxyUrl = `/pdf-proxy?url=${encodeURIComponent(book.pdfUrl)}`;
        setPdfUri(proxyUrl);
        setIsLoading(false);
      } else {
        // For native platforms, use the existing download logic
        const result = await downloadPdf(book.pdfUrl, book.id);
        
        if (result.success && result.localUri) {
          setPdfUri(result.localUri);
        } else {
          throw new Error(result.error || 'Failed to load PDF');
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('PDF loading error:', err);
      setError(`Unable to load PDF: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number, numberOfPages: number) => {
    setCurrentPage(page);
    setTotalPages(numberOfPages);
  };

  const handleError = (error: Error) => {
    console.error('PDF viewer error:', error);
    setError(`PDF viewer error: ${error.message}`);
    setIsLoading(false);
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  if (!book) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Book not found" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.subject}>{book.subject}</Text>
        {totalPages > 0 && (
          <Text style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </Text>
        )}
      </View>

      {isLoading ? (
  <LoadingIndicator message="Loading PDF..." />
) : error ? (
  <ErrorMessage 
    message={error}
    onRetry={() => book && loadPdf(book)}
  />
) : pdfUri ? (
  <View style={{ flex: 1, width: '100%', height: '100%' }}>
  <PdfViewerWeb pdfUrl={book.pdfUrl} />
</View>
) : (
  <ErrorMessage message="PDF source not available" />
)}

      <FloatingActionButton
        onPress={toggleChat}
        title="Ask AI Assistant"
      />

      <ChatView
        visible={isChatVisible}
        book={book}
        onLoadError={() => setError('Failed to load AI chat')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#3F51B5',
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  pageInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  pdfContainer: {
    flex: 1,
    width: '100%',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
});