import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { Platform } from 'react-native';

export default function TabLayout() {
  const theme = useThemeColors();

  // Ajuste de altura da tab bar para iOS (notch)
  const tabBarHeight = Platform.OS === 'ios' ? 85 : 60;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.card },
        headerTitleStyle: { fontWeight: '700', color: theme.text, fontSize: 17 },
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          borderTopWidth: Platform.OS === 'ios' ? 0 : 1,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerTitle: 'FinancePro',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          headerTitle: 'Movimentações',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Contas',
          headerTitle: 'Minhas Contas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Família',
          headerTitle: 'Gestão Familiar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: 'Meu Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
