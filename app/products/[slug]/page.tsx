"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/spotlight-card"

type Category = { id: string; name: string; slug: string }
type Product = { id: string; name: string; price: number; image_url: string | null; status: string }

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      // 1. Get Category
      const { data: cat } = await supabase
        .from("categories")
        .select("id,name,slug")
        .eq("slug", slug)
        .single()

      if (!cat) {
        setCategory(null)
        setLoading(false)
        return
      }
      setCategory(cat)

      // 2. Get Products linked to this category
      const { data: pcData } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", cat.id)

      let productIds: string[] = []
      if (pcData && pcData.length > 0) {
        productIds = pcData.map((pc: any) => pc.product_id)
      }

      // Fetch products that match the old category_id OR are in the new product_categories table
      let productsQuery = supabase
        .from("products")
        .select("id,name,price,image_url,status")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (productIds.length > 0) {
        productsQuery = productsQuery.or(`id.in.(${productIds.join(',')}),category_id.eq.${cat.id}`)
      } else {
        productsQuery = productsQuery.eq("category_id", cat.id)
      }

      const { data: rows } = await productsQuery

      setProducts(rows || [])
      setLoading(false)
    }
    run()
  }, [slug])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>
  if (!category) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Category not found</div>

  return (
    <main className="min-h-screen bg-background text-foreground pt-0 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
          <div>
            <div className="text-primary text-sm font-bold tracking-widest uppercase mb-2">Collection</div>
            <h1 className="text-5xl font-bold font-serif">{category.name}</h1>
          </div>
          <div className="text-muted-foreground text-sm hidden sm:block">
            {products.length} Products Found
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div key={p.id} className="h-full">
              <GlowCard
                glowColor="amber" // Keep amber glow or make dynamic? Keeping for now as it looks premium
                customSize={true}
                className="flex flex-col h-full w-full !p-0 overflow-hidden group border-border bg-card"
              >
                {/* Image Area */}
                <Link href={`/products/detail/${p.id}`} className="relative aspect-square w-full overflow-hidden bg-muted">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">No Image</div>
                  )}
                </Link>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
                    {category.name}
                  </div>

                  <Link href={`/products/detail/${p.id}`}>
                    <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                  </Link>

                  <div className="text-lg font-medium text-foreground/90 mb-6">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </div>

                  <div className="mt-auto grid grid-cols-[1fr,auto] gap-3">
                    <Button
                      asChild
                      variant="cta"
                      size="cta-sm"
                      className="uppercase tracking-wider shadow-md"
                    >
                      <Link href={`/products/detail/${p.id}`}>
                        Add
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="border-border hover:bg-muted"
                    >
                      <Link href={`/products/detail/${p.id}`}>
                        <ArrowRight className="w-5 h-5 text-foreground" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <div className="text-2xl font-bold mb-2">Coming Soon</div>
            <p className="text-muted-foreground">New products are being added to this collection.</p>
          </div>
        )}
      </div>
    </main>
  )
}
