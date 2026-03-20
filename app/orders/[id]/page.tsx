"use client"

import { useEffect, useMemo, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { BadgeCheck, Package, Truck, Home, ArrowLeft, XCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



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
  const { toast } = useToast()

  const [order, setOrder] = useState<OrderRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // -- Cancellation State --
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  // -- Return/Replace State --
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [returnAction, setReturnAction] = useState<"return" | "replace">("replace")
  const [returnReason, setReturnReason] = useState("")
  const [isReturning, setIsReturning] = useState(false)

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

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast({ title: "Please provide a reason", variant: "destructive" })
      return
    }

    setIsCancelling(true)
    const newStatus = `cancelled: ${cancelReason}`

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order?.id)

    if (error) {
      toast({ title: "Failed to cancel order", description: error.message, variant: "destructive" })
      setIsCancelling(false)
      return
    }

    toast({ title: "Order Cancelled Successfully" })
    setOrder(prev => prev ? { ...prev, status: newStatus } : null)
    setIsCancelModalOpen(false)
    setIsCancelling(false)
  }

  const handleReturnOrder = async () => {
    if (!returnReason.trim()) {
      toast({ title: "Please provide a reason", variant: "destructive" })
      return
    }

    setIsReturning(true)
    const newStatus = `${returnAction}_requested: ${returnReason}`

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order?.id)

    if (error) {
      toast({ title: `Failed to request ${returnAction}`, description: error.message, variant: "destructive" })
      setIsReturning(false)
      return
    }

    toast({ title: `${returnAction === 'return' ? 'Return' : 'Replacement'} Requested Successfully` })
    setOrder(prev => prev ? { ...prev, status: newStatus } : null)
    setIsReturnModalOpen(false)
    setIsReturning(false)
  }

  const activeIndex = useMemo(() => getStepIndex(order?.status), [order?.status])
  const bareStatus = (order?.status || "").toLowerCase().split(":")[0] // Clean status for conditions
  
  const canCancel = bareStatus === "pending" || bareStatus === "confirmed"
  const isCancelled = bareStatus === "cancelled"
  
  const canReturn = bareStatus === "delivered"
  const isReturnRequested = bareStatus === "return_requested" || bareStatus === "replacement_requested"

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <p className="text-muted-foreground">Loading order…</p>
      </main>
    )
  }

  if (errorMsg || !order) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-destructive mb-4">Order not found</p>
          <Link className="underline text-primary" href="/orders">Back to orders</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-6 pt-28 pb-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <Link href="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {new Date(order.created_at).toLocaleString()}
              </p>
              {isCancelled && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold border border-destructive/20">
                  <XCircle className="w-3.5 h-3.5" /> Order Cancelled
                </div>
              )}
              {isReturnRequested && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                  <RotateCcw className="w-3.5 h-3.5" /> {bareStatus === "return_requested" ? "Return" : "Replacement"} Processing
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Total: <span className="text-foreground font-bold">₹{Number(order.total_amount ?? 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="relative mt-10 mb-12">
            <div className="absolute left-4 right-4 top-6 h-[2px] bg-muted" />
            <div
              className="absolute left-4 top-6 h-[2px] bg-primary transition-all duration-500"
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
                          "h-12 w-12 rounded-full grid place-items-center border transition-all duration-300 bg-background",
                          isDone
                            ? "border-primary text-primary"
                            : isActive
                            ? "border-primary text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] dark:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                            : "border-border text-muted-foreground",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className={`mt-3 text-xs font-bold uppercase ${isActive || isDone ? "text-primary" : "text-muted-foreground"}`}>
                      {s.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cancellation Alert / Modal */}
          {isCancelled && (
             <div className="mt-8 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium">
               This order has been cancelled. Reason: {order.status.split(": ")[1] || "Not provided"}
             </div>
          )}

          {canCancel && isCancelModalOpen && (
            <div className="mt-10 p-5 rounded-2xl border border-border bg-muted/20 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-destructive" /> Request Order Cancellation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Please let us know why you are cancelling this order so we can improve.</p>
              
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: I found a better price elsewhere, or I ordered the wrong item by mistake..."
                className="w-full min-h-[100px] p-4 rounded-xl border border-border bg-background mb-4 text-sm focus:ring-2 focus:ring-destructive focus:outline-none transition-shadow"
              />
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Nevermind</Button>
                <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
                  {isCancelling ? "Cancelling..." : "Cancel Order"}
                </Button>
              </div>
            </div>
          )}

          {/* Return / Replace Modal */}
          {canReturn && isReturnModalOpen && (
            <div className="mt-10 p-5 rounded-2xl border border-border bg-muted/20 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
                <RotateCcw className="w-5 h-5 text-primary" /> Request Return or Replacement
              </h3>
              
              <div className="grid gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Request Type</label>
                  <Select value={returnAction} onValueChange={(v: "return" | "replace") => setReturnAction(v)}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replace">Item Replacement</SelectItem>
                      <SelectItem value="return">Return & Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Reason / Details</label>
                  <textarea 
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Ex: Item arrived damaged, missing accessories, or sizing issue..."
                    className="w-full min-h-[100px] p-4 rounded-xl border border-border bg-background mb-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>Nevermind</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleReturnOrder} disabled={isReturning}>
                  {isReturning ? "Submitting..." : `Submit ${returnAction === "return" ? "Return" : "Replacement"} Request`}
                </Button>
              </div>
            </div>
          )}

          {/* Items + Address */}
          <div className="grid md:grid-cols-2 gap-4 mt-10">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Items</p>
              <div className="space-y-3 text-sm">
                {(order.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between gap-4 py-2 border-b border-border last:border-0">
                    <span className="text-foreground">
                      {it.product_name || "Product"} <span className="text-xs text-muted-foreground ml-1">× {it.quantity}</span>
                    </span>
                    <span className="text-foreground font-semibold">
                      ₹{Number(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Delivery address</p>
                {order.Address ? (
                   <>
                    <p className="text-sm text-foreground font-bold">
                        {order.Address.first_name} {order.Address.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {order.Address.formatted || `${order.Address.hno}, ${order.Address.city}`}
                    </p>
                   </>
                ) : (
                    <p className="text-sm text-muted-foreground">No address details available.</p>
                )}
              </div>
            </div>
          </div>
          
          {/* ACTION BUTTONS (Track / Cancel / Return) */}
          <div className="mt-8 pt-6 border-t border-border flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {canCancel && !isCancelModalOpen && (
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto py-6 sm:py-2" onClick={() => setIsCancelModalOpen(true)}>
                    Cancel Order
                  </Button>
                )}
                
                {canReturn && !isReturnModalOpen && (
                  <Button variant="outline" className="border-border hover:bg-muted w-full sm:w-auto py-6 sm:py-2" onClick={() => setIsReturnModalOpen(true)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Return / Replace
                  </Button>
                )}
              </div>

              <div className="flex flex-col w-full sm:w-auto sm:items-end gap-2">
                {order.tracking_url ? (
                  <Button asChild className="font-bold h-14 sm:h-12 w-full sm:w-auto px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                       <Truck className="w-5 h-5 mr-2" /> Track Shipment
                    </a>
                  </Button>
                ) : (
                  <div className="text-center sm:text-right px-4 py-3 bg-muted/30 rounded-xl border border-border/50 w-full">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center sm:justify-end gap-2">
                        <Truck className="w-4 h-4 opacity-70" /> 
                        {bareStatus === "pending" ? "Order is not yet confirmed"
                         : bareStatus === "confirmed" ? "Order is not yet shipped"
                         : bareStatus === "shipped" ? "Tracking details updating..."
                         : bareStatus === "cancelled" ? "Tracking unavailable (Cancelled)"
                         : "Tracking unavailable"}
                    </p>
                  </div>
                )}
              </div>
          </div>

        </div>
      </div>
    </main>
  )
}

