import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../src/theme/useThemeColors';

interface MenuItem {
  key: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function HamburgerMenu() {
  const router = useRouter();
  const theme = useThemeColors();
  const [visible, setVisible] = useState(false);

  const menuItems: MenuItem[] = [
    {
      key: 'reports',
      title: 'Relatórios',
      subtitle: 'Visão mensal dos gastos',
      icon: 'bar-chart-outline',
      color: theme.primary,
    },
    {
      key: 'goals',
      title: 'Metas Financeiras',
      subtitle: 'Objetivos de economia',
      icon: 'flag-outline',
      color: '#F59E0B',
    },
    {
      key: 'budget',
      title: 'Orçamento',
      subtitle: 'Controle de gastos mensais',
      icon: 'wallet-outline',
      color: '#3B82F6',
    },
  ];

  const handleNavigate = (key: string) => {
    setVisible(false);
    router.push(`/(tabs)/${key}`);
  };

  return (
    <>
      {/* Botão do Menu */}
      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="menu" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Modal do Menu */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.menuPanel, { backgroundColor: theme.card }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>
                FinancePro
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>
              Acesso rápido aos recursos
            </Text>

            {/* Itens do Menu */}
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, { backgroundColor: theme.background }]}
                onPress={() => handleNavigate(item.key)}
              >
                <View style={[styles.itemIcon, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={[styles.itemSubtitle, { color: theme.textMuted }]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuPanel: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  menuSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 14,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
