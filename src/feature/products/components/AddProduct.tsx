import React from "react";
import type { Product } from "../types";
import ProductForm from "./ProductForm";

function AddProduct() {
	const handleSuccess = (product: Product) => {
		console.log("Product created successfully:", product);
		// You can add any additional logic here after successful product creation
	};

	return <ProductForm mode="add" onSuccess={handleSuccess} />;
}

export default AddProduct;
