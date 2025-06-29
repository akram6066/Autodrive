"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import SocialLogin from "@/components/auth/SocialLogin";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 Redirect automatically after session updates
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", { ...form, redirect: false });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
    // ✅ no need for else block anymore — redirect handled in useEffect above
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary"
            />
            <div className="absolute right-3 top-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl flex justify-center items-center hover:bg-orange-600 transition">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Login"}
          </button>
        </form>

        <div className="my-4 text-center text-gray-500">OR</div>

        <SocialLogin />

        <p className="text-sm text-center text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-primary font-semibold hover:underline">Register</a>
        </p>

        <p className="text-sm text-center text-gray-600 mt-2">
          <a href="/forgot-password" className="text-primary font-semibold hover:underline">Forgot Password?</a>
        </p>
      </div>
    </div>
  )
}
