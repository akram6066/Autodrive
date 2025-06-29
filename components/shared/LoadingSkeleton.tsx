interface LoadingSkeletonProps {
  type?: "grid" | "list" | "card";
  count?: number;
  columns?: number;
  height?: number;
}

export default function LoadingSkeleton({
  type = "grid",
  count = 6,
  columns = 3,
  height = 320,
}: LoadingSkeletonProps) {
  const getClasses = () => {
    if (type === "list") return "w-full h-20";
    if (type === "card") return `w-full h-[${height}px]`;
    return `h-[${height}px] w-full`;
  };

  const skeletonItems = Array.from({ length: count });

  return (
    <div
      className={
        type === "grid"
          ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-6 animate-pulse`
          : "flex flex-col gap-4 animate-pulse"
      }
    >
      {skeletonItems.map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 rounded-xl shadow-sm ${getClasses()}`}
        />
      ))}
    </div>
  );
}
