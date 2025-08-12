/*
File: app/admin/orders/page.tsx
Split into components:
- OrderFilter
- OrderCard
- StatusBadge
- ActionButtons
*/

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader } from "lucide-react";
import OrderFilter from "@/components/admin/OrderFilter";
import OrderCard from "@/components/admin/OrderCard";

export interface OrderItem {
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Order {
 paymentMethod: "cod" | "mpesa";
  _id: string;
  items: OrderItem[];
  total: number;
  phone?: string;
  address?: string;
  status: "pending" | "paid" | "shipped";
  createdAt: string;
  user?: User;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "shipped">("all");

  useEffect(() => {
    axios
      .get("/api/admin/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Admin order error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`/api/admin/orders/${orderId}`);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((order) => order.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Admin Order Management</h1>

      <OrderFilter filter={filter} setFilter={setFilter} />

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
