"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { useGlobalCartMerge } from "@/hooks/useGlobalCartMerge";

export default function GlobalClientProviders({ children }: { children: ReactNode }) {
  // ✅ Trigger global cart merge logic
  useGlobalCartMerge();

  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
