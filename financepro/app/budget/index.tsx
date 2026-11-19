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
import { api } from '../../src/services/api';
import { formatCurrency, parseBrlToCents } from '../../src/utils/format';
import { useThemeColors } from '../../src/theme/useThemeColors';

export default function BudgetScreen() {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal de orçamento
  const [modalVisible, setModalVisible] = useState(false);
  const [totalInput, setTotalInput] = useState('');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

  const loadBudget = useCallback(async () => {
    try {
      const data = await api.getCurrentBudget();
      setBudget(data);
    } catch (err) {
      console.log('Erro ao carregar orçamento', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  const handleCreateBudget = async () => {
    if (!totalInput) {
      Alert.alert('Atenção', 'Informe o valor total do orçamento.');
      return;
    }

    const totalCents = parseBrlToCents(totalInput);
    if (totalCents <= 0) {
      Alert.alert('Atenção', 'Informe um valor maior que zero.');
      return;
    }

    try {
      setSaving(true);
      const now = new Date();
      await api.createBudget({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        totalBudgetCents: totalCents,
      });

      setModalVisible(false);
      setTotalInput('');
      loadBudget();
      Alert.alert('Sucesso', 'Orçamento criado com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao criar orçamento.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {!budget ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
          <Ionicons name="wallet-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Nenhum orçamento definido
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Defina um orçamento para controlar seus gastos mensais!
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.primaryBtnText}>Definir Orçamento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Card Principal */}
          <View style={[styles.budgetCard, { backgroundColor: '#1E293B' }]}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetLabel}>Orçamento Total</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(budget.totalBudgetCents)}
              </Text>
            </View>

            {/* Progresso */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <View>
                  <Text style={[styles.progressLabel, { color: '#94A3B8' }]}>
                    Gasto
                  </Text>
                  <Text style={[styles.progressValue, { color: theme.expense }]}>
                    {formatCurrency(budget.totalSpentCents)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.progressLabel, { color: '#94A3B8' }]}>
                    Disponível
                  </Text>
                  <Text style={[styles.progressValue, { color: theme.income }]}>
                    {formatCurrency(budget.remainingCents)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${budget.percentageUsed}%`,
                      backgroundColor:
                        budget.percentageUsed > 80
                          ? theme.expense
                          : budget.percentageUsed > 50
                          ? '#F59E0B'
                          : theme.income,
                    },
                  ]}
                />
              </View>

              <View style={styles.progressPercentContainer}>
                <Text style={styles.progressPercentText}>
                  {budget.percentageUsed}% utilizado
                </Text>
              </View>
            </View>
          </View>

          {/* Alerta de Estouro */}
          {budget.percentageUsed >= 100 && (
            <View style={[styles.alertCard, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning" size={20} color="#B91C1C" />
              <Text style={styles.alertText}>
                Você ultrapassou seu orçamento mensal!
              </Text>
            </View>
          )}

          {/* Ações */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
              onPress={loadBudget}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modal de Orçamento */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Orçamento Mensal
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Orçamento Total (R$)
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: 5000,00"
              keyboardType="numeric"
              value={totalInput}
              onChangeText={setTotalInput}
            />

            <Text style={[styles.infoText, { color: theme.textMuted }]}>
              Defina o limite total de gastos para este mês. Você poderá criar
              orçamentos por categoria depois.
            </Text>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleCreateBudget}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Definir Orçamento</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCard: {
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  primaryBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  budgetCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  budgetHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetLabel: { color: '#94A3B8', fontSize: 14 },
  budgetValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginTop: 4 },
  progressContainer: { marginTop: 16 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  progressPercentContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  progressPercentText: { color: '#94A3B8', fontSize: 13 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  alertText: { flex: 1, color: '#B91C1C', fontSize: 14, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
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
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  infoText: { fontSize: 12, lineHeight: 18, marginTop: 12 },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
