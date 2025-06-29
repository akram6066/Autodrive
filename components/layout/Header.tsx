"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const router = useRouter();  // ✅ Fixed!

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.ico" width={40} height={40} alt="AutoDrive Logo" />
          <span className="font-bold text-xl text-gray-900">AutoDrive</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="hover:text-orange-500 font-medium">Products</Link>

          <button aria-label="View Cart" className="relative" onClick={() => router.push("/cart")}>
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-orange-500" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {session ? (
            <>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-800">{session.user?.name}</span>
              </div>
              <button onClick={() => signOut()} className="btn-orange">Logout</button>
            </>
          ) : (
            <button onClick={() => signIn()} className="btn-orange">Login</button>
          )}
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-inner px-4 py-6 space-y-4">
          <Link href="/products" onClick={() => setMenuOpen(false)} className="block text-lg font-medium">Products</Link>

          {session ? (
            <>
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5 text-orange-500" />
                <span>{session.user?.name}</span>
              </div>
              <button onClick={() => signOut()} className="btn-orange w-full">Logout</button>
            </>
          ) : (
            <button onClick={() => signIn()} className="btn-orange w-full">Login</button>
          )}
        </div>
      )}
    </header>
  );
}
