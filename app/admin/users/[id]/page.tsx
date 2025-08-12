// app/admin/users/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Order {
  _id: string;
  total: number;
  status: "pending" | "paid" | "shipped";
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export default function AdminUserProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/admin/users/${params.id}`)
      .then((res) => {
        setUser(res.data.user);
        setOrders(res.data.orders);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center items-center h-60"><Loader className="animate-spin" /></div>;
  }

  if (!user) {
    return <div className="text-center text-red-500 mt-10">User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role ?? "user"}</p>
        <p><strong>User ID:</strong> {user._id}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded p-4 shadow-sm">
              <p><strong>Order ID:</strong> {order._id.slice(-6)}</p>
              <p><strong>Total:</strong> KES {order.total}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Date:</strong> {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
