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
  const [personalAccounts, setPersonalAccounts] = useState<any[]>([]);
  const [familyAccounts, setFamilyAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal nova conta
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initialBalance, setInitialBalance] = useState('');
  const [ownerType, setOwnerType] = useState<'user' | 'family'>('user');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

  // Animação de entrada dos cards
  const enterAnim = useState(() => new Animated.Value(0))[0];

  const loadAccounts = useCallback(async () => {
    try {
      const res = await api.getAccounts();
      setPersonalAccounts(res.personal || []);
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
  }, [enterAnim, personalAccounts.length, familyAccounts.length]);

  const totalBalance = [...personalAccounts, ...familyAccounts].reduce(
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
      await api.createAccount({
        name: name.trim(),
        type,
        initialBalanceCents,
        ownerType,
      });

      const perm = await notificationService.requestPermission();
      if (perm) {
        await notificationService.scheduleMonthlyReport();
        Alert.alert(
          'Sucesso',
          ownerType === 'family'
            ? 'Conta familiar cadastrada! Lembrete de relatório mensal agendado.'
            : 'Conta cadastrada! Lembrete de relatório mensal agendado.'
        );
      } else {
        Alert.alert(
          'Sucesso',
          ownerType === 'family'
            ? 'Conta familiar cadastrada com sucesso!'
            : 'Conta cadastrada com sucesso!'
        );
      }

      setModalVisible(false);
      setName('');
      setInitialBalance('');
      loadAccounts();
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      const errorMessage = err.message || 'Falha ao cadastrar conta.';
      if (ownerType === 'family' && errorMessage.includes('família')) {
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

  const openModal = (owner: 'user' | 'family') => {
    setOwnerType(owner);
    setType('checking');
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
          <View style={[styles.typeBadge, { backgroundColor: accStyle.bg }]}>
            <Ionicons
              name={acc.type === 'savings' ? 'trending-up-outline' : 'wallet-outline'}
              size={12}
              color={accStyle.color}
            />
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

  const renderEmptyState = (owner: 'user' | 'family') => {
    const isFamily = owner === 'family';
    return (
      <TouchableOpacity
        style={[
          styles.emptyCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={() => openModal(owner)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.emptyIcon,
            { backgroundColor: isFamily ? '#DBEAFE' : '#DCFCE7' },
          ]}
        >
          <Ionicons
            name={isFamily ? 'people-outline' : 'add-circle-outline'}
            size={24}
            color={isFamily ? '#3B82F6' : theme.primary}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]} numberOfLines={1}>
          {isFamily ? 'Crie uma conta compartilhada' : 'Adicione sua primeira conta'}
        </Text>
        <Text style={[styles.emptySub, { color: theme.textMuted }]}>
          {isFamily
            ? 'A conta fica visível para todos os participantes do grupo familiar.'
            : 'Contas como carteira, banco ou dinheiro em espécie.'}
        </Text>
        <View
          style={[styles.emptyCta, { backgroundColor: isFamily ? '#3B82F6' : theme.primary }]}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.emptyCtaText}>
            {isFamily ? 'Nova Conta Familiar' : 'Nova Conta'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const totalAccounts = personalAccounts.length + familyAccounts.length;

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
              Saldo Total
            </Text>
            <View style={styles.summaryBadge}>
              <Ionicons name="pie-chart-outline" size={14} color={theme.primary} />
              <Text style={[styles.summaryBadgeText, { color: theme.primary }]}>
                {totalAccounts} {totalAccounts === 1 ? 'conta' : 'contas'}
              </Text>
            </View>
          </View>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {formatCurrency(totalBalance)}
          </Text>
          <Text style={[styles.summarySub, { color: theme.textMuted }]}>
            Somado de todas as suas contas
          </Text>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryMetric}>
              <Ionicons name="person-outline" size={16} color={theme.primary} />
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {personalAccounts.length}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                Individuais
              </Text>
            </View>
            <View style={[styles.summaryDividerV, { backgroundColor: theme.border }]} />
            <View style={styles.summaryMetric}>
              <Ionicons name="people-outline" size={16} color="#3B82F6" />
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {familyAccounts.length}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                Familiares
              </Text>
            </View>
          </View>
        </View>

        {/* Seção Individual */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleWrap}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Minhas Contas
            </Text>
            <View style={styles.sectionDotRow}>
              <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.sectionCount, { color: theme.textMuted }]}>
                {personalAccounts.length}
              </Text>
            </View>
          </View>
        </View>

        {personalAccounts.length === 0 ? (
          renderEmptyState('user')
        ) : (
          personalAccounts.map(renderAccountCard)
        )}

        {/* Seção Familiar */}
        <View style={[styles.sectionRow, { marginTop: 24 }]}>
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
          renderEmptyState('family')
        ) : (
          familyAccounts.map(renderAccountCard)
        )}
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => openModal('user')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal Nova Conta */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {ownerType === 'family' ? 'Nova Conta Familiar' : 'Nova Conta Individual'}
                </Text>
                {ownerType === 'family' && (
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
              placeholder="Ex: Nubank, Itaú, Carteira"
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
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleCreateAccount}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Criar Conta</Text>
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
    backgroundColor: '#F0FDF4',
  },
  summaryBadgeText: { fontSize: 12, fontWeight: '700' },
  summaryValue: {
    fontSize: 34,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  summarySub: { fontSize: 12, marginTop: 2 },
  summaryDivider: {
    height: 1,
    marginTop: 16,
    marginBottom: 14,
  },
  summaryRow: { flexDirection: 'row' },
  summaryMetric: { flex: 1, alignItems: 'center', gap: 2 },
  metricValue: { fontSize: 18, fontWeight: '800' },
  metricLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryDividerV: {
    width: 1,
    marginHorizontal: 12,
    alignSelf: 'stretch',
  },

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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    shadowColor: '#059669',
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
    shadowColor: '#059669',
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
