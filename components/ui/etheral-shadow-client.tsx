"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

const EtheralShadow = dynamic(
  () => import("@/components/ui/etheral-shadow").then(m => m.EtheralShadow),
  { ssr: false }
)

export function EtheralShadowClient() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Only enable the heavy SVG turbulence animation on desktop (≥1024px)
    // On mobile/tablet it costs too much GPU and causes severe lag
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  if (!isDesktop) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <EtheralShadow
        color="rgba(128, 128, 128, 0.4)"
        animation={{ scale: 100, speed: 90 }}
        sizing="fill"
      />
    </div>
  )
}
