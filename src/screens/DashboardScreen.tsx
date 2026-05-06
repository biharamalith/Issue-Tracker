import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
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
      style={[styles.statCard, { backgroundColor: c.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={[styles.statCount, { color: c.text }]}>{count}</Text>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.surface }]}>
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
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: c.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={[styles.greeting, { color: c.textMuted }]}>Good day 👋</Text>
            <Text style={[styles.userName, { color: c.text }]}>{user?.name ?? 'User'}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.iconBtn, { backgroundColor: c.surface }]}
          >
            <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={logout} 
            style={[styles.logoutBtn, { backgroundColor: c.surface }]}
          >
            <Text style={[styles.logoutText, { color: c.error }]}>Logout</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100, gap: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    ...fontStyles.headingMedium,
  },
  greeting: { fontSize: 12, ...fontStyles.body, marginBottom: 2 },
  userName: { fontSize: 18, ...fontStyles.headingMedium },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { 
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutBtn: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: { fontSize: 13, ...fontStyles.bodyMedium },
  totalCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, ...fontStyles.bodyMedium },
  totalCount: { color: '#fff', fontSize: 56, ...fontStyles.heading, letterSpacing: -2 },
  totalSync: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4, ...fontStyles.body },
  sectionTitle: { fontSize: 17, ...fontStyles.headingMedium, marginBottom: -4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47.5%',
    borderRadius: 18,
    padding: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: { fontSize: 20 },
  statCount: { fontSize: 36, ...fontStyles.heading, letterSpacing: -1 },
  statLabel: { fontSize: 13, ...fontStyles.bodyMedium },
  createBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: { color: '#fff', fontSize: 16, ...fontStyles.headingMedium },
});
