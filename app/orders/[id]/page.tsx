"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { formatPrice } from "@/utils/price";

interface Order {
  _id: string;
  total: number;
  paymentMethod: string;
  status: string;
  phone: string;
  items: {
    name: string;
    variant?: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  user: {
    name: string;
  };
  createdAt: string;
}

// Skeleton Loading Component
function OrderSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-pulse">
      <div className="h-8 w-1/4 bg-gray-200 rounded"></div>

      {/* Status + Payment Skeleton */}
      <div className="border p-4 rounded-lg space-y-2 bg-white shadow">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="h-4 w-3/4 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* Customer Skeleton */}
      <div className="border p-4 rounded-lg space-y-2 bg-white shadow">
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className="h-4 w-1/2 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* Items Skeleton */}
      <div className="border p-4 rounded-lg bg-white shadow">
        <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Tracking Skeleton */}
      <div className="border p-4 rounded-lg bg-white shadow">
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function SingleOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) return <OrderSkeleton />;

  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Order Summary</h1>

      {/* Status + Payment */}
      <div className="border p-4 rounded-lg space-y-2 bg-white shadow">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        <p><strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Total:</strong> {formatPrice(order.total)}</p>
      </div>

      {/* Customer */}
      <div className="border p-4 rounded-lg space-y-2 bg-white shadow">
        <h2 className="text-lg font-semibold">Customer Info</h2>
        <p><strong>Name:</strong> {order.user.name}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
      </div>

      {/* Items */}
      <div className="border p-4 rounded-lg bg-white shadow">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3"
            >
              <div className="flex items-center space-x-4 w-full">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                    priority={idx === 0}
                    onError={(e) => {
                      e.currentTarget.src = "/images/fallback.png";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  {item.variant && <p className="text-sm text-gray-500">Variant: {item.variant}</p>}
                </div>
              </div>
              <div className="text-right mt-2 sm:mt-0 sm:w-auto w-full">
                <p className="text-sm sm:text-base">{item.quantity} x {formatPrice(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Tracking */}
      <div className="border p-4 rounded-lg bg-white shadow">
        <h2 className="text-lg font-semibold mb-2">Delivery Tracking</h2>
        <p className="text-sm text-gray-500 italic">Tracking will be available soon...</p>
      </div>
    </div>
  );
}