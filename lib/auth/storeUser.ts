// lib/auth/storeUser.ts
import { Session } from "next-auth";

export function storeAuthUser(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session?.user?.id) return;

  try {
    localStorage.setItem("auth-user", JSON.stringify({ id: session.user.id }));
  } catch (err) {
    console.error("❌ Failed to save auth-user to localStorage:", err);
  }
}
