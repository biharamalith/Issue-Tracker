import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../types';
import { useTheme } from '../hooks/useTheme';
import { fontStyles } from '../utils/fonts';

interface Props {
  priority: Priority;
  size?: 'sm' | 'md';
}

const LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const ICONS: Record<Priority, string> = {
  low: '↓',
  medium: '→',
  high: '↑',
  critical: '⚡',
};

export const PriorityBadge: React.FC<Props> = ({ priority, size = 'md' }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const colorMap: Record<Priority, { text: string; bg: string }> = {
    low: { text: c.priorityLow, bg: c.priorityLowBg },
    medium: { text: c.priorityMedium, bg: c.priorityMediumBg },
    high: { text: c.priorityHigh, bg: c.priorityHighBg },
    critical: { text: c.priorityCritical, bg: c.priorityCriticalBg },
  };

  const { text, bg } = colorMap[priority];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.small]}>
      <Text style={[styles.icon, { color: text }]}>{ICONS[priority]}</Text>
      <Text style={[styles.label, { color: text }, isSmall && styles.smallText]}>
        {LABELS[priority]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 4,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    fontSize: 13,
    ...fontStyles.bodyMedium,
  },
  smallText: {
    fontSize: 11,
  },
});
