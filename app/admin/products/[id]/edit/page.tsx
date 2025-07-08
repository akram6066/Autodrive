"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Image from "next/image";

interface CategoryType {
  _id: string;
  name: string;
}

interface SizeType {
  size: string;
  price: string;
}

interface BrandType {
  brandName: string;
  sizes: SizeType[];
}

interface ProductAPIResponse {
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
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    category: string;
    description: string;
    quantity: string;
    discountPrice: string;
    isOffer: boolean;
    imageFile: File | null;
    imagePreview: string;
    brands: BrandType[];
  }>({
    name: "",
    category: "",
    description: "",
    quantity: "1",
    discountPrice: "",
    isOffer: false,
    imageFile: null,
    imagePreview: "",
    brands: [{ brandName: "", sizes: [{ size: "", price: "" }] }],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get<CategoryType[]>("/api/admin/categories"),
          axios.get<ProductAPIResponse>(`/api/admin/products/${id}`),
        ]);

        setCategories(catRes.data);

        const product = prodRes.data;

        setForm({
          name: product.name,
          category: product.category._id,
          description: product.description,
          quantity: product.quantity.toString(),
          discountPrice: product.discountPrice.toString(),
          isOffer: product.isOffer,
          imageFile: null,
          imagePreview: product.image,
          brands: product.brands.map((brand) => ({
            brandName: brand.brandName,
            sizes: brand.sizes.map((size) => ({
              size: size.size,
              price: size.price.toString(),
            })),
          })),
        });
      } catch (err) {
        const axiosErr = err as AxiosError;
        console.error(axiosErr);
        setError("Failed to fetch product data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("quantity", form.quantity);
      formData.append("discountPrice", form.discountPrice || "0");
      formData.append("isOffer", form.isOffer.toString());

      // ✅ Validate brands and sizes before sending
      const cleanedBrands = form.brands
        .filter((b) => b.brandName.trim() !== "")
        .map((brand) => ({
          brandName: brand.brandName.trim(),
          sizes: brand.sizes
            .filter((s) => s.size.trim() !== "" && s.price !== "")
            .map((s) => ({
              size: s.size.trim(),
              price: parseFloat(s.price),
            })),
        }))
        .filter((b) => b.sizes.length > 0);

      if (cleanedBrands.length === 0) {
        setError("At least one brand with size and price is required.");
        setSubmitLoading(false);
        return;
      }

      formData.append("brands", JSON.stringify(cleanedBrands));

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      await axios.put(`/api/admin/products/${id}`, formData);

      alert("✅ Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      console.error("Update error:", axiosErr);
      setError(axiosErr.response?.data?.error || "Something went wrong.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Product Name"
          className="p-3 border w-full rounded"
          required
        />

        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="p-3 border w-full rounded"
        >
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          rows={3}
          className="p-3 border w-full rounded"
        />

        <input
          type="number"
          min={1}
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          placeholder="Quantity"
          className="p-3 border w-full rounded"
        />

        <input
          type="number"
          min={0}
          value={form.discountPrice}
          onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
          placeholder="Discount Price"
          className="p-3 border w-full rounded"
        />

        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={form.isOffer}
            onChange={(e) => setForm({ ...form, isOffer: e.target.checked })}
          />
          Mark as Offer
        </label>

        <div>
          {form.imagePreview && (
            <Image
              src={form.imagePreview}
              alt="Preview"
              width={150}
              height={150}
              className="rounded mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="p-2 border rounded w-full"
          />
        </div>

        <h2 className="font-semibold">Brands & Sizes</h2>
        {form.brands.map((brand, brandIndex) => (
          <div key={brandIndex} className="bg-gray-50 border p-4 rounded mb-4">
            <input
              type="text"
              placeholder="Brand Name"
              value={brand.brandName}
              onChange={(e) => {
                const updated = [...form.brands];
                updated[brandIndex].brandName = e.target.value;
                setForm({ ...form, brands: updated });
              }}
              className="p-2 border rounded w-full mb-2"
            />
            {brand.sizes.map((size, sizeIndex) => (
              <div key={sizeIndex} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Size"
                  value={size.size}
                  onChange={(e) => {
                    const updated = [...form.brands];
                    updated[brandIndex].sizes[sizeIndex].size = e.target.value;
                    setForm({ ...form, brands: updated });
                  }}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={size.price}
                  onChange={(e) => {
                    const updated = [...form.brands];
                    updated[brandIndex].sizes[sizeIndex].price = e.target.value;
                    setForm({ ...form, brands: updated });
                  }}
                  className="p-2 border rounded w-full"
                />
              </div>
            ))}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded w-full"
        >
          {submitLoading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}
