"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { PackageSearch, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Order = {
  id: string
  created_at: string
  total_amount: number
  status: string
}

function statusPill(status: string) {
  const s = (status || "pending").toLowerCase()
  if (s === "delivered") return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
  if (s === "shipped") return "bg-sky-500/15 text-sky-300 border border-sky-500/30"
  if (s === "confirmed") return "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
  return "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
}

function labelStatus(status: string) {
  const s = (status || "pending").toLowerCase()
  if (s === "pending") return "Order placed"
  if (s === "confirmed") return "Confirmed"
  if (s === "shipped") return "Shipped"
  if (s === "delivered") return "Delivered"
  return status
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    const loadOrders = async () => {
      setLoading(true)

      const { data: sessionRes } = await supabase.auth.getSession()
      const session = sessionRes.session

      if (!session) {
        router.replace("/auth")
        return
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, status")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (!mounted) return

      if (error) {
        console.log("ORDERS ERROR:", error)
        toast({
          title: "Could not load orders",
          description: error.message,
          variant: "destructive",
        })
        setOrders([])
      } else {
        setOrders((data ?? []) as Order[])
      }

      setLoading(false)
    }

    loadOrders()
    return () => {
      mounted = false
    }
  }, [router, toast])

  if (loading) {
    return (
      <main className="pt-40 text-center text-muted-foreground">
        Loading your orders...
      </main>
    )
  }

  if (orders.length === 0) {
    return (
      <main className="pt-40 pb-24 px-6 min-h-screen flex flex-col items-center text-center">
        <PackageSearch className="w-20 h-20 text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-3">No Orders Yet</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You haven’t placed any orders yet. Start shopping to see your orders here.
        </p>

        <Link href="/shop">
          <Button className="bg-primary text-primary-foreground px-10 py-6 uppercase tracking-widest font-bold">
            <ShoppingBag className="mr-2 w-4 h-4" />
            Start Shopping
          </Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block border border-white/10 rounded-xl p-6 hover:border-primary transition"
            >
              <div className="flex justify-between items-center gap-6">
                <div>
                  <p className="font-bold">Order #{order.id.slice(-8)}</p>

                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>

                  <span className={`inline-flex mt-2 px-3 py-1 text-xs rounded-full ${statusPill(order.status)}`}>
                    {labelStatus(order.status)}
                  </span>
                </div>

                <p className="text-lg font-bold">
                  ₹{Number(order.total_amount ?? 0).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
