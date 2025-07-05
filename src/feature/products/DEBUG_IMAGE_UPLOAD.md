# Image Upload Flow - Debugging Guide

## Expected Behavior:

### Add Mode:
1. User fills out product form
2. User selects images (stored locally, no API call yet)
3. User submits product form → Product created
4. "Upload Images" button becomes available
5. User clicks "Upload Images" → API calls triggered:
   - GET presigned URLs
   - Upload files to S3
   - POST image metadata to backend

### Edit Mode:
1. Product data loaded automatically
2. Existing images loaded and displayed
3. "Upload Images" button available immediately
4. User selects new images
5. User clicks "Upload Images" → API calls triggered immediately

## Debug Steps:

1. **Check if button is visible:**
   - In Edit mode: Button should be visible if `savedProduct` exists
   - In Add mode: Button should be visible after product is created

2. **Check if button click triggers console logs:**
   - Look for "Upload button clicked with files:" in console
   - Look for "Upload function available:" in console

3. **Check if upload function is called:**
   - Look for "Uploading images for product:" in console (from useProductImages)

4. **Check API calls:**
   - Should see POST to `/catalog/api/v1/upload/presigned-url`
   - Should see PUT requests to S3
   - Should see POST to `/catalog/api/v1/products/{id}/images`

## Common Issues:
- **Button not visible:** Check if `savedProduct` is set properly in edit mode
- **No API calls:** Check if `onUploadImages` function is passed correctly
- **Upload fails:** Check if product ID is available in useProductImages hook
