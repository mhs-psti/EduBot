import React from 'react';
import { StyleSheet } from 'react-native';
import PDFReader from 'react-native-pdf';

export const PdfViewer = ({ uri, onPageChange, onLoadComplete, onError }: any) => {
  return (
    <PDFReader
      source={{ uri }}
      onPageChanged={onPageChange}
      onLoadComplete={onLoadComplete}
      onError={onError}
      style={styles.pdf}
    />
  );
};

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
});