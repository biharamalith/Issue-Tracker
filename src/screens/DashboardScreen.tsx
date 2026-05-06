import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIssueStore } from '../store/issueStore';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { RootStackParamList, Status } from '../types';
import { fontStyles } from '../utils/fonts';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const StatCard: React.FC<{
  label: string;
  count: number;
  color: string;
  bg: string;
  icon: string;
  onPress: () => void;
}> = ({ label, count, color, bg, icon, onPress }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={[styles.statLabel, { color: c.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const DashboardScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const { getDashboardCounts, fetchFromApi, isLoading, lastSynced, syncQueue } = useIssueStore();
  const counts = getDashboardCounts();

  const handleRefresh = () => fetchFromApi();

  const goToListWithFilter = (status: Status | 'all') => {
    useIssueStore.getState().setFilters({ status, search: '', priority: 'all' });
    navigation.navigate('Main');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={c.primary} />
      }
    >
      {/* Network Status Bar */}
      <NetworkStatusBar />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: c.textMuted }]}>Good day 👋</Text>
          <Text style={[styles.userName, { color: c.text }]}>{user?.name ?? 'User'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
            <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { borderColor: c.border }]}>
            <Text style={[styles.logoutText, { color: c.textSecondary }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Total */}
      <View style={[styles.totalCard, { backgroundColor: c.primary }]}>
        <Text style={styles.totalLabel}>Total Issues</Text>
        <Text style={styles.totalCount}>{counts.total}</Text>
        {lastSynced && (
          <Text style={styles.totalSync}>
            Last synced {new Date(lastSynced).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Stats grid */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>By Status</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Open"
          count={counts.open}
          color={c.statusOpen}
          bg={c.statusOpenBg}
          icon="🔵"
          onPress={() => goToListWithFilter('open')}
        />
        <StatCard
          label="In Progress"
          count={counts.in_progress}
          color={c.statusInProgress}
          bg={c.statusInProgressBg}
          icon="🟡"
          onPress={() => goToListWithFilter('in_progress')}
        />
        <StatCard
          label="Resolved"
          count={counts.resolved}
          color={c.statusResolved}
          bg={c.statusResolvedBg}
          icon="🟢"
          onPress={() => goToListWithFilter('resolved')}
        />
        <StatCard
          label="Closed"
          count={counts.closed}
          color={c.statusClosed}
          bg={c.statusClosedBg}
          icon="⚫"
          onPress={() => goToListWithFilter('closed')}
        />
      </View>

      {/* Quick action */}
      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('CreateEditIssue', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.createBtnText}>+ Create New Issue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 13, ...fontStyles.body },
  userName: { fontSize: 22, ...fontStyles.heading },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 4 },
  logoutBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: { fontSize: 13, ...fontStyles.bodyMedium },
  totalCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, ...fontStyles.bodyMedium },
  totalCount: { color: '#fff', fontSize: 52, ...fontStyles.heading },
  totalSync: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, ...fontStyles.body },
  sectionTitle: { fontSize: 16, ...fontStyles.headingMedium },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: { fontSize: 18 },
  statCount: { fontSize: 32, ...fontStyles.heading },
  statLabel: { fontSize: 13, ...fontStyles.bodyMedium },
  createBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  createBtnText: { color: '#fff', fontSize: 16, ...fontStyles.headingMedium },
});
