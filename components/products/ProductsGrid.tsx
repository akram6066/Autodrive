"use client";

import React from "react";
import ProductCard, { Product } from "./ProductCard";

interface Props {
  products: Product[];
}

export default function ProductsGrid({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-lg text-red-500 py-20">
        No products found!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
