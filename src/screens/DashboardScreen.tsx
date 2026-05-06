import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
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

// Constants for consistent sizing
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

const ICON_SIZES = {
  small: 18,
  medium: 20,
  large: 24,
  xlarge: 36,
};

const BORDER_RADIUS = {
  small: 10,
  medium: 12,
  large: 16,
  xlarge: 18,
  xxlarge: 20,
  round: 24,
};

const StatCard: React.FC<{
  label: string;
  count: number;
  color: string;
  bg: string;
  icon: string;
  onPress: () => void;
}> = React.memo(({ label, count, color, bg, icon, onPress }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  
  const progressWidth = useMemo(() => {
    return Math.min((count / 10) * 100, 100);
  }, [count]);

  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: c.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${count} issues`}
      accessibilityHint="Tap to view filtered list"
    >
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: bg }]}>
          <Text style={styles.statIconText}>{icon}</Text>
        </View>
        <Text style={[styles.statLabel, { color: c.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.statCount, { color: c.text }]}>{count}</Text>
      <View style={[styles.statProgress, { backgroundColor: c.border }]}>
        <View 
          style={[
            styles.statProgressBar, 
            { backgroundColor: color, width: `${progressWidth}%` }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
});

export const DashboardScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const { getDashboardCounts, fetchFromApi, isLoading, lastSynced } = useIssueStore();
  const counts = getDashboardCounts();

  const handleRefresh = useCallback(() => {
    fetchFromApi();
  }, [fetchFromApi]);

  const goToListWithFilter = useCallback((status: Status | 'all') => {
    useIssueStore.getState().setFilters({ status, search: '', priority: 'all' });
    navigation.navigate('Main');
  }, [navigation]);

  const formattedSyncTime = useMemo(() => {
    if (!lastSynced) return null;
    return new Date(lastSynced).toLocaleTimeString();
  }, [lastSynced]);

  const userInitial = useMemo(() => {
    return user?.name?.charAt(0).toUpperCase() || 'U';
  }, [user?.name]);

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
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <View style={styles.userTextContainer}>
            <Text style={[styles.greeting, { color: c.textMuted }]}>Good day 👋</Text>
            <Text style={[styles.userName, { color: c.text }]} numberOfLines={1}>
              {user?.name ?? 'User'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.iconBtn, { backgroundColor: c.surface }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <Text style={styles.iconBtnText}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={logout} 
            style={[styles.logoutBtn, { backgroundColor: c.surface }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <Text style={[styles.logoutText, { color: c.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Total */}
      <View style={[styles.totalCard, { backgroundColor: c.primary }]}>
        <Text style={styles.totalLabel}>Total Issues</Text>
        <Text style={styles.totalCount}>{counts.total}</Text>
        {formattedSyncTime && (
          <Text style={styles.totalSync}>
            Last synced {formattedSyncTime}
          </Text>
        )}
      </View>

      {/* Stats grid */}
      <View style={styles.statsSection}>
        <View style={styles.statsSectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>By Status</Text>
          <Text style={[styles.sectionSubtitle, { color: c.textMuted }]}>
            {counts.total} total
          </Text>
        </View>
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
      </View>

      {/* Quick action */}
      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('CreateEditIssue', {})}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create new issue"
      >
        <Text style={styles.createBtnText}>+ Create New Issue</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
  },
  container: { 
    flex: 1,
  },
  content: { 
    padding: SPACING.xl,
    paddingBottom: 100,
    gap: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  userTextContainer: {
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: ICON_SIZES.medium,
    ...fontStyles.headingMedium,
  },
  greeting: { 
    fontSize: 12,
    ...fontStyles.body,
    marginBottom: 2,
  },
  userName: { 
    fontSize: 18,
    ...fontStyles.headingMedium,
  },
  headerActions: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBtn: { 
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconBtnText: {
    fontSize: ICON_SIZES.small,
  },
  logoutBtn: {
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutText: { 
    fontSize: 13,
    ...fontStyles.bodyMedium,
  },
  totalCard: {
    borderRadius: BORDER_RADIUS.xxlarge,
    padding: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  totalLabel: { 
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    ...fontStyles.bodyMedium,
  },
  totalCount: { 
    color: '#fff',
    fontSize: 56,
    ...fontStyles.heading,
    letterSpacing: -2,
  },
  totalSync: { 
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: SPACING.xs,
    ...fontStyles.body,
  },
  statsSection: {
    gap: SPACING.md,
  },
  statsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: { 
    fontSize: 17,
    ...fontStyles.headingMedium,
  },
  sectionSubtitle: { 
    fontSize: 13,
    ...fontStyles.body,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    width: '47.5%',
    borderRadius: BORDER_RADIUS.xlarge,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statIcon: {
    width: ICON_SIZES.xlarge,
    height: ICON_SIZES.xlarge,
    borderRadius: BORDER_RADIUS.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: { 
    fontSize: ICON_SIZES.small,
  },
  statLabel: { 
    fontSize: 12,
    ...fontStyles.bodyMedium,
    flex: 1,
  },
  statCount: { 
    fontSize: 32,
    ...fontStyles.heading,
    letterSpacing: -1,
  },
  statProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  createBtn: {
    borderRadius: BORDER_RADIUS.large,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createBtnText: { 
    color: '#fff',
    fontSize: 16,
    ...fontStyles.headingMedium,
  },
});
