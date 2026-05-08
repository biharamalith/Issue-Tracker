import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIssueStore } from '../store/issueStore';
import { useTheme } from '../hooks/useTheme';
import { IssueCard } from '../components/IssueCard';
import { NetworkStatusBar } from '../components/NetworkStatusBar';
import { RootStackParamList, Status, Priority } from '../types';
import { fontStyles } from '../utils/fonts';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_OPTIONS: Array<Status | 'all'> = ['all', 'open', 'in_progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS: Array<Priority | 'all'> = ['all', 'low', 'medium', 'high', 'critical'];

const capitalize = (s: string) =>
  s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const IssueListScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<Nav>();

  const {
    fetchFromApi,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    getFilteredIssues,
  } = useIssueStore();

  const filteredIssues = getFilteredIssues();
  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || !!filters.search;

  const handleRefresh = useCallback(() => {
    fetchFromApi();
  }, []);

  // Loading state
  if (isLoading && filteredIssues.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loadingText, { color: c.textSecondary }]}>Fetching issues...</Text>
      </View>
    );
  }

  // Error state
  if (error && filteredIssues.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorTitle, { color: c.text }]}>Something went wrong</Text>
        <Text style={[styles.errorMsg, { color: c.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: c.primary }]} onPress={handleRefresh}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.surface }]}>
      {isDark ? (
        // Dark mode: Use solid background color
        <View style={[styles.backgroundImage, { backgroundColor: c.background }]}>
          <View style={styles.container}>
            {/* Custom Header */}
            <View style={[styles.customHeader, { backgroundColor: c.surface }]}>
              <Text style={[styles.headerTitle, { color: c.text }]}>Issues</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateEditIssue', {})}
                style={[styles.addButton, { backgroundColor: c.primary }]}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            {/* Network Status Bar */}
            <NetworkStatusBar />

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={[
            styles.searchInput, 
            { 
              backgroundColor: c.surface, 
              borderColor: c.border, 
              color: c.text,
              fontFamily: 'Satoshi-Regular',
            }
          ]}
          placeholder="Search issues..."
          placeholderTextColor={c.placeholder}
          value={filters.search}
          onChangeText={v => setFilters({ search: v })}
          clearButtonMode="while-editing"
        />
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: c.error + '22' }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearBtnText, { color: c.error }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status filter chips */}
      <View style={styles.chipScroll}>
        <FlatList
          horizontal
          data={STATUS_OPTIONS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: filters.status === item ? c.primary : c.surface,
                  borderColor: filters.status === item ? c.primary : c.border,
                },
              ]}
              onPress={() => setFilters({ status: item })}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: filters.status === item ? '#fff' : c.textSecondary },
                ]}
              >
                {capitalize(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Priority filter chips */}
      <View style={styles.chipScroll}>
        <FlatList
          horizontal
          data={PRIORITY_OPTIONS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: filters.priority === item ? c.primary : c.surface,
                  borderColor: filters.priority === item ? c.primary : c.border,
                },
              ]}
              onPress={() => setFilters({ priority: item as any })}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: filters.priority === item ? '#fff' : c.textSecondary },
                ]}
              >
                {capitalize(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Result count */}
      <Text style={[styles.resultCount, { color: c.textMuted }]}>
        {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''}
        {hasActiveFilters ? ' (filtered)' : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filteredIssues}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={c.primary} />
        }
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No issues found</Text>
            <Text style={[styles.emptyMsg, { color: c.textSecondary }]}>
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Create your first issue to get started'}
            </Text>
            {!hasActiveFilters && (
              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: c.primary }]}
                onPress={() => navigation.navigate('CreateEditIssue', {})}
              >
                <Text style={styles.createBtnText}>+ Create Issue</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('CreateEditIssue', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Light mode: Use background image
        <ImageBackground
          source={require('../../assets/homegb.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.container}>
            {/* Custom Header */}
            <View style={[styles.customHeader, { backgroundColor: c.surface }]}>
              <Text style={[styles.headerTitle, { color: c.text }]}>Issues</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateEditIssue', {})}
                style={[styles.addButton, { backgroundColor: c.primary }]}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            {/* Network Status Bar */}
            <NetworkStatusBar />

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={[
            styles.searchInput, 
            { 
              backgroundColor: c.surface, 
              borderColor: c.border, 
              color: c.text,
              fontFamily: 'Satoshi-Regular',
            }
          ]}
          placeholder="Search issues..."
          placeholderTextColor={c.placeholder}
          value={filters.search}
          onChangeText={v => setFilters({ search: v })}
          clearButtonMode="while-editing"
        />
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: c.error + '22' }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearBtnText, { color: c.error }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status filter chips */}
      <View style={styles.chipScroll}>
        <FlatList
          horizontal
          data={STATUS_OPTIONS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: filters.status === item ? c.primary : c.surface,
                  borderColor: filters.status === item ? c.primary : c.border,
                },
              ]}
              onPress={() => setFilters({ status: item })}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: filters.status === item ? '#fff' : c.textSecondary },
                ]}
              >
                {capitalize(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Priority filter chips */}
      <View style={styles.chipScroll}>
        <FlatList
          horizontal
          data={PRIORITY_OPTIONS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: filters.priority === item ? c.primary : c.surface,
                  borderColor: filters.priority === item ? c.primary : c.border,
                },
              ]}
              onPress={() => setFilters({ priority: item as any })}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: filters.priority === item ? '#fff' : c.textSecondary },
                ]}
              >
                {capitalize(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Result count */}
      <Text style={[styles.resultCount, { color: c.textMuted }]}>
        {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''}
        {hasActiveFilters ? ' (filtered)' : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filteredIssues}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={c.primary} />
        }
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No issues found</Text>
            <Text style={[styles.emptyMsg, { color: c.textSecondary }]}>
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Create your first issue to get started'}
            </Text>
            {!hasActiveFilters && (
              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: c.primary }]}
                onPress={() => navigation.navigate('CreateEditIssue', {})}
              >
                <Text style={styles.createBtnText}>+ Create Issue</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('CreateEditIssue', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
          </View>
        </ImageBackground>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: { flex: 1 },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    ...fontStyles.heading,
    letterSpacing: -0.5,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    ...fontStyles.headingMedium,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontSize: 14, marginTop: 8, ...fontStyles.body },
  errorIcon: { fontSize: 48 },
  errorTitle: { fontSize: 18, ...fontStyles.headingMedium },
  errorMsg: { fontSize: 14, textAlign: 'center', ...fontStyles.body },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  retryText: { color: '#fff', ...fontStyles.headingMedium },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    ...fontStyles.body,
  },
  clearBtn: { borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center' },
  clearBtnText: { fontSize: 13, ...fontStyles.bodyMedium },
  chipScroll: { paddingBottom: 4 },
  chipContainer: { paddingHorizontal: 16, gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13, ...fontStyles.bodyMedium },
  resultCount: { fontSize: 12, paddingHorizontal: 16, paddingBottom: 4, ...fontStyles.body },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, ...fontStyles.headingMedium },
  emptyMsg: { fontSize: 14, textAlign: 'center', ...fontStyles.body },
  createBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  createBtnText: { color: '#fff', ...fontStyles.headingMedium },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,  // Moved up to avoid bottom navbar (was 24)
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: { 
    fontSize: 28, 
    color: '#fff', 
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: -2,  // Fine-tune vertical centering
  },
});
