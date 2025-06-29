"use client"

import { InputHTMLAttributes } from "react"

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
    />
  )
}
