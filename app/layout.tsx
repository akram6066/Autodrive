// import "./globals.css";
// import { Providers } from "./providers";
// import { Toaster } from "react-hot-toast";
// import Header from "@/components/layout/Header";

// export const metadata = {
//   title: "AutoDrive",
//   description: "Professional SaaS Store",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className="pt-20" suppressHydrationWarning>
//         <Providers>
//           <Header />
//           <main>{children}</main>
//           <Toaster position="top-right" />
//         </Providers>
//       </body>
//     </html>
//   );
// }


// app/layout.tsx
// app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export const metadata = {
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
