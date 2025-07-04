import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from './ProductForm';
import { Product } from '../types';

interface EditProductProps {
  product?: Product; // Optional prop for when product data is passed from parent
}

function EditProduct({ product }: EditProductProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSuccess = (updatedProduct: Product) => {
    console.log('Product updated successfully:', updatedProduct);
    // You can add navigation or other logic here after successful update
    // navigate('/products'); // Uncomment if you want to navigate back to products list
  };

  // If no product ID is provided via params or props, show error
  if (!id && !product?.id) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-red-500">
          No product ID provided for editing.
        </div>
      </div>
    );
  }

  return (
    <ProductForm 
      mode="edit" 
      productId={id || product?.id}
      initialProduct={product}
      onSuccess={handleSuccess}
    />
  );
}

export default EditProduct