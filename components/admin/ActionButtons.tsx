import { Order } from "@/app/admin/orders/page";

interface Props {
  order: Order;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
}

export default function ActionButtons({ order, onStatusChange, onDelete }: Props) {
  const statuses: Order["status"][] = ["pending", "paid", "shipped"];

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onStatusChange(order._id, status)}
          disabled={order.status === status}
          className={`px-3 py-1 rounded text-sm border ${
            order.status === status
              ? "bg-blue-600 text-white cursor-not-allowed opacity-60"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Mark as {status}
        </button>
      ))}
      <button
        onClick={() => onDelete(order._id)}
        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        Delete / Refund
      </button>
    </div>
  );
}
