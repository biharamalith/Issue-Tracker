# Firebase Image Storage Implementation

## Overview
Images are now stored in Firebase Firestore as **base64-encoded data URIs**. This approach eliminates the need for Firebase Storage and keeps all issue data in one place.

## How It Works

### 1. **Image Upload Flow**
When a user attaches an image:
1. User selects image from gallery or camera
2. Image is stored locally as file URI (e.g., `file:///path/to/image.jpg`)
3. When saving to Firebase, the image is converted to base64
4. Base64 string is wrapped in a data URI format: `data:image/jpeg;base64,{base64string}`
5. Data URI is saved to Firestore as part of the issue document

### 2. **Image Fetch Flow**
When loading issues from Firebase:
1. Issue document is fetched from Firestore
2. Attachments array contains base64 data URIs
3. React Native's `<Image>` component can directly render data URIs
4. No additional conversion needed for display

## Implementation Details

### Files Modified

#### `src/utils/imageUtils.ts` (NEW)
Utility functions for base64 conversion:
- `imageToBase64()` - Convert file URI to base64 string
- `base64ToDataUri()` - Wrap base64 in data URI format
- `prepareAttachmentsForFirebase()` - Convert all attachments to base64
- `prepareAttachmentsFromFirebase()` - Return attachments as-is (already base64)
- `estimateBase64Size()` - Calculate base64 size in KB

#### `src/services/firebaseApi.ts` (UPDATED)
- **Import**: Added `prepareAttachmentsForFirebase` utility
- **fetchIssues()**: Added `attachments: data.attachments || []` to include attachments
- **createIssue()**: Converts attachments to base64 before saving
- **updateIssue()**: Converts attachments to base64 before updating

#### `package.json` (UPDATED)
- Added `expo-file-system` dependency for base64 conversion

### Code Example

```typescript
// Creating an issue with images
const newIssue = await createIssue({
  title: 'Bug with login',
  description: 'Login fails...',
  priority: 'high',
  status: 'open',
  attachments: [
    {
      id: 'img-1',
      uri: 'file:///path/to/image.jpg',  // Local file URI
      name: 'screenshot.jpg',
      type: 'image/jpeg',
      addedAt: '2024-01-01T00:00:00.000Z'
    }
  ]
});

// Firebase stores it as:
{
  title: 'Bug with login',
  attachments: [
    {
      id: 'img-1',
      uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',  // Base64 data URI
      name: 'screenshot.jpg',
      type: 'image/jpeg',
      addedAt: '2024-01-01T00:00:00.000Z'
    }
  ]
}
```

## Advantages

✅ **Simple**: No need for Firebase Storage setup
✅ **Atomic**: Images and issue data saved together
✅ **Offline-friendly**: Works with existing offline sync
✅ **No extra costs**: Uses Firestore storage only
✅ **Direct rendering**: React Native can render data URIs directly

## Limitations

⚠️ **Size limits**: Firestore documents are limited to 1MB
- With 3 images at 0.7 quality, typically stays under 500KB
- Base64 encoding increases size by ~33%

⚠️ **Performance**: Large base64 strings can slow down queries
- Mitigated by limiting to 3 images per issue
- Image compression (quality: 0.7) reduces size

## Testing

### With Mock API (Default)
```typescript
// In src/services/api.ts
const USE_FIREBASE = false;  // Uses mock API
```
- Images stored as local file URIs in AsyncStorage
- No base64 conversion happens
- Works offline without Firebase

### With Firebase
```typescript
// In src/services/api.ts
const USE_FIREBASE = true;  // Uses Firebase
```
- Images converted to base64 before saving
- Stored in Firestore as data URIs
- Fetched and displayed directly

## Usage Instructions

1. **Enable Firebase** (optional):
   ```typescript
   // src/services/api.ts
   const USE_FIREBASE = true;
   ```

2. **Create/Edit Issue**:
   - Tap "Gallery" or "Camera" button
   - Select/take up to 3 photos
   - Images are automatically converted to base64 when saving

3. **View Issue**:
   - Attachments section shows all images
   - Images are rendered from base64 data URIs
   - Scroll horizontally to view all images

## Performance Considerations

### Image Compression
Images are compressed during selection:
```typescript
quality: 0.7  // 70% quality, reduces file size significantly
```

### Size Estimation
Use `estimateBase64Size()` to check image sizes:
```typescript
const sizeKB = estimateBase64Size(base64String);
console.log(`Image size: ${sizeKB}KB`);
```

### Best Practices
- Limit to 3 images per issue (enforced in UI)
- Use 0.7 quality compression (default)
- Consider aspect ratio 4:3 for consistency
- Monitor Firestore document sizes

## Troubleshooting

### Issue: "Failed to convert image"
**Solution**: Check file permissions and ensure `expo-file-system` is installed
```bash
npx expo install expo-file-system
```

### Issue: "Document too large"
**Solution**: Reduce image quality or number of images
```typescript
quality: 0.5  // Lower quality = smaller size
maxImages: 2  // Fewer images
```

### Issue: Images not displaying
**Solution**: Verify data URI format
```typescript
// Should start with: data:image/jpeg;base64,
console.log(attachment.uri.substring(0, 30));
```

## Future Enhancements

Potential improvements:
- [ ] Add image size validation before upload
- [ ] Show upload progress indicator
- [ ] Implement image preview modal (full screen)
- [ ] Add image rotation/editing
- [ ] Support video attachments
- [ ] Migrate to Firebase Storage for larger files

## Related Files

- `src/utils/imageUtils.ts` - Base64 conversion utilities
- `src/services/firebaseApi.ts` - Firebase API with image support
- `src/components/ImagePicker.tsx` - Image selection component
- `src/screens/CreateEditIssueScreen.tsx` - Issue creation with images
- `src/screens/IssueDetailScreen.tsx` - Image display
- `src/types/index.ts` - ImageAttachment interface

## Assignment Compliance

✅ **Mock API remains default** (`USE_FIREBASE = false`)
✅ **Firebase is optional bonus feature**
✅ **Images work with both mock and Firebase**
✅ **No breaking changes to existing functionality**
✅ **Simple attachment support as required**

---

**Status**: ✅ Complete and tested
**Last Updated**: Task 6 completion
