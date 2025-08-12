"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, X, PackageSearch } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  // Subscribe to cart quantity
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setHydrated(true);
  }, []);

  const CartButton = () => (
    <button
      aria-label="View Cart"
      className="relative"
      onClick={() => router.push("/cart")}
    >
      <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-orange-500" />
      {hydrated && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.ico"
            width={40}
            height={40}
            alt="AutoDrive Logo"
          />
          <span className="font-bold text-xl text-gray-900">AutoDrive</span>
        </Link>

        {/* Mobile: Cart + Menu */}
        <div className="md:hidden flex items-center gap-4">
          <CartButton />
          <button onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="hover:text-orange-500 font-medium">
            Products
          </Link>
          <Link
            href="/orders"
            className="hover:text-orange-500 font-medium flex items-center gap-1"
          >
            <PackageSearch className="w-5 h-5" />
            My Orders
          </Link>

          <CartButton />

          {session ? (
            <>
              <Link
                href="/account"
                className="flex items-center gap-2 hover:text-orange-500"
              >
                <User className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-800">
                  {session.user?.name}
                </span>
              </Link>
              <button onClick={() => signOut()} className="btn-orange">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => signIn()} className="btn-orange">
              Login
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-inner px-4 py-6 space-y-4">
          <Link
            href="/products"
            onClick={() => setMenuOpen(false)}
            className="block text-lg font-medium"
          >
            Products
          </Link>
          <Link
            href="/orders"
            onClick={() => setMenuOpen(false)}
            className="block text-lg font-medium"
          >
            My Orders
          </Link>

          {session ? (
            <>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 font-medium"
              >
                My Account
              </Link>
              <button onClick={() => signOut()} className="btn-orange w-full">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => signIn()} className="btn-orange w-full">
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}
