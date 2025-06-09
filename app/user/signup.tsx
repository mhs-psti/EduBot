import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { signUp } from '../../utils/auth';
import { styles } from './authStyles';
import { useRouter } from 'expo-router';
import { AlertModal } from '../../components/AlertModal';
import { useAlertModal } from '../../hooks/useAlertModal';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    setError('');
    setSuccess(false);
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Starting signup process...');
      const { data, error } = await signUp({ email: email.trim(), password });
      console.log('Signup response:', { data, error });
      
      setLoading(false);
      
      if (error) {
        console.log('Signup error:', error.message);
        setError(error.message);
      } else if (data?.user) {
        console.log('Signup successful, showing alert...');
        setSuccess(true);
        
        showAlert(
          'Success!',
          'Please check your email to confirm your account before signing in.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Navigating to signin...');
                router.replace('./signin');
              }
            }
          ]
        );
      } else {
        console.log('Unexpected response:', data);
        setError('Unexpected response from server');
      }
    } catch (err: any) {
      console.log('Signup exception:', err);
      setLoading(false);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>Account created successfully! Please check your email to confirm your account.</Text> : null}
        
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          autoComplete="new-password"
        />
        
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          autoComplete="new-password"
        />
        
        <TouchableOpacity 
          onPress={handleSignUp} 
          style={[styles.button, loading && { opacity: 0.6 }]} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('./signin')}>
          <Text style={styles.link}>Already have an account? Sign In</Text>
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
