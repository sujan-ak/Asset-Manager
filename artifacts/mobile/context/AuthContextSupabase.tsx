import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase, Profile } from '@/lib/supabase';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  grade?: string;
  school?: string;
  role: 'student' | 'admin';
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth] State changed:', _event);
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
      console.log('[Auth] Deep link received:', url);
      
      // Supabase will automatically handle the OAuth callback
      // The onAuthStateChange listener will fire when complete
    };

    // Subscribe to deep link events
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  async function loadUserProfile(supabaseUser: SupabaseUser) {
    console.log('[Auth] Loading profile for user:', supabaseUser.id);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('[Auth] Failed to load profile:', error.message, error.code);
        setIsLoading(false);
        return;
      }

      if (!profile) {
        console.log('[Auth] Profile not found, creating new profile...');
        await createUserProfile(supabaseUser);
        return;
      }

      console.log('[Auth] Profile loaded successfully');
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
    } catch (error: any) {
      console.error('[Auth] Error loading profile:', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function createUserProfile(supabaseUser: SupabaseUser) {
    console.log('[Auth] Creating profile for user:', supabaseUser.id);
    try {
      const profileData = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        full_name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
        role: 'student' as const,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (error) {
        console.error('[Auth] Profile creation failed:', error.message, error.code);
        setIsLoading(false);
        return;
      }

      if (data) {
        console.log('[Auth] Profile created successfully');
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
      console.error('[Auth] Error creating profile:', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[Auth] Starting Google OAuth flow...');
      setIsLoading(true);

      // Create redirect URL for OAuth callback
      const redirectTo = Linking.createURL('/auth/callback');
      console.log('[Auth] OAuth redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          skipBrowserRedirect: true, // We'll handle the browser opening
        },
      });

      if (error) {
        console.error('[Auth] Google OAuth error:', error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (!data?.url) {
        console.error('[Auth] No OAuth URL returned');
        setIsLoading(false);
        return { success: false, error: 'Failed to initiate Google sign-in' };
      }

      console.log('[Auth] Opening OAuth URL in browser...');
      
      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      console.log('[Auth] Browser session result:', result.type);

      if (result.type === 'success') {
        // Extract tokens from URL and create session
        const { url } = result;
        const params = new URL(url).searchParams;
        
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          // Set the session manually
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) {
            console.error('[Auth] Failed to set session:', sessionError.message);
            setIsLoading(false);
            return { success: false, error: sessionError.message };
          }

          console.log('[Auth] Google OAuth successful');
          // The onAuthStateChange will handle loading the profile
          return { success: true };
        }
      } else if (result.type === 'cancel') {
        console.log('[Auth] User cancelled OAuth');
        setIsLoading(false);
        return { success: false, error: 'Sign-in cancelled' };
      }

      setIsLoading(false);
      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      console.error('[Auth] Google OAuth exception:', error.message);
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error('[Auth] Registration error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Profile will be created automatically via loadUserProfile
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('[Auth] Registration exception:', error);
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('[Auth] Login exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[Auth] Logout error:', error);
      }

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('[Auth] Logout exception:', error);
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name,
          grade: updates.grade,
          school: updates.school,
          avatar_url: updates.avatar,
        })
        .eq('id', user.id);

      if (error) {
        console.error('[Auth] Update profile error:', error);
        return { success: false, error: error.message };
      }

      setUser({ ...user, ...updates });
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Update profile exception:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  }

  async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'edodwaja://reset-password',
      });

      if (error) {
        console.error('[Auth] Password reset error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Password reset exception:', error);
      return { success: false, error: error.message || 'Failed to send reset email' };
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
