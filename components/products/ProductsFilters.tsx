"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  defaultCategories?: Category[]; // allow preload
}

export default function ProductsFilters({ defaultCategories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>(defaultCategories || []);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [size, setSize] = useState(searchParams.get("size") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  useEffect(() => {
    if (categories.length === 0) {
      axios.get("/api/admin/categories").then((res) => setCategories(res.data));
    }
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (size) params.set("size", size);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/products?${params.toString()}`);
  };

  const resetFilters = () => {
    setCategory("");
    setBrand("");
    setSize("");
    setMinPrice("");
    setMaxPrice("");
    router.push(`/products`);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-10">
      <h2 className="text-xl font-bold text-primary mb-4">Filters</h2>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Search brand..."
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Size</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Search size..."
            className="p-2 border rounded w-full"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="p-2 border rounded w-full"
            />
          </div>

          <div className="flex-1">
            <label className="block font-semibold mb-1">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="10000"
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={applyFilters}
            className="flex-1 bg-primary text-white py-2 rounded font-semibold"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-semibold"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
