import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { formatCurrency } from '../../src/utils/format';
import { useThemeColors } from '../../src/theme/useThemeColors';

interface CategoryReport {
  categoryId: string;
  categoryName: string;
  icon: string;
  totalCents: number;
  count: number;
  percentage: string;
}

interface MonthlyReport {
  period: { month: number; year: number };
  totalIncomeCents: number;
  totalExpenseCents: number;
  netSavingsCents: number;
  expensesByCategory: CategoryReport[];
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function ReportsScreen() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  const theme = useThemeColors();

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await api.getMonthlyReport(currentMonth + 1, currentYear) as MonthlyReport;
      setReport(data);
    } catch (err) {
      console.log('Erro ao carregar relatório', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [currentMonth, currentYear]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Calcular totais
  const totalIncome = report?.totalIncomeCents || 0;
  const totalExpense = report?.totalExpenseCents || 0;
  const netSavings = report?.netSavingsCents || 0;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Navegação de Mês */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: theme.text }]}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : report ? (
        <>
          {/* Resumo Principal */}
          <View style={[styles.summaryCard, { backgroundColor: '#1E293B' }]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Ionicons name="arrow-down" size={20} color="#10B981" />
                </View>
                <Text style={styles.summaryLabel}>Receitas</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons name="arrow-up" size={20} color="#EF4444" />
                </View>
                <Text style={styles.summaryLabel}>Despesas</Text>
                <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                  {formatCurrency(totalExpense)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={[styles.iconCircle, { backgroundColor: netSavings >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons name="wallet" size={20} color={netSavings >= 0 ? '#10B981' : '#EF4444'} />
                </View>
                <Text style={styles.summaryLabel}>Economia</Text>
                <Text style={[styles.summaryValue, { color: netSavings >= 0 ? '#10B981' : '#EF4444' }]}>
                  {formatCurrency(netSavings)}
                </Text>
              </View>
            </View>
            <View style={styles.savingsRateContainer}>
              <Text style={styles.savingsRateLabel}>Taxa de Economia</Text>
              <Text style={[styles.savingsRateValue, { color: netSavings >= 0 ? '#10B981' : '#EF4444' }]}>
                {savingsRate}%
              </Text>
            </View>
          </View>

          {/* Distribuição por Categoria */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Gastos por Categoria
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              {report.expensesByCategory.length} categorias com gastos
            </Text>
          </View>

          {report.expensesByCategory.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <Ionicons name="pricetag-outline" size={40} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Nenhum gasto registrado neste período
              </Text>
            </View>
          ) : (
            report.expensesByCategory.map((category, index) => {
              const progressWidth = Math.min(parseFloat(category.percentage), 100);
              return (
                <View
                  key={category.categoryId}
                  style={[styles.categoryCard, { backgroundColor: theme.card }]}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryIcon, { backgroundColor: '#DCFCE7' }]}>
                        <Ionicons name={category.icon as any} size={18} color="#166534" />
                      </View>
                      <View>
                        <Text style={[styles.categoryName, { color: theme.text }]}>
                          {category.categoryName}
                        </Text>
                        <Text style={[styles.categoryCount, { color: theme.textMuted }]}>
                          {category.count} transações
                        </Text>
                      </View>
                    </View>
                    <View style={styles.categoryAmounts}>
                      <Text style={[styles.categoryAmount, { color: theme.text }]}>
                        {formatCurrency(category.totalCents)}
                      </Text>
                      <Text style={[styles.categoryPercentage, { color: theme.primary }]}>
                        {category.percentage}%
                      </Text>
                    </View>
                  </View>
                  {/* Barra de progresso */}
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progressWidth}%`,
                          backgroundColor:
                            parseFloat(category.percentage) > 30
                              ? '#EF4444'
                              : parseFloat(category.percentage) > 15
                              ? '#F59E0B'
                              : '#10B981',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}

          {/* Gráfico de Pizza Simplificado (visualização) */}
          {report.expensesByCategory.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Visualização
                </Text>
              </View>
              <View style={[styles.pieChartContainer, { backgroundColor: theme.card }]}>
                {report.expensesByCategory.slice(0, 5).map((cat, idx) => {
                  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
                  return (
                    <View key={cat.categoryId} style={styles.pieSlice}>
                      <View style={[styles.pieColor, { backgroundColor: colors[idx % colors.length] }]} />
                      <Text style={styles.pieLabel}>{cat.categoryName}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 60,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  savingsRateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  savingsRateLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginRight: 8,
  },
  savingsRateValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  categoryCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryAmounts: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 12,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  pieChartContainer: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  pieSlice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieLabel: {
    fontSize: 14,
    color: '#1E293B',
  },
});
