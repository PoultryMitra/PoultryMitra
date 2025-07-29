import React from 'react';

const Products = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <p className="mb-4">Manage your product inventory and ensure availability for your customers.</p>
      <ul className="list-disc pl-6">
        <li>Inventory Tracking</li>
        <li>Pricing Management</li>
        <li>Product Categorization</li>
        <li>Stock Alerts</li>
      </ul>
    </div>
  );
};

export default Products;
