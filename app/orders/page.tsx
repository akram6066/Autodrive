"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import {  PackageCheck, PackageX, Clock } from "lucide-react";
import { formatPrice } from "@/utils/price";
import { useSession } from "next-auth/react";
import clsx from "clsx";

interface Order {
  _id: string;
  items: {
    name: string;
    variant: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const controller = new AbortController();

    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await axios.get("/api/orders", {
          signal: controller.signal,
        });
        setOrders(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError("Failed to load orders.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();

    return () => controller.abort();
  }, [status, session?.user?.id]);

  // Pre-format orders to avoid recalculating inside JSX
  const processedOrders = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        formattedDate: new Date(order.createdAt).toLocaleDateString(),
        totalFormatted: formatPrice(order.total),
      })),
    [orders]
  );

  if (status !== "authenticated") {
    return (
      <div className="text-center mt-20 text-gray-500 space-y-2">
        <p className="text-lg">You must be logged in to view your orders.</p>
        <Link href="/login" className="text-blue-600 hover:underline text-sm">
          Go to Login →
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 grid gap-5">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-2xl p-5 shadow-sm bg-gray-100 animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 text-lg">{error}</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">My Orders</h1>

      {processedOrders.length === 0 ? (
        <div className="text-center text-gray-500 space-y-2">
          <p className="text-lg">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="text-blue-600 hover:underline text-sm"
          >
            Browse products →
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {processedOrders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all bg-white"
            >
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Order #{order._id.slice(-6)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Placed on {order.formattedDate}
                  </p>
                </div>

                <div
                  className={clsx(
                    "flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full",
                    {
                      "bg-green-100 text-green-700":
                        order.status === "delivered",
                      "bg-yellow-100 text-yellow-700":
                        order.status === "pending",
                      "bg-red-100 text-red-700":
                        order.status === "cancelled",
                    }
                  )}
                >
                  {order.status === "delivered" && <PackageCheck size={16} />}
                  {order.status === "pending" && <Clock size={16} />}
                  {order.status === "cancelled" && <PackageX size={16} />}
                  {order.status}
                </div>
              </div>

              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                {order.items.map((item, i) => (
                  <li key={i}>
                    <span className="font-medium">{item.name}</span>{" "}
                    <span className="text-gray-500">
                      ({item.variant}) × {item.quantity}
                    </span>{" "}
                    ={" "}
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center flex-wrap gap-2 border-t pt-3">
                <span className="font-semibold text-gray-900">
                  Total: {order.totalFormatted}
                </span>
                <Link
                  href={`/orders/${order._id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
