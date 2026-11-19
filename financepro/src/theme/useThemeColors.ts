import { useTheme } from './ThemeProvider';
import { getThemeColors } from './colors';

export function useThemeColors() {
  const { theme } = useTheme();
  return getThemeColors(theme);
}
