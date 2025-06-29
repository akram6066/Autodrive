"use client";

import { ReactNode,  } from "react";
import { SessionProvider,  } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { useGlobalCartMerge } from "@/hooks/useGlobalCartMerge";

function CartMergeWrapper({ children }: { children: ReactNode }) {
  // ✅ We can safely call useSession() here since SessionProvider already wrapped this
  useGlobalCartMerge();

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <CartMergeWrapper>
          {children}
        </CartMergeWrapper>
      </CartProvider>
    </SessionProvider>
  );
}
