"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"
import SocialLogin from "./SocialLogin"

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      ...form,
      redirect: false
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push("/")
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" onChange={handleChange} type="email" placeholder="Email" className="w-full p-3 border rounded" />
        <input name="password" onChange={handleChange} type="password" placeholder="Password" className="w-full p-3 border rounded" />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded flex justify-center items-center">
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Login"}
        </button>
      </form>

      <div className="my-4 text-center text-gray-500">OR</div>

      <SocialLogin />

      <p className="text-sm text-center text-gray-600 mt-4">
        Don&#39;t have an account?{" "}
        <a href="/register" className="text-orange-500 font-semibold hover:underline">
          Register here
        </a>
      </p>
    </>
  )
}
