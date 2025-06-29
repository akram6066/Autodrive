"use client";

import AdminRoute from "@/components/AdminRoute";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";

type CategoryType = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data);
    } catch {
      showMessage("Failed to fetch categories", "error");
    }
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory._id}`, formData);
        showMessage("✅ Category updated successfully!", "success");
        setEditingCategory(null);
      } else {
        await axios.post("/api/admin/categories", formData);
        showMessage("✅ Category added successfully!", "success");
      }
      setName("");
      setImage(null);
      fetchCategories();
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      showMessage(axiosError.response?.data?.error || "❌ Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: CategoryType) => {
    setEditingCategory(cat);
    setName(cat.name);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setUpdatingId(id);
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      showMessage("🗑️ Category deleted successfully!", "success");
      fetchCategories();
    } catch {
      showMessage("❌ Delete failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminRoute>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Manage Categories</h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded-xl text-center ${
              message.type === "success"
                ? "text-green-700 bg-green-100 border border-green-300"
                : "text-red-700 bg-red-100 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="p-3 border rounded-xl w-full md:w-[40%]"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files?.[0]) setImage(e.target.files[0]);
            }}
            className="p-3 border rounded-xl w-full md:w-[30%]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-xl w-full md:w-[20%]"
          >
            {loading ? "Saving..." : editingCategory ? "Update" : "Add"}
          </button>
        </form>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center gap-4 bg-white border p-4 rounded-xl shadow-sm">
              {cat.image ? (
                <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              <div className="flex-1">
                <div className="font-semibold">{cat.name}</div>
                <div className="text-gray-400 text-sm">{cat.slug}</div>
              </div>

              <button onClick={() => handleEdit(cat)} className="text-blue-500">Edit</button>
              <button
                onClick={() => handleDelete(cat._id)}
                disabled={updatingId === cat._id}
                className="text-red-500"
              >
                {updatingId === cat._id ? "..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminRoute>
  );
}
