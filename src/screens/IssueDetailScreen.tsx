import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIssueStore } from '../store/issueStore';
import { useTheme } from '../hooks/useTheme';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CustomAlert } from '../components/CustomAlert';
import { RootStackParamList } from '../types';
import { formatDate } from '../utils/formatDate';
import { fontStyles } from '../utils/fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type RouteProps = RouteProp<RootStackParamList, 'IssueDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.infoRow, { borderBottomColor: c.divider }]}>
      <Text style={[styles.infoLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.text }]}>{value}</Text>
    </View>
  );
};

export const IssueDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { issueId } = route.params;

  const getIssueById = useIssueStore(s => s.getIssueById);
  const markInProgress = useIssueStore(s => s.markInProgress);
  const resolveIssue = useIssueStore(s => s.resolveIssue);
  const closeIssue = useIssueStore(s => s.closeIssue);
  const deleteIssue = useIssueStore(s => s.deleteIssue);
  const exportToJSON = useIssueStore(s => s.exportToJSON);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showInProgressAlert, setShowInProgressAlert] = useState(false);
  const [showResolveAlert, setShowResolveAlert] = useState(false);
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const issue = getIssueById(issueId);

  if (!issue) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={styles.notFoundIcon}>🚫</Text>
        <Text style={[styles.notFoundText, { color: c.text }]}>Issue not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: c.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleInProgress = () => {
    setShowInProgressAlert(true);
  };

  const handleResolve = () => {
    setShowResolveAlert(true);
  };

  const handleClose = () => {
    setShowCloseAlert(true);
  };

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const handleShare = async () => {
    await Share.share({
      title: issue.title,
      message: `Issue: ${issue.title}\nStatus: ${issue.status}\nPriority: ${issue.priority}\n\n${issue.description}`,
    });
  };

  const canMarkInProgress = issue.status === 'open';
  const canResolve = issue.status === 'open' || issue.status === 'in_progress';
  const canClose = issue.status !== 'closed';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Pending sync indicator */}
      {issue.pendingSync && (
        <View style={[styles.syncBanner, { backgroundColor: c.warning + '22', borderColor: c.warning }]}>
          <Text style={[styles.syncBannerText, { color: c.warning }]}>
            ⏳ This issue has unsaved changes pending sync
          </Text>
        </View>
      )}

      {/* Title card */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>{issue.title}</Text>
        <View style={styles.badges}>
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </View>
      </View>

      {/* Description */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>Description</Text>
        <Text style={[styles.description, { color: c.text }]}>{issue.description}</Text>
      </View>

      {/* Attachments */}
      {issue.attachments && issue.attachments.length > 0 && (
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
            Attachments ({issue.attachments.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {issue.attachments.map((img) => (
              <TouchableOpacity
                key={img.id}
                style={[styles.imageContainer, { borderColor: c.border }]}
                onPress={() => setSelectedImage(img.uri)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img.uri }} style={styles.image} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Metadata */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>Details</Text>
        <InfoRow label="Assignee" value={issue.assignee ?? 'Unassigned'} />
        <InfoRow label="Created" value={formatDate(issue.createdAt)} />
        <InfoRow label="Updated" value={formatDate(issue.updatedAt)} />
        <InfoRow label="ID" value={issue.id} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: c.primary }]}
          onPress={() => navigation.navigate('CreateEditIssue', { issueId: issue.id })}
        >
          <Text style={styles.actionBtnText}>✏️  Edit Issue</Text>
        </TouchableOpacity>

        {canMarkInProgress && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.statusInProgress }]}
            onPress={handleInProgress}
          >
            <Text style={styles.actionBtnText}>⏳  Mark In Progress</Text>
          </TouchableOpacity>
        )}

        {canResolve && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.success }]}
            onPress={handleResolve}
          >
            <Text style={styles.actionBtnText}>✅  Mark Resolved</Text>
          </TouchableOpacity>
        )}

        {canClose && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.statusClosed, borderColor: c.border }]}
            onPress={handleClose}
          >
            <Text style={styles.actionBtnText}>🔒  Close Issue</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: c.info }]}
          onPress={handleShare}
        >
          <Text style={styles.actionBtnText}>📤  Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn, { borderColor: c.error }]}
          onPress={handleDelete}
        >
          <Text style={[styles.actionBtnText, { color: c.error }]}>🗑️  Delete Issue</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <View style={styles.modalContent}>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
          
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: c.error }]}
            onPress={() => setSelectedImage(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Custom Alerts */}
      <CustomAlert
        visible={showInProgressAlert}
        title="Mark as In Progress"
        message="Are you sure you want to mark this issue as in progress?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowInProgressAlert(false) },
          {
            text: 'Mark In Progress',
            onPress: async () => {
              setShowInProgressAlert(false);
              await markInProgress(issue.id);
            },
          },
        ]}
        onDismiss={() => setShowInProgressAlert(false)}
      />

      <CustomAlert
        visible={showResolveAlert}
        title="Mark as Resolved"
        message="Are you sure you want to mark this issue as resolved?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowResolveAlert(false) },
          {
            text: 'Resolve',
            onPress: async () => {
              setShowResolveAlert(false);
              await resolveIssue(issue.id);
            },
          },
        ]}
        onDismiss={() => setShowResolveAlert(false)}
      />

      <CustomAlert
        visible={showCloseAlert}
        title="Close Issue"
        message="This will mark the issue as closed. Continue?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowCloseAlert(false) },
          {
            text: 'Close Issue',
            style: 'destructive',
            onPress: async () => {
              setShowCloseAlert(false);
              await closeIssue(issue.id);
            },
          },
        ]}
        onDismiss={() => setShowCloseAlert(false)}
      />

      <CustomAlert
        visible={showDeleteAlert}
        title="Delete Issue"
        message="This action cannot be undone. Are you sure?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowDeleteAlert(false) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setShowDeleteAlert(false);
              await deleteIssue(issue.id);
              navigation.goBack();
            },
          },
        ]}
        onDismiss={() => setShowDeleteAlert(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundIcon: { fontSize: 48 },
  notFoundText: { fontSize: 18, ...fontStyles.headingMedium },
  syncBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  syncBannerText: { fontSize: 13, ...fontStyles.bodyMedium },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  title: { fontSize: 20, lineHeight: 28, ...fontStyles.heading },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sectionTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, ...fontStyles.bodyBold },
  description: { fontSize: 15, lineHeight: 23, ...fontStyles.body },
  imageScroll: {
    marginTop: 8,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 14, ...fontStyles.body },
  infoValue: { fontSize: 14, ...fontStyles.bodyMedium },
  actions: { gap: 10 },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontSize: 15, ...fontStyles.headingMedium },
  deleteBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 26,
    ...fontStyles.heading,
  },
});
