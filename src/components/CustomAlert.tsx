import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { fontStyles } from '../utils/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onDismiss?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const handleButtonPress = (button: AlertButton) => {
    // Only call onDismiss if button doesn't have its own onPress
    // or if it's a cancel button
    if (button.onPress) {
      button.onPress();
    } else if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonColor = (style?: string) => {
    switch (style) {
      case 'destructive':
        return c.error;
      case 'cancel':
        return c.textSecondary;
      default:
        return c.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.alertBox, { backgroundColor: c.surface }]}
          >
            {/* Title */}
            <Text style={[styles.title, { color: c.text }]}>{title}</Text>

            {/* Message */}
            {message && (
              <Text style={[styles.message, { color: c.textSecondary }]}>
                {message}
              </Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.cancelButton,
                    { borderColor: c.border },
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: getButtonColor(button.style),
                        ...fontStyles.headingMedium,
                      },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 80,
    maxWidth: 320,
  },
  alertBox: {
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
    ...fontStyles.heading,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    ...fontStyles.body,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
  },
});
