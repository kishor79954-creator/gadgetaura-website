"use client"

import dynamic from "next/dynamic"

const EtheralShadow = dynamic(
  () => import("@/components/ui/etheral-shadow").then(m => m.EtheralShadow),
  { ssr: false }
)

export function EtheralShadowClient() {
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
