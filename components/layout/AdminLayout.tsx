"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, PackageCheck, ShoppingCart, Users, Layers } from "lucide-react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: PackageCheck },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">

      {/* Sidebar */}
      <div className={`bg-white w-64 shadow-lg fixed z-50 top-0 left-0 h-full transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 md:translate-x-0`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold text-orange-500">AutoDrive</h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden">
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-3 rounded-xl transition ${pathname === item.href ? "bg-orange-500 text-white" : "hover:bg-orange-100 text-gray-700"}`}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        {/* Top Bar */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(true)} className="md:hidden">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-medium text-gray-600">Hello, Admin</p>
            <Link href="/" className="bg-orange-500 text-white py-2 px-4 rounded-xl">Logout</Link>
          </div>
        </div>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
