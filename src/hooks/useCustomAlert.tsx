import { useState, useCallback } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertConfig(options);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    setTimeout(() => setAlertConfig(null), 300);
  }, []);

  return {
    alertConfig,
    visible,
    showAlert,
    hideAlert,
  };
};
