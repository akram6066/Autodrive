"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { handleCartMerge } from "@/lib/cart/mergeOnLogin";

export function useGlobalCartMerge() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (status === "authenticated" && session?.user?.id) {
      handleCartMerge();
    }
  }, [mounted, status, session]);
}
