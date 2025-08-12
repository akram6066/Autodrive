"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import { ReactNode, useEffect, useState } from "react";
import AuthRedirectHandler from "@/components/auth/AuthRedirectHandler";

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <>
      <AuthRedirectHandler />
      {!isAdmin && <Header />}
      <main>{children}</main>
    </>
  );
}
