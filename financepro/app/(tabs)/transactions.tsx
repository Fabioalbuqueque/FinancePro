import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { formatCurrency, formatDate, parseBrlToCents } from '../../src/utils/format';
import { useThemeColors } from '../../src/theme/useThemeColors';

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');

  // Modal de Nova Transação
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filterType) params.type = filterType;

      const txRes: any = await api.getTransactions(params);
      const accRes: any = await api.getAccounts();
      const catRes: any = await api.getCategories();

      setTransactions(txRes.items || []);
      const allAccs = [...(accRes.personal || []), ...(accRes.family || [])];
      setAccounts(allAccs);
      if (allAccs.length > 0 && !selectedAccount) {
        setSelectedAccount(allAccs[0]._id);
      }
      setCategories(catRes || []);
      if (catRes.length > 0 && !selectedCategory) {
        setSelectedCategory(catRes[0]._id);
      }
    } catch (err) {
      console.log('Erro ao carregar transações', err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTransaction = async () => {
    if (!description.trim()) {
      Alert.alert('Atenção', 'Informe uma descrição para a movimentação.');
      return;
    }

    if (!amountInput.trim()) {
      Alert.alert('Atenção', 'Informe um valor para a movimentação.');
      return;
    }

    if (!selectedAccount) {
      Alert.alert('Atenção', 'Selecione uma conta de destino.');
      return;
    }

    const amountCents = parseBrlToCents(amountInput);
    if (amountCents <= 0) {
      Alert.alert('Atenção', 'Informe um valor maior que zero.');
      return;
    }

    try {
      setSaving(true);
      console.log('Criando transação com dados:', {
        description,
        amountCents,
        type,
        accountId: selectedAccount,
        categoryId: selectedCategory || undefined,
      });
      await api.createTransaction({
        description: description.trim(),
        amountCents,
        type,
        accountId: selectedAccount,
        categoryId: selectedCategory || undefined,
        status: 'paid',
        date: new Date().toISOString(),
      });

      setModalVisible(false);
      setDescription('');
      setAmountInput('');
      loadData();
      Alert.alert('Sucesso', 'Movimentação registrada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao criar transação:', err);
      Alert.alert('Erro', err.message || 'Falha ao registrar movimentação.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Excluir', 'Deseja realmente excluir este lançamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteTransaction(id);
            loadData();
          } catch (err: any) {
            Alert.alert('Atenção', err.message || 'Falha ao excluir lançamento.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Filtros de Tipo */}
      <View style={styles.filterBar}>
        {[
          { label: 'Todas', value: '' },
          { label: 'Receitas', value: 'income' },
          { label: 'Despesas', value: 'expense' },
          { label: 'Transferências', value: 'transfer' },
        ].map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterChip,
              filterType === f.value && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilterType(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filterType === f.value ? '#FFFFFF' : theme.textMuted },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de Transações */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.primary} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        item.type === 'income'
                          ? '#DCFCE7'
                          : item.type === 'expense'
                          ? '#FEE2E2'
                          : '#DBEAFE',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.type === 'income'
                        ? 'arrow-down'
                        : item.type === 'expense'
                        ? 'arrow-up'
                        : 'swap-horizontal'
                    }
                    size={20}
                    color={
                      item.type === 'income'
                        ? theme.income
                        : item.type === 'expense'
                        ? theme.expense
                        : theme.transfer
                    }
                  />
                </View>
                <View>
                  <Text style={[styles.desc, { color: theme.text }]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.sub, { color: theme.textMuted }]}>
                    {item.categoryId?.name || 'Sem Categoria'} • {formatDate(item.date)}
                  </Text>
                  <Text style={[styles.accSub, { color: theme.textMuted }]}>
                    Conta: {item.accountId?.name || 'Geral'} • Por: {item.userId?.name || 'Eu'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text
                  style={[
                    styles.amount,
                    {
                      color:
                        item.type === 'income'
                          ? theme.income
                          : item.type === 'expense'
                          ? theme.expense
                          : theme.transfer,
                    },
                  ]}
                >
                  {item.type === 'expense' ? '- ' : '+ '}
                  {formatCurrency(item.amountCents)}
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item._id)}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: theme.textMuted }}>Nenhum lançamento encontrado.</Text>
            </View>
          }
        />
      )}

      {/* Botão Flutuante para Adicionar */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Botão Flutuante para Transferência */}
      <TouchableOpacity
        style={[styles.fab, styles.fabTransfer, { backgroundColor: theme.transfer }]}
        onPress={() => router.push('/transfer')}
      >
        <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal de Criação de Lançamento */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Nova Movimentação
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Alternador Despesa / Receita */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'expense' && { backgroundColor: theme.expense },
                ]}
                onPress={() => setType('expense')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: type === 'expense' ? '#FFFFFF' : theme.textMuted },
                  ]}
                >
                  Despesa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'income' && { backgroundColor: theme.income },
                ]}
                onPress={() => setType('income')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: type === 'income' ? '#FFFFFF' : theme.textMuted },
                  ]}
                >
                  Receita
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Descrição</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: Aluguel, Supermercado, Salário"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Valor (R$)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: 150,00"
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleCreateTransaction}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Salvar Lançamento</Text>
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
  filterBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: { fontSize: 15, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 2 },
  accSub: { fontSize: 11, marginTop: 1 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  empty: { alignItems: 'center', marginTop: 40 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabTransfer: {
    bottom: 90,
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  typeBtnText: { fontSize: 14, fontWeight: '600' },
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
