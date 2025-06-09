import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { getCurrentSession, onAuthStateChange } from '../utils/auth';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuthState();
    
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      setIsAuthenticated(!!session);
      
      // Handle sign out event
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to signin...');
        router.replace('../../user/signin');
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading || isAuthenticated === null) return; // Don't redirect while loading

    const inAuthGroup = segments[0] === 'user';
    const inProtectedGroup = segments[0] === '(tabs)';

    console.log('Route check:', { isAuthenticated, inAuthGroup, inProtectedGroup, segments });

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to sign in if not authenticated and not in auth group
      console.log('Redirecting to signin...');
      router.replace('../../user/signin');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth group
      console.log('Redirecting to tabs...');
      router.replace('../../(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  const checkAuthState = async () => {
    try {
      const { data } = await getCurrentSession();
      console.log('Initial auth check:', !!data.session);
      setIsAuthenticated(!!data.session);
    } catch (error) {
      console.log('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9' }}>
        <ActivityIndicator size="large" color="#3F51B5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="user" options={{ headerShown: false }} />
    </Stack>
  );
}