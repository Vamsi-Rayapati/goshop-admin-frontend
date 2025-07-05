import { message, type UploadFile } from "antd";
import { useCallback, useState } from "react";
import type { ImageResponse, ImageRequest } from "../types";
import {
	completeImageUpload,
	completeImageUploadWithMerge,
	getProductImages,
	saveImageMetadata,
} from "../services/ProductImageService";

export function useProductImages(productId?: string) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [existingImages, setExistingImages] = useState<ImageResponse[]>([]);
	const [isLoadingImages, setIsLoadingImages] = useState(false);

	/**
	 * Load existing product images
	 */
	const loadProductImages = useCallback(async (id: string) => {
		if (!id) return;

		setIsLoadingImages(true);
		try {
			const response = await getProductImages(id);
			setExistingImages(response.images || []);
		} catch (error) {
			console.error("Error loading product images:", error);
			message.error("Failed to load product images");
		} finally {
			setIsLoadingImages(false);
		}
	}, []);

	/**
	 * Upload images for a product
	 */
	const uploadImages = async (
		id: string,
		files: UploadFile[],
	): Promise<boolean> => {
		if (!id || files.length === 0) {
			message.warning("Please select files to upload");
			return false;
		}

		setIsUploading(true);
		setUploadProgress(0);

		try {
			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			const result = await completeImageUpload(id, files);

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (result.success) {
				message.success(
					`Successfully uploaded ${result.images?.images.length || 0} images`,
				);

				// Show partial success warning if there were errors
				if (result.errors && result.errors.length > 0) {
					message.warning(
						`Some files failed to upload: ${result.errors.join(", ")}`,
					);
				}

				// Reload images to show the newly uploaded ones
				await loadProductImages(id);
				return true;
			} else {
				const errorMessage = result.errors?.join(", ") || "Unknown error";
				message.error(`Upload failed: ${errorMessage}`);
				return false;
			}
		} catch (error) {
			console.error("Error uploading images:", error);
			message.error("Failed to upload images");
			return false;
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	/**
	 * Upload images and merge with existing ones, sending complete list to backend
	 */
	const uploadImagesWithMerge = async (
		id: string,
		files: UploadFile[],
	): Promise<boolean> => {
		console.log("uploadImagesWithMerge called with:", {
			id,
			files: files.length,
		});

		if (!id || files.length === 0) {
			console.warn("Invalid parameters:", { id, filesLength: files.length });
			message.warning("Please select files to upload");
			return false;
		}

		setIsUploading(true);
		setUploadProgress(0);

		try {
			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			console.log("Calling completeImageUploadWithMerge...");
			const result = await completeImageUploadWithMerge(
				id,
				files,
				existingImages,
			);

			console.log("Upload result:", result);

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (result.success) {
				message.success(`Successfully uploaded ${files.length} new image(s)`);

				// Show partial success warning if there were errors
				if (result.errors && result.errors.length > 0) {
					message.warning(
						`Some files failed to upload: ${result.errors.join(", ")}`,
					);
				}

				// Reload images to show the newly uploaded ones
				await loadProductImages(id);
				return true;
			} else {
				const errorMessage = result.errors?.join(", ") || "Unknown error";
				message.error(`Upload failed: ${errorMessage}`);
				return false;
			}
		} catch (error) {
			console.error("Error uploading images:", error);
			message.error("Failed to upload images");
			return false;
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	/**
	 * Handle file upload with automatic product ID detection
	 * This will merge new images with existing ones and send the complete list
	 */
	const handleUpload = async (files: UploadFile[]): Promise<boolean> => {
		console.log("handleUpload called with:", { files, productId });

		if (!productId) {
			console.error("Product ID is missing:", productId);
			message.error("Product ID is required for image upload");
			return false;
		}

		console.log("Calling uploadImagesWithMerge...");
		return uploadImagesWithMerge(productId, files);
	};

	/**
	 * Reorder images by updating their display_order
	 */
	const reorderImages = useCallback(
		async (images: ImageResponse[]): Promise<boolean> => {
			if (!productId) {
				message.error("Product ID is required");
				return false;
			}

			try {
				const imageRequests: ImageRequest[] = images.map((img) => ({
					is_primary: img.is_primary,
					image_url: img.image_url,
					display_order: img.display_order,
				}));

				await saveImageMetadata(productId, imageRequests);
				setExistingImages(images);
				message.success("Images reordered successfully");
				return true;
			} catch (error) {
				console.error("Error reordering images:", error);
				message.error("Failed to reorder images");
				return false;
			}
		},
		[productId],
	);

	/**
	 * Set an image as primary
	 */
	const setPrimaryImage = useCallback(
		async (imageId: string): Promise<boolean> => {
			if (!productId) {
				message.error("Product ID is required");
				return false;
			}

			try {
				const updatedImages = existingImages.map((img) => ({
					...img,
					is_primary: img.id === imageId,
				}));

				const imageRequests: ImageRequest[] = updatedImages.map((img) => ({
					is_primary: img.is_primary,
					image_url: img.image_url,
					display_order: img.display_order,
				}));

				await saveImageMetadata(productId, imageRequests);
				setExistingImages(updatedImages);
				message.success("Primary image updated successfully");
				return true;
			} catch (error) {
				console.error("Error setting primary image:", error);
				message.error("Failed to set primary image");
				return false;
			}
		},
		[productId, existingImages],
	);

	/**
	 * Delete an image
	 */
	const deleteImage = useCallback(
		async (imageId: string): Promise<boolean> => {
			if (!productId) {
				message.error("Product ID is required");
				return false;
			}

			try {
				const filteredImages = existingImages.filter(
					(img) => img.id !== imageId,
				);

				// Recalculate display_order and ensure there's a primary image
				const reorderedImages = filteredImages.map((img, index) => ({
					...img,
					display_order: index + 1,
					is_primary: index === 0 || img.is_primary, // First image becomes primary if we deleted the primary
				}));

				// If we deleted the primary image, make the first one primary
				if (
					filteredImages.length > 0 &&
					!filteredImages.some((img) => img.is_primary)
				) {
					reorderedImages[0].is_primary = true;
				}

				const imageRequests: ImageRequest[] = reorderedImages.map((img) => ({
					is_primary: img.is_primary,
					image_url: img.image_url,
					display_order: img.display_order,
				}));

				await saveImageMetadata(productId, imageRequests);
				setExistingImages(reorderedImages);
				message.success("Image deleted successfully");
				return true;
			} catch (error) {
				console.error("Error deleting image:", error);
				message.error("Failed to delete image");
				return false;
			}
		},
		[productId, existingImages],
	);

	return {
		// State
		isUploading,
		uploadProgress,
		existingImages,
		isLoadingImages,

		// Actions
		uploadImages,
		handleUpload,
		loadProductImages,
		reorderImages,
		setPrimaryImage,
		deleteImage,
	};
}
