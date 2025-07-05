import {
	CloudUploadOutlined,
	EyeOutlined,
	StarFilled,
	StarOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import {
	Button,
	Card,
	Divider,
	Image,
	Progress,
	Spin,
	Typography,
	Upload,
	message,
	type UploadFile,
} from "antd";
import type { RcFile } from "antd/es/upload";
import { useState, useEffect } from "react";
import type { Product, ImageResponse } from "../types";

const { Text } = Typography;

interface ImageSlot {
	id: string | null;
	file: UploadFile | null;
	imageData: ImageResponse | null;
	isUploading: boolean;
}

interface ProductImageUploadProps {
	mode: "add" | "edit";
	isProductSaved: boolean;
	savedProduct: Product | null;
	isLoading: boolean;
	// Image upload functionality
	existingImages?: ImageResponse[];
	isUploading?: boolean;
	uploadProgress?: number;
	onUploadImages?: (files: UploadFile[]) => Promise<boolean>;
	onSetPrimaryImage?: (imageId: string) => Promise<boolean>;
}

function ProductImageUpload({
	mode,
	isProductSaved,
	savedProduct,
	isLoading,
	existingImages = [],
	isUploading = false,
	uploadProgress = 0,
	onUploadImages,
	onSetPrimaryImage,
}: ProductImageUploadProps) {
	const maxImages = 5;
	const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() =>
		Array.from({ length: maxImages }, () => ({
			id: null,
			file: null,
			imageData: null,
			isUploading: false,
		})),
	);

	// Update slots when existing images change
	useEffect(() => {
		const newSlots: ImageSlot[] = Array.from(
			{ length: maxImages },
			(_, index) => {
				const existingImage = existingImages.find(
					(img) => img.display_order === index + 1,
				);
				return {
					id: existingImage?.id || null,
					file: null,
					imageData: existingImage || null,
					isUploading: false,
				};
			},
		);
		setImageSlots(newSlots);
	}, [existingImages]);

	const handleFileSelect = (file: File, slotIndex: number) => {
		console.log("handleFileSelect called:", {
			file: file.name,
			slotIndex,
			isProductSaved,
		});

		try {
			if (!isProductSaved) {
				console.log("Product not saved, returning early");
				message.error("Please save the product first");
				return;
			}

			console.log("Product is saved, proceeding with file processing...");

			// Convert File to RcFile by adding required properties
			const uid = `${Date.now()}-${slotIndex}`;
			console.log("Generated UID:", uid);

			console.log("About to create RcFile...");
			// Create RcFile by extending the file object properly
			const rcFile = Object.defineProperties(file, {
				uid: { value: uid, writable: true, enumerable: true },
				lastModifiedDate: {
					value: new Date(file.lastModified),
					writable: true,
					enumerable: true,
				},
			}) as RcFile;
			console.log("RcFile created successfully:", rcFile);

			console.log("Creating UploadFile object...");
			const uploadFile: UploadFile = {
				uid,
				name: file.name,
				status: "done",
				originFileObj: rcFile,
				size: file.size,
				type: file.type,
			};

			console.log("Upload file created:", uploadFile);

			// Update the slot with the selected file
			console.log("About to update imageSlots...");
			const newSlots = [...imageSlots];
			newSlots[slotIndex] = {
				...newSlots[slotIndex],
				file: uploadFile,
				isUploading: true,
			};
			console.log("Setting imageSlots with newSlots:", newSlots);
			setImageSlots(newSlots);

			// Auto upload the file
			console.log(
				"onUploadImages function:",
				onUploadImages ? "exists" : "missing",
			);
			console.log("onUploadImages type:", typeof onUploadImages);
			if (onUploadImages) {
				console.log("Calling onUploadImages...");
				onUploadImages([uploadFile])
					.then((success) => {
						console.log("onUploadImages resolved with success:", success);
						if (success) {
							// File uploaded successfully, image will be updated via existingImages prop
							const updatedSlots = [...imageSlots];
							updatedSlots[slotIndex] = {
								...updatedSlots[slotIndex],
								file: null,
								isUploading: false,
							};
							setImageSlots(updatedSlots);
						} else {
							// Upload failed, clear the slot
							const updatedSlots = [...imageSlots];
							updatedSlots[slotIndex] = {
								id: null,
								file: null,
								imageData: null,
								isUploading: false,
							};
							setImageSlots(updatedSlots);
						}
					})
					.catch((error) => {
						console.error("onUploadImages promise rejected:", error);
						// Upload failed, clear the slot
						const updatedSlots = [...imageSlots];
						updatedSlots[slotIndex] = {
							id: null,
							file: null,
							imageData: null,
							isUploading: false,
						};
						setImageSlots(updatedSlots);
					});
			} else {
				console.error("onUploadImages function is missing!");
			}
		} catch (error) {
			console.error("Error in handleFileSelect:", error);
			message.error("Failed to process file upload");
		}
	};

	const handleSetPrimary = (slotIndex: number) => {
		const slot = imageSlots[slotIndex];
		if (slot.imageData && onSetPrimaryImage) {
			onSetPrimaryImage(slot.imageData.id);
		}
	};

	const getNextAvailableSlot = () => {
		return imageSlots.findIndex((slot) => !slot.imageData && !slot.file);
	};

	const isUploadReady =
		(mode === "edit" && !isLoading && savedProduct) ||
		(mode === "add" && isProductSaved);

	return (
		<Card
			title={
				<div className="flex items-center space-x-2">
					<CloudUploadOutlined className="text-green-500" />
					<span>Product Images</span>
					{mode === "add" && !isProductSaved && (
						<Text type="secondary" className="text-sm ml-2">
							(Create product first)
						</Text>
					)}
					{mode === "edit" && isLoading && (
						<Text type="secondary" className="text-sm ml-2">
							(Loading...)
						</Text>
					)}
					{isUploadReady && (
						<Text type="success" className="text-sm ml-2">
							✅ Ready to upload
						</Text>
					)}
				</div>
			}
			className={`shadow-lg transition-all duration-300 ${
				isUploadReady
					? "hover:shadow-xl border-green-200"
					: "opacity-60 border-gray-200"
			}`}
			bodyStyle={{ padding: "24px" }}
		>
			{mode === "edit" && isLoading ? (
				<div className="flex flex-col items-center justify-center py-12">
					<Spin size="large" />
					<Text className="mt-4 text-gray-600">Loading product data...</Text>
				</div>
			) : (
				<div className="space-y-4">
					{mode === "add" && !isProductSaved && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<Text type="secondary" className="text-sm">
								🎯 Complete and submit the product form to enable image uploads
							</Text>
						</div>
					)}

					{isProductSaved && savedProduct && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-4">
							<Text type="success" className="text-sm">
								✅ Product "{savedProduct.name}"{" "}
								{mode === "add" ? "created" : "updated"} successfully!
								{mode === "add" && " You can now upload images."}
							</Text>
							<Text type="secondary" className="text-xs block mt-1">
								Product ID: {savedProduct.id}
							</Text>
						</div>
					)}

					{isUploading && (
						<div className="mb-4">
							<Progress
								percent={uploadProgress}
								status="active"
								strokeColor={{
									"0%": "#108ee9",
									"100%": "#87d068",
								}}
							/>
							<Text type="secondary" className="text-xs">
								Uploading image...
							</Text>
						</div>
					)}

					<div className="space-y-4">
						<Divider orientation="left" className="text-sm mb-4">
							Product Images (Upload in sequence 1-5)
						</Divider>

						<div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
							{imageSlots.map((slot, index) => (
								<div
									key={slot.id || `slot-${index}`}
									className="relative aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-blue-400 transition-colors"
								>
									{slot.isUploading ? (
										<div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
											<Spin size="small" />
											<Text className="text-xs mt-2">Uploading...</Text>
										</div>
									) : slot.imageData ? (
										<div className="relative w-full h-full">
											<Image
												src={slot.imageData.image_url}
												alt={`Product image ${index + 1}`}
												className="w-full h-full object-cover"
												preview={{
													mask: (
														<div className="flex items-center justify-center">
															<EyeOutlined />
														</div>
													),
												}}
											/>

											{/* Image controls */}
											<div className="absolute top-1 right-1 flex space-x-1">
												<Button
													type="text"
													size="small"
													icon={
														slot.imageData.is_primary ? (
															<StarFilled className="text-yellow-500" />
														) : (
															<StarOutlined className="text-white" />
														)
													}
													className={`${slot.imageData.is_primary ? "bg-yellow-100" : "bg-black bg-opacity-50"} border-none text-xs`}
													onClick={() => handleSetPrimary(index)}
													title={
														slot.imageData.is_primary
															? "Primary image"
															: "Set as primary"
													}
												/>
											</div>

											{/* Primary badge */}
											{slot.imageData.is_primary && (
												<div className="absolute bottom-1 left-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
													Primary
												</div>
											)}

											{/* Slot number */}
											<div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
												{index + 1}
											</div>
										</div>
									) : (
										<Upload
											accept="image/*"
											showUploadList={false}
											beforeUpload={(file) => {
												console.log("beforeUpload called:", {
													fileName: file.name,
													isUploadReady,
												});

												// Check if this slot can be used (sequential upload)
												const nextSlot = getNextAvailableSlot();
												console.log(
													"Next available slot:",
													nextSlot,
													"Current slot:",
													index,
												);

												if (nextSlot !== -1 && nextSlot !== index) {
													message.warning(
														`Please upload images in sequence. Next available slot is ${nextSlot + 1}`,
													);
													return false;
												}

												if (!isUploadReady) {
													message.error("Please save the product first");
													return false;
												}

												console.log("About to call handleFileSelect");
												handleFileSelect(file, index);
												return false;
											}}
											disabled={
												!isUploadReady ||
												(getNextAvailableSlot() !== -1 &&
													getNextAvailableSlot() !== index)
											}
										>
											<div className="flex flex-col items-center justify-center h-full p-4 cursor-pointer hover:bg-gray-50 transition-colors">
												<PlusOutlined className="text-2xl text-gray-400 mb-2" />
												<Text className="text-xs text-gray-500 text-center">
													Slot {index + 1}
													{getNextAvailableSlot() === index ? (
														<div className="text-blue-500 font-medium">
															Click to upload
														</div>
													) : (
														<div>Upload in order</div>
													)}
												</Text>
											</div>
										</Upload>
									)}
								</div>
							))}
						</div>

						<div className="text-center">
							<Text type="secondary" className="text-sm">
								📋 Upload images in sequence from left to right (1-5). First
								image will be set as primary.
							</Text>
						</div>
					</div>
				</div>
			)}
		</Card>
	);
}

export default ProductImageUpload;
