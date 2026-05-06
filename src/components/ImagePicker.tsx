import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { ImageAttachment } from '../types';
import { fontStyles } from '../utils/fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImagePickerProps {
  attachments: ImageAttachment[];
  onAttachmentsChange: (attachments: ImageAttachment[]) => void;
  maxImages?: number;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  attachments,
  onAttachmentsChange,
  maxImages = 3,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to attach images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (attachments.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only attach up to ${maxImages} images.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Compress to reduce size
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment: ImageAttachment = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uri: asset.uri,
          name: asset.fileName || `image-${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
          addedAt: new Date().toISOString(),
        };
        onAttachmentsChange([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (attachments.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only attach up to ${maxImages} images.`);
      return;
    }

    const { status } = await ImagePickerExpo.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePickerExpo.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment: ImageAttachment = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uri: asset.uri,
          name: `photo-${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize,
          addedAt: new Date().toISOString(),
        };
        onAttachmentsChange([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (id: string) => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onAttachmentsChange(attachments.filter((img) => img.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: c.textSecondary }]}>
        Attachments ({attachments.length}/{maxImages})
      </Text>

      {/* Image Grid */}
      {attachments.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {attachments.map((img) => (
            <View key={img.id} style={[styles.imageContainer, { borderColor: c.border }]}>
              <TouchableOpacity onPress={() => setSelectedImage(img.uri)} activeOpacity={0.8}>
                <Image source={{ uri: img.uri }} style={styles.image} resizeMode="cover" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.removeBtn, { backgroundColor: c.error }]}
                onPress={() => removeImage(img.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Action Buttons */}
      {attachments.length < maxImages && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={pickImage}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🖼️</Text>
            <Text style={[styles.actionText, { color: c.text }]}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={takePhoto}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={[styles.actionText, { color: c.text }]}>Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <Text style={[styles.loadingText, { color: c.textMuted }]}>Loading...</Text>
      )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    ...fontStyles.bodyMedium,
  },
  imageScroll: {
    marginVertical: 4,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 20,
    ...fontStyles.heading,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    ...fontStyles.bodyMedium,
  },
  loadingText: {
    fontSize: 12,
    textAlign: 'center',
    ...fontStyles.body,
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
