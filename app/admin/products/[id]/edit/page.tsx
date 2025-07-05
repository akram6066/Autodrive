"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import AdminRoute from "@/components/AdminRoute";
import { UploadCloud, Loader2 } from "lucide-react";

interface CategoryType {
  _id: string;
  name: string;
}

interface SizeType {
  size: string;
  price: string;
}

interface ProductType {
  name: string;
  description: string;
  category: CategoryType;
  quantity: number;
  discountPrice?: number;
  isOffer: boolean;
  image: string;
  brands: {
    brandName: string;
    sizes: SizeType[];
  }[];
}

export default function ProductEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    quantity: "1",
    discountPrice: "",
    isOffer: false,
    image: null as File | null,
    imagePreview: null as string | null,
    brands: [{ brandName: "", sizes: [{ size: "", price: "" }] }],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [categoryRes, productRes] = await Promise.all([
          axios.get<CategoryType[]>("/api/admin/categories"),
          axios.get<ProductType>(`/api/admin/products/${id}`),
        ]);

        const product = productRes.data;

        setCategories(categoryRes.data);

        setForm({
          name: product.name,
          category: product.category._id,
          description: product.description,
          quantity: product.quantity.toString(),
          discountPrice: product.discountPrice?.toString() || "",
          isOffer: product.isOffer,
          image: null,
          imagePreview: product.image || null,
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
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const validateForm = () => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.category) return "Category is required";
    if (!form.quantity || parseInt(form.quantity) <= 0)
      return "Quantity must be greater than 0";

    for (const brand of form.brands) {
      if (!brand.brandName.trim()) return "Brand name is required";
      for (const size of brand.sizes) {
        if (!size.size.trim()) return "Size is required";
        if (!size.price.trim() || parseFloat(size.price) <= 0)
          return "Price must be greater than 0";
      }
    }

    return null;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setForm({
        ...form,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("quantity", form.quantity);
      formData.append("discountPrice", form.discountPrice);
      formData.append("isOffer", form.isOffer.toString());
      formData.append(
        "brands",
        JSON.stringify(
          form.brands.map((b) => ({
            brandName: b.brandName,
            sizes: b.sizes.map((s) => ({
              size: s.size,
              price: parseFloat(s.price),
            })),
          }))
        )
      );

      if (form.image) {
        formData.append("image", form.image);
      }

      await axios.put(`/api/admin/products/${id}`, formData);
      alert("✅ Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      const axiosErr = err as AxiosError<{ error: string }>;
      setError(axiosErr.response?.data?.error || "Failed to update product.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <AdminRoute>
      <div className="pt-20 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Edit Product</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-xl text-center shadow-md">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="p-3 border rounded-xl w-full"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="p-3 border rounded-xl w-full"
                rows={3}
              />
              <input
                type="number"
                min={1}
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                className="p-3 border rounded-xl w-full"
              />
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="p-3 border rounded-xl w-full"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                placeholder="Discount Price (optional)"
                value={form.discountPrice}
                onChange={(e) =>
                  setForm({ ...form, discountPrice: e.target.value })
                }
                className="p-3 border rounded-xl w-full"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={form.isOffer}
                  onChange={(e) =>
                    setForm({ ...form, isOffer: e.target.checked })
                  }
                />
                <label>Mark as Offer</label>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="w-full aspect-square bg-gray-100 border-2 border-dashed rounded-xl flex justify-center items-center relative">
                {form.imagePreview ? (
                  <Image
                    src={form.imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <UploadCloud className="w-16 h-16 mx-auto" />
                    <span>Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-primary">Brands & Sizes</h2>

          {form.brands.map((brand, i) => (
            <div
              key={i}
              className="bg-gray-50 border rounded-xl p-4 space-y-4"
            >
              <input
                type="text"
                placeholder="Brand Name"
                value={brand.brandName}
                onChange={(e) => {
                  const updated = [...form.brands];
                  updated[i].brandName = e.target.value;
                  setForm({ ...form, brands: updated });
                }}
                className="p-3 border rounded-xl w-full"
              />
              {brand.sizes.map((size, j) => (
                <div key={j} className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Size"
                    value={size.size}
                    onChange={(e) => {
                      const updated = [...form.brands];
                      updated[i].sizes[j].size = e.target.value;
                      setForm({ ...form, brands: updated });
                    }}
                    className="p-3 border rounded-xl w-full"
                  />
                  <input
                    type="number"
                    placeholder="Price (KES)"
                    value={size.price}
                    onChange={(e) => {
                      const updated = [...form.brands];
                      updated[i].sizes[j].price = e.target.value;
                      setForm({ ...form, brands: updated });
                    }}
                    className="p-3 border rounded-xl w-full"
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitLoading}
            className="bg-primary text-white py-4 rounded-xl text-lg w-full flex justify-center"
          >
            {submitLoading ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              "Update Product"
            )}
          </button>
        </form>
      </div>
    </AdminRoute>
  );
}
