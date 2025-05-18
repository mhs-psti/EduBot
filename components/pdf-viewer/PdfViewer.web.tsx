import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { fetchPdfWithAuth } from '../../../utils/api';

interface PdfViewerProps {
  uri: string | null;
  onError?: (error: Error) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ uri, onError }) => {
  if (!uri) {
    return <View style={styles.container} />;
  }
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);
  useEffect(() => {
    const base64 = await fetchImageWithAuth(uri);
    setBase64Pdf(base64);
  }, [uri]);

  if (!base64Pdf) return <p>Loading PDF...</p>;

  return (
    <iframe
      src={base64Pdf}
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="PDF Preview"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});