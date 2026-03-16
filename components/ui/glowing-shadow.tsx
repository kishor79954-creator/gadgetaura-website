"use client"
import type { ReactNode } from "react"

export function GlowingShadow({ children }: { children: ReactNode }) {
  return (
    <div className="relative group flex items-center justify-center p-12">
      <div className="absolute inset-0 bg-[#D4AF37]/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative z-10 bg-black border border-[#D4AF37]/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.1)] hover:shadow-[0_0_80px_rgba(212,175,55,0.2)] transition-all duration-500">
        {children}
      </div>
    </div>
  )
}
