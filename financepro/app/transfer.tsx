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
import { api } from '../src/services/api';
import { formatCurrency, parseBrlToCents } from '../src/utils/format';
import { useThemeColors } from '../src/theme/useThemeColors';

export default function TransferScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de transferência
  const [modalVisible, setModalVisible] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

  const loadAccounts = useCallback(async () => {
    try {
      const res = await api.getAccounts();
      const allAccounts = [...(res.personal || []), ...(res.family || [])];
      setAccounts(allAccounts);

      // Selecionar as duas primeiras contas por padrão
      if (allAccounts.length >= 2) {
        setFromAccount(allAccounts[0]._id);
        setToAccount(allAccounts[1]._id);
      }
    } catch (err) {
      console.log('Erro ao carregar contas', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amountInput) {
      Alert.alert('Atenção', 'Selecione as contas e informe o valor.');
      return;
    }

    if (fromAccount === toAccount) {
      Alert.alert('Atenção', 'A conta de origem e destino devem ser diferentes.');
      return;
    }

    const amountCents = parseBrlToCents(amountInput);
    if (amountCents <= 0) {
      Alert.alert('Atenção', 'Informe um valor maior que zero.');
      return;
    }

    try {
      setSaving(true);
      await api.createTransfer({
        fromAccountId: fromAccount,
        toAccountId: toAccount,
        amountCents,
        description: description || undefined,
        date: new Date().toISOString(),
      });

      setModalVisible(false);
      setAmountInput('');
      setDescription('');
      Alert.alert('Sucesso', 'Transferência realizada com sucesso!');
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao realizar transferência.');
    } finally {
      setSaving(false);
    }
  };

  const getAccountName = (id: string) => {
    const account = accounts.find((a) => a._id === id);
    return account?.name || 'Conta';
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Seleção de Contas */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Transferir entre contas
        </Text>

        {/* Conta de Origem */}
        <TouchableOpacity
          style={[styles.accountCard, { backgroundColor: theme.card }]}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.accountInfo}>
            <Ionicons name="arrow-up" size={24} color={theme.expense} />
            <View>
              <Text style={[styles.accountLabel, { color: theme.textMuted }]}>
                De (Origem)
              </Text>
              <Text style={[styles.accountName, { color: theme.text }]}>
                {getAccountName(fromAccount)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Conta de Destino */}
        <TouchableOpacity
          style={[styles.accountCard, { backgroundColor: theme.card }]}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.accountInfo}>
            <Ionicons name="arrow-down" size={24} color={theme.income} />
            <View>
              <Text style={[styles.accountLabel, { color: theme.textMuted }]}>
                Para (Destino)
              </Text>
              <Text style={[styles.accountName, { color: theme.text }]}>
                {getAccountName(toAccount)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Valor */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>Valor (R$)</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Ex: 500,00"
          keyboardType="numeric"
          value={amountInput}
          onChangeText={setAmountInput}
        />

        {/* Descrição (opcional) */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Descrição (opcional)
        </Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Ex: Transferência para reserva"
          value={description}
          onChangeText={setDescription}
        />

        {/* Botão Transferir */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          onPress={handleTransfer}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.submitContent}>
              <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
              <Text style={styles.submitText}>Transferir Agora</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Informações */}
        <View style={[styles.infoCard, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
          <Text style={styles.infoText}>
            Transferências são atômicas: saem da conta de origem e entram na
            destino simultaneamente. Se uma falhar, a outra também.
          </Text>
        </View>
      </ScrollView>

      {/* Modal de Seleção de Conta */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Selecionar Conta
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {accounts.map((account) => (
              <TouchableOpacity
                key={account._id}
                style={styles.accountOption}
                onPress={() => {
                  if (fromAccount === account._id) {
                    setToAccount(account._id);
                  } else {
                    setFromAccount(account._id);
                  }
                  setModalVisible(false);
                }}
              >
                <View style={styles.optionInfo}>
                  <View style={styles.optionIcon}>
                    <Ionicons
                      name={
                        account.type === 'checking'
                          ? 'card-outline'
                          : account.type === 'savings'
                          ? 'shield-checkmark-outline'
                          : 'cash-outline'
                      }
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.optionName, { color: theme.text }]}>
                    {account.name}
                  </Text>
                </View>
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  submitBtn: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  accountOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionName: {
    fontSize: 15,
    fontWeight: '500',
  },
});
