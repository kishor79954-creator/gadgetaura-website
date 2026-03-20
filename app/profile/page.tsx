"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jwtDecode } from "jwt-decode"
import Image from "next/image"
import { Package, User, LogOut, Mail, Shield, Calendar, Clock, CheckCircle2, ChevronRight } from "lucide-react"

type Order = {
  id: string
  created_at: string
  total_amount: number
  status: string
  items: any
  Address?: any
}

type JwtWithRole = {
  user_role?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const handleUpdatePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    
    setUpdatingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    setUpdatingPassword(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess("Password updated successfully")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => {
        setIsChangingPassword(false)
        setPasswordSuccess("")
      }, 2000)
    }
  }

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = "/auth?redirect=/profile"
        return
      }

      setUser(session.user)

      try {
        const jwt = jwtDecode<JwtWithRole>(session.access_token)
        setUserRole(jwt.user_role ?? null)
      } catch (e) {
        console.error("Failed to decode JWT:", e)
      }

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
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading your profile...</p>
        </div>
      </main>
    )
  }

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Valued Customer"
  const email = user?.email
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-24 px-4 md:px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 font-serif tracking-tight">Your Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PROFILE CARD */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent -z-10 group-hover:scale-105 transition-transform duration-500" />
              
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 rounded-full ring-4 ring-background shadow-xl mb-5 overflow-hidden bg-muted">
                  {avatarUrl ? (
                    <Image 
                      src={avatarUrl} 
                      alt={fullName} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{email}</span>
                </div>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Role</span>
                    </div>
                    <span className="font-medium capitalize">{userRole || "User"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Joined</span>
                    </div>
                    <span className="font-medium">{joinDate}</span>
                  </div>
                </div>
              </div>
              
              {!isChangingPassword ? (
                <div className="space-y-3 mt-6 w-full">
                  {email === "kishor79954@gmail.com" && (
                    <Button
                      onClick={() => router.push("/admin")}
                      className="w-full rounded-xl h-11 font-bold shadow-lg hover:scale-[1.02] bg-primary text-primary-foreground transition-all"
                    >
                      <Shield className="w-4 h-4 mr-2" /> Admin Dashboard
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    variant="outline"
                    className="w-full rounded-xl h-11 font-medium transition-all"
                  >
                    Change Password
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full rounded-xl h-11 font-bold shadow-lg shadow-destructive/20 hover:scale-[1.02] transition-all"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-4 mt-6 p-4 border border-border rounded-2xl bg-secondary/20 text-left">
                  <h3 className="font-bold text-sm">Change Password</h3>
                  <div className="space-y-3">
                    <Input 
                      type="password" 
                      placeholder="New Password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="h-10 text-sm"
                    />
                    <Input 
                      type="password" 
                      placeholder="Confirm New Password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="h-10 text-sm"
                    />
                    {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                    {passwordSuccess && <p className="text-xs text-green-500">{passwordSuccess}</p>}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1"
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordError("")
                          setNewPassword("")
                          setConfirmPassword("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={handleUpdatePassword}
                        disabled={updatingPassword}
                      >
                        {updatingPassword ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ORDERS SECTION */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm h-full">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Order History</h2>
                    <p className="text-muted-foreground text-sm mt-1">Track and manage your recent purchases</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary">{orders.length}</span>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Orders</p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 mb-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <Package className="w-10 h-10 opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm">When you place your first order, it will appear here so you can track its status.</p>
                  <Button onClick={() => router.push('/products')} className="h-12 px-8 font-bold rounded-xl">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isCompleted = order.status.toLowerCase() === "completed" || order.status.toLowerCase() === "delivered"
                    
                    return (
                      <div
                        key={order.id}
                        className="border border-border rounded-2xl p-5 md:p-6 transition-all hover:border-primary/30 hover:shadow-md bg-background group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-bold text-foreground bg-secondary px-2 py-1 rounded-md">
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <span
                                className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                                  isCompleted
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                }`}
                              >
                                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                <span className="capitalize">{order.status}</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 opacity-70" />
                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 border-border pt-4 md:pt-0">
                            <p className="text-xl font-bold text-foreground">
                              ₹{order.total_amount?.toLocaleString() || 0}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-xs text-primary font-medium group-hover:bg-primary/10"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              View Details <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
