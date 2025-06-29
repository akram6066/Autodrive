"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loader2 } from "lucide-react"

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await axios.post("/api/auth/register", form)
      router.push("/login")
    } catch (err) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" onChange={handleChange} type="text" placeholder="Name" className="w-full p-3 border rounded" />
      <input name="email" onChange={handleChange} type="email" placeholder="Email" className="w-full p-3 border rounded" />
      <input name="password" onChange={handleChange} type="password" placeholder="Password" className="w-full p-3 border rounded" />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded flex justify-center items-center">
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Register"}
      </button>
    </form>
  )
}
