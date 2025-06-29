// app/client-providers.tsx
"use client";

import { Providers } from "./providers";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
