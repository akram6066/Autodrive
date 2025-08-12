// types/user.ts

export type UserRole = "admin" | "user";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string;
  createdAt: string; // keep as string (ISO) from API
}
