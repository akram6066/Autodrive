// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Loader2 } from "lucide-react";

// export default function VerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const emailParam = searchParams.get("email");

//   const emailFromUrl = emailParam ? emailParam.trim().toLowerCase() : "";

//   const [code, setCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // ✅ Check if email param missing
//   useEffect(() => {
//     if (!emailFromUrl) {
//       setError("Verification link invalid or expired. Please register again.");
//     }
//   }, [emailFromUrl]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       if (!emailFromUrl) {
//         throw new Error("Email is missing.");
//       }
//       if (!code || code.trim().length < 4) {
//         throw new Error("Please enter a valid verification code.");
//       }

//       const res = await axios.post("/api/auth/verify", {
//         email: emailFromUrl,
//         code: code.trim(),
//       });

//       setMessage(res.data.message);
//       setTimeout(() => router.push("/"), 2000);
//     } catch (err: unknown) {
//       if (axios.isAxiosError(err)) {
//         setError(err.response?.data?.message || "Something went wrong");
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Something went wrong");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     setError("");
//     setMessage("");
//     setLoading(true);

//     try {
//       if (!emailFromUrl) {
//         throw new Error("Email is missing.");
//       }

//       await axios.post("/api/auth/resend-code", { email: emailFromUrl });
//       setMessage("A new verification code has been sent to your email.");
//     } catch (err: unknown) {
//       if (axios.isAxiosError(err)) {
//         setError(err.response?.data?.message || "Something went wrong");
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Something went wrong");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!emailFromUrl) {
//     // ✅ Prevent showing form if email param missing
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-white p-10 rounded-xl shadow">
//           <h1 className="text-2xl font-bold mb-4 text-red-500">
//             Verification link invalid.
//           </h1>
//           <p className="text-gray-600">Please register again to receive a valid link.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md border border-gray-200">
//         <h1 className="text-3xl font-bold text-center mb-8 text-primary">Verify Your Email</h1>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <p className="text-center text-gray-600">
//             Verifying for: <span className="font-semibold">{emailFromUrl}</span>
//           </p>

//           <input
//             type="text"
//             placeholder="Enter Verification Code"
//             value={code}
//             onChange={(e) => setCode(e.target.value.trim())}
//             className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary"
//           />

//           {error && <p className="text-red-500 text-sm">{error}</p>}
//           {message && <p className="text-green-500 text-sm">{message}</p>}

//           <button
//             type="submit"
//             disabled={loading || !code}
//             className="w-full bg-primary text-white py-3 rounded-xl flex justify-center items-center hover:bg-orange-600 transition"
//           >
//             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify"}
//           </button>
//         </form>

//         <div className="text-center mt-4">
//           <button
//             onClick={handleResend}
//             disabled={loading}
//             className="text-sm text-blue-500 hover:underline"
//           >
//             Resend Code
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { Suspense } from "react";
import VerifyClient from "@/components/verify/VerifyClient";

// Define the return type for validateEmail
type ValidateEmailResult =
  | { isValid: true; email: string; message?: never }
  | { isValid: false; email?: never; message: string };

// Server-side function to validate email param
async function validateEmail(email: string | undefined): Promise<ValidateEmailResult> {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "Verification link invalid or expired. Please register again." };
  }
  return { isValid: true, email: email.trim().toLowerCase() };
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams; // Await searchParams for query parameters
  const validationResult = await validateEmail(email);

  if (!validationResult.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Verification link invalid.</h1>
          <p className="text-gray-600">{validationResult.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyClient email={validationResult.email} /> {/* TypeScript now knows email is string */}
      </Suspense>
    </div>
  );
}

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";