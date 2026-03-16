"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { ThumbsUp, PackageSearch, BadgeCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const awb = searchParams.get("awb")

  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Tracking page (example link)
  const trackingUrl = "https://www.shiprocket.in/shipment-tracking/"

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div
        className={[
          "max-w-xl w-full rounded-2xl border border-white/10 bg-[#0F0F11] p-8 text-center",
          "transition-all duration-500 ease-out",
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        ].join(" ")}
      >
        {/* Animated icon */}
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-yellow-500/10 grid place-items-center relative">
          <div className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping" />
          <ThumbsUp className="h-10 w-10 text-yellow-500" />
        </div>

        <h1 className="text-3xl font-bold mb-2 font-serif">Order Placed Successfully!</h1>
        <p className="text-gray-400 mb-8">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        <div className="text-left rounded-xl border border-white/10 bg-black/30 p-5 mb-8">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Order ID</p>
          <p className="font-mono text-lg text-white break-all font-bold">{orderId || "Processing..."}</p>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Tracking Info</p>
            <p className="text-sm text-gray-400">
              {awb ? `AWB: ${awb}` : "Tracking details will be updated once shipped."}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Track shipment */}
          <Button asChild className="w-full h-12 text-lg font-bold bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl">
            <a href={trackingUrl} target="_blank" rel="noreferrer">
              <PackageSearch className="mr-2 h-5 w-5" /> Track Shipment
            </a>
          </Button>

          {/* Check order status */}
          <Button asChild variant="outline" className="w-full h-12 text-lg border-white/20 hover:bg-white/10 text-white rounded-xl">
            <Link href={orderId ? `/orders/${orderId}` : "/orders"}>
              <BadgeCheck className="mr-2 h-5 w-5" /> Check Order Status
            </Link>
          </Button>

          <Link href="/" className="block text-gray-500 text-sm hover:text-white mt-6 transition-colors">
            Continue Shopping <ArrowRight className="inline h-3 w-3 ml-1"/>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
