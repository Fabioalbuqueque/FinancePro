import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { formatCurrency, formatDate } from '../../src/utils/format';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { useAuth } from '../../src/stores/auth';

export default function DashboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scope, setScope] = useState<'all' | 'user' | 'family'>('all');

  const theme = useThemeColors();

  const loadData = useCallback(async () => {
    if (authLoading) return;
    try {
      const summary = await api.getDashboard(scope);
      setData(summary);
    } catch (err) {
      console.log('Erro ao carregar dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scope, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [loadData, authLoading, user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const indicators = data?.indicators || {
    totalBalanceCents: 0,
    incomeCents: 0,
    expenseCents: 0,
    netResultCents: 0,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Seletor de Escopo: Todos, Individual, Familiar */}
      <View style={styles.scopeContainer}>
        {(['all', 'user', 'family'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.scopeTab,
              scope === s && { backgroundColor: theme.primary },
            ]}
            onPress={() => setScope(s)}
          >
            <Text
              style={[
                styles.scopeText,
                { color: scope === s ? '#FFFFFF' : theme.textMuted },
              ]}
            >
              {s === 'all' ? 'Geral' : s === 'user' ? 'Individual' : 'Familiar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Principal: Saldo Total */}
      <View style={[styles.balanceCard, { backgroundColor: '#1E293B' }]}>
        <Text style={styles.balanceLabel}>Patrimônio Total Líquido</Text>
        <Text style={styles.balanceValue}>
          {formatCurrency(indicators.totalBalanceCents)}
        </Text>
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>
            Mês atual: {data?.period?.month}/{data?.period?.year}
          </Text>
        </View>
      </View>

      {/* Grid de Indicadores: Receitas, Despesas e Resultado */}
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="arrow-down-circle" size={24} color={theme.income} />
            <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Receitas</Text>
          </View>
          <Text style={[styles.cardValue, { color: theme.income }]}>
            {formatCurrency(indicators.incomeCents)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="arrow-up-circle" size={24} color={theme.expense} />
            <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Despesas</Text>
          </View>
          <Text style={[styles.cardValue, { color: theme.expense }]}>
            {formatCurrency(indicators.expenseCents)}
          </Text>
        </View>
      </View>

      {/* Card de Economia Líquida */}
      <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.resultLabel, { color: theme.textMuted }]}>
          Resultado do Período (Balanço Líquido)
        </Text>
        <Text
          style={[
            styles.resultValue,
            {
              color:
                indicators.netResultCents >= 0 ? theme.income : theme.expense,
            },
          ]}
        >
          {formatCurrency(indicators.netResultCents)}
        </Text>
      </View>

      {/* Últimas Movimentações */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Últimas Movimentações
        </Text>
      </View>

      {data?.recentTransactions?.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
          <Ionicons name="receipt-outline" size={40} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Nenhuma movimentação registrada no período.
          </Text>
        </View>
      ) : (
        data?.recentTransactions?.map((tx: any) => (
          <View
            key={tx._id}
            style={[styles.transactionItem, { backgroundColor: theme.card }]}
          >
            <View style={styles.txIconContainer}>
              <Ionicons
                name={
                  tx.type === 'income'
                    ? 'arrow-down'
                    : tx.type === 'expense'
                    ? 'arrow-up'
                    : 'swap-horizontal'
                }
                size={20}
                color={
                  tx.type === 'income'
                    ? theme.income
                    : tx.type === 'expense'
                    ? theme.expense
                    : theme.transfer
                }
              />
            </View>
            <View style={styles.txDetails}>
              <Text style={[styles.txDesc, { color: theme.text }]}>
                {tx.description}
              </Text>
              <Text style={[styles.txSub, { color: theme.textMuted }]}>
                {tx.accountId?.name || 'Conta'} • {formatDate(tx.date)}
              </Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                {
                  color:
                    tx.type === 'income'
                      ? theme.income
                      : tx.type === 'expense'
                      ? theme.expense
                      : theme.transfer,
                },
              ]}
            >
              {tx.type === 'expense' ? '- ' : '+ '}
              {formatCurrency(tx.amountCents)}
            </Text>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scopeContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  scopeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  scopeText: { fontSize: 13, fontWeight: '600' },
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  balanceLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  periodBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodText: { color: '#E2E8F0', fontSize: 12 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, padding: 16, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardTitle: { fontSize: 13, fontWeight: '600' },
  cardValue: { fontSize: 18, fontWeight: '700' },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: { fontSize: 13, fontWeight: '500' },
  resultValue: { fontSize: 18, fontWeight: '700' },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { marginTop: 8, fontSize: 14, textAlign: 'center' },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  txIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: { flex: 1 },
  txDesc: { fontSize: 15, fontWeight: '600' },
  txSub: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
});
