"use client";

import { useSearchParams, useRouter } from "next/navigation";

interface Props {
  total: number;
  currentPage: number;
  pageSize: number;
}

export default function ProductsPagination({ total, currentPage, pageSize }: Props) {
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : 0;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 12;
  const totalPages = Math.ceil(safeTotal / safePageSize);

  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex justify-center mt-10 gap-2">
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;
        return (
          <button
            key={`page-${index}`}
            onClick={() => goToPage(page)}
            className={`px-4 py-2 rounded-xl border font-semibold ${
              page === currentPage
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}
