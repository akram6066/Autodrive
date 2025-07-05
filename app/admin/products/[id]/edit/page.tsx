"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import AdminRoute from "@/components/AdminRoute";
import BrandManager, { BrandType } from "@/components/BrandManager";
import { productEditSchema } from "@/lib/validation/productSchema";

const schema = productEditSchema;

type FormData = z.infer<typeof schema>;

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface ProductAPI {
  name: string;
  category: CategoryType;
  description: string;
  quantity: number;
  discountPrice: number;
  isOffer: boolean;
  image: string;
  brands: BrandType[];
}

interface AxiosErrorResponse {
  error: string;
}

export default function ProductEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [brands, setBrands] = useState<BrandType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      quantity: "1",
      discountPrice: "0",
      isOffer: false,
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get<CategoryType[]>("/api/admin/categories"),
          axios.get<ProductAPI>(`/api/admin/products/${id}`),
        ]);

        const product = prodRes.data;
        setCategories(catRes.data);

        reset({
          name: product.name,
          category: product.category?._id || "",
          description: product.description,
          quantity: product.quantity.toString(),
          discountPrice: product.discountPrice.toString(),
          isOffer: product.isOffer,
        });

        setBrands(
          product.brands.map((b) => ({
            brandName: b.brandName,
            sizes: b.sizes.map((s) => ({
              size: s.size,
              price: s.price.toString(),
            })),
          }))
        );

        setImagePreview(product.image);
      } catch (err: unknown) {
        const error = err as AxiosError;
        console.error(error);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("category", data.category);
      formData.append("description", data.description || "");
      formData.append("quantity", data.quantity);
      formData.append("discountPrice", data.discountPrice);
      formData.append("isOffer", data.isOffer.toString());

      formData.append(
        "brands",
        JSON.stringify(
          brands.map((b) => ({
            brandName: b.brandName,
            sizes: b.sizes.map((s) => ({
              size: s.size,
              price: s.price === "" ? 0 : parseFloat(s.price),
            })),
          }))
        )
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.put(`/api/admin/products/${id}`, formData);
      router.push("/admin/products");
    } catch (err: unknown) {
      const error = err as AxiosError<AxiosErrorResponse>;
      console.error(error);
      setError(error.response?.data?.error || "Failed to update product");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <AdminRoute>
      <div className="pt-28 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

        {error && (
          <div className="bg-red-200 text-red-800 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input
            type="text"
            placeholder="Product name"
            {...register("name")}
            className="p-3 border w-full rounded"
          />
          {errors.name && <p className="text-red-600">{errors.name.message}</p>}

          <select
            {...register("category")}
            className="p-3 border w-full rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600">{errors.category.message}</p>
          )}

          <textarea
            placeholder="Description"
            {...register("description")}
            rows={3}
            className="p-3 border w-full rounded"
          />

          <input
            type="number"
            min={1}
            placeholder="Quantity"
            {...register("quantity")}
            className="p-3 border w-full rounded"
          />
          {errors.quantity && (
            <p className="text-red-600">{errors.quantity.message}</p>
          )}

          <input
            type="number"
            min={0}
            placeholder="Discount Price"
            {...register("discountPrice")}
            className="p-3 border w-full rounded"
          />
          {errors.discountPrice && (
            <p className="text-red-600">{errors.discountPrice.message}</p>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("isOffer")} />
            <span>Mark as Offer</span>
          </div>

          <div>
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Product Preview"
                width={150}
                height={150}
                className="rounded mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              className="p-2 border rounded w-full"
            />
          </div>

          <BrandManager value={brands} onChange={setBrands} />

          <button
            type="submit"
            disabled={submitLoading}
            className="bg-primary text-white py-3 px-6 rounded w-full text-lg disabled:opacity-60"
          >
            {submitLoading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </AdminRoute>
  );
}
