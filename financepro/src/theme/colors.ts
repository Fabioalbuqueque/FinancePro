export const colors = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    primary: '#10B981', // Verde FinancePro
    primaryDark: '#059669',
    income: '#10B981',
    expense: '#EF4444',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#334155',
    primary: '#10B981',
    primaryDark: '#059669',
    income: '#34D399',
    expense: '#F87171',
    tabBar: '#1E293B',
    tabBarBorder: '#334155',
  },
};

export type ThemeColors = typeof colors.light | typeof colors.dark;

export function getThemeColors(theme: 'light' | 'dark'): ThemeColors {
  return theme === 'dark' ? colors.dark : colors.light;
}
