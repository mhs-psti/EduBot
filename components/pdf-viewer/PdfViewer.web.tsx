import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { fetchPdfWithAuth } from '../../utils/api';

interface PdfViewerProps {
  uri: string | null;
  onError?: (error: Error) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ uri, onError }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
  const loadPdf = async () => {
    const blobUrl = await fetchPdfBlobUrlWithAuth(uri);
    setPdfUrl(blobUrl);
  };
  loadPdf();

    return () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  };
}, [uri]);

  if (!pdfUrl) {
    return (
      <View style={styles.container}>
        <Text>Loading PDF...</Text>
      </View>
    );
  }

  return (
    <iframe
      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
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