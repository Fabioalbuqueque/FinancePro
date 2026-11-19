import React from 'react';
import { Tabs, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/theme/useThemeColors';

export default function TabLayout() {
  const theme = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.card },
        headerTitleStyle: { fontWeight: '700', color: theme.text },
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
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
      {/* Telas secundárias - acessíveis pela tela de Perfil */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatórios',
          headerTitle: 'Relatórios Mensais',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Metas',
          headerTitle: 'Metas Financeiras',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Orçamento',
          headerTitle: 'Orçamento Mensal',
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
