import * as Notifications from 'expo-notifications';

class NotificationService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    // Pedir permissão
    await Notifications.requestPermissionsAsync();

    this.initialized = true;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async scheduleNotification(
    title: string,
    body: string,
    trigger?: { year: number; month: number; day: number; hour: number; minute: number }
  ) {
    try {
      const content: any = {
        title,
        body,
      };

      const notificationPayload: any = {
        content,
      };

      if (trigger) {
        notificationPayload.trigger = trigger;
      }

      const notificationId = await Notifications.scheduleNotificationAsync(
        notificationPayload
      );

      console.log('Notificação agendada:', notificationId);
      return notificationId;
    } catch (error) {
      console.log('Erro ao agendar notificação:', error);
      return null;
    }
  }

  async scheduleMonthlyReport() {
    const now = new Date();
    const trigger = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: 1,
      hour: 8,
      minute: 0,
    };

    return this.scheduleNotification(
      'Relatório Mensal Disponível',
      'Seu relatório financeiro mensal está pronto. Acesse a aba Relatórios!',
      trigger
    );
  }

  async cancelNotification(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
