// components/auth/AuthRedirectHandler.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthRedirectHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const redirectPath = localStorage.getItem("redirect_after_login");
      if (redirectPath) {
        localStorage.removeItem("redirect_after_login");
        router.push(redirectPath);
      }
    }
  }, [status, session, router]);

  return null;
}
