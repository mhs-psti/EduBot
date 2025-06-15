import { useEffect } from 'react';
import { useRouter, useSegments, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../utils/app';

export default function AuthCallback() {
  const router = useRouter();
  const segments = useSegments();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      try {
        // Check if we have token_hash and type in the URL
        if (params.token_hash && params.type) {
          // If it's a password reset, redirect to reset password page
          if (params.type === 'recovery') {
            router.replace({
              pathname: '/user/reset-password',
              params: {
                token_hash: params.token_hash,
                type: params.type
              }
            });
            return;
          }

          // For other types (like email confirmation)
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: params.token_hash as string,
            type: params.type as any
          });

          if (error) {
            console.error('Error verifying OTP:', error);
            router.replace('/user/signin');
            return;
          }

          if (data.session) {
            // Successfully verified, redirect to main app
            router.replace('/(tabs)');
            return;
          }
        }

        // If no token_hash or regular auth callback
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          router.replace('/user/signin');
          return;
        }

        if (session) {
          // Redirect to the appropriate page based on the user's state
          const inAuthGroup = segments[0] === 'user';
          if (inAuthGroup) {
            router.replace('/(tabs)');
          } else {
            router.replace('/');
          }
        } else {
          router.replace('/user/signin');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.replace('/user/signin');
      }
    };

    handleAuthCallback();
  }, [params]);

  return null;
} 