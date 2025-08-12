import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import type { Metadata } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://autodrive-55ekodg6j-abdis-projects-f6a5889b.vercel.app"
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "AutoDrive",
  description: "Professional SaaS Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="pt-20" suppressHydrationWarning>
        <Providers>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
