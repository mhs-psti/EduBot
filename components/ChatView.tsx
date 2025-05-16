import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Dataset } from '../types/dataset';
import { ErrorMessage } from './ErrorMessage';
import { LoadingIndicator } from './LoadingIndicator';

interface ChatViewProps {
  visible: boolean;
  book: Book;
  onLoadError: () => void;
}

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const ChatView: React.FC<ChatViewProps> = ({
  visible,
  book,
  onLoadError,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const translateY = useSharedValue(height);

  // Mock chat URL - this would be replaced with your actual AI chat service
  const chatUrl = `${API_URL}/chat/share?shared_id=23c09a822fe211f0888b82b4a2c8f9a7`;
  
  React.useEffect(() => {
    translateY.value = withTiming(
      visible ? 0 : height,
      {
        duration: 400,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }
    );
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onLoadError();
  };

  // Mock data to be sent to the chat service
  const bookContext = {
    title: book.title,
    subject: book.subject,
    classLevel: book.classLevel,
  };

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]} 
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSubtitle}>Ask questions about {book.title}</Text>
      </View>

      {hasError ? (
        <ErrorMessage 
          message="Unable to load the AI chat. Please check your internet connection and try again."
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
          }}
        />
      ) : (
        <View style={styles.webViewContainer}>
          {isLoading && <LoadingIndicator message="Loading AI Chat..." />}
          
          {Platform.OS === 'web' ? (
            <iframe
              src={`${chatUrl}?context=${encodeURIComponent(JSON.stringify(bookContext))}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="AI Chat"
            />
          ) : (
            <WebView
              source={{
                uri: `${chatUrl}?context=${encodeURIComponent(JSON.stringify(bookContext))}`,
              }}
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              style={styles.webView}
            />
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  header: {
    padding: 16,
    backgroundColor: '#3F51B5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
});