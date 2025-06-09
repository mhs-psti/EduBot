import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { signIn } from '../../utils/auth';
import { styles } from './authStyles';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Starting signin process...');
      const { data, error } = await signIn({ email: email.trim(), password });
      console.log('Signin response:', { data, error });
      
      setLoading(false);
      
      if (error) {
        console.log('Signin error:', error.message);
        setError(error.message);
      } else if (data?.user) {
        console.log('Signin successful, redirecting to tabs...');
        // Redirect to main tabs screen on successful sign in
        router.replace('/(tabs)');
      } else {
        console.log('Unexpected signin response:', data);
        setError('Unexpected response from server');
      }
    } catch (err: any) {
      console.log('Signin exception:', err);
      setLoading(false);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
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
          autoComplete="current-password"
        />
        
        <TouchableOpacity 
          onPress={handleSignIn} 
          style={[styles.button, loading && { opacity: 0.6 }]} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('./forgot-password')}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('./signup')}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}