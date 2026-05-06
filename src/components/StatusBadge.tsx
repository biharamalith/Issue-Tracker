import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Status } from '../types';
import { useTheme } from '../hooks/useTheme';
import { fontStyles } from '../utils/fonts';

interface Props {
  status: Status;
  size?: 'sm' | 'md';
}

const LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const colorMap: Record<Status, { text: string; bg: string }> = {
    open: { text: c.statusOpen, bg: c.statusOpenBg },
    in_progress: { text: c.statusInProgress, bg: c.statusInProgressBg },
    resolved: { text: c.statusResolved, bg: c.statusResolvedBg },
    closed: { text: c.statusClosed, bg: c.statusClosedBg },
  };

  const { text, bg } = colorMap[status];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.small]}>
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[styles.label, { color: text }, isSmall && styles.smallText]}>
        {LABELS[status]}
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
    gap: 5,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    ...fontStyles.bodyMedium,
  },
  smallText: {
    fontSize: 11,
  },
});
