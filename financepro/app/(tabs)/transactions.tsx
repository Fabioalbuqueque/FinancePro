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
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');

  // Modal de Nova Transação (Apenas Receita ou Despesa)
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filterType) params.type = filterType;

      const [txRes, catRes]: [any, any] = await Promise.all([
        api.getTransactions(params),
        api.getCategories(),
      ]);

      setTransactions(txRes.items || []);

      const allCats = catRes || [];
      setCategories(allCats);

      // Auto-selecionar primeira categoria correspondente ao tipo atual
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

  // Ao alternar entre Receita e Despesa, atualiza as categorias correspondentes
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    const matchingCats = categories.filter((c) => c.type === newType);
    if (matchingCats.length > 0) {
      setSelectedCategory(matchingCats[0]._id);
    } else {
      setSelectedCategory('');
    }
  };

  const handleCreateTransaction = async () => {
    if (!description.trim()) {
      Alert.alert('Atenção', 'Informe uma descrição.');
      return;
    }

    if (!amountInput.trim()) {
      Alert.alert('Atenção', 'Informe o valor.');
      return;
    }

    const amountCents = parseBrlToCents(amountInput);
    if (amountCents <= 0) {
      Alert.alert('Atenção', 'Informe um valor maior que zero.');
      return;
    }

    try {
      setSaving(true);
      await api.createTransaction({
        description: description.trim(),
        amountCents,
        type,
        categoryId: selectedCategory || undefined,
        status: 'paid',
        date: new Date().toISOString(),
      });

      setModalVisible(false);
      setDescription('');
      setAmountInput('');
      await loadData();
      Alert.alert('Sucesso', `${type === 'income' ? 'Receita' : 'Despesa'} salva com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao salvar movimentação:', err);
      Alert.alert('Erro', err.message || 'Falha ao salvar lançamento.');
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
                        item.type === 'income' ? '#DCFCE7' : '#FEE2E2',
                    },
                  ]}
                >
                  <Ionicons
                    name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={item.type === 'income' ? theme.income : theme.expense}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.desc, { color: theme.text }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={[styles.sub, { color: theme.textMuted }]}>
                    {item.categoryId?.name || (item.type === 'income' ? 'Receita' : 'Despesa')} • {formatDate(item.date)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text
                  style={[
                    styles.amount,
                    {
                      color: item.type === 'income' ? theme.income : theme.expense,
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

      {/* Modal de Criação (Apenas Receita ou Despesa) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Novo Lançamento
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
                    size={18}
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
                    size={18}
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

              {/* Seletor de Categoria */}
              <Text style={[styles.inputLabel, { color: theme.text, marginTop: 14 }]}>
                Categoria
              </Text>
              {(() => {
                const filteredCats = categories.filter((c) => c.type === type);
                if (filteredCats.length === 0) {
                  return (
                    <Text style={{ color: theme.textMuted, fontSize: 13, marginVertical: 8 }}>
                      Nenhuma categoria cadastrada.
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
                    backgroundColor: type === 'income' ? theme.income : theme.expense,
                  },
                ]}
                onPress={handleCreateTransaction}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    Salvar {type === 'income' ? 'Receita' : 'Despesa'}
                  </Text>
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  typeBtnText: { fontSize: 15, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  chipsScroll: { paddingVertical: 6, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  submitBtn: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
