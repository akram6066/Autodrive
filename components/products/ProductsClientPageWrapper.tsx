// ProductsClientPageWrapper.tsx
"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ProductsClientPage = dynamic(() => import("./ProductsClientPage"), {
  ssr: false,
});

export default function ProductsClientPageWrapper() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;
  return <ProductsClientPage />;
}
