import type { UploadFile } from "antd";
import apiService from "../../base/utils/ApiService";
import { PRESIGNED_URL_API, PRODUCTS_API } from "../constants";
import type {
	GetImagesResponse,
	ImageRequest,
	ImageResponse,
	PostImagesRequest,
	PostImagesResponse,
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
 * Process and upload files to S3 with slot-based ordering
 */
export async function uploadFiles(
	files: UploadFile[],
	productKey: string,
): Promise<{ uploadedImages: ImageRequest[]; errors: string[] }> {
	console.log("uploadFiles called:", { files: files.length, productKey });

	const uploadedImages: ImageRequest[] = [];
	const errors: string[] = [];

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

			// For slot-based upload, determine the slot position from the file's uid
			// The uid format is expected to be like "timestamp-slotIndex"
			const slotIndex = file.uid.includes("-")
				? parseInt(file.uid.split("-").pop() || "0")
				: i;

			// Add to uploaded images list
			uploadedImages.push({
				is_primary: slotIndex === 0, // First slot (index 0) is primary
				image_url: presignedData.public_url, // Use the public_url from response
				display_order: slotIndex + 1, // Display order is 1-based
			});
		} catch (error) {
			console.error(`Error uploading file ${file.name}:`, error);
			errors.push(`Failed to upload ${file.name}`);
		}
	}

	return { uploadedImages, errors };
}

/**
 * Save image metadata to backend
 */
export async function saveImageMetadata(
	productId: string,
	images: ImageRequest[],
): Promise<PostImagesResponse> {
	const response = await apiService.request<PostImagesResponse>({
		url: `${PRODUCTS_API}/${productId}/images`,
		method: "POST",
		data: {
			images,
		} as PostImagesRequest,
	});

	return response.data;
}

/**
 * Get product images
 */
export async function getProductImages(
	productId: string,
): Promise<GetImagesResponse> {
	const response = await apiService.request<GetImagesResponse>({
		url: `${PRODUCTS_API}/${productId}/images`,
		method: "GET",
	});

	return response.data;
}

/**
 * Complete upload process: upload files to S3 and save metadata
 * This merges new images with existing ones and sends the complete list
 */
export async function completeImageUploadWithMerge(
	productId: string,
	files: UploadFile[],
	existingImages: ImageResponse[],
): Promise<{
	success: boolean;
	images?: PostImagesResponse;
	errors?: string[];
}> {
	console.log("completeImageUploadWithMerge called:", {
		productId,
		files: files.length,
		existingImages: existingImages.length,
	});

	try {
		// Upload new files to S3
		console.log("Calling uploadFiles...");
		const { uploadedImages, errors } = await uploadFiles(files, productId);

		console.log("uploadFiles result:", {
			uploadedImages: uploadedImages.length,
			errors,
		});

		if (uploadedImages.length === 0) {
			return {
				success: false,
				errors: errors.length > 0 ? errors : ["No files uploaded"],
			};
		}

		// Create a map of existing images by their display_order for easy merging
		const existingImageMap = new Map<number, ImageRequest>();
		existingImages.forEach((img) => {
			existingImageMap.set(img.display_order, {
				is_primary: img.is_primary,
				image_url: img.image_url,
				display_order: img.display_order,
			});
		});

		// Add new images to the map, potentially overwriting slots
		uploadedImages.forEach((newImg) => {
			existingImageMap.set(newImg.display_order, newImg);
		});

		// Convert map back to array and sort by display_order
		const allImages = Array.from(existingImageMap.values()).sort(
			(a, b) => a.display_order - b.display_order,
		);

		// Ensure there's exactly one primary image
		// If no primary is set, make the first image primary
		const hasPrimary = allImages.some((img) => img.is_primary);
		if (!hasPrimary && allImages.length > 0) {
			allImages[0].is_primary = true;
		}

		// Save the complete image list to backend
		const imagesResponse = await saveImageMetadata(productId, allImages);

		return {
			success: true,
			images: imagesResponse,
			errors: errors.length > 0 ? errors : undefined,
		};
	} catch (error) {
		console.error("Error in complete image upload with merge:", error);
		return {
			success: false,
			errors: ["Failed to complete image upload process"],
		};
	}
}

/**
 * Complete upload process: upload files to S3 and save metadata
 */
export async function completeImageUpload(
	productId: string,
	files: UploadFile[],
): Promise<{
	success: boolean;
	images?: PostImagesResponse;
	errors?: string[];
}> {
	try {
		// Upload files to S3
		const { uploadedImages, errors } = await uploadFiles(files, productId);

		if (uploadedImages.length === 0) {
			return {
				success: false,
				errors: errors.length > 0 ? errors : ["No files uploaded"],
			};
		}

		// Save metadata to backend
		const imagesResponse = await saveImageMetadata(productId, uploadedImages);

		return {
			success: true,
			images: imagesResponse,
			errors: errors.length > 0 ? errors : undefined,
		};
	} catch (error) {
		console.error("Error in complete image upload:", error);
		return {
			success: false,
			errors: ["Failed to complete image upload process"],
		};
	}
}
