"use client"

import { useEffect, useMemo, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { BadgeCheck, Package, Truck, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type OrderRow = {
  id: string
  created_at: string
  total_amount: number
  status: string
  tracking_url?: string // Added this field
  items: any[]
  Address?: any
}

const STEPS = [
  { key: "pending", label: "Order placed", Icon: BadgeCheck },
  { key: "confirmed", label: "Confirmed", Icon: Package },
  { key: "shipped", label: "Shipped", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: Home },
] as const

function getStepIndex(status: string | null | undefined) {
  const i = STEPS.findIndex((s) => s.key === (status || "pending").toLowerCase())
  return i === -1 ? 0 : i
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [order, setOrder] = useState<OrderRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setErrorMsg(null)

      // 1. Fetch Order - Added tracking_url to select
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, status, tracking_url, Address") 
        .eq("id", id)
        .single()

      if (orderError) {
        if (mounted) setErrorMsg(orderError.message)
        setLoading(false)
        return
      }

      // 2. Fetch Items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id)

      if (mounted) {
        if (itemsError) {
           console.error("Error fetching items:", itemsError)
        }
        setOrder({ ...orderData, items: itemsData || [] } as OrderRow)
        setLoading(false)
      }
    }

    if (id) load()

    return () => {
      mounted = false
    }
  }, [id])

  const activeIndex = useMemo(() => getStepIndex(order?.status), [order?.status])

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <p className="text-gray-400">Loading order…</p>
      </main>
    )
  }

  if (errorMsg || !order) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">Order not found</p>
          <Link className="underline" href="/orders">Back to orders</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div className="text-sm text-gray-400">
              Total: <span className="text-white font-bold">₹{Number(order.total_amount ?? 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="relative mt-10 mb-12">
            <div className="absolute left-4 right-4 top-6 h-[2px] bg-white/10" />
            <div
              className="absolute left-4 top-6 h-[2px] bg-yellow-500/70 transition-all duration-500"
              style={{
                width: activeIndex === 0 ? "0%" : `${(activeIndex / (STEPS.length - 1)) * 100}%`,
              }}
            />

            <div className="grid grid-cols-4 gap-3">
              {STEPS.map((s, idx) => {
                const isDone = idx < activeIndex
                const isActive = idx === activeIndex
                const Icon = s.Icon

                return (
                  <div key={s.key} className="text-center relative z-10">
                    <div className="flex justify-center">
                      <div
                        className={[
                          "h-12 w-12 rounded-full grid place-items-center border transition-all duration-300 bg-[#0F0F11]",
                          isDone
                            ? "border-yellow-500 text-yellow-500"
                            : isActive
                            ? "border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                            : "border-white/10 text-gray-600",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className={`mt-3 text-xs font-bold uppercase ${isActive || isDone ? "text-yellow-500" : "text-gray-600"}`}>
                      {s.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Items + Address */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Items</p>
              <div className="space-y-3 text-sm">
                {(order.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                    <span className="text-gray-200">
                      {it.product_name || "Product"} <span className="text-xs text-gray-500">× {it.quantity}</span>
                    </span>
                    <span className="text-white font-semibold">
                      ₹{Number(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Delivery address</p>
                {order.Address ? (
                   <>
                    <p className="text-sm text-gray-200 font-bold">
                        {order.Address.first_name} {order.Address.last_name}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {order.Address.formatted || `${order.Address.hno}, ${order.Address.city}`}
                    </p>
                   </>
                ) : (
                    <p className="text-sm text-gray-500">No address details available.</p>
                )}
              </div>
            </div>
          </div>
          
          {/* TRACK SHIPPING BUTTON - UPDATED */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <Button 
                asChild={!!order.tracking_url} // Only render as link if URL exists
                disabled={!order.tracking_url} 
                className={`font-bold h-12 px-8 rounded-xl ${
                    order.tracking_url 
                    ? "bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer" 
                    : "bg-white/10 text-gray-500 cursor-not-allowed hover:bg-white/10"
                }`}
                onClick={(e) => {
                    if (!order.tracking_url) {
                        e.preventDefault()
                    }
                }}
              >
                 {order.tracking_url ? (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                       <Truck className="w-5 h-5 mr-2" /> Track Shipment
                    </a>
                 ) : (
                    <span className="flex items-center">
                       <Truck className="w-5 h-5 mr-2" /> Tracking Not Available
                    </span>
                 )}
              </Button>
          </div>

        </div>
      </div>
    </main>
  )
}

