

// lib/auth.ts

import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

import dbConnect from "@/lib/dbConnect";
import clientPromise from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import AdapterAccount from "@/models/Account";

// Custom User type to fix "Unexpected any"
interface ExtendedUser {
  id?: string;
  _id?: string;
  role?: "user" | "admin";
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password.");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email.");
        }

        if (!user.password) {
          throw new Error("This account uses Google login. Please sign in with Google.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role || "user",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      if (account?.provider === "google") {
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          if (existingUser.role === "admin") {
            return false;
          }

          const alreadyLinked = await AdapterAccount.findOne({
            userId: existingUser._id,
            provider: "google",
          });

          if (!alreadyLinked) {
            await AdapterAccount.create({
              userId: existingUser._id,
              provider: account.provider,
              type: account.type,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            });
          }

          user.id = existingUser._id.toString();
          user.role = existingUser.role ?? "user";
        } else {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: true,
            role: "user",
          });

          user.id = newUser._id.toString();
          user.role = newUser.role;
        }
      }

      return true;
    },

    async jwt({ token, user }: { token: JWT; user?: ExtendedUser }) {
      if (user) {
        token.id = user.id ?? user._id?.toString() ?? "";
        token.role = user.role ?? "user";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
      }
      return session;
    },
  },
};
