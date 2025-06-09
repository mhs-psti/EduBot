import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { resetPassword } from '../../utils/auth';
import { styles } from './authStyles';
import { useRouter } from 'expo-router';
import { AlertModal } from '../../components/AlertModal';
import { useAlertModal } from '../../hooks/useAlertModal';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { alertState, showAlert, hideAlert } = useAlertModal();

  const handleReset = async () => {
    setLoading(true);
    try {
      const { error } = await resetPassword({ email });
      setLoading(false);
      
      if (error) {
        showAlert('Reset Error', error.message);
      } else {
        showAlert(
          'Success!',
          'Check your email for password reset instructions!',
          [
            {
              text: 'OK',
              onPress: () => router.push('./signin')
            }
          ]
        );
      }
    } catch (err: any) {
      setLoading(false);
      showAlert('Error', err.message || 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          style={styles.input} 
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TouchableOpacity onPress={handleReset} style={[styles.button, loading && { opacity: 0.6 }]} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Email'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('./signin')}>
          <Text style={styles.link}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Alert Modal */}
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onRequestClose={hideAlert}
      />
    </SafeAreaView>
  );
}
