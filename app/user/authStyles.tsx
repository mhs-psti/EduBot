import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#212121',
      marginBottom: 24,
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#212121',
    },
    button: {
      backgroundColor: '#3F51B5',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    link: {
      color: '#3F51B5',
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 8,
    },
    error: {
      color: '#FF6B6B',
      fontSize: 14,
      fontWeight: 'normal',
      marginBottom: 16,
      textAlign: 'center',
    },
    success: {
      color: '#4CAF50',
      fontSize: 14,
      fontWeight: 'normal',
      marginBottom: 16,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: 'normal',
      color: '#666666',
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 22,
    },
  });