interface Props {
  filter: "all" | "pending" | "paid" | "shipped";
  setFilter: (f: "all" | "pending" | "paid" | "shipped") => void;
}

export default function OrderFilter({ filter, setFilter }: Props) {
  const filters = ["all", "pending", "paid", "shipped"] as const;

  return (
    <div className="mb-4">
      <label className="mr-2 font-medium">Filter:</label>
      {filters.map((s) => (
        <button
          key={s}
          onClick={() => setFilter(s)}
          className={`px-3 py-1 text-sm rounded border mr-2 ${
            filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
