"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { handleCartMerge } from "@/lib/cart/mergeOnLogin";
import { storeAuthUser } from "@/lib/auth/storeUser";

export function useGlobalCartMerge() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (status === "authenticated" && session?.user?.id) {
      storeAuthUser(session); // ✅ Save user ID to localStorage
      handleCartMerge();      // ✅ Merge guest cart to server
    }
  }, [mounted, status, session]);
}
