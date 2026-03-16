"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Truck, CheckCircle, PackageCheck, X, Mail, Phone, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Helper to format price
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null)
  const [trackingUrl, setTrackingUrl] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)

    // Fetch Orders
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      setLoading(false)
      return
    }

    setOrders(ordersData || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id)
    if (error) alert("Failed to update")
    else fetchOrders()
  }

  const handleShipOrder = async () => {
    if (!shippingOrderId) return
    if (!trackingUrl.trim()) return alert("Please enter a tracking URL")

    const { error } = await supabase
      .from("orders")
      .update({ status: "shipped", tracking_url: trackingUrl })
      .eq("id", shippingOrderId)

    if (error) alert("Failed to update shipping info")
    else {
      setShippingOrderId(null)
      setTrackingUrl("")
      fetchOrders()
    }
  }

  // --- Payment Logic Helper ---
  const getPaymentBadge = (order: any) => {
    // Logic relies purely on payment_method from checkout
    const method = (order.payment_method || "").toLowerCase()
    const isCOD = method.includes('cod') || method.includes('cash') || method.includes('delivery')

    if (isCOD) {
      const remaining = (order.total_amount || 0) - 149
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] whitespace-nowrap">
            Partial (₹149 Paid)
          </Badge>
          <span className="text-[10px] text-gray-400 font-mono">
            Collect: {formatPrice(remaining > 0 ? remaining : 0)}
          </span>
        </div>
      )
    } else {
      // Assume UPI/Card/Netbanking are fully paid
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
          Fully Paid
        </Badge>
      )
    }
  }

  return (
    <div className="text-white p-4 md:p-8 lg:p-14 relative w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Orders Management</h1>
        <Button onClick={fetchOrders} variant="outline" className="border-white/20 text-white w-full sm:w-auto">Refresh</Button>
      </div>

      <div className="rounded-xl border border-white/10 overflow-x-auto bg-[#111] w-full max-w-full">
        <Table>
          <TableHeader className="bg-black/50">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Order ID</TableHead>
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Total</TableHead>
              <TableHead className="text-gray-400">Payment</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">Loading...</TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">No orders found.</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">
                        {order.Address?.first_name || "Guest"} {order.Address?.last_name || ""}
                      </span>
                      <span className="text-xs text-gray-400">{order.customer_email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-yellow-500">{formatPrice(order.total_amount)}</TableCell>

                  {/* Payment Status Column */}
                  <TableCell>
                    {getPaymentBadge(order)}
                  </TableCell>

                  <TableCell><StatusBadge status={order.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === "pending" && (
                        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs" onClick={() => updateStatus(order.id, "confirmed")}>
                          <PackageCheck className="w-3 h-3 mr-1" /> Confirm
                        </Button>
                      )}
                      {order.status === "confirmed" && (
                        <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-500 text-white text-xs" onClick={() => setShippingOrderId(order.id)}>
                          <Truck className="w-3 h-3 mr-1" /> Ship
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button size="sm" className="h-8 bg-green-600 hover:bg-green-500 text-white text-xs" onClick={() => updateStatus(order.id, "delivered")}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Deliver
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 text-gray-400" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Tracking Modal */}
      {shippingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Tracking Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Tracking URL</label>
                <Input
                  placeholder="Paste tracking link here..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="ghost" onClick={() => setShippingOrderId(null)}>Cancel</Button>
                <Button className="bg-purple-600 hover:bg-purple-500 text-white" onClick={handleShipOrder}>
                  Save & Mark Shipped
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-[#1a1a1a] p-6 border-b border-white/10 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Order #{selectedOrder.id.slice(0, 8)}
                  <StatusBadge status={selectedOrder.status} />
                </h2>
                <p className="text-gray-400 text-sm mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Contact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Mail className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs text-gray-400">Email Address</p>
                        <p className="text-sm font-medium text-white">{selectedOrder.customer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><Phone className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs text-gray-400">Phone Number</p>
                        <p className="text-sm font-medium text-white">{selectedOrder.Address?.phone || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Shipping Address</h3>
                  <div className="flex gap-3">
                    <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg h-fit"><MapPin className="w-4 h-4" /></div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p className="font-bold text-white text-base">
                        {selectedOrder.Address?.first_name} {selectedOrder.Address?.last_name}
                      </p>
                      <p>{selectedOrder.Address?.hno}</p>
                      <p>{selectedOrder.Address?.area}</p>
                      <p className="font-medium text-white pt-1">
                        {selectedOrder.Address?.city}, {selectedOrder.Address?.state} - {selectedOrder.Address?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Payment Info in Modal */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Details</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Method</span>
                    <Badge variant="outline" className="capitalize">{selectedOrder.payment_method || "Online"}</Badge>
                  </div>
                  {/* Show detailed breakdown if COD */}
                  {(selectedOrder.payment_method?.toLowerCase().includes('cod') || selectedOrder.payment_method?.toLowerCase().includes('cash')) && (
                    <div className="bg-black/20 p-3 rounded-lg text-sm space-y-1 mt-2">
                      <div className="flex justify-between text-green-400">
                        <span>Advance Paid</span>
                        <span>- ₹149</span>
                      </div>
                      <div className="flex justify-between text-white font-bold pt-1 border-t border-white/10">
                        <span>Amount to Collect</span>
                        <span>{formatPrice((selectedOrder.total_amount || 0) - 149)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Items</h3>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-white">{selectedOrder.order_items?.length} Items</span>
                  </div>
                  <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="text-white font-medium">{item.product_name}</p>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-white">{formatPrice(item.price)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
                    <span className="font-bold text-gray-400">Total Amount</span>
                    <span className="font-bold text-yellow-500 text-lg">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  }
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>{status}</span>
}
