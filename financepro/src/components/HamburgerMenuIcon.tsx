import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../src/theme/useThemeColors';

export function HamburgerMenuIcon() {
  const router = useRouter();
  const theme = useThemeColors();

  const handlePress = () => {
    // Abre o menu hambúrguer (navega para um modal ou abre um drawer)
    // Por enquanto, vamos navegar para a página de relatórios
    router.push('/(tabs)/reports');
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Ionicons name="menu" size={24} color={theme.text} />
    </TouchableOpacity>
  );
}
