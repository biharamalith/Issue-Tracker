import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Issue } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { useTheme } from '../hooks/useTheme';
import { formatDate } from '../utils/formatDate';
import { fontStyles } from '../utils/fonts';

interface Props {
  issue: Issue;
  onPress: () => void;
}

export const IssueCard: React.FC<Props> = ({ issue, onPress }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Offline indicator */}
      {issue.pendingSync && (
        <View style={[styles.syncBanner, { backgroundColor: c.warning }]}>
          <Text style={styles.syncText}>⏳ Pending sync</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {issue.title}
        </Text>
        {issue.assignee && (
          <View style={[styles.avatar, { backgroundColor: c.primaryLight }]}>
            <Text style={[styles.avatarText, { color: c.primary }]}>
              {issue.assignee.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, { color: c.textSecondary }]} numberOfLines={2}>
        {issue.description}
      </Text>

      <View style={styles.badges}>
        <StatusBadge status={issue.status} size="sm" />
        <PriorityBadge priority={issue.priority} size="sm" />
      </View>

      <Text style={[styles.date, { color: c.textMuted }]}>
        Created {formatDate(issue.createdAt)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    gap: 10,
    overflow: 'hidden',
  },
  syncBanner: {
    marginHorizontal: -16,
    marginTop: -16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  syncText: {
    fontSize: 11,
    color: '#fff',
    ...fontStyles.bodyMedium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 15,
    flex: 1,
    lineHeight: 21,
    ...fontStyles.bodyBold,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    ...fontStyles.headingMedium,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    ...fontStyles.body,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  date: {
    fontSize: 12,
    ...fontStyles.body,
  },
});
