import { Typography } from "antd";
import ProductImageUpload from "./ProductImageUpload";
import ProductInformationForm from "./ProductInformationForm";
import { useProductForm } from "../hooks/useProductForm";
import type { Product } from "../types";

const { Title, Text } = Typography;

interface ProductFormProps {
	mode: "add" | "edit";
	productId?: string;
	initialProduct?: Product;
	onSuccess?: (product: Product) => void;
}

function ProductForm({
	mode,
	productId,
	initialProduct,
	onSuccess,
}: ProductFormProps) {
	const {
		form,
		isFormValid,
		isProductSaved,
		savedProduct,
		isLoading,
		getProductRes,
		handleFormChange,
		handleSubmit,
		imageUpload,
	} = useProductForm({
		mode,
		productId,
		initialProduct,
		onSuccess,
	});

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<Title level={2} className="text-center mb-8">
				{mode === "add" ? "Add New Product" : "Edit Product"}
			</Title>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Product Information Form */}
				{mode === "edit" && getProductRes.isLoading ? (
					<div className="flex flex-col items-center justify-center py-16 px-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
						<Text className="mt-6 text-lg text-gray-600 font-medium">
							Loading product details...
						</Text>
						<Text className="mt-2 text-sm text-gray-400">
							Please wait while we fetch the product information
						</Text>
					</div>
				) : (
					<ProductInformationForm
						mode={mode}
						form={form}
						initialProduct={initialProduct}
						isProductSaved={isProductSaved}
						isFormValid={isFormValid}
						isLoading={isLoading}
						onFormChange={handleFormChange}
						onSubmit={handleSubmit}
					/>
				)}

				{/* Product Image Upload */}
				<ProductImageUpload
					mode={mode}
					isProductSaved={isProductSaved}
					savedProduct={savedProduct}
					isLoading={getProductRes.isLoading}
					existingImages={imageUpload.existingImages}
					isUploading={imageUpload.isUploading}
					uploadProgress={imageUpload.uploadProgress}
					onUploadImages={imageUpload.handleUpload}
					onSetPrimaryImage={imageUpload.setPrimaryImage}
				/>
			</div>
		</div>
	);
}

export default ProductForm;
