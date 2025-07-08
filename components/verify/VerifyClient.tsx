"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface VerifyClientProps {
  email: string; // Explicitly type as string
}

export default function VerifyClient({ email }: VerifyClientProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!code || code.trim().length < 4) {
        throw new Error("Please enter a valid verification code.");
      }

      const res = await axios.post("/api/auth/verify", {
        email,
        code: code.trim(),
      });

      setMessage(res.data.message);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await axios.post("/api/auth/resend-code", { email });
      setMessage("A new verification code has been sent to your email.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md border border-gray-200">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Verify Your Email</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-center text-gray-600">
          Verifying for: <span className="font-semibold">{email}</span>
        </p>

        <input
          type="text"
          placeholder="Enter Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading || !code}
          className="w-full bg-primary text-white py-3 rounded-xl flex justify-center items-center hover:bg-orange-600 transition"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify"}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={handleResend}
          disabled={loading}
          className="text-sm text-blue-500 hover:underline"
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}