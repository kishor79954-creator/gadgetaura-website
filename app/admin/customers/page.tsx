"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, User, Pencil } from "lucide-react"

// Helper to format currency
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Edit State
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "", city: "" })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)

    // 1. Fetch Orders
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (orderError) {
      console.error("Error fetching orders:", orderError)
      setLoading(false)
      return
    }

    if (orders && orders.length > 0) {
      const customerMap = new Map()

      orders.forEach(order => {
        const email = order.customer_email || "Unknown"
        // Use native Address JSON from order
        const address = order.Address || order.address

        // Helper to safely get fields
        const getName = (a: any) => {
          if (!a) return null
          if (typeof a === 'string') {
            try { a = JSON.parse(a) } catch (e) { }
          }
          if (a && a.first_name) return `${a.first_name} ${a.last_name || ''}`.trim()
          if (a && a.name) return a.name
          if (a && a.fullName) return a.fullName
          return null
        }

        const getPhone = (a: any) => {
          if (!a) return null
          if (typeof a === 'string') {
            try { a = JSON.parse(a) } catch (e) { }
          }
          if (a) return a.phone || a.mobile || a.contact || a.phone_number || null
          return null
        }

        const getCity = (a: any) => {
          if (!a) return null
          if (typeof a === 'string') {
            try { a = JSON.parse(a) } catch (e) { }
          }
          if (a) return a.city || a.town || a.district || a.location || null
          return null
        }

        const resolvedName = getName(address)
        const resolvedPhone = getPhone(address)
        const resolvedCity = getCity(address)

        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name: resolvedName || email.split('@')[0],
            phone: resolvedPhone || "N/A",
            city: resolvedCity || "N/A",
            totalOrders: 0,
            totalSpent: 0,
            lastOrder: order.created_at,
            addressId: order.address_id, // Keep addressId for update logic
            orderId: order.id, // Store for potential updates later
            qualityScore: (resolvedName ? 1 : 0) + (resolvedPhone ? 1 : 0) + (resolvedCity ? 1 : 0)
          })
        }

        const cust = customerMap.get(email)
        cust.totalOrders += 1
        cust.totalSpent += (order.total_amount || 0)

        if (new Date(order.created_at) > new Date(cust.lastOrder)) {
          cust.lastOrder = order.created_at
          const newScore = (resolvedName ? 1 : 0) + (resolvedPhone ? 1 : 0) + (resolvedCity ? 1 : 0)

          if (newScore >= cust.qualityScore) {
            if (resolvedName) cust.name = resolvedName
            if (resolvedPhone) cust.phone = resolvedPhone
            if (resolvedCity) cust.city = resolvedCity
            cust.addressId = order.address_id // Keep addressId for update logic
            cust.orderId = order.id
            cust.qualityScore = newScore
          }
        }
      })

      setCustomers(Array.from(customerMap.values()))
    } else {
      setCustomers([])
    }

    setLoading(false)
  }

  // --- HANDLE EDIT ---
  const startEdit = (cust: any) => {
    setEditingCustomer(cust)
    setEditForm({
      name: cust.name === "Guest User" ? "" : cust.name,
      phone: cust.phone === "N/A" ? "" : cust.phone,
      city: cust.city === "N/A" ? "" : cust.city
    })
  }

  const saveCustomer = async () => {
    if (!editingCustomer || !editingCustomer.addressId) return alert("Cannot update: No linked address record found.")

    const [firstName, ...lastNameParts] = editForm.name.split(" ")
    const lastName = lastNameParts.join(" ")

    // Update the Address table directly
    const { error } = await supabase
      .from("Address")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: editForm.phone,
        city: editForm.city
      })
      .eq("id", editingCustomer.addressId)

    if (error) {
      // Fallback to lowercase
      const { error: lowerError } = await supabase
        .from("address")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: editForm.phone,
          city: editForm.city
        })
        .eq("id", editingCustomer.addressId)

      if (lowerError) return alert("Failed to update customer info")
    }

    setEditingCustomer(null)
    fetchCustomers() // Refresh
  }

  return (
    <div className="text-white p-4 md:p-8 lg:p-14 w-full max-w-full overflow-x-hidden">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Customers</h1>

      <div className="rounded-xl border border-white/10 overflow-x-auto bg-[#111] w-full max-w-full">
        <Table>
          <TableHeader className="bg-black/50">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Customer</TableHead>
              <TableHead className="text-gray-400">Contact</TableHead>
              <TableHead className="text-gray-400">Location</TableHead>
              <TableHead className="text-gray-400 text-right">Orders</TableHead>
              <TableHead className="text-gray-400 text-right">Total Spent</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500">Loading...</TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500">No customers found.</TableCell></TableRow>
            ) : (
              customers.map((cust, idx) => (
                <TableRow key={idx} className="border-white/10 hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white capitalize">{cust.name}</p>
                        <p className="text-xs text-gray-500">Last seen: {new Date(cust.lastOrder).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Mail className="w-3 h-3" /> {cust.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Phone className="w-3 h-3" /> {cust.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-3 h-3 text-gray-500" /> {cust.city}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-300">
                    {cust.totalOrders}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-500">
                    {formatPrice(cust.totalSpent)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-gray-400"
                      onClick={() => startEdit(cust)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Customer Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                className="bg-black/50 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingCustomer(null)}>Cancel</Button>
            <Button onClick={saveCustomer} className="bg-white text-black hover:bg-gray-200">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
