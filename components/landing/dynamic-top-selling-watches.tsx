"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"

import { supabase } from "@/lib/supabaseClient"
import dynamic from "next/dynamic"

const HoverBorderGradient = dynamic(() => import("@/components/ui/hover-border-gradient").then((m) => m.HoverBorderGradient), { ssr: false });
const GlowCard = dynamic(() => import("@/components/ui/spotlight-card").then((m) => m.GlowCard), { ssr: false });

type TopSellingProduct = {
  id: string
  name: string
  price: number
  compare_at_price?: number | null
  image_url: string | null
  homepageslot: number
  stock?: number | null
}

export function DynamicTopSellingWatches() {
  const router = useRouter()
  const [products, setProducts] = useState<TopSellingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    const fetchTopSelling = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, image_url, homepageslot, stock")
        .in("homepageslot", [5, 6, 7, 8])
        .eq("status", "active")
        .order("homepageslot", { ascending: true })

      if (!error) setProducts(data ?? [])
      setLoading(false)
    }

    fetchTopSelling()

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse bg-white/5 rounded-2xl border border-white/10"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const cardContent = (
          <div onClick={() => router.push(`/products/detail/${product.id}`)} className="flex flex-col h-full w-full text-left relative">
            {/* Image Area */}
            <div className="relative w-full aspect-square sm:aspect-[4/5] flex-shrink-0">
              {/* DISCOUNT OVERLAY */}
              {product.compare_at_price && product.compare_at_price > product.price && (
                <div className="absolute top-3 right-3 z-30 pointer-events-none">
                  <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-md w-max">
                    {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </span>
                </div>
              )}

              {/* SCARCITY / SOLD OUT OVERLAY */}
              <div className="absolute top-3 left-3 z-30 pointer-events-none flex flex-col gap-2">
                {product.stock !== null && product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                  <span className="bg-indigo-950 text-indigo-200 border border-indigo-900 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm w-max animate-pulse">
                    Only {product.stock} Left!
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="bg-neutral-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm w-max">
                    Sold Out
                  </span>
                )}
              </div>

              <div className="absolute inset-0 block overflow-hidden bg-black border-b border-border/10 rounded-t-2xl">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 bg-muted text-5xl grayscale">
                    ⌚
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Details Area */}
            <div className="flex-1 p-3 sm:p-4 w-full flex flex-col justify-between transition-colors rounded-b-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] bg-white dark:bg-slate-950 min-h-[100px] relative z-20">
              <div className="mb-2">
                <h3 className="text-[14px] sm:text-[16px] font-bold transition-colors line-clamp-1 leading-tight tracking-tight text-left text-slate-900 group-hover:text-rose-600 dark:text-slate-100 dark:group-hover:text-rose-400">
                  {product.name}
                </h3>
              </div>

              <div className="flex items-center justify-between w-full mt-auto">
                <div className="flex flex-col text-left pointer-events-none">
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-through font-medium leading-none mb-1">
                      ₹{Number(product.compare_at_price).toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-sm sm:text-lg font-bold leading-none text-slate-900 dark:text-slate-100">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (product.stock !== 0) {
                      router.push(`/products/detail/${product.id}`)
                    }
                  }}
                  className={`p-2 rounded-full transition-all shadow-sm flex items-center justify-center flex-shrink-0 z-30 relative ${product.stock === 0
                    ? "bg-neutral-200 text-neutral-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                    : "bg-rose-600 text-white hover:bg-rose-500 hover:scale-105 active:scale-95"
                    }`}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )

        return (
          <div key={product.id} className="h-full">
            {isMobile ? (
              <div className="h-full w-full bg-card rounded-2xl overflow-hidden border border-border/10 shadow-sm relative group cursor-pointer transition-transform hover:-translate-y-1">
                {cardContent}
              </div>
            ) : (
              <HoverBorderGradient
                containerClassName="h-full w-full !p-0"
                className="h-full w-full !p-0 bg-transparent rounded-2xl"
                duration={1.5}
              >
                <GlowCard
                  glowColor="red"
                  customSize={true}
                  className="flex flex-col h-full w-full !p-0 !gap-0 overflow-hidden group transition-all duration-300 hover:-translate-y-2 rounded-2xl border-none bg-card dark:bg-slate-950 shadow-none dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] cursor-pointer"
                >
                  {cardContent}
                </GlowCard>
              </HoverBorderGradient>
            )}
          </div>
        )
      })}
    </div >
  )
}
