import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Hook para configurar notificações locais no mobile
 * Pede permissão e configura o comportamento padrão
 */
export function useLocalNotifications() {
  useEffect(() => {
    // Configurar o comportamento padrão das notificações
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Pedir permissão apenas em dispositivos físicos
    const requestPermission = async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      }
    };
    requestPermission();
  }, []);
}