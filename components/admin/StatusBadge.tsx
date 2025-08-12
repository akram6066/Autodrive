interface Props {
  status: "pending" | "paid" | "shipped";
}

export default function StatusBadge({ status }: Props) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    shipped: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`px-3 py-1 text-sm rounded-full capitalize ${statusColors[status]}`}
    >
      {status}
    </span>
  );
}
