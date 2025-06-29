"use client"

import { ReactNode } from "react"

export default function Button({ children, onClick, type = "button", className = "" }: {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-primary hover:bg-orange-600 text-white py-3 px-6 rounded-xl transition font-semibold ${className}`}
    >
      {children}
    </button>
  )
}
