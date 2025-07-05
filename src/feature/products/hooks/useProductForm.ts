import { Form, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import useFetch from "../../base/hooks/useFetch";
import { PRODUCTS_API } from "../constants";
import type { Product } from "../types";
import { useProductImages } from "./useProductImages";

interface UseProductFormProps {
	mode: "add" | "edit";
	productId?: string;
	initialProduct?: Product;
	onSuccess?: (product: Product) => void;
}

export function useProductForm({
	mode,
	productId,
	initialProduct,
	onSuccess,
}: UseProductFormProps) {
	const [form] = Form.useForm();
	const [isFormValid, setIsFormValid] = useState(false);
	const [isProductSaved, setIsProductSaved] = useState(false);
	const [savedProduct, setSavedProduct] = useState<Product | null>(null);
	const [lastLoadedProductId, setLastLoadedProductId] = useState<string | null>(
		null,
	);

	// Use the useFetch hook for API calls
	const [saveProductRes, saveProductReq] = useFetch<Product>();
	const [getProductRes, getProductReq] = useFetch<Product>();

	// Image upload functionality - memoize to prevent infinite loops
	const imageProductId = useMemo(
		() => savedProduct?.id || productId,
		[savedProduct?.id, productId],
	);
	const imageUpload = useProductImages(imageProductId);

	// Fetch product data for edit mode
	// biome-ignore lint/correctness/useExhaustiveDependencies: Avoiding infinite loop
	useEffect(() => {
		if (
			mode === "edit" &&
			productId &&
			!initialProduct &&
			!getProductRes.isLoading
		) {
			getProductReq({
				url: `${PRODUCTS_API}/${productId}`,
				method: "GET",
			});
		}
	}, [mode, productId, initialProduct]);

	// Set initial form values and load images for edit mode
	useEffect(() => {
		if (mode === "edit") {
			const productData = initialProduct || getProductRes.data;
			if (productData && productData.id !== lastLoadedProductId) {
				const formValues = {
					name: productData.name,
					description: productData.description,
					category_id: productData.category_id,
					price: productData.price,
					stock: productData.stock,
				};
				form.setFieldsValue(formValues);
				setIsFormValid(true);

				// Set savedProduct for edit mode so upload button is available
				setSavedProduct(productData);

				// Load existing images only once per product
				imageUpload.loadProductImages(productData.id);
				setLastLoadedProductId(productData.id);
			}
		}
	}, [
		mode,
		initialProduct,
		getProductRes.data,
		form,
		imageUpload.loadProductImages,
		lastLoadedProductId,
	]);

	const handleFormChange = () => {
		const values = form.getFieldsValue();

		// Check if required fields are filled
		const isValid =
			values.name &&
			values.price > 0 &&
			values.stock >= 0 &&
			values.category_id &&
			values.category_id !== 0 &&
			values.category_id !== "0"; // Handle both string and number cases
		setIsFormValid(isValid);
	};

	const handleSubmit = async (values: Omit<Product, "id">) => {
		try {
			console.log("Raw form values:", values);

			// If category_id should be a number, convert it; if string, keep as is
			const submitData = {
				...values,
				category_id:
					typeof values.category_id === "string"
						? Number(values.category_id)
						: values.category_id,
			};

			console.log("Submitting product data:", submitData);

			const response = await saveProductReq({
				url: mode === "add" ? PRODUCTS_API : `${PRODUCTS_API}/${productId}`,
				method: mode === "add" ? "POST" : "PATCH",
				data: submitData,
			});

			if (response.isSuccess) {
				const successMessage =
					mode === "add"
						? "Product added successfully!"
						: "Product updated successfully!";
				message.success(successMessage);

				setIsProductSaved(true);
				setSavedProduct(response.data);

				console.log(
					`Product ${mode === "add" ? "created" : "updated"}:`,
					response.data,
				);

				// Call onSuccess callback if provided
				if (onSuccess) {
					onSuccess(response.data);
				}
			}
		} catch (error) {
			console.error(
				`Error ${mode === "add" ? "creating" : "updating"} product:`,
				error,
			);
			// The useFetch hook already shows error messages via message.error
		}
	};

	const isLoading =
		saveProductRes.isLoading ||
		(mode === "edit" && getProductRes.isLoading) ||
		imageUpload.isUploading;

	return {
		form,
		isFormValid,
		isProductSaved,
		savedProduct,
		isLoading,
		getProductRes,
		handleFormChange,
		handleSubmit,
		// Image upload functionality
		imageUpload: {
			isUploading: imageUpload.isUploading,
			uploadProgress: imageUpload.uploadProgress,
			existingImages: imageUpload.existingImages,
			isLoadingImages: imageUpload.isLoadingImages,
			uploadImages: imageUpload.uploadImages,
			handleUpload: imageUpload.handleUpload,
			loadProductImages: imageUpload.loadProductImages,
			setPrimaryImage: imageUpload.setPrimaryImage,
			deleteImage: imageUpload.deleteImage,
		},
	};
}
