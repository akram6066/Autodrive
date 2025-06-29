"use client";

import AdminRoute from "@/components/AdminRoute";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import Image from "next/image";

// Types
type CategoryType = { _id: string; name: string };

// interface SizeType {
//   size: string;
//   price: string;
// }

// interface BrandType {
//   brandName: string;
//   sizes: SizeType[];
// }

export default function ProductCreatePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
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
    axios
      .get("/api/admin/categories")
      .then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) {
          setForm((prev) => ({ ...prev, category: res.data[0]._id }));
        }
      })
      .catch(() => {
        setError("Failed to load categories");
      });
  }, []);

  const validateForm = () => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.image) return "Please upload product image";
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
    if (e.target.files && e.target.files[0]) {
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
      setLoading(true);

      // 1️⃣ Upload Image First
      let imageUrl = "";
      if (form.image) {
        const imgForm = new FormData();
        imgForm.append("image", form.image);
        const uploadRes = await axios.post("/api/admin/products/upload", imgForm);
        imageUrl = uploadRes.data.imageUrl;
      }

      // 2️⃣ Now submit full product as JSON
      const productPayload = {
        name: form.name,
        category: form.category,
        description: form.description,
        quantity: parseInt(form.quantity),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        isOffer: form.isOffer,
        image: imageUrl,
        brands: form.brands.map((brand) => ({
          brandName: brand.brandName,
          sizes: brand.sizes.map((size) => ({
            size: size.size,
            price: parseFloat(size.price),
          })),
        })),
      };

      await axios.post("/api/admin/products", productPayload);
      alert("✅ Product created successfully!");
      router.push("/admin/products");
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="pt-20 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Create New Product</h1>

        {categories.length === 0 ? (
          <div className="bg-red-100 p-4 text-center rounded-xl">
            No categories found. Please add categories first!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-xl text-center shadow-md">
                ⚠️ {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="p-3 border rounded-xl w-full"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="p-3 border rounded-xl w-full"
                  rows={3}
                  required
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="p-3 border rounded-xl w-full"
                  required
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="p-3 border rounded-xl w-full"
                >
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
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  className="p-3 border rounded-xl w-full"
                />
                <div className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={form.isOffer}
                    onChange={(e) => setForm({ ...form, isOffer: e.target.checked })}
                  />
                  <label>Mark as Offer</label>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="w-full aspect-square bg-gray-100 border-2 border-dashed rounded-xl flex justify-center items-center relative">
                  {form.imagePreview ? (
                    <Image src={form.imagePreview} alt="Preview" fill className="object-cover rounded-xl" />
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

            {form.brands.map((brand, brandIndex) => (
              <div key={brandIndex} className="bg-gray-50 border rounded-xl p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Brand Name"
                  value={brand.brandName}
                  onChange={(e) => {
                    const updated = [...form.brands];
                    updated[brandIndex].brandName = e.target.value;
                    setForm({ ...form, brands: updated });
                  }}
                  className="p-3 border rounded-xl w-full"
                  required
                />
                {brand.sizes.map((size, sizeIndex) => (
                  <div key={sizeIndex} className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Size"
                      value={size.size}
                      onChange={(e) => {
                        const updated = [...form.brands];
                        updated[brandIndex].sizes[sizeIndex].size = e.target.value;
                        setForm({ ...form, brands: updated });
                      }}
                      className="p-3 border rounded-xl w-full"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price (KES)"
                      value={size.price}
                      onChange={(e) => {
                        const updated = [...form.brands];
                        updated[brandIndex].sizes[sizeIndex].price = e.target.value;
                        setForm({ ...form, brands: updated });
                      }}
                      className="p-3 border rounded-xl w-full"
                      required
                    />
                  </div>
                ))}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-4 rounded-xl text-lg w-full flex justify-center"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Save Product"}
            </button>
          </form>
        )}
      </div>
    </AdminRoute>
  );
}
