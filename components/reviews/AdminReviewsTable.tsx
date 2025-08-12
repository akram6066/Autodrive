// components/AdminReviewsTable.tsx
"use client";

import React, { useEffect, useState } from "react";

type AdminReviewRow = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { _id: string; name?: string; email?: string };
  product?: { _id: string; name?: string; slug?: string };
};

export default function AdminReviewsTable() {
  const [rows, setRows] = useState<AdminReviewRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = (await res.json()) as AdminReviewRow[];
        setRows(data);
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch {
      alert("Network error");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="text-left">
            <th className="p-2 border">User</th>
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Rating</th>
            <th className="p-2 border">Comment</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="align-top">
              <td className="p-2 border">{r.user?.name ?? r.user?.email ?? "—"}</td>
              <td className="p-2 border">{r.product?.name ?? "—"}</td>
              <td className="p-2 border">{r.rating}</td>
              <td className="p-2 border">{r.comment}</td>
              <td className="p-2 border">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="p-2 border">
                <button
                  onClick={() => void deleteReview(r._id)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
