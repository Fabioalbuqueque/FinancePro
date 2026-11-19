import React from 'react';
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

interface SubMenuItem {
  key: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
}

export function SubMenuHeader({ title }: { title: string }) {
  const router = useRouter();
  const theme = useThemeColors();
  const [visible, setVisible] = React.useState(false);

  const subMenuItems: SubMenuItem[] = [
    {
      key: 'reports',
      title: 'Relatórios',
      subtitle: 'Visão mensal dos gastos',
      icon: 'bar-chart-outline',
      color: theme.primary,
    },
    {
      key: 'goals',
      title: 'Metas',
      subtitle: 'Objetivos de economia',
      icon: 'flag-outline',
      color: '#F59E0B',
    },
    {
      key: 'budget',
      title: 'Orçamento',
      subtitle: 'Controle de gastos',
      icon: 'wallet-outline',
      color: '#3B82F6',
    },
  ];

  const handleNavigate = (key: string) => {
    setVisible(false);
    router.push(`/(tabs)/${key}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* Botão Menu */}
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.background }]}
          onPress={() => setVisible(true)}
        >
          <Ionicons name="menu" size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        </View>

        {/* Placeholder para manter alinhamento */}
        <View style={[styles.menuButton, { backgroundColor: 'transparent' }]} />
      </View>

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
              Navegação rápida
            </Text>

            {/* Itens do Menu */}
            {subMenuItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, { backgroundColor: theme.background }]}
                onPress={() => handleNavigate(item.key)}
              >
                <View style={[styles.itemIcon, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
