import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry 
}) => {
  return (
    <View style={styles.container}>
      <AlertCircle size={40} color="#F44336" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F51B5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});