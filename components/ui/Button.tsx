"use client"

import { ReactNode } from "react"

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "destructive"
}

export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  size = "md",
  variant = "default",
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  const variantClasses = {
    default: "bg-primary text-white hover:bg-orange-600",
    outline: "border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-xl font-semibold transition ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
