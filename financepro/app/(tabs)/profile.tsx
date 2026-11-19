import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/stores/auth';
import { colors, getThemeColors } from '../../src/theme/colors';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme: resolvedTheme, setTheme, themeMode } = useTheme();
  const theme = getThemeColors(resolvedTheme);
  const [selectedThemeMode, setSelectedThemeMode] = useState(themeMode);

  const handleThemeChange = async (mode: 'light' | 'dark' | 'system') => {
    await setTheme(mode);
    setSelectedThemeMode(mode);
  };

  // Navegar para telas secundárias
  const navigateTo = (screen: string) => {
    router.push(`/${screen}`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Cabeçalho do Perfil */}
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {user?.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>
          {user?.name || 'Usuário FinancePro'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.textMuted }]}>
          {user?.email}
        </Text>
      </View>

      {/* Recursos Financeiros */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          RECURSOS FINANCEIROS
        </Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('reports')}>
          <View style={[styles.menuIcon, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="bar-chart-outline" size={20} color={theme.primary} />
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              Relatórios
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>
              Visão mensal dos gastos
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('goals')}>
          <View style={[styles.menuIcon, { backgroundColor: '#F59E0B20' }]}>
            <Ionicons name="flag-outline" size={20} color="#F59E0B" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              Metas Financeiras
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>
              Objetivos de economia
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('budget')}>
          <View style={[styles.menuIcon, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="wallet-outline" size={20} color="#3B82F6" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              Orçamento
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>
              Controle de gastos mensais
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Preferências e Configurações */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          PREFERÊNCIAS
        </Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon-outline" size={20} color={theme.text} />
            <Text style={[styles.rowText, { color: theme.text }]}>Tema</Text>
          </View>
          <TouchableOpacity
            style={[styles.themeSelector, { backgroundColor: selectedThemeMode === 'dark' ? '#1E293B' : '#FFFFFF' }]}
            onPress={() => handleThemeChange(selectedThemeMode === 'light' ? 'dark' : 'light')}
          >
            <Ionicons
              name={selectedThemeMode === 'dark' ? 'moon' : 'sunny'}
              size={20}
              color={selectedThemeMode === 'dark' ? '#F8FAFC' : '#0F172A'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="cash-outline" size={20} color={theme.text} />
            <Text style={[styles.rowText, { color: theme.text }]}>Moeda Padrão</Text>
          </View>
          <Text style={[styles.rowValue, { color: theme.textMuted }]}>
            Real Brasileiro (BRL)
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="language-outline" size={20} color={theme.text} />
            <Text style={[styles.rowText, { color: theme.text }]}>Idioma</Text>
          </View>
          <Text style={[styles.rowValue, { color: theme.textMuted }]}>
            Português (Brasil)
          </Text>
        </View>
      </View>

      {/* Segurança e Sobre */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          SISTEMA
        </Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="information-circle-outline" size={20} color={theme.text} />
            <Text style={[styles.rowText, { color: theme.text }]}>Versão do App</Text>
          </View>
          <Text style={[styles.rowValue, { color: theme.textMuted }]}>1.0.0 (MVP)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.text} />
            <Text style={[styles.rowText, { color: theme.text }]}>Segurança</Text>
          </View>
          <Text style={[styles.rowValue, { color: theme.primary }]}>
            Firebase Autenticado
          </Text>
        </View>
      </View>

      {/* Botão de Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Encerrar Sessão</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: { fontSize: 28, fontWeight: '700', color: '#166534' },
  userName: { fontSize: 20, fontWeight: '700' },
  userEmail: { fontSize: 14, marginTop: 4 },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeSelector: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    height: 50,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
