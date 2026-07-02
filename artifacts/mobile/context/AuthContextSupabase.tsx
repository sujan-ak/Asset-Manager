import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import { Profile } from '@/types/auth';
import * as authService from '@/services/authService';
import { registerForPushNotifications } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

const SESSION_ID_KEY = 'edodwaja_session_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

const devLog = (...args: any[]) => {
  if (__DEV__) console.log(...args);
};
const devError = (...args: any[]) => {
  if (__DEV__) console.error(...args);
};

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  grade?: string;
  school?: string;
  role: string;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionInvalidated: boolean;
  clearSessionInvalidated: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionInvalidated, setSessionInvalidated] = useState(false);
  const userRef = useRef<User | null>(null);

  // Keep ref in sync so AppState handler always has current user
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    // Get initial session
    authService.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      devLog('[Auth] State changed:', _event);
      setSession(session);

      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Handle deep links for OAuth callback
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      devLog('[Auth] Deep link received:', url);
      
      // Supabase will automatically handle the OAuth callback
      // The onAuthStateChange listener will fire when complete
    };

    // Subscribe to deep link events
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // AppState listener — enforce single-device session on resume
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;
      const currentUser = userRef.current;
      if (!currentUser) return;

      try {
        const localSessionId = await SecureStore.getItemAsync(SESSION_ID_KEY);
        if (!localSessionId) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('active_session_id')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profile && profile.active_session_id !== localSessionId) {
          devLog('[Auth] Session mismatch — signing out');
          await SecureStore.deleteItemAsync(SESSION_ID_KEY);
          await authService.signOut();
          setUser(null);
          setSession(null);
          setSessionInvalidated(true);
        }
      } catch (err: any) {
        devError('[Auth] AppState session check error:', err.message);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  async function loadUserProfile(supabaseUser: SupabaseUser) {
    devLog('[Auth] Loading profile for user:', supabaseUser.id);
    try {
      const { data: profile, error } = await authService.getProfile(supabaseUser.id);

      if (error) {
        devError('[Auth] Failed to load profile:', error.message, error.code);
        setIsLoading(false);
        return;
      }

      if (!profile) {
        devLog('[Auth] Profile not found, creating new profile...');
        await createUserProfile(supabaseUser);
        return;
      }

      devLog('[Auth] Profile loaded successfully');
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.email.split('@')[0],
        avatar: profile.avatar_url || undefined,
        grade: profile.grade || undefined,
        school: profile.school || undefined,
        role: profile.role,
        joinedDate: new Date(profile.created_at).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
      });

      // Register push token after profile is confirmed (skip in Expo Go)
      if (Application.applicationId !== 'host.exp.Exponent') {
        registerForPushNotifications(profile.id).catch(() => {});
      }
    } catch (error: any) {
      devError('[Auth] Error loading profile:', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function createUserProfile(supabaseUser: SupabaseUser) {
    devLog('[Auth] Creating profile for user:', supabaseUser.id);
    try {
      const profileData = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        full_name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
        role: 'student' as const,
      };

      const { data, error } = await authService.createProfile(profileData);

      if (error) {
        devError('[Auth] Profile creation failed:', error.message, error.code);
        setIsLoading(false);
        return;
      }

      if (data) {
        devLog('[Auth] Profile created successfully');
        setUser({
          id: data.id,
          email: data.email,
          name: data.full_name || data.email.split('@')[0],
          avatar: data.avatar_url || undefined,
          grade: data.grade || undefined,
          school: data.school || undefined,
          role: data.role,
          joinedDate: new Date(data.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
        });
      }
    } catch (error: any) {
      devError('[Auth] Error creating profile:', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      devLog('[Auth] Starting Google OAuth flow...');
      setIsLoading(true);

      // Create redirect URL for OAuth callback
      const redirectTo = Linking.createURL('/auth/callback');
      devLog('[Auth] OAuth redirect URL:', redirectTo);

      const { data, error } = await authService.signInWithGoogle(redirectTo);

      if (error) {
        devError('[Auth] Google OAuth error:', error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (!data?.url) {
        devError('[Auth] No OAuth URL returned');
        setIsLoading(false);
        return { success: false, error: 'Failed to initiate Google sign-in' };
      }

      devLog('[Auth] Opening OAuth URL in browser...');
      
      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      devLog('[Auth] Browser session result:', result.type);

      if (result.type === 'success') {
        // Extract tokens from URL and create session
        const { url } = result;
        const params = new URL(url).searchParams;
        
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          // Set the session manually
          const { data: sessionData, error: sessionError } = await authService.setSession(
            access_token,
            refresh_token
          );

          if (sessionError) {
            devError('[Auth] Failed to set session:', sessionError.message);
            setIsLoading(false);
            return { success: false, error: sessionError.message };
          }

          devLog('[Auth] Google OAuth successful');
          // The onAuthStateChange will handle loading the profile
          return { success: true };
        }
      } else if (result.type === 'cancel') {
        devLog('[Auth] User cancelled OAuth');
        setIsLoading(false);
        return { success: false, error: 'Sign-in cancelled' };
      }

      setIsLoading(false);
      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      devError('[Auth] Google OAuth exception:', error.message);
      setIsLoading(false);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  async function register(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      setIsLoading(true);

      const { data, error } = await authService.signUp(email, password, { name });

      if (error) {
        devError('[Auth] Registration error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Profile will be created automatically via loadUserProfile
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      devError('[Auth] Registration exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }

  async function login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      setIsLoading(true);

      const { data, error } = await authService.signInWithPassword(email, password);

      if (error) {
        devError('[Auth] Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        await writeSessionId(data.session.user.id);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      devError('[Auth] Login exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }

  async function writeSessionId(userId: string): Promise<void> {
    try {
      const sessionId = generateUUID();
      await SecureStore.setItemAsync(SESSION_ID_KEY, sessionId);
      await supabase
        .from('profiles')
        .update({ active_session_id: sessionId })
        .eq('id', userId);
      devLog('[Auth] Session ID written:', sessionId);
    } catch (err: any) {
      devError('[Auth] Failed to write session ID:', err.message);
    }
  }

  async function logout() {
    try {
      devLog('[Auth] Logging out...');
      setIsLoading(true);

      // Clear session ID from SecureStore and profiles row
      if (user) {
        try {
          await SecureStore.deleteItemAsync(SESSION_ID_KEY);
          await supabase
            .from('profiles')
            .update({ active_session_id: null })
            .eq('id', user.id);
        } catch (err: any) {
          devError('[Auth] Failed to clear session ID on logout:', err.message);
        }
      }

      const { error } = await authService.signOut();

      if (error) {
        devError('[Auth] Logout error:', error);
        throw error;
      }

      devLog('[Auth] Logout successful');
      setUser(null);
      setSession(null);
    } catch (error) {
      devError('[Auth] Logout exception:', error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUser(
    updates: Partial<User>
  ): Promise<{ success: boolean; error?: string }> {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const profileUpdates: any = {};
      
      if (updates.name !== undefined) profileUpdates.full_name = updates.name;
      if (updates.grade !== undefined) profileUpdates.grade = updates.grade;
      if (updates.school !== undefined) profileUpdates.school = updates.school;
      if (updates.avatar !== undefined) profileUpdates.avatar_url = updates.avatar;

      const { error } = await authService.updateProfile(user.id, profileUpdates);

      if (error) {
        devError('[Auth] Update profile error:', error);
        return { success: false, error: error.message };
      }

      // Update local user state with the changes
      const updatedUser = { ...user };
      if (updates.name !== undefined) updatedUser.name = updates.name;
      if (updates.grade !== undefined) updatedUser.grade = updates.grade;
      if (updates.school !== undefined) updatedUser.school = updates.school;
      if (updates.avatar !== undefined) updatedUser.avatar = updates.avatar;
      
      setUser(updatedUser);
      devLog('[Auth] Profile updated successfully:', updatedUser);
      return { success: true };
    } catch (error: any) {
      devError('[Auth] Update profile exception:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  }

  async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await authService.resetPasswordForEmail(
        email,
        'edodwaja://reset-password'
      );

      if (error) {
        devError('[Auth] Password reset error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      devError('[Auth] Password reset exception:', error);
      return { success: false, error: error.message || 'Failed to send reset email' };
    }
  }

  async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      devLog('[Auth] Sending OTP to phone:', phone);
      setIsLoading(true);

      const { error } = await authService.sendOtp(phone);

      if (error) {
        devError('[Auth] Send OTP error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      devLog('[Auth] OTP sent successfully');
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      devError('[Auth] Send OTP exception:', error);
      setIsLoading(false);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  }

  async function verifyOtp(phone: string, token: string): Promise<{ success: boolean; error?: string }> {
    try {
      devLog('[Auth] Verifying OTP for phone:', phone);
      setIsLoading(true);

      const { data, error } = await authService.verifyOtp(phone, token);

      if (error) {
        devError('[Auth] Verify OTP error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.session) {
        devLog('[Auth] OTP verification successful');
        // The onAuthStateChange will handle loading/creating the profile
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Verification failed' };
    } catch (error: any) {
      devError('[Auth] Verify OTP exception:', error);
      setIsLoading(false);
      return { success: false, error: error.message || 'Failed to verify OTP' };
    }
  }

  function clearSessionInvalidated() {
    setSessionInvalidated(false);
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    sessionInvalidated,
    clearSessionInvalidated,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    resetPassword,
    sendOtp,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
