import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Cross-platform Alert yang bekerja sempurna di Web dan Native.
 * Pada Web, react-native-web memiliki Alert.alert stub kosong (no-op).
 * showAlert menggunakan browser alert / confirm agar pesan peringatan atau error
 * SELALU terlihat jelas oleh pengguna.
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const fullText = message ? `${title}\n\n${message}` : title;

    if (buttons && buttons.length > 1) {
      const confirmAction = buttons.find((b) => b.style !== 'cancel') || buttons[0];
      const cancelAction = buttons.find((b) => b.style === 'cancel');

      const confirmed = window.confirm(fullText);
      if (confirmed) {
        confirmAction?.onPress?.();
      } else {
        cancelAction?.onPress?.();
      }
      return;
    }

    window.alert(fullText);
    buttons?.[0]?.onPress?.();
    return;
  }

  Alert.alert(title, message, buttons as any);
};
