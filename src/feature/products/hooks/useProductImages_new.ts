import { message, type UploadFile } from "antd";
import { useCallback, useState, useEffect } from "react";
import type { ImageResponse, Product } from "../types";
import {
	uploadImagesAndUpdateProduct,
	updateProductImagePrimary,
} from "../services/ProductImageService";

export function useProductImages(
	productId?: string,
	savedProduct?: Product | null,
	onProductUpdate?: (product: Product) => void,
) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [existingImages, setExistingImages] = useState<ImageResponse[]>([]);

	// Update existing images when saved product changes
	useEffect(() => {
		if (savedProduct?.images) {
			console.log(
				"Updating existingImages from savedProduct:",
				savedProduct.images,
			);
			setExistingImages(savedProduct.images);
		}
	}, [savedProduct?.images]);

	/**
	 * Upload images and update product
	 */
	const handleUpload = async (files: UploadFile[]): Promise<boolean> => {
		console.log("handleUpload called with:", {
			files: files.length,
			productId,
		});

		if (!productId) {
			console.error("Product ID is missing:", productId);
			message.error("Product ID is required for image upload");
			return false;
		}

		console.log("Calling uploadImagesAndUpdateProduct...");
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

			const result = await uploadImagesAndUpdateProduct(
				productId,
				files,
				existingImages,
			);

			console.log("Upload result:", result);

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (result.success && result.product) {
				message.success(`Successfully uploaded ${files.length} new image(s)`);

				// Update the existing images from the response
				if (result.product.images) {
					setExistingImages(result.product.images);
				}

				// Notify parent component about product update
				if (onProductUpdate) {
					onProductUpdate(result.product);
				}

				// Show partial success warning if there were errors
				if (result.errors && result.errors.length > 0) {
					message.warning(
						`Some files failed to upload: ${result.errors.join(", ")}`,
					);
				}

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
	 * Set primary image
	 */
	const setPrimaryImage = useCallback(
		async (imageId: string): Promise<boolean> => {
			if (!productId) {
				message.error("Product ID is required");
				return false;
			}

			try {
				const result = await updateProductImagePrimary(
					productId,
					imageId,
					existingImages,
				);

				if (result.success && result.product) {
					message.success("Primary image updated successfully");

					// Update existing images
					if (result.product.images) {
						setExistingImages(result.product.images);
					}

					// Notify parent component
					if (onProductUpdate) {
						onProductUpdate(result.product);
					}

					return true;
				} else {
					message.error(result.error || "Failed to update primary image");
					return false;
				}
			} catch (error) {
				console.error("Error setting primary image:", error);
				message.error("Failed to update primary image");
				return false;
			}
		},
		[productId, existingImages, onProductUpdate],
	);

	return {
		// State
		isUploading,
		uploadProgress,
		existingImages,

		// Actions
		handleUpload,
		setPrimaryImage,
	};
}
