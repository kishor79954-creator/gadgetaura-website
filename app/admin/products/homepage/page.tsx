"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ProductRow = {
  id: string
  name: string
  price: number
  image_url: string | null
  homepageslot: number | null
}

export default function AssignHomepageSlotPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const slot = Number(sp.get("slot") || "0")
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [products, setProducts] = useState<ProductRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slot || slot < 1) {
      router.replace("/admin/products")
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("products")
        .select("id,name,price,image_url,homepageslot")
        .order("created_at", { ascending: false })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setProducts((data ?? []) as ProductRow[])
      setLoading(false)
    }

    load()
  }, [slot, router])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return products
    return products.filter(p => p.name.toLowerCase().includes(s))
  }, [q, products])

  const assign = async (productId: string) => {
    setLoading(true)

    // Clear current slot occupant
    const { error: clearErr } = await supabase
      .from("products")
      .update({ homepageslot: null })
      .eq("homepageslot", slot)

    if (clearErr) {
      setError(clearErr.message)
      setLoading(false)
      return
    }

    // Assign new product
    const { error: setErr } = await supabase
      .from("products")
      .update({ homepageslot: slot })
      .eq("id", productId)

    if (setErr) {
      setError(setErr.message)
      setLoading(false)
      return
    }

    router.push("/admin/products")
  }

  if (loading) return <div className="text-white p-8 lg:p-14">Loading...</div>

  return (
    <div className="text-white p-8 lg:p-14">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assign Homepage Slot #{slot}</h1>
        <Button asChild variant="secondary">
          <Link href="/admin/products">← Back</Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200">
          {error}
        </div>
      )}

      <div className="mb-6 max-w-md">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product by name..."
          className="bg-[#111] border-white/10"
        />
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-auto">
        {filtered.map((p) => (
          <div key={p.id} className="border border-white/10 rounded-xl p-4 flex items-center justify-between bg-black/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.name}</div>
                <div className="text-xs text-gray-400">
                  ₹{Number(p.price).toLocaleString()}
                  {p.homepageslot ? (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      Slot #{p.homepageslot}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <Button
              className="bg-yellow-500 hover:bg-yellow-400 text-black"
              onClick={() => assign(p.id)}
              disabled={loading}
            >
              Put in Slot #{slot}
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-gray-400 p-8 text-center">No products found. Create some first!</div>
        )}
      </div>
    </div>
  )
}
