import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { formatCurrency, parseBrlToCents } from '../../src/utils/format';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { notificationService } from '../../src/services/notifications';

type AccountType = 'checking' | 'savings' | 'cash' | 'digital';

const ACCOUNT_STYLE: Record<
  AccountType,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  checking: {
    label: 'Conta Corrente',
    icon: 'card-outline',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  savings: {
    label: 'Poupança',
    icon: 'shield-checkmark-outline',
    color: '#10B981',
    bg: '#DCFCE7',
  },
  cash: {
    label: 'Dinheiro em Espécie',
    icon: 'cash-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  digital: {
    label: 'Carteira Digital',
    icon: 'phone-portrait-outline',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
};

export default function AccountsScreen() {
  const router = useRouter();
  const [familyAccounts, setFamilyAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal nova/editar conta
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initialBalance, setInitialBalance] = useState('');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

  // Animação de entrada dos cards
  const enterAnim = useState(() => new Animated.Value(0))[0];

  const loadAccounts = useCallback(async () => {
    try {
      const res = await api.getAccounts();
      setFamilyAccounts(res.family || []);
    } catch (err) {
      console.log('Erro ao carregar contas', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enterAnim, familyAccounts.length]);

  const totalBalance = familyAccounts.reduce(
    (sum, acc) => sum + (acc.initialBalanceCents || 0),
    0
  );

  const handleCreateAccount = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Informe o nome da conta.');
      return;
    }

    const initialBalanceCents = parseBrlToCents(initialBalance);

    try {
      setSaving(true);

      if (editingId) {
        await api.updateAccount(editingId, {
          name: name.trim(),
          type,
          initialBalanceCents,
        });
      } else {
        await api.createAccount({
          name: name.trim(),
          type,
          initialBalanceCents,
          ownerType: 'family',
        });

        const perm = await notificationService.requestPermission();
        if (perm) {
          await notificationService.scheduleMonthlyReport();
        }
      }

      setModalVisible(false);
      setName('');
      setInitialBalance('');
      setEditingId(null);
      loadAccounts();
      Alert.alert(
        'Sucesso',
        editingId
          ? 'Conta atualizada com sucesso!'
          : 'Conta familiar cadastrada com sucesso!'
      );
    } catch (err: any) {
      console.error('Erro ao salvar conta:', err);
      const errorMessage = err.message || 'Falha ao salvar conta.';
      if (errorMessage.includes('família') || errorMessage.includes('família ativa')) {
        Alert.alert(
          'Nenhuma família ativa',
          'Para criar uma conta familiar, você precisa primeiro criar um grupo familiar.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Ir para Família',
              onPress: () => router.push('/(tabs)/family'),
            },
          ]
        );
      } else {
        Alert.alert('Erro', errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = (acc: any) => {
    Alert.alert(
      'Excluir conta',
      `Deseja realmente excluir "${acc.name}"?\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAccount(acc._id);
              Alert.alert('Sucesso', 'Conta excluída com sucesso.');
              loadAccounts();
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Falha ao excluir conta.');
            }
          },
        },
      ]
    );
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setInitialBalance('');
    setType('checking');
    setModalVisible(true);
  };

  const openEditModal = (acc: any) => {
    setEditingId(acc._id);
    setName(acc.name || '');
    setInitialBalance(
      acc.initialBalanceCents
        ? (acc.initialBalanceCents / 100).toFixed(2).replace('.', ',')
        : ''
    );
    setType(acc.type || 'checking');
    setModalVisible(true);
  };

  const renderAccountCard = (acc: any) => {
    const accStyle =
      ACCOUNT_STYLE[(acc.type as AccountType) || 'checking'] || ACCOUNT_STYLE.checking;
    const isPositive = (acc.initialBalanceCents || 0) >= 0;
    return (
      <Animated.View
        key={acc._id}
        style={[
          styles.accCard,
          {
            backgroundColor: theme.card,
            opacity: enterAnim,
            transform: [
              {
                translateY: enterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: accStyle.bg }]}>
            <Ionicons name={accStyle.icon} size={22} color={accStyle.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.accName, { color: theme.text }]}>{acc.name}</Text>
            <Text style={[styles.accType, { color: theme.textMuted }]}>
              {accStyle.label}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#F1F5F9' }]}
              onPress={() => openEditModal(acc)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={16} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
              onPress={() => handleDeleteAccount(acc)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
          <View>
            <Text style={[styles.balanceLabel, { color: theme.textMuted }]}>Saldo</Text>
            <Text
              style={[
                styles.balanceVal,
                { color: isPositive ? theme.income : theme.expense },
              ]}
            >
              {formatCurrency(acc.initialBalanceCents)}
            </Text>
          </View>
          <View style={styles.balanceChip}>
            <Ionicons
              name="wallet-outline"
              size={14}
              color={isPositive ? theme.income : theme.expense}
            />
            <Text style={[styles.balanceChipText, { color: theme.textMuted }]}>Inicial</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => {
    return (
      <TouchableOpacity
        style={[
          styles.emptyCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={openCreateModal}
        activeOpacity={0.7}
      >
        <View style={[styles.emptyIcon, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="people-outline" size={24} color="#3B82F6" />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          Crie uma conta compartilhada
        </Text>
        <Text style={[styles.emptySub, { color: theme.textMuted }]}>
          A conta fica visível para todos os participantes do grupo familiar.
        </Text>
        <View style={[styles.emptyCta, { backgroundColor: '#3B82F6' }]}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.emptyCtaText}>Nova Conta Familiar</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card de Resumo — Saldo Total */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <View style={styles.summaryTop}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
              Saldo Familiar
            </Text>
            <View style={styles.summaryBadge}>
              <Ionicons name="pie-chart-outline" size={14} color="#3B82F6" />
              <Text style={[styles.summaryBadgeText, { color: '#3B82F6' }]}>
                {familyAccounts.length} {familyAccounts.length === 1 ? 'conta' : 'contas'}
              </Text>
            </View>
          </View>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {formatCurrency(totalBalance)}
          </Text>
          <Text style={[styles.summarySub, { color: theme.textMuted }]}>
            Somado de todas as contas compartilhadas
          </Text>
        </View>

        {/* Seção Familiar */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleWrap}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Contas Compartilhadas
            </Text>
            <View style={styles.sectionDotRow}>
              <View style={[styles.sectionDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[styles.sectionCount, { color: theme.textMuted }]}>
                {familyAccounts.length}
              </Text>
            </View>
          </View>
        </View>

        {familyAccounts.length === 0 ? (
          renderEmptyState()
        ) : (
          familyAccounts.map((acc) => renderAccountCard(acc))
        )}
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#3B82F6' }]}
        onPress={openCreateModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal Nova/Editar Conta */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {editingId
                    ? 'Editar Conta Familiar'
                    : 'Nova Conta Familiar'}
                </Text>
                {!editingId && (
                  <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                    Compartilhada com seu grupo familiar
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Tipo de Conta</Text>
            <View style={styles.typeGrid}>
              {(Object.keys(ACCOUNT_STYLE) as AccountType[]).map((t) => {
                const s = ACCOUNT_STYLE[t];
                const selected = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeCell,
                      {
                        backgroundColor: selected ? s.bg : theme.background,
                        borderColor: selected ? s.color : theme.border,
                      },
                    ]}
                    onPress={() => setType(t)}
                  >
                    <View
                      style={[
                        styles.typeCellIcon,
                        { backgroundColor: selected ? s.color : theme.border },
                      ]}
                    >
                      <Ionicons
                        name={s.icon}
                        size={18}
                        color={selected ? '#FFFFFF' : theme.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeCellLabel,
                        { color: selected ? s.color : theme.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {s.label}
                    </Text>
                    {selected && (
                      <View style={[styles.typeCheck, { backgroundColor: s.color }]}>
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Nome da Conta</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: Reserva Familiar, Conta Conjunta"
              value={name}
              onChangeText={setName}
              maxLength={40}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Saldo Inicial (R$)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="0,00"
              keyboardType="numeric"
              value={initialBalance}
              onChangeText={setInitialBalance}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#3B82F6' }]}
              onPress={handleCreateAccount}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={editingId ? 'checkmark-circle-outline' : 'add-circle-outline'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.submitBtnText}>
                    {editingId ? 'Salvar Alterações' : 'Criar Conta'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  summaryCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  summaryBadgeText: { fontSize: 12, fontWeight: '700' },
  summaryValue: {
    fontSize: 34,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  summarySub: { fontSize: 12, marginTop: 2 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  sectionDotRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionDot: { width: 7, height: 7, borderRadius: 4 },
  sectionCount: { fontSize: 12, fontWeight: '700' },

  accCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  accType: { fontSize: 12, marginTop: 2 },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
  },
  balanceLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceVal: { fontSize: 20, fontWeight: '800', marginTop: 2, letterSpacing: -0.3 },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  balanceChipText: { fontSize: 11, fontWeight: '600' },

  emptyCard: {
    borderRadius: 16,
    padding: 20,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
    maxWidth: 200,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    maxWidth: 220,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyCtaText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  modalSubtitle: { fontSize: 12, marginTop: 3 },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeCell: {
    width: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    position: 'relative',
  },
  typeCellIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCellLabel: { fontSize: 12, fontWeight: '700', flex: 1 },
  typeCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
