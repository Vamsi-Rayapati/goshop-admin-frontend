# Product Image Upload Integration

This integration provides complete S3-based image upload functionality for products using presigned URLs.

## Components Overview

### 1. Types (`types.ts`)
- `UploadSignedUrlRequest`: Request for presigned URL
- `UploadSignedUrlResponse`: Response with upload URL and file path
- `ImageRequest`: Image metadata for backend
- `PostImagesRequest/Response`: Batch image operations
- `GetImagesResponse`: Retrieve existing images

### 2. Service (`ProductImageService.ts`)
- `getPresignedUrl()`: Get presigned URL from backend
- `uploadToS3()`: Upload file directly to S3
- `uploadFiles()`: Process multiple files and upload to S3
- `saveImageMetadata()`: Save image metadata to backend
- `getProductImages()`: Retrieve existing product images
- `completeImageUpload()`: Complete end-to-end upload process

### 3. Hook (`useProductImages.ts`)
- Manages upload state (loading, progress, errors)
- Provides functions for uploading and loading images
- Integrates with the service layer

### 4. Enhanced Components
- `ProductImageUpload`: Enhanced with upload progress, existing images display
- `ProductForm`: Integrated with image upload functionality
- `useProductForm`: Enhanced to handle image uploads after product creation

## API Integration

### Backend Endpoints
```
POST /catalog/api/v1/upload/presigned-url
GET  /catalog/api/v1/products/:id/images
POST /catalog/api/v1/products/:id/images
```

### Request/Response Flow
1. User selects files in `ProductImageUpload` component
2. Files are stored in local state until product is saved
3. After product creation/update, files are processed:
   - Generate S3 keys using product ID
   - Request presigned URLs from backend
   - Upload files directly to S3 using presigned URLs
   - Save image metadata to backend with S3 URLs
4. Existing images are loaded and displayed

## Usage

### In Add Product Mode
1. User fills product form
2. User selects images (stored locally)
3. User submits form → product created
4. Images automatically uploaded to S3
5. Image metadata saved to backend

### In Edit Product Mode
1. Product data loaded
2. Existing images displayed
3. User can add new images
4. New images uploaded when "Upload Images" clicked

## Features
- ✅ S3 presigned URL integration
- ✅ Progress tracking
- ✅ Error handling
- ✅ Existing images display
- ✅ Primary image marking
- ✅ Display order management
- ✅ File validation
- ✅ Responsive UI
- ✅ TypeScript support
