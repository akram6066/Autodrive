"use client";

import { useEffect, useState } from "react";
import { Review } from "@/types/review";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState<number>(1);
  const [editComment, setEditComment] = useState<string>("");

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch(
      `/api/admin/reviews?page=${page}&limit=10&search=${encodeURIComponent(
        search
      )}&rating=${rating}`
    );
    const data = await res.json();
    setReviews(data.reviews);
    setPages(data.pages);
    setLoading(false);
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    setReviews((prev) => prev.filter((r) => r._id !== id)); // optimistic update
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  }

  function openEditModal(review: Review) {
    setEditReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditModalOpen(true);
  }

  async function saveReview() {
    if (!editReview) return;

    // optimistic update
    setReviews((prev) =>
      prev.map((r) =>
        r._id === editReview._id
          ? { ...r, rating: editRating, comment: editComment }
          : r
      )
    );

    await fetch(`/api/admin/reviews/${editReview._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: editRating,
        comment: editComment,
      }),
    });

    setEditModalOpen(false);
    fetchReviews();
  }

  useEffect(() => {
    fetchReviews();
  }, [page, search, rating]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Review Management</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Ratings</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r.toString()}>
              {r} Stars
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Rating</th>
              <th className="p-2 border">Comment</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td className="p-2 border">{review.product?.name}</td>
                <td className="p-2 border">{review.user?.name}</td>
                <td className="p-2 border">{review.rating}</td>
                <td className="p-2 border">{review.comment}</td>
                <td className="p-2 border">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => openEditModal(review)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border ${
              page === i + 1 ? "bg-blue-500 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Edit Modal */}
      {editModalOpen && editReview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Review</h2>
            <label className="block mb-2">Rating</label>
            <select
              value={editRating}
              onChange={(e) => setEditRating(Number(e.target.value))}
              className="border p-2 rounded w-full mb-4"
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} Stars
                </option>
              ))}
            </select>

            <label className="block mb-2">Comment</label>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveReview}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
