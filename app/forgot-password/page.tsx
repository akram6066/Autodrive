"use client"

import { useState } from "react"
import axios from "axios"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await axios.post("/api/auth/forgot-password", { email })
      setMessage(res.data.message)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong")
      } else {
        setError("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Forgot Password</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary"
          />

          {error && <p className="text-error text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl flex justify-center items-center hover:bg-orange-600 transition">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  )
}
