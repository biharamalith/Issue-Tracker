import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { useIssueStore } from '../store/issueStore';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { RootStackParamList, MainTabParamList, Status } from '../types';
import { fontStyles } from '../utils/fonts';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

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
  iconSource: any;
  onPress: () => void;
}> = React.memo(({ label, count, color, bg, iconSource, onPress }) => {
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
          <Image 
            source={iconSource}
            style={styles.statIconImage}
            resizeMode="contain"
          />
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
    navigation.navigate('IssueList');
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
      {isDark ? (
        // Dark mode: Use solid background color
        <View style={[styles.backgroundImage, { backgroundColor: c.background }]}>
          <ScrollView
            style={styles.container}
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
      <LinearGradient
        colors={[c.primary, c.primary, c.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.totalCard}
      >
        {/* Decorative bubbles */}
        <View style={styles.bubble1} />
        <View style={styles.bubble2} />
        <View style={styles.bubble3} />
        
        {/* Content */}
        <View style={styles.totalContent}>
          <Text style={styles.totalLabel}>TOTAL ISSUES</Text>
          <Text style={styles.totalCount}>{counts.total}</Text>
          {formattedSyncTime && (
            <View style={styles.syncRow}>
              <View style={styles.syncDot} />
              <Text style={styles.totalSync}>
                Last synced {formattedSyncTime}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Stats grid */}
      <View style={styles.statsSection}>
        <View style={styles.statsSectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>By Status</Text>
          <TouchableOpacity 
            onPress={() => {
              // Navigate to IssueList tab and clear filters to show all
              useIssueStore.getState().setFilters({ status: 'all', search: '', priority: 'all' });
              navigation.navigate('IssueList');
            }}
            style={styles.viewAllBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllText, { color: c.primary }]}>View all</Text>
            <Text style={[styles.viewAllArrow, { color: c.primary }]}>→</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            label="Open"
            count={counts.open}
            color={c.statusOpen}
            bg={c.statusOpenBg}
            iconSource={require('../../assets/open.png')}
            onPress={() => goToListWithFilter('open')}
          />
          <StatCard
            label="In Progress"
            count={counts.in_progress}
            color={c.statusInProgress}
            bg={c.statusInProgressBg}
            iconSource={require('../../assets/In progress.png')}
            onPress={() => goToListWithFilter('in_progress')}
          />
          <StatCard
            label="Resolved"
            count={counts.resolved}
            color={c.statusResolved}
            bg={c.statusResolvedBg}
            iconSource={require('../../assets/resolved.png')}
            onPress={() => goToListWithFilter('resolved')}
          />
          <StatCard
            label="Closed"
            count={counts.closed}
            color={c.statusClosed}
            bg={c.statusClosedBg}
            iconSource={require('../../assets/Closed.png')}
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
        </View>
      ) : (
        // Light mode: Use background image
        <ImageBackground
          source={require('../../assets/homegb.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <ScrollView
            style={styles.container}
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
      <LinearGradient
        colors={[c.primary, c.primary, c.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.totalCard}
      >
        {/* Decorative bubbles */}
        <View style={styles.bubble1} />
        <View style={styles.bubble2} />
        <View style={styles.bubble3} />
        
        {/* Content */}
        <View style={styles.totalContent}>
          <Text style={styles.totalLabel}>TOTAL ISSUES</Text>
          <Text style={styles.totalCount}>{counts.total}</Text>
          {formattedSyncTime && (
            <View style={styles.syncRow}>
              <View style={styles.syncDot} />
              <Text style={styles.totalSync}>
                Last synced {formattedSyncTime}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Stats grid */}
      <View style={styles.statsSection}>
        <View style={styles.statsSectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>By Status</Text>
          <TouchableOpacity 
            onPress={() => {
              // Navigate to IssueList tab and clear filters to show all
              useIssueStore.getState().setFilters({ status: 'all', search: '', priority: 'all' });
              navigation.navigate('IssueList');
            }}
            style={styles.viewAllBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllText, { color: c.primary }]}>View all</Text>
            <Text style={[styles.viewAllArrow, { color: c.primary }]}>→</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            label="Open"
            count={counts.open}
            color={c.statusOpen}
            bg={c.statusOpenBg}
            iconSource={require('../../assets/open.png')}
            onPress={() => goToListWithFilter('open')}
          />
          <StatCard
            label="In Progress"
            count={counts.in_progress}
            color={c.statusInProgress}
            bg={c.statusInProgressBg}
            iconSource={require('../../assets/In progress.png')}
            onPress={() => goToListWithFilter('in_progress')}
          />
          <StatCard
            label="Resolved"
            count={counts.resolved}
            color={c.statusResolved}
            bg={c.statusResolvedBg}
            iconSource={require('../../assets/resolved.png')}
            onPress={() => goToListWithFilter('resolved')}
          />
          <StatCard
            label="Closed"
            count={counts.closed}
            color={c.statusClosed}
            bg={c.statusClosedBg}
            iconSource={require('../../assets/Closed.png')}
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
        </ImageBackground>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    overflow: 'hidden',
    position: 'relative',
    minHeight: 160,
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
  totalContent: {
    alignItems: 'flex-start',
    gap: SPACING.xs,
    zIndex: 10,
  },
  bubble1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -60,
    right: -40,
  },
  bubble2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -40,
    right: 100,
  },
  bubble3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: 80,
    right: 20,
  },
  totalLabel: { 
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    letterSpacing: 1.5,
    ...fontStyles.bodyMedium,
  },
  totalCount: { 
    color: '#fff',
    fontSize: 56,
    ...fontStyles.heading,
    letterSpacing: -2,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  totalSync: { 
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
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
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    ...fontStyles.bodyMedium,
  },
  viewAllArrow: {
    fontSize: 16,
    ...fontStyles.bodyMedium,
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
  statIconImage: {
    width: 24,
    height: 24,
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
