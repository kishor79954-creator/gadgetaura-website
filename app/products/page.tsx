"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { ShinyButton } from "@/components/ui/shiny-button"
import { ArrowRight, Filter, ShoppingCart, Heart } from "lucide-react"
import { useWishlist } from "@/app/context/WishlistContext"

type Product = {
  id: string
  name: string
  price: number
  compare_at_price: number | null
  image_url: string | null
  category_id: string
  stock_count: number | null
  is_trending: boolean | null
}

type Category = {
  id: string
  name: string
  slug: string
}

function CatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "all"

  const { toggleWishlist, isInWishlist } = useWishlist()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [sortMethod, setSortMethod] = useState("featured")
  const [loading, setLoading] = useState(true)

  // Update active category if URL changes (e.g. back button navigation)
  useEffect(() => {
    const cat = searchParams.get("category")
    if (cat) {
      setActiveCategory(cat)
    } else {
      setActiveCategory("all")
    }
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: catData } = await supabase.from("categories").select("id,name,slug")
      if (catData) setCategories(catData)

      const { data: prodData, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products:", error.message)
      }

      const { data: pcData } = await supabase.from("product_categories").select("product_id, category_id")
      const pcMap: Record<string, string[]> = {}
      if (pcData) {
        pcData.forEach((pc: any) => {
          if (!pcMap[pc.product_id]) pcMap[pc.product_id] = []
          pcMap[pc.product_id].push(pc.category_id)
        })
      }

      if (prodData) {
        // Mock data if columns are missing from DB
        const processedProducts = prodData.map((p: any) => ({
          ...p,
          categoryIds: pcMap[p.id] || (p.category_id ? [p.category_id] : []),
          is_trending: p.is_trending != null ? p.is_trending : ["1", "4", "7"].includes(p.id.toString()),
          stock_count: p.stock_count != null ? p.stock_count : (
            ["3"].includes(p.id.toString()) ? 0 :
              ["2", "5", "8"].includes(p.id.toString()) ? 3 :
                10
          )
        }))
        setProducts(processedProducts)
      }
      setLoading(false)
    }

    fetchData()
  }, [])


  let displayProducts = activeCategory === "all"
    ? [...products]
    : products.filter(p => {
      const cat = categories.find(c => c.slug === activeCategory)
      if (!cat) return false
      const cIds = (p as any).categoryIds || [p.category_id]
      return cIds.includes(cat.id)
    })

  // Apply Sorting
  displayProducts.sort((a, b) => {
    switch (sortMethod) {
      case "price_asc":
        return Number(a.price) - Number(b.price)
      case "price_desc":
        return Number(b.price) - Number(a.price)
      case "newest":
        // Assuming higher ID/created_at is newer, or just mock it by comparing ids if created_at isn't fetched
        return String(b.id).localeCompare(String(a.id))
      case "featured":
      default:
        // Prioritize trending products and in-stock items
        if (a.is_trending && !b.is_trending) return -1
        if (!a.is_trending && b.is_trending) return 1
        if (a.stock_count !== 0 && b.stock_count === 0) return -1
        if (a.stock_count === 0 && b.stock_count !== 0) return 1
        return 0
    }
  })

  return (
    <main className="min-h-screen text-foreground pt-32 pb-24 px-4 md:px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif mb-4 font-bold text-primary">The Catalog</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover our curated selection of premium watches, high-end audio, and innovative smart gadgets.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setActiveCategory("all")
                window.history.pushState(null, "", "/products")
              }}
              className={`px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all border ${activeCategory === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent border-input text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.slug)
                  // Optional: Update URL without reload so it's shareable
                  window.history.pushState(null, "", `/products?category=${cat.slug}`)
                }}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all border ${activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-input text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-primary uppercase tracking-widest font-bold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {displayProducts.length} Items
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value)}
                className="appearance-none bg-background text-foreground border border-input rounded-full px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Grid with GlowCards */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayProducts.map((p) => (
              <div key={p.id} className="h-full">

                <Link 
                  href={`/products/detail/${p.id}`} 
                  className="group relative h-full flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 md:hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 bg-card border border-border dark:bg-slate-950"
                  style={{ touchAction: 'pan-y' }}
                >

                      {/* Image */}
                      <div className="relative w-full aspect-square flex-shrink-0">
                        {/* BADGES TOP LEFT */}
                        <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 pointer-events-none">
                          {p.is_trending && (
                            <span className="bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm flex items-center gap-1 w-max">
                              Trending <span className="text-sm">🔥</span>
                            </span>
                          )}
                          {p.stock_count !== null && p.stock_count <= 5 && p.stock_count > 0 && (
                            <span className="bg-indigo-950 text-indigo-200 border border-indigo-900 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm w-max animate-pulse">
                              Only {p.stock_count} Left!
                            </span>
                          )}
                          {p.stock_count === 0 && (
                            <span className="bg-neutral-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm w-max">
                              Sold Out
                            </span>
                          )}
                        </div>

                        {/* DISCOUNT BOTTOM RIGHT */}
                        <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
                          {p.compare_at_price && p.compare_at_price > p.price && (
                            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-md">
                              {Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)}% OFF
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 z-40">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleWishlist(p)
                            }}
                            className="bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-all"
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${isInWishlist(p.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                            />
                          </button>
                        </div>

                        <div className="absolute inset-0 block overflow-hidden bg-black border-b border-border/10 rounded-t-2xl">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 bg-muted">
                              No Image
                            </div>
                          )}
                          {p.stock_count === 0 && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 pointer-events-none" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 sm:p-4 w-full flex flex-col justify-between transition-colors rounded-b-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] bg-white dark:bg-slate-950 relative z-20">
                        <div className="mb-2">
                          <h3 className="text-[14px] sm:text-[16px] font-bold transition-colors line-clamp-1 leading-tight tracking-tight text-left text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                            {p.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between w-full mt-auto">
                          <div className="flex flex-col text-left pointer-events-none">
                            {p.compare_at_price && p.compare_at_price > p.price && (
                              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-through font-medium leading-none mb-1">
                                ₹{Number(p.compare_at_price).toLocaleString("en-IN")}
                              </span>
                            )}
                            <span className="text-sm sm:text-lg font-bold leading-none text-slate-900 dark:text-slate-100">
                              ₹{Number(p.price).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (p.stock_count !== 0) {
                                router.push(`/products/detail/${p.id}`)
                              }
                            }}
                            disabled={p.stock_count === 0}
                            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-sm z-40 relative ${p.stock_count === 0
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-500 hover:text-white hover:scale-105 active:scale-95"
                              }`}
                            title={p.stock_count === 0 ? "Sold Out" : "View Product"}
                          >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center">Loading Catalog...</div>}>
      <CatalogContent />
    </Suspense>
  )
}
