"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import ProductsGrid from "./ProductsGrid";

interface Product {
  id: string;
  slug: string;
  name: string;
  category: { id: string; name: string; slug: string };
  description: string;
  quantity: number;
  brands: { brandName: string; sizes: { size: string; price: number }[] }[];
  image: string;
  discountPrice?: number;
  isOffer?: boolean;
  rating?: number;
}

interface ProductResponse {
  total: number;
  products: Product[];
}

export default function ProductsPageWrapper() {
  const searchParams = useSearchParams();
  const query = searchParams.toString(); // ✅ Extracted to static variable

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get<ProductResponse>(`/api/products?${query}`);
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]); // ✅ Static dependency

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-center text-primary mb-12">Explore Products</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-500">Loading products...</div>
      ) : (
        <ProductsGrid products={products} />
      )}
    </div>
  );
}
