"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

interface Props {
  total: number;
  currentPage: number;
  pageSize: number;
}

export default function ProductsPagination({ total, currentPage, pageSize }: Props) {
  const safeTotal = useMemo(
    () => (Number.isFinite(total) && total >= 0 ? total : 0),
    [total]
  );
  const safePageSize = useMemo(
    () => (Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 12),
    [pageSize]
  );
  const totalPages = useMemo(
    () => Math.ceil(safeTotal / safePageSize),
    [safeTotal, safePageSize]
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);

    return pages;
  };

  const pages = useMemo(getPageNumbers, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/products?${params.toString()}`);

    // ✅ Smooth scroll to top after route update
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 50);
    }
  };

  return (
    <nav className="flex justify-center mt-10 gap-1" aria-label="Pagination Navigation">
      {/* Prev Button */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-xl border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        aria-label="Previous Page"
      >
        Prev
      </button>

      {/* Page Buttons */}
      {pages.map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={idx}
            onClick={() => goToPage(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`px-4 py-2 rounded-xl border font-semibold ${
              page === currentPage
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="px-3 py-2 text-gray-500">
            {page}
          </span>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-xl border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        aria-label="Next Page"
      >
        Next
      </button>
    </nav>
  );
}
