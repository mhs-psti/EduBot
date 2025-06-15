import { supabase } from './app';

// Sign Up
export async function signUp({ email, password }: { email: string; password: string }) {
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: process.env.EXPO_PUBLIC_SITE_URL
    }
  });
}

// Sign In
export async function signIn({ email, password }: { email: string; password: string }) {
  return await supabase.auth.signInWithPassword({ email, password });
}

// Forgot Password
export async function resetPassword({ email }: { email: string }) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.EXPO_PUBLIC_SITE_URL
  });
}

// Get Current User
export function getCurrentUser() {
  return supabase.auth.getUser();
}

// Get Current Session
export function getCurrentSession() {
  return supabase.auth.getSession();
}

// Get Current User ID (helper function)
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  return await supabase.auth.signOut();
}

// Listen for auth state changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}