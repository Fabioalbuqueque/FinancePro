import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/stores/auth';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Slot />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
