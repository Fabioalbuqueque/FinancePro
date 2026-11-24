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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { formatCurrency, parseBrlToCents } from '../../src/utils/format';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { notificationService } from '../../src/services/notifications';

export default function AccountsScreen() {
  const router = useRouter();
  const [personalAccounts, setPersonalAccounts] = useState<any[]>([]);
  const [familyAccounts, setFamilyAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal nova conta
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [initialBalance, setInitialBalance] = useState('');
  const [ownerType, setOwnerType] = useState<'user' | 'family'>('user');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

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

      // Agendar notificação de relatório mensal
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

  const renderAccountCard = (acc: any) => (
    <View key={acc._id} style={[styles.accCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={
              acc.type === 'checking'
                ? 'card-outline'
                : acc.type === 'savings'
                ? 'shield-checkmark-outline'
                : acc.type === 'cash'
                ? 'cash-outline'
                : 'phone-portrait-outline'
            }
            size={22}
            color={theme.primary}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.accName, { color: theme.text }]}>{acc.name}</Text>
          <Text style={[styles.accType, { color: theme.textMuted }]}>
            {acc.type === 'checking'
              ? 'Conta Corrente'
              : acc.type === 'savings'
              ? 'Poupança'
              : acc.type === 'cash'
              ? 'Dinheiro em Espécie'
              : 'Carteira Digital'}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.balanceLabel, { color: theme.textMuted }]}>Saldo Inicial</Text>
        <Text style={[styles.balanceVal, { color: theme.text }]}>
          {formatCurrency(acc.initialBalanceCents)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Contas Individuais
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              setOwnerType('user');
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Nova Conta</Text>
          </TouchableOpacity>
        </View>

        {personalAccounts.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Nenhuma conta individual cadastrada.
          </Text>
        ) : (
          personalAccounts.map(renderAccountCard)
        )}

        <View style={[styles.sectionRow, { marginTop: 28 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Contas Compartilhadas (Família)
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#3B82F6' }]}
            onPress={() => {
              setOwnerType('family');
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Conta Familiar</Text>
          </TouchableOpacity>
        </View>

        {familyAccounts.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Nenhuma conta compartilhada encontrada.
          </Text>
        ) : (
          familyAccounts.map(renderAccountCard)
        )}
      </ScrollView>

      {/* Modal Nova Conta */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {ownerType === 'family' ? 'Nova Conta Familiar' : 'Nova Conta Individual'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Nome da Conta</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: Nubank, Itaú, Carteira"
              value={name}
              onChangeText={setName}
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
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Criar Conta</Text>
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
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  accCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accName: { fontSize: 16, fontWeight: '600' },
  accType: { fontSize: 13, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  balanceLabel: { fontSize: 13 },
  balanceVal: { fontSize: 15, fontWeight: '700' },
  emptyText: { fontSize: 14, fontStyle: 'italic', marginBottom: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
