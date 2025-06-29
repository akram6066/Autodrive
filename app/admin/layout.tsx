// app/admin/layout.tsx
import AdminLayout from "@/components/layout/AdminLayout";
import "../globals.css"; // ✅ correct relative path
import { Providers } from "../providers";
import { Toaster } from "react-hot-toast";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AdminLayout>
        {children}
      </AdminLayout>
      <Toaster position="top-right" />
    </Providers>
  );
}
