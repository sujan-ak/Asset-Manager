import { Redirect, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContextSupabase';
import { useColors } from '@/hooks/useColors';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const colors = useColors();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoading) {
      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to login if not authenticated and trying to access protected route
        console.log('[ProtectedRoute] Redirecting to login - not authenticated');
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to home if authenticated and trying to access auth screens
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
