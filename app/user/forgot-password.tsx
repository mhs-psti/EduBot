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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { alertState, showAlert, hideAlert } = useAlertModal();

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await resetPassword({ email: email.trim() });
      setLoading(false);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        showAlert(
          'Reset Link Sent!',
          'Please check your email for instructions to reset your password.',
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
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>Reset link sent successfully!</Text> : null}
        
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        
        <TouchableOpacity 
          onPress={handleResetPassword} 
          style={[styles.button, loading && { opacity: 0.6 }]} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Text>
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