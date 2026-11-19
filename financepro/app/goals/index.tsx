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

export default function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de nova meta
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

  const loadGoals = useCallback(async () => {
    try {
      const data: any[] = await api.listGoals();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Erro ao carregar metas', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = async () => {
    if (!name || !targetInput || !deadline) {
      Alert.alert('Atenção', 'Preencha nome, valor alvo e prazo.');
      return;
    }

    const targetCents = parseBrlToCents(targetInput);
    if (targetCents <= 0) {
      Alert.alert('Atenção', 'Informe um valor alvo maior que zero.');
      return;
    }

    try {
      setSaving(true);
      await api.createGoal({
        name,
        targetAmountCents: targetCents,
        currentAmountCents: parseBrlToCents(currentInput),
        deadline,
        category: category || undefined,
      });

      setModalVisible(false);
      setName('');
      setTargetInput('');
      setCurrentInput('');
      setDeadline('');
      setCategory('');
      loadGoals();
      Alert.alert('Sucesso', 'Meta criada com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao criar meta.');
    } finally {
      setSaving(false);
    }
  };

  const handleContribute = (goalId: string, goalName: string) => {
    let amount = '';
    Alert.alert(
      'Adicionar Contribuição',
      `Quanto deseja adicionar à meta "${goalName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: async () => {
            try {
              const amountCents = parseBrlToCents(amount);
              if (amountCents <= 0) {
                Alert.alert('Atenção', 'Informe um valor válido.');
                return;
              }

              await api.addGoalContribution(goalId, amountCents);
              loadGoals();
              Alert.alert('Sucesso', 'Contribuição adicionada!');
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Falha ao adicionar contribuição.');
            }
          },
        },
      ]
    );
  };

  const renderGoalCard = (goal: any) => {
    const progress = goal.progressPercentage || 0;
    const isCompleted = goal.status === 'completed';

    return (
      <View key={goal._id} style={[styles.goalCard, { backgroundColor: theme.card }]}>
        {/* Header */}
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalName, { color: theme.text }]}>
              {goal.name}
            </Text>
            {goal.category && (
              <View style={[styles.categoryBadge, { backgroundColor: '#E0E7FF' }]}>
                <Text style={styles.categoryText}>{goal.category}</Text>
              </View>
            )}
          </View>
          {isCompleted ? (
            <View style={[styles.completedBadge, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#166534" />
            </View>
          ) : (
            <View style={[styles.deadlineBadge, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.deadlineText}>
                {goal.daysRemaining} dias
              </Text>
            </View>
          )}
        </View>

        {/* Progresso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: theme.textMuted }]}>
              {formatCurrency(goal.currentAmountCents)} de {formatCurrency(goal.targetAmountCents)}
            </Text>
            <Text
              style={[
                styles.progressPercent,
                { color: isCompleted ? theme.income : theme.primary },
              ]}
            >
              {progress}%
            </Text>
          </View>

          {/* Barra de Progresso */}
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor: isCompleted ? theme.income : theme.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Ações */}
        {!isCompleted && (
          <View style={styles.goalActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
              onPress={() => handleContribute(goal._id, goal.name)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}
              onPress={() =>
                Alert.alert(
                  'Excluir Meta',
                  `Excluir a meta "${goal.name}"?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Excluir',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await api.deleteGoal(goal._id);
                          loadGoals();
                        } catch (err: any) {
                          Alert.alert('Erro', err.message);
                        }
                      },
                    },
                  ]
                )
              }
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
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
      {goals.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
          <Ionicons name="flag-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Nenhuma meta definida
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Crie sua primeira meta para começar a poupar!
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.primaryBtnText}>Criar Meta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        goals.map(renderGoalCard)
      )}

      {/* Modal Nova Meta */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Nova Meta
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Nome</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: Viagem, Carro, Reserva"
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Valor Alvo (R$)
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: 5000,00"
              keyboardType="numeric"
              value={targetInput}
              onChangeText={setTargetInput}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Valor Atual (R$)
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="0,00"
              keyboardType="numeric"
              value={currentInput}
              onChangeText={setCurrentInput}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Prazo Final (AAAA-MM-DD)
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="2027-06-30"
              value={deadline}
              onChangeText={setDeadline}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Categoria (opcional)
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Viagem, Investimento, etc."
              value={category}
              onChangeText={setCategory}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleCreateGoal}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Criar Meta</Text>
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
  goalCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#3730A3' },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deadlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deadlineText: { fontSize: 12, fontWeight: '600', color: '#B91C1C' },
  progressContainer: { marginBottom: 12 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: { fontSize: 13 },
  progressPercent: { fontSize: 13, fontWeight: '700' },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  input: {
    height: 44,
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
    marginTop: 20,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
