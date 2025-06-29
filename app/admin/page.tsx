"use client";

import AdminRoute from "@/components/AdminRoute";
import { Users, ShoppingCart, PackageCheck, AlertTriangle, Layers } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";

type ProductType = {
  _id: string;
  name: string;
  quantity: number;
};

export default function AdminHome() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/products");
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const stockOutCount = products.filter((p) => p.quantity <= 0).length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 5).length;

  return (
    <AdminRoute>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-primary mb-10 text-center">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <Link href="/admin/products" className="bg-gradient-to-br from-orange-500 to-orange-400 rounded-2xl shadow-xl p-8 text-white flex items-center gap-6 transition hover:scale-105">
            <PackageCheck className="w-16 h-16" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Total Products</h2>
              <p className="text-3xl font-bold">{loading ? "--" : totalProducts}</p>
            </div>
          </Link>

          <Link href="/admin/categories" className="bg-gradient-to-br from-purple-500 to-purple-400 rounded-2xl shadow-xl p-8 text-white flex items-center gap-6 transition hover:scale-105">
            <Layers className="w-16 h-16" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Categories</h2>
              <p className="text-3xl font-bold">Manage</p>
            </div>
          </Link>

          <Link href="/admin/orders" className="bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl shadow-xl p-8 text-white flex items-center gap-6 transition hover:scale-105">
            <ShoppingCart className="w-16 h-16" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
              <p className="text-3xl font-bold">--</p>
            </div>
          </Link>

          <Link href="/admin/customers" className="bg-gradient-to-br from-green-500 to-green-400 rounded-2xl shadow-xl p-8 text-white flex items-center gap-6 transition hover:scale-105">
            <Users className="w-16 h-16" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Total Customers</h2>
              <p className="text-3xl font-bold">--</p>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-red-500 to-red-400 rounded-2xl shadow-xl p-8 text-white flex items-center gap-6">
            <AlertTriangle className="w-16 h-16" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Stock Alerts</h2>
              <p className="text-lg">Out: <strong>{loading ? "--" : stockOutCount}</strong></p>
              <p className="text-lg">Low: <strong>{loading ? "--" : lowStockCount}</strong></p>
            </div>
          </div>

        </div>
      </div>
    </AdminRoute>
  );
}
