import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useIssueStore } from '../store/issueStore';
import { useTheme } from '../hooks/useTheme';
import { fontStyles } from '../utils/fonts';

export const NetworkStatusBar: React.FC = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const isOnline = useIssueStore(s => s.isOnline);
  const syncQueue = useIssueStore(s => s.syncQueue);
  const isSyncing = useIssueStore(s => s.isSyncing);
  const syncError = useIssueStore(s => s.syncError);
  const syncPendingIssues = useIssueStore(s => s.syncPendingIssues);
  const retrySyncFailed = useIssueStore(s => s.retrySyncFailed);

  // Don't show if online and no pending items
  if (isOnline && syncQueue.length === 0 && !syncError) {
    return null;
  }

  const handleSync = () => {
    if (syncError) {
      retrySyncFailed();
    } else {
      syncPendingIssues();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: !isOnline
            ? '#FEF2F2'
            : syncError
            ? '#FEF2F2'
            : isSyncing
            ? '#FEF9C3'
            : '#ECFDF5',
          borderBottomColor: !isOnline
            ? '#FCA5A5'
            : syncError
            ? '#FCA5A5'
            : isSyncing
            ? '#FDE047'
            : '#86EFAC',
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>
          {!isOnline ? '📡' : syncError ? '⚠️' : isSyncing ? '⏳' : '💾'}
        </Text>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.text,
              {
                color: !isOnline
                  ? '#DC2626'
                  : syncError
                  ? '#DC2626'
                  : isSyncing
                  ? '#CA8A04'
                  : '#059669',
              },
            ]}
          >
            {!isOnline
              ? 'You are offline'
              : syncError
              ? syncError
              : isSyncing
              ? `Syncing ${syncQueue.length} item${syncQueue.length > 1 ? 's' : ''}...`
              : `${syncQueue.length} item${syncQueue.length > 1 ? 's' : ''} pending sync`}
          </Text>
        </View>

        {/* Sync button */}
        {isOnline && !isSyncing && syncQueue.length > 0 && (
          <TouchableOpacity
            style={[
              styles.syncBtn,
              {
                backgroundColor: syncError ? '#DC2626' : c.primary,
              },
            ]}
            onPress={handleSync}
            activeOpacity={0.7}
          >
            <Text style={styles.syncBtnText}>
              {syncError ? 'Retry' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    ...fontStyles.bodyMedium,
  },
  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncBtnText: {
    color: '#fff',
    fontSize: 12,
    ...fontStyles.headingMedium,
  },
});
