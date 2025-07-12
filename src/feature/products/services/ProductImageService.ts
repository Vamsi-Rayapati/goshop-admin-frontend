import type { UploadFile } from "antd";
import apiService from "../../base/utils/ApiService";
import { PRESIGNED_URL_API, PRODUCTS_API } from "../constants";
import type {
	ImageRequest,
	ImageResponse,
	Product,
	UploadSignedUrlRequest,
	UploadSignedUrlResponse,
} from "../types";

/**
 * Get presigned URL for S3 upload
 */
export async function getPresignedUrl(
	key: string,
	fileName: string,
	contentType: string,
): Promise<UploadSignedUrlResponse> {
	console.log("getPresignedUrl called:", { key, fileName, contentType });

	const requestData = {
		key,
		file_name: fileName,
		content_type: contentType,
	} as UploadSignedUrlRequest;

	console.log(
		"Making API request to:",
		PRESIGNED_URL_API,
		"with data:",
		requestData,
	);

	const response = await apiService.request<UploadSignedUrlResponse>({
		url: PRESIGNED_URL_API,
		method: "POST",
		data: requestData,
	});

	console.log("getPresignedUrl response:", response.data);
	return response.data;
}

/**
 * Upload file to S3 using presigned URL
 */
export async function uploadToS3(
	presignedUrl: string,
	file: File,
	contentType: string,
): Promise<void> {
	console.log("uploadToS3 called:", {
		presignedUrl,
		fileName: file.name,
		contentType,
		fileSize: file.size,
	});

	const response = await fetch(presignedUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": contentType,
		},
	});

	console.log("S3 upload response:", {
		status: response.status,
		statusText: response.statusText,
	});

	if (!response.ok) {
		throw new Error(
			`S3 upload failed: ${response.status} ${response.statusText}`,
		);
	}
}

/**
 * Upload files and update product with new images
 */
export async function uploadImagesAndUpdateProduct(
	productId: string,
	files: UploadFile[],
	existingImages: ImageResponse[] = [],
): Promise<{
	success: boolean;
	product?: Product;
	errors?: string[];
}> {
	console.log("uploadImagesAndUpdateProduct called:", {
		productId,
		files: files.length,
		existingImages: existingImages.length,
	});

	try {
		const uploadedImages: ImageRequest[] = [];
		const errors: string[] = [];

		// Upload each file to S3
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			console.log(`Processing file ${i + 1}/${files.length}:`, file.name);

			if (!file.originFileObj) {
				console.error("File originFileObj missing:", file);
				errors.push(`File ${file.name} is not valid`);
				continue;
			}

			try {
				// Generate key for S3
				const key = `product`;
				console.log("Generated S3 key:", key);

				// Get presigned URL
				console.log("Getting presigned URL...");
				const presignedData = await getPresignedUrl(
					key,
					file.name,
					file.type || "image/jpeg",
				);
				console.log("Presigned URL received:", presignedData);

				// Upload to S3
				console.log("Uploading to S3...");
				await uploadToS3(
					presignedData.upload_url,
					file.originFileObj,
					file.type || "image/jpeg",
				);
				console.log("S3 upload completed successfully");

				// Determine slot position from file UID
				const slotIndex = file.uid.includes("-")
					? parseInt(file.uid.split("-").pop() || "0")
					: i;

				// Add to uploaded images list
				uploadedImages.push({
					is_primary: slotIndex === 0, // First slot is primary
					image_url: presignedData.public_url,
					display_order: slotIndex + 1, // 1-based
				});

				console.log("Added image to uploadedImages:", {
					slotIndex,
					display_order: slotIndex + 1,
					is_primary: slotIndex === 0,
				});
			} catch (error) {
				console.error(`Error uploading file ${file.name}:`, error);
				errors.push(`Failed to upload ${file.name}: ${error}`);
			}
		}

		if (uploadedImages.length === 0) {
			return {
				success: false,
				errors: errors.length > 0 ? errors : ["No files uploaded"],
			};
		}

		// Merge with existing images
		console.log("Merging with existing images...");
		const existingImageMap = new Map<number, ImageRequest>();
		existingImages.forEach((img) => {
			existingImageMap.set(img.display_order, {
				is_primary: img.is_primary,
				image_url: img.image_url,
				display_order: img.display_order,
			});
		});

		// Add new images, potentially overwriting slots
		uploadedImages.forEach((newImg) => {
			existingImageMap.set(newImg.display_order, newImg);
		});

		// Convert to array and sort
		const allImages = Array.from(existingImageMap.values()).sort(
			(a, b) => a.display_order - b.display_order,
		);

		// Ensure one primary image
		const hasPrimary = allImages.some((img) => img.is_primary);
		if (!hasPrimary && allImages.length > 0) {
			allImages[0].is_primary = true;
		}

		console.log("Final image list to update product:", allImages);

		// Update product with new images
		const response = await apiService.request<Product>({
			url: `${PRODUCTS_API}/${productId}`,
			method: "PUT",
			data: {
				images: allImages,
			},
		});

		console.log("Product update response:", response.data);

		return {
			success: true,
			product: response.data,
			errors: errors.length > 0 ? errors : undefined,
		};
	} catch (error) {
		console.error("Error in uploadImagesAndUpdateProduct:", error);
		return {
			success: false,
			errors: [`Upload failed: ${error}`],
		};
	}
}

/**
 * Update product image primary status
 */
export async function updateProductImagePrimary(
	productId: string,
	imageId: string,
	existingImages: ImageResponse[],
): Promise<{
	success: boolean;
	product?: Product;
	error?: string;
}> {
	try {
		// Update primary status in existing images
		const updatedImages = existingImages.map((img) => ({
			is_primary: img.id === imageId,
			image_url: img.image_url,
			display_order: img.display_order,
		}));

		// Update product
		const response = await apiService.request<Product>({
			url: `${PRODUCTS_API}/${productId}`,
			method: "PUT",
			data: {
				images: updatedImages,
			},
		});

		return {
			success: true,
			product: response.data,
		};
	} catch (error) {
		console.error("Error updating primary image:", error);
		return {
			success: false,
			error: `Failed to update primary image: ${error}`,
		};
	}
}
