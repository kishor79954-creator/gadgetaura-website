"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { StackProduct } from "@/components/ui/vertical-image-stack"
import { VerticalImageStack } from "@/components/ui/vertical-image-stack"

export function DynamicPremiumStack() {
  const [premium, setPremium] = useState<StackProduct[]>([])

  useEffect(() => {
    const fetchPremium = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, image_url, homepageslot, stock")
        .in("homepageslot", [11, 12, 13, 14, 15])
        .eq("status", "active")
        .order("homepageslot", { ascending: true })

      if (data) setPremium(data as unknown as StackProduct[])
    }
    fetchPremium()
  }, [])

  // Placeholder data if no premium products are found
  const placeholders = [
    { id: "p1", name: "Cyberpunk Headset", image_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80", price: 12999 },
    { id: "p2", name: "Neon Sneakers", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", price: 8999 },
    { id: "p3", name: "Future Watch", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", price: 24999 },
    { id: "p4", name: "Retro Camera", image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80", price: 45000 },
    { id: "p5", name: "Smart Speaker", image_url: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=800&q=80", price: 9999 },
  ]

  return (
    <section className="py-8 text-foreground overflow-hidden">
      {/* Use real data if available, otherwise placeholders */}
      <VerticalImageStack products={premium.length > 0 ? premium : placeholders} />
    </section>
  )
}
