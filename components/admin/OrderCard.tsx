import { Order } from "@/app/admin/orders/page";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";
import Link from "next/link";

interface Props {
  order: Order;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
}

export default function OrderCard({ order, onStatusChange, onDelete }: Props) {
  return (
    <div className="border p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-medium">#{order._id.slice(-6)} - {order.user?.name}</p>
          <p className="text-sm text-gray-500">{order.user?.email}</p>
        </div>
        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
      </div>

      <div className="text-sm text-gray-700 mb-2 space-y-1">
        {order.items.map((item, i) => (
          <div key={i}>{item.name} ({item.variant}) × {item.quantity}</div>
        ))}
      </div>

      <div className="text-sm text-gray-600 mb-1">
        <p>Phone: {order.phone}</p>
        <p>Address: {order.address}</p>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Total: KES {order.total}</span>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButtons
          order={order}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
        {order.user?._id && (
          <Link
            href={`/admin/users/${order.user._id}`}
            className="text-sm text-blue-600 underline"
          >
            View Full Profile
          </Link>
        )}
      </div>
    </div>
  );
}
