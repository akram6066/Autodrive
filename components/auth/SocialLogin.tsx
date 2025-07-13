"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

export default function SocialLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError("Access denied. You may not have permission to sign in with Google.");
        setLoading(false);
      } else {
        // Let useSession/useEffect on login page handle redirection
        router.refresh(); // Ensures session updates immediately
      }
    } catch (err) {
      console.error("Google Sign In Error", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`flex items-center justify-center w-full border rounded p-3 hover:bg-gray-100 transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <FcGoogle className="w-5 h-5 mr-2" />
        )}
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
