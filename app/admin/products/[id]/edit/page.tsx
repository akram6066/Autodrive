"use client";

import AdminRoute from "@/components/AdminRoute";
import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

// Types
interface SizeType {
  size: string;
  price: string;
}
interface BrandType {
  brandName: string;
  sizes: SizeType[];
}
interface CategoryType {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}
interface ProductAPI {
  _id: string;
  name: string;
  category: CategoryType;
  description: string;
  quantity: number;
  discountPrice: number;
  isOffer: boolean;
  image: string;
  brands: {
    brandName: string;
    sizes: { size: string; price: number }[];
  }[];
}

export default function ProductEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryType[]>([]);

  const [form, setForm] = useState<{
    name: string;
    category: string;
    description: string;
    quantity: string;
    discountPrice: string;
    isOffer: boolean;
    imagePreview: string;
    imageFile: File | null;
    brands: BrandType[];
  }>({
    name: "",
    category: "",
    description: "",
    quantity: "1",
    discountPrice: "0",
    isOffer: false,
    imagePreview: "",
    imageFile: null,
    brands: [],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, productRes] = await Promise.all([
          axios.get<CategoryType[]>("/api/admin/categories"),
          axios.get<ProductAPI>(`/api/admin/products/${id}`),
        ]);

        setCategories(catRes.data);
        const product = productRes.data;

        setForm({
          name: product.name ?? "",
          category: product.category?._id ?? "",
          description: product.description ?? "",
          quantity: product.quantity?.toString() ?? "1",
          discountPrice: product.discountPrice?.toString() ?? "0",
          isOffer: product.isOffer ?? false,
          imagePreview: product.image ?? "",
          imageFile: null,
          brands: product.brands.map((brand) => ({
            brandName: brand.brandName,
            sizes: brand.sizes.map((size) => ({
              size: size.size,
              price: size.price.toString(),
            })),
          })),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load product data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({
        ...form,
        imageFile: e.target.files[0],
        imagePreview: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleBrandNameChange = (brandIndex: number, value: string) => {
    const updatedBrands = [...form.brands];
    updatedBrands[brandIndex].brandName = value;
    setForm({ ...form, brands: updatedBrands });
  };

  const handleSizeChange = (
    brandIndex: number,
    sizeIndex: number,
    field: keyof SizeType,
    value: string
  ) => {
    const updatedBrands = [...form.brands];
    updatedBrands[brandIndex].sizes[sizeIndex][field] = value;
    setForm({ ...form, brands: updatedBrands });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("quantity", form.quantity);
    formData.append("discountPrice", form.discountPrice);
    formData.append("isOffer", form.isOffer ? "true" : "false");
    formData.append(
      "brands",
      JSON.stringify(
        form.brands.map((brand) => ({
          brandName: brand.brandName,
          sizes: brand.sizes.map((size) => ({
            size: size.size,
            price: parseFloat(size.price),
          })),
        }))
      )
    );

    if (form.imageFile) {
      formData.append("image", form.imageFile);
    }

    try {
      await axios.put(`/api/admin/products/${id}`, formData);
      alert("✅ Product updated successfully");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Failed to update product");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <AdminRoute>
      <div className="pt-28 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Edit Product</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-6 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label>Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-3 border rounded w-full"
              required
            />
          </div>

          <div>
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="p-3 border rounded w-full"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="p-3 border rounded w-full"
              rows={3}
            />
          </div>

          <div>
            <label>Quantity</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="p-3 border rounded w-full"
              required
            />
          </div>

          <div>
            <label>Discount Price</label>
            <input
              type="number"
              min={0}
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              className="p-3 border rounded w-full"
            />
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={form.isOffer}
              onChange={(e) => setForm({ ...form, isOffer: e.target.checked })}
            />
            <label className="font-semibold">Mark as Offer</label>
          </div>

          <div>
            <label>Product Image</label>
            {form.imagePreview && (
              <Image
                src={form.imagePreview}
                alt="Product Image"
                width={200}
                height={200}
                className="rounded"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="p-3 border rounded w-full"
            />
          </div>

          <div>
            <h2 className="font-semibold text-lg text-primary mb-2">Brands & Sizes</h2>
            {form.brands.map((brand, brandIndex) => (
              <div key={brandIndex} className="bg-gray-100 rounded-xl p-4 mb-4">
                <input
                  type="text"
                  value={brand.brandName}
                  onChange={(e) => handleBrandNameChange(brandIndex, e.target.value)}
                  className="p-3 border rounded w-full mb-3"
                  placeholder="Brand Name"
                  required
                />
                {brand.sizes.map((sizeObj, sizeIndex) => (
                  <div key={sizeIndex} className="flex gap-4 mb-2">
                    <input
                      type="text"
                      value={sizeObj.size}
                      onChange={(e) => handleSizeChange(brandIndex, sizeIndex, "size", e.target.value)}
                      className="p-3 border rounded w-1/2"
                      placeholder="Size"
                      required
                    />
                    <input
                      type="number"
                      min={0}
                      value={sizeObj.price}
                      onChange={(e) => handleSizeChange(brandIndex, sizeIndex, "price", e.target.value)}
                      className="p-3 border rounded w-1/2"
                      placeholder="Price"
                      required
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button type="submit" className="bg-primary text-white py-3 rounded w-full text-lg">
            Update Product
          </button>
        </form>
      </div>
    </AdminRoute>
  );
}
