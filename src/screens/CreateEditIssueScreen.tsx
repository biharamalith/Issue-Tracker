import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIssueStore } from '../store/issueStore';
import { useTheme } from '../hooks/useTheme';
import { Priority, Status, RootStackParamList, ImageAttachment } from '../types';
import { validateIssueForm } from '../utils/formatDate';
import { fontStyles } from '../utils/fonts';
import { ImagePicker } from '../components/ImagePicker';

type RouteProps = RouteProp<RootStackParamList, 'CreateEditIssue'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const STATUSES: Status[] = ['open', 'in_progress', 'resolved', 'closed'];

function SegmentPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.segmentItem,
              {
                backgroundColor: value === opt ? c.primary : c.surface,
                borderColor: value === opt ? c.primary : c.border,
              },
            ]}
            onPress={() => onChange(opt)}
          >
            <Text
              style={[
                styles.segmentText,
                { color: value === opt ? '#fff' : c.textSecondary },
              ]}
            >
              {opt.replace(/_/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export const CreateEditIssueScreen: React.FC = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { issueId } = route.params ?? {};

  const isEditing = !!issueId;
  const getIssueById = useIssueStore(s => s.getIssueById);
  const createIssue = useIssueStore(s => s.createIssue);
  const updateIssue = useIssueStore(s => s.updateIssue);

  const existingIssue = issueId ? getIssueById(issueId) : undefined;

  const [title, setTitle] = useState(existingIssue?.title ?? '');
  const [description, setDescription] = useState(existingIssue?.description ?? '');
  const [priority, setPriority] = useState<Priority>(existingIssue?.priority ?? 'medium');
  const [status, setStatus] = useState<Status>(existingIssue?.status ?? 'open');
  const [assignee, setAssignee] = useState(existingIssue?.assignee ?? '');
  const [attachments, setAttachments] = useState<ImageAttachment[]>(existingIssue?.attachments ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Issue' : 'New Issue' });
  }, [isEditing]);

  const handleSubmit = async () => {
    const validationErrors = validateIssueForm({ title, description });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && issueId) {
        await updateIssue(issueId, { 
          title, 
          description, 
          priority, 
          status, 
          assignee: assignee || undefined,
          attachments,
        });
        Alert.alert('Updated', 'Issue saved locally.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const newIssue = await createIssue({
          title,
          description,
          priority,
          status,
          assignee: assignee || undefined,
          attachments,
        });
        Alert.alert('Created', 'Issue saved locally and will sync when online.', [
          { text: 'View Issue', onPress: () => navigation.replace('IssueDetail', { issueId: newIssue.id }) },
          { text: 'Go Back', onPress: () => navigation.goBack() },
        ]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setErrors(e => ({ ...e, [field]: undefined as any }));
    if (field === 'title') setTitle(value);
    if (field === 'description') setDescription(value);
    if (field === 'assignee') setAssignee(value);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Title *</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: c.surface, 
                borderColor: errors.title ? c.error : c.border, 
                color: c.text,
                fontFamily: 'Satoshi-Regular',
              },
            ]}
            value={title}
            onChangeText={v => handleFieldChange('title', v)}
            placeholder="Brief description of the issue"
            placeholderTextColor={c.placeholder}
          />
          {errors.title && <Text style={[styles.fieldError, { color: c.error }]}>{errors.title}</Text>}
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Description *</Text>
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              { 
                backgroundColor: c.surface, 
                borderColor: errors.description ? c.error : c.border, 
                color: c.text,
                fontFamily: 'Satoshi-Regular',
              },
            ]}
            value={description}
            onChangeText={v => handleFieldChange('description', v)}
            placeholder="Detailed explanation of the issue, steps to reproduce, expected behavior..."
            placeholderTextColor={c.placeholder}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={[styles.fieldError, { color: c.error }]}>{errors.description}</Text>
          )}
        </View>

        {/* Priority */}
        <SegmentPicker
          label="Priority"
          options={PRIORITIES}
          value={priority}
          onChange={setPriority}
        />

        {/* Status (only when editing) */}
        {isEditing && (
          <SegmentPicker
            label="Status"
            options={STATUSES}
            value={status}
            onChange={setStatus}
          />
        )}

        {/* Assignee */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Assignee (optional)</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: c.surface, 
                borderColor: c.border, 
                color: c.text,
                fontFamily: 'Satoshi-Regular',
              },
            ]}
            value={assignee}
            onChangeText={v => handleFieldChange('assignee', v)}
            placeholder="e.g. Bihara Malith"
            placeholderTextColor={c.placeholder}
          />
        </View>

        {/* Image Attachments */}
        <ImagePicker
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          maxImages={3}
        />

        {/* Offline notice */}
        <View style={[styles.offlineBanner, { backgroundColor: c.primaryLight, borderColor: c.primary + '40' }]}>
          <Text style={[styles.offlineBannerText, { color: c.primary }]}>
            💾 This issue will be saved locally and synced when the server is available.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: c.primary }, isSaving && styles.disabled]}
          onPress={handleSubmit}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEditing ? 'Save Changes' : 'Create Issue'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  field: { gap: 6 },
  label: { fontSize: 14, ...fontStyles.bodyMedium },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    ...fontStyles.body,
  },
  textarea: { minHeight: 110 },
  fieldError: { fontSize: 12, ...fontStyles.bodyMedium },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmentItem: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  segmentText: { fontSize: 13, textTransform: 'capitalize', ...fontStyles.bodyMedium },
  offlineBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  offlineBannerText: { fontSize: 13, lineHeight: 18, ...fontStyles.body },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, ...fontStyles.headingMedium },
});
