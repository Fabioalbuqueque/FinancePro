import { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextData {
  theme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => Promise<void>;
  themeMode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Carregar preferência salva
  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem('financepro_theme');
        if (saved) {
          const mode = saved as ThemeMode;
          setThemeModeState(mode);

          if (mode === 'system') {
            const scheme = Appearance.getColorScheme();
            setResolvedTheme(scheme === 'dark' ? 'dark' : 'light');
          } else {
            setResolvedTheme(mode);
          }
        }
      } catch (err) {
        console.log('Erro ao carregar tema', err);
      }
    }
    loadTheme();
  }, []);

  // Atualizar tema resolvido
  useEffect(() => {
    if (themeMode !== 'system') {
      setResolvedTheme(themeMode);
    }
  }, [themeMode]);

  const setTheme = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('financepro_theme', mode);

    if (mode === 'system') {
      const scheme = Appearance.getColorScheme();
      setResolvedTheme(scheme === 'dark' ? 'dark' : 'light');
    } else {
      setResolvedTheme(mode);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        setTheme,
        themeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
