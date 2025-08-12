"use client";

interface LoadingSkeletonProps {
  type?: "grid" | "list" | "card";
  count?: number;
  columns?: number;
  height?: number;
  rounded?: string; // Tailwind rounding (e.g., "rounded-lg")
}

export default function LoadingSkeleton({
  type = "grid",
  count = 6,
  columns = 3,
  height = 320,
  rounded = "rounded-xl",
}: LoadingSkeletonProps) {
  // Classes for item size
  const getClasses = () => {
    if (type === "list") return "w-full h-20";
    if (type === "card") return "w-full";
    return "w-full";
  };

  // Grid column classes
  const gridColsClass =
    {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
    }[columns] || "lg:grid-cols-3";

  return (
    <div
      className={
        type === "grid"
          ? `grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-6`
          : "flex flex-col gap-4"
      }
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`relative overflow-hidden bg-gray-200 shadow-sm ${rounded} ${getClasses()}`}
          style={{ height: `${height}px` }}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      ))}
    </div>
  );
}
