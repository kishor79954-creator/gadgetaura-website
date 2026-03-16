"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { jwtDecode } from "jwt-decode"

type Order = {
  id: string
  created_at: string
  total_amount: number
  status: string
  items: any
}

type JwtWithRole = {
  user_role?: string
}

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = "/auth"
        return
      }

      setUserEmail(session.user.email ?? null)

      // ✅ Read role from JWT custom claims (added by the Auth Hook)
      const jwt = jwtDecode<JwtWithRole>(session.access_token)
      setUserRole(jwt.user_role ?? null)
      console.log("user_role:", jwt.user_role) // check in browser console

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      setOrders((data as Order[]) || [])
      setLoading(false)
    }

    load()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white">Loading profile...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-400 text-sm">Logged in as {userEmail}</p>
            {/* ✅ optional: show role */}
            <p className="text-gray-500 text-xs mt-1">Role: {userRole ?? "unknown"}</p>
          </div>

          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 border-red-500 text-white"
          >
            Logout
          </Button>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-4">My Orders</h2>

          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet. Start shopping!</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-white/10 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm text-gray-400">Order #{order.id.slice(-8)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-lg font-bold">₹{order.total_amount?.toLocaleString() || 0}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
