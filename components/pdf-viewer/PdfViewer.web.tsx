import React from 'react';
import { PdfViewerWeb } from '../PdfViewerWeb';

export const PdfViewer = ({ uri }: { uri: string }) => {
  return <PdfViewerWeb pdfUrl={uri} />;
};