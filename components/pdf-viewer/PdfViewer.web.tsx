import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PdfViewerProps {
  uri: string | null;
  onError?: (error: Error) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ uri, onError }) => {
  console.log(uri);
  if (!uri) {
    return <View style={styles.container} />;
  }

  return (
    <iframe
      src={`${uri}#toolbar=0`}
      style={styles.iframe}
      onError={() => onError?.(new Error('Failed to load PDF'))}
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