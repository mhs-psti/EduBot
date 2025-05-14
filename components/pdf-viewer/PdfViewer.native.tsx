import { WebView } from 'react-native-webview';

export const PdfViewer = ({ uri }: { uri: string }) => (
  <WebView
    source={{ uri }}
    style={{ flex: 1 }}
    startInLoadingState
  />
);