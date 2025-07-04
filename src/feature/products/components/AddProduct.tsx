import React from 'react';
import ProductForm from './ProductForm';
import { Product } from '../types';

function AddProduct() {
  const handleSuccess = (product: Product) => {
    console.log('Product created successfully:', product);
    // You can add any additional logic here after successful product creation
  };

  return (
    <ProductForm 
      mode="add" 
      onSuccess={handleSuccess}
    />
  );
}

export default AddProduct;