"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useCart } from "@/app/context/Cart-Context"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
  homepage_slot: number | null
  stock_count: number | null
  is_trending: boolean | null
  compare_at_price?: number | null
}

export function TopSellingWatches() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchTopSelling() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .gte('homepage_slot', 5)
          .lte('homepage_slot', 8)
          .order('homepage_slot', { ascending: true })
          .limit(4)

        if (error) throw error

        if (data) {
          const processedData = data.map((p: any) => ({
            ...p,
            is_trending: p.is_trending != null ? p.is_trending : ["1", "4", "7"].includes(p.id.toString()),
            stock_count: p.stock_count != null ? p.stock_count : (
              ["3"].includes(p.id.toString()) ? 0 :
                ["2", "5", "8"].includes(p.id.toString()) ? 3 :
                  10
            )
          }))
          setProducts(processedData)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Error fetching top selling products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopSelling()
  }, [])

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  if (loading) {
    return <div className="py-20 text-center text-white/50 flex justify-center"><Loader2 className="animate-spin" /></div>
  }

  const getProductBySlot = (slot: number) => products.find(p => p.homepage_slot === slot)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
      {[5, 6, 7, 8].map((slotNum) => {
        const product = getProductBySlot(slotNum)

        if (!product) {
          return (
            <div key={slotNum} className="h-full min-h-[300px] bg-neutral-900/30 rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center text-neutral-500 text-center p-4">
              <span className="text-lg font-bold mb-2">Slot {slotNum} Empty</span>
              <p className="text-xs">Assign a product to Top Watches slot {slotNum}</p>
            </div>
          )
        }

        return (
          <div key={product.id} className="group relative h-full flex flex-col rounded-2xl border border-border/50 dark:border-slate-800 dark:hover:border-blue-500/30 overflow-hidden transition-all duration-300 hover:shadow-2xl dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] md:hover:-translate-y-2 bg-card dark:bg-slate-950">
            <Link href={`/products/detail/${product.id}`} className="block relative w-full flex-shrink-0 aspect-square overflow-hidden bg-black border-b border-border/10 cursor-pointer" style={{ touchAction: 'pan-y' }}>
              <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 pointer-events-none">
                {product.is_trending && (
                  <span className="bg-blue-500 text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-sm flex items-center gap-1 w-max">
                    Trending <span className="text-sm">🔥</span>
                  </span>
                )}
                {product.stock_count !== null && product.stock_count <= 5 && product.stock_count > 0 && (
                  <span className="bg-indigo-950 text-indigo-200 border border-indigo-900 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-sm w-max animate-pulse">
                    Only {product.stock_count} Left!
                  </span>
                )}
                {product.stock_count === 0 && (
                  <span className="bg-neutral-600 text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-sm w-max">
                    Sold Out
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-md w-max">
                    {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </span>
                )}
              </div>

              <img
                src={product.image_url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              />
              {product.stock_count === 0 && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 pointer-events-none" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity pointer-events-none" />
            </Link>

            <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 w-full bg-white dark:bg-slate-950 relative z-20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
              <Link href={`/products/detail/${product.id}`} className="mb-2">
                <h3 className="text-[13px] sm:text-[16px] font-bold text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight tracking-tight text-left">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between w-full mt-auto">
                <div className="flex flex-col text-left pointer-events-none">
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-through font-medium leading-none mb-1">
                      ₹{Number(product.compare_at_price).toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (product.stock_count !== 0) {
                      // @ts-ignore
                      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                        window.location.href = `/products/detail/${product.id}`
                      } else {
                        handleAddToCart(product)
                      }
                    }
                  }}
                  disabled={product.stock_count === 0}
                  className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-sm z-40 relative ${product.stock_count === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-500 hover:text-white hover:scale-105 active:scale-95"
                    }`}
                  title={product.stock_count === 0 ? "Sold Out" : "Add to Cart"}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
