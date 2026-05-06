import * as FileSystem from 'expo-file-system/legacy';
import { ImageAttachment } from '../types';

/**
 * Convert image URI to base64 string for storage
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image');
  }
};

/**
 * Convert base64 string back to data URI for display
 */
export const base64ToDataUri = (base64: string, mimeType: string = 'image/jpeg'): string => {
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Prepare attachments for Firebase storage (convert to base64)
 */
export const prepareAttachmentsForFirebase = async (
  attachments: ImageAttachment[]
): Promise<ImageAttachment[]> => {
  const prepared: ImageAttachment[] = [];

  for (const attachment of attachments) {
    try {
      // If URI is already base64, keep it
      if (attachment.uri.startsWith('data:')) {
        prepared.push(attachment);
        continue;
      }

      // Convert file URI to base64
      const base64 = await imageToBase64(attachment.uri);
      const dataUri = base64ToDataUri(base64, attachment.type);

      prepared.push({
        ...attachment,
        uri: dataUri, // Store as data URI
      });
    } catch (error) {
      console.error('Error preparing attachment:', attachment.id, error);
      // Skip failed images
    }
  }

  return prepared;
};

/**
 * Prepare attachments from Firebase (already base64, just return)
 */
export const prepareAttachmentsFromFirebase = (
  attachments: ImageAttachment[]
): ImageAttachment[] => {
  // Attachments from Firebase are already in base64 data URI format
  return attachments;
};

/**
 * Estimate base64 size in KB
 */
export const estimateBase64Size = (base64: string): number => {
  // Base64 is roughly 4/3 the size of original
  return Math.round((base64.length * 3) / 4 / 1024);
};
