import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { fetchPdfWithAuth } from '../../../utils/api';

interface PdfViewerProps {
  uri: string | null;
  onError?: (error: Error) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ uri, onError }) => {
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const base64 = await fetchPdfWithAuth(uri!);
        setBase64Pdf(base64);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    if (uri) loadPdf();
  }, [uri]);

  if (!base64Pdf) {
    return (
      <View style={styles.container}>
        <Text>Loading PDF...</Text>
      </View>
    );
  }

  return (
    <iframe
      src={base64Pdf}
      style={styles.iframe as any}
      title="PDF Preview"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iframe: {
    width: '100%',
    height: '100vh',
    border: 'none',
  },
});