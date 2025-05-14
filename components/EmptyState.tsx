import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookX } from 'lucide-react-native';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  subMessage 
}) => {
  return (
    <View style={styles.container}>
      <BookX size={60} color="#BDBDBD" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#616161',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});