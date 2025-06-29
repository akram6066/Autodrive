"use client";

import AdminRoute from "@/components/AdminRoute";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Edit, Trash2, Plus, BadgePercent } from "lucide-react";

// Correct category type
type CategoryType = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

// Correct product type
type ProductType = {
  _id: string;
  name: string;
  category: CategoryType | null;  // allow null just in case
  image: string;
  quantity: number;
  discountPrice?: number;
  isOffer?: boolean;
  brands: {
    sizes: { price: number }[];
  }[];
};

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/products");
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      alert("✅ Product deleted");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminRoute>
      <div className="pt-5 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Manage Products</h1>
          <Link href="/admin/products/new" className="bg-primary text-white px-6 py-3 rounded-xl flex gap-2 items-center">
            <Plus className="w-5 h-5" /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-lg">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const prices = product.brands.flatMap(b => b.sizes.map(s => s.price));
              const originalPrice = prices.length > 0 ? Math.min(...prices) : 0;

              let discountPercent = 0;
              if (
                product.discountPrice &&
                product.discountPrice > 0 &&
                originalPrice > 0 &&
                product.discountPrice < originalPrice
              ) {
                discountPercent = Math.round(
                  ((originalPrice - product.discountPrice) / originalPrice) * 100
                );
              }

              return (
                <div key={product._id} className="bg-white border rounded-xl shadow-sm p-3 relative group hover:shadow-lg transition">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                    {product.isOffer && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                        <BadgePercent className="w-4 h-4" /> Offer
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h2 className="font-semibold text-lg">{product.name}</h2>
                    <p className="text-sm text-gray-500 capitalize">
                      {product.category?.name || "No Category"}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 font-medium">Stock: {product.quantity}</p>
                    <div className="mt-2">
                      {product.discountPrice && discountPercent > 0 ? (
                        <div className="text-sm font-semibold">
                          <span className="line-through text-gray-400 mr-2">KES {originalPrice}</span>
                          <span className="text-red-500">KES {product.discountPrice}</span>
                          <span className="ml-2 text-green-600 text-xs">({discountPercent}% OFF)</span>
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-primary">KES {originalPrice}</div>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <Link href={`/admin/products/${product._id}/edit`} className="p-2 bg-blue-500 text-white rounded-lg">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(product._id)} disabled={deletingId === product._id} className="p-2 bg-red-500 text-white rounded-lg">
                      {deletingId === product._id ? "..." : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
