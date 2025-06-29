// app/ClientLayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import { ReactNode } from "react";

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <main>{children}</main>
    </>
  );
}
