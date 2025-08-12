import { Metadata } from "next";
import ProductsClientPage from "@/components/products/ProductsClientPage";

export const metadata: Metadata = {
  title: "Browse Products | AutoDrive",
  description: "Find the best products with filtering, pricing, brands and more.",
  openGraph: {
    title: "Browse Products | AutoDrive",
    description: "Find the best products with filtering, pricing, brands and more.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/products`,
    siteName: "AutoDrive",
    type: "website",
  },
};

export default function ProductsPage() {
  return <ProductsClientPage />;
}
