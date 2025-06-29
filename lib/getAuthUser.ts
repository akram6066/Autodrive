import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";  // ✅ This is your file

export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id as string;
}
