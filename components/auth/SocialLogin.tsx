"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

export default function SocialLogin() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" }); // after successful login, redirect to home page
    } catch (err) {
      console.error("Google Sign In Error", err);
      setLoading(false);
    }
  };

  return (
    <div>
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
    </div>
  );
}
