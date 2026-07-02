import { Redirect, useSegments, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, View, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContextSupabase';
import { useColors } from '@/hooks/useColors';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, sessionInvalidated, clearSessionInvalidated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (sessionInvalidated) {
      clearSessionInvalidated();
      // Navigate first, then show alert so the screen is visible behind the dialog
      router.replace('/(auth)/login');
      Alert.alert(
        'Signed Out',
        'Your account was signed in on another device. You have been signed out.',
        [{ text: 'OK' }]
      );
    }
  }, [sessionInvalidated]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoading) {
      if (!isAuthenticated && !inAuthGroup) {
        console.log('[ProtectedRoute] Redirecting to login - not authenticated');
      } else if (isAuthenticated && inAuthGroup) {
        console.log('[ProtectedRoute] Redirecting to home - already authenticated');
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';

  // If not authenticated and not in auth group, redirect to login
  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated and in auth group, redirect to home
  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
