import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';

interface MobileButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MobileButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
}: MobileButtonProps) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  const getVariantStyle = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: theme.card,
          textColor: theme.text,
          borderColor: theme.border,
        };
      case 'danger':
        return {
          backgroundColor: '#FEE2E2',
          textColor: '#EF4444',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: theme.primary,
        };
      default:
        return {
          backgroundColor: theme.primary,
          textColor: '#FFFFFF',
        };
    }
  };

  const variantStyle = getVariantStyle(variant);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          opacity: disabled || loading ? 0.7 : 1,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: variantStyle.borderColor,
          marginHorizontal: fullWidth ? 16 : 0,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.buttonText, { color: variantStyle.textColor }]}>
            Processando...
          </Text>
        </View>
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <Ionicons name={icon as any} size={18} color={variantStyle.textColor} />
          )}
          <Text style={[styles.buttonText, { color: variantStyle.textColor }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});