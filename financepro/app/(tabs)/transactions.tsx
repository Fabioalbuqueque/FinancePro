import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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
  const [creatingAccount, setCreatingAccount] = useState(false);

  const theme = useThemeColors();

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filterType) params.type = filterType;

      const [txRes, accRes, catRes]: [any, any, any] = await Promise.all([
        api.getTransactions(params),
        api.getAccounts(),
        api.getCategories(),
      ]);

      setTransactions(txRes.items || []);
      const allAccs = [...(accRes.personal || []), ...(accRes.family || [])];
      setAccounts(allAccs);

      // Auto-selecionar conta válida
      if (allAccs.length > 0) {
        setSelectedAccount((prev) =>
          prev && allAccs.some((a) => a._id === prev) ? prev : allAccs[0]._id
        );
      } else {
        setSelectedAccount('');
      }

      const allCats = catRes || [];
      setCategories(allCats);

      // Auto-selecionar primeira categoria compatível com o tipo
      const matchingCats = allCats.filter((c: any) => c.type === type);
      if (matchingCats.length > 0) {
        setSelectedCategory((prev) =>
          prev && matchingCats.some((c: any) => c._id === prev) ? prev : matchingCats[0]._id
        );
      } else {
        setSelectedCategory('');
      }
    } catch (err) {
      console.log('Erro ao carregar dados de transações', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, type]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ao mudar de despesa para receita ou vice-versa, atualiza seleção de categoria
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    const matchingCats = categories.filter((c) => c.type === newType);
    if (matchingCats.length > 0) {
      setSelectedCategory(matchingCats[0]._id);
    } else {
      setSelectedCategory('');
    }
  };

  // Criação rápida de conta dentro do modal para não travar o fluxo
  const handleQuickCreateAccount = async (accountName: string, accountType: string = 'checking') => {
    try {
      setCreatingAccount(true);
      const newAcc = await api.createAccount({
        name: accountName,
        type: accountType,
        initialBalanceCents: 0,
        ownerType: 'user',
      });
      await loadData();
      if (newAcc?._id) {
        setSelectedAccount(newAcc._id);
      }
      Alert.alert('Conta criada', `Conta "${accountName}" criada e selecionada com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao criar conta rápida:', err);
      Alert.alert('Erro', err.message || 'Falha ao criar conta.');
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!description.trim()) {
      Alert.alert('Atenção', 'Informe uma descrição para a movimentação.');
      return;
    }

    if (!amountInput.trim()) {
      Alert.alert('Atenção', 'Informe um valor para a movimentação.');
      return;
    }

    const amountCents = parseBrlToCents(amountInput);
    if (amountCents <= 0) {
      Alert.alert('Atenção', 'Informe um valor maior que zero.');
      return;
    }

    if (!selectedAccount) {
      Alert.alert(
        'Atenção',
        'Você precisa de uma conta ativa para salvar. Crie uma conta rápida clicando no botão abaixo.'
      );
      return;
    }

    try {
      setSaving(true);
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
      await loadData();
      Alert.alert('Sucesso', 'Movimentação registrada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao criar transação:', err);
      Alert.alert('Erro ao Salvar', err.message || 'Falha ao registrar movimentação.');
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
                <View style={{ flex: 1 }}>
                  <Text style={[styles.desc, { color: theme.text }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={[styles.sub, { color: theme.textMuted }]}>
                    {item.categoryId?.name || 'Sem Categoria'} • {formatDate(item.date)}
                  </Text>
                  <Text style={[styles.accSub, { color: theme.textMuted }]}>
                    Conta: {item.accountId?.name || 'Geral'}
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Nova Movimentação
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Alternador Despesa / Receita */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === 'expense' && { backgroundColor: theme.expense },
                  ]}
                  onPress={() => handleTypeChange('expense')}
                >
                  <Ionicons
                    name="arrow-up"
                    size={16}
                    color={type === 'expense' ? '#FFFFFF' : theme.textMuted}
                    style={{ marginRight: 6 }}
                  />
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
                  onPress={() => handleTypeChange('income')}
                >
                  <Ionicons
                    name="arrow-down"
                    size={16}
                    color={type === 'income' ? '#FFFFFF' : theme.textMuted}
                    style={{ marginRight: 6 }}
                  />
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

              {/* Descrição */}
              <Text style={[styles.inputLabel, { color: theme.text }]}>Descrição</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
                ]}
                placeholder={
                  type === 'expense'
                    ? 'Ex: Supermercado, Aluguel, Farmácia'
                    : 'Ex: Salário, Freelance, Rendimentos'
                }
                placeholderTextColor={theme.textMuted}
                value={description}
                onChangeText={setDescription}
              />

              {/* Valor */}
              <Text style={[styles.inputLabel, { color: theme.text }]}>Valor (R$)</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
                ]}
                placeholder="Ex: 150,00"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={amountInput}
                onChangeText={setAmountInput}
              />

              {/* Seletor de Conta */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.inputLabel, { color: theme.text, marginBottom: 0 }]}>
                  Conta
                </Text>
                <TouchableOpacity onPress={() => handleQuickCreateAccount('Nova Conta', 'checking')}>
                  <Text style={[styles.quickAddText, { color: theme.primary }]}>+ Nova conta</Text>
                </TouchableOpacity>
              </View>

              {accounts.length === 0 ? (
                <View style={[styles.noAccountBox, { borderColor: theme.border }]}>
                  <Ionicons name="wallet-outline" size={28} color={theme.primary} />
                  <Text style={[styles.noAccountTitle, { color: theme.text }]}>
                    Nenhuma conta cadastrada
                  </Text>
                  <Text style={[styles.noAccountSub, { color: theme.textMuted }]}>
                    Crie uma conta rápida para poder registrar e vincular suas movimentações:
                  </Text>
                  <View style={styles.quickCreateRow}>
                    <TouchableOpacity
                      style={[styles.quickCreateBtn, { backgroundColor: theme.primary }]}
                      onPress={() => handleQuickCreateAccount('Carteira', 'cash')}
                      disabled={creatingAccount}
                    >
                      {creatingAccount ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.quickCreateBtnText}>+ Criar Carteira</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickCreateBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => handleQuickCreateAccount('Conta Corrente', 'checking')}
                      disabled={creatingAccount}
                    >
                      {creatingAccount ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.quickCreateBtnText}>+ Criar Conta Corrente</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsScroll}
                >
                  {accounts.map((acc) => {
                    const isSelected = selectedAccount === acc._id;
                    return (
                      <TouchableOpacity
                        key={acc._id}
                        style={[
                          styles.accountChip,
                          {
                            borderColor: isSelected ? theme.primary : theme.border,
                            backgroundColor: isSelected ? theme.primary + '18' : theme.background,
                          },
                        ]}
                        onPress={() => setSelectedAccount(acc._id)}
                      >
                        <Ionicons
                          name={acc.type === 'cash' ? 'cash-outline' : 'card-outline'}
                          size={16}
                          color={isSelected ? theme.primary : theme.textMuted}
                        />
                        <View style={{ marginLeft: 6 }}>
                          <Text
                            style={[
                              styles.chipTitle,
                              {
                                color: isSelected ? theme.primary : theme.text,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {acc.name}
                          </Text>
                          <Text style={[styles.chipSubtitle, { color: theme.textMuted }]}>
                            {formatCurrency(acc.balanceCents || acc.initialBalanceCents || 0)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Seletor de Categoria */}
              <Text style={[styles.inputLabel, { color: theme.text, marginTop: 14 }]}>
                Categoria ({type === 'expense' ? 'Despesas' : 'Receitas'})
              </Text>
              {(() => {
                const filteredCats = categories.filter((c) => c.type === type);
                if (filteredCats.length === 0) {
                  return (
                    <Text style={{ color: theme.textMuted, fontSize: 13, marginVertical: 8 }}>
                      Nenhuma categoria de {type === 'expense' ? 'despesa' : 'receita'} disponível.
                    </Text>
                  );
                }
                return (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsScroll}
                  >
                    {filteredCats.map((cat) => {
                      const isSelected = selectedCategory === cat._id;
                      return (
                        <TouchableOpacity
                          key={cat._id}
                          style={[
                            styles.categoryChip,
                            {
                              borderColor: isSelected ? theme.primary : theme.border,
                              backgroundColor: isSelected ? theme.primary : theme.background,
                            },
                          ]}
                          onPress={() => setSelectedCategory(cat._id)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              { color: isSelected ? '#FFFFFF' : theme.text },
                            ]}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                );
              })()}

              {/* Botão de Salvar */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: accounts.length === 0 ? '#94A3B8' : theme.primary,
                  },
                ]}
                onPress={handleCreateTransaction}
                disabled={saving || accounts.length === 0}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Salvar Lançamento</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  typeBtnText: { fontSize: 14, fontWeight: '600' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  quickAddText: { fontSize: 13, fontWeight: '600' },
  noAccountBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  noAccountTitle: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  noAccountSub: { fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 10 },
  quickCreateRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  quickCreateBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  quickCreateBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  chipsScroll: { paddingVertical: 6, gap: 8 },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  chipTitle: { fontSize: 13 },
  chipSubtitle: { fontSize: 11 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
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
