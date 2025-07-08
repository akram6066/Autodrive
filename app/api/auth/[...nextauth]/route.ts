
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize NextAuth handler with authOptions from lib/auth.ts
const handler = NextAuth(authOptions);

// Export handlers for GET and POST
export { handler as GET, handler as POST };