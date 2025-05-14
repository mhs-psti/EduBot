import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { books } from '../../../data/books';
import { Book } from '../../../types/book';
import { downloadPdf } from '../../../utils/downloadPdf';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { FloatingActionButton } from '../../../components/FloatingActionButton';
import { ChatView } from '../../../components/ChatView';
import { PdfViewer } from '../../../components/pdf-viewer/PdfViewer';

const PdfViewerWeb =
  Platform.OS === 'web'
    ? require('../../../components/PdfViewerWeb').PdfViewerWeb
    : null;

let PDFReader: any = null;
if (Platform.OS !== 'web') {
  try {
    PDFReader = require('react-native-pdf').default;
  } catch (err) {
    console.warn('PDFReader not loaded:', err);
  }
}

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const found = books.find((b) => b.id === id);
    if (!found) {
      setError('Book not found');
      setIsLoading(false);
      return;
    }

    setBook(found);
  }, [id]);

  const toggleChat = () => setIsChatVisible((prev) => !prev);

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

      <View style={styles.pdfContainer}>
        {{if(Platform.OS === 'web') ? (
        <PdfViewer
    uri={pdfUri}
  />
        )
        : (<PdfViewer
    uri={pdfUri}
    onPageChange={(page: number, numberOfPages: number) => {
      setCurrentPage(page);
      setTotalPages(numberOfPages);
    }}
    onLoadComplete={(numberOfPages: number) => setTotalPages(numberOfPages)}
    onError={(error: Error) => {
      console.error('PDF viewer error:', error);
      setError(`PDF viewer error: ${error.message}`);
    }}
  />)
        )}}
</View>

      <FloatingActionButton onPress={toggleChat} title="Ask AI Assistant" />

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
    backgroundColor: '#F5F5F5',
  },
});