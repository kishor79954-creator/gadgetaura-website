"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"

// ─── Heavy components: lazy-loaded so they DON'T block first paint ───────────

const LandingVideo = dynamic(
  () => import("@/components/landing-video").then(m => m.LandingVideo),
  { ssr: false, loading: () => <div className="w-full h-screen bg-background" /> }
)

const CategorySection = dynamic(
  () => import("@/components/landing/category-section").then(m => m.CategorySection),
  { ssr: false, loading: () => <div className="h-40 animate-pulse bg-muted rounded-xl mx-6" /> }
)

const GlowCard = dynamic(
  () => import("@/components/ui/spotlight-card").then(m => m.GlowCard),
  { ssr: false }
)

const HoverBorderGradient = dynamic(
  () => import("@/components/ui/hover-border-gradient").then(m => m.HoverBorderGradient),
  { ssr: false }
)

const ContainerScroll = dynamic(
  () => import("@/components/ui/container-scroll-animation").then(m => m.ContainerScroll),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl mx-6 mb-12" /> }
)

const InstagramReels = dynamic(
  () => import("@/components/ui/instagram-reels").then(m => m.InstagramReels),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-2xl mx-6 mb-12" /> }
)

const Footer = dynamic(
  () => import("@/components/ui/footer").then(m => m.Footer),
  { ssr: false, loading: () => <div className="h-32 bg-muted" /> }
)

const VerticalImageStack = dynamic(
  () => import("@/components/ui/vertical-image-stack").then(m => m.VerticalImageStack),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl mx-6" /> }
)

import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import type { StackProduct } from "@/components/ui/vertical-image-stack"

type FeaturedProduct = {
  id: string
  name: string
  price: number
  compare_at_price?: number | null
  image_url: string | null
  homepageslot: number
  stock_count?: number | null
}

/* ---------------- FEATURED PRODUCTS ---------------- */

function DynamicFeaturedProducts() {
  const router = useRouter()
  const [featured, setFeatured] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, image_url, homepageslot, stock_count")
        .in("homepageslot", [1, 2, 3, 4])
        .order("homepageslot", { ascending: true })

      if (!error) setFeatured(data ?? [])
      setLoading(false)
    }

    fetchFeatured()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
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
      {featured.map((product) => (
        <div key={product.id} className="h-full">

          <HoverBorderGradient
            containerClassName="h-full w-full !p-0"
            className="h-full w-full !p-0 bg-transparent rounded-2xl"
            duration={1.5}
          >
            <GlowCard
              glowColor="amber"
              customSize={true}
              className="flex flex-col h-full w-full !p-0 !gap-0 overflow-hidden group transition-all duration-300 hover:-translate-y-2 rounded-2xl border-none bg-card dark:bg-slate-950 shadow-none dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] cursor-pointer"
            >
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
                    {product.stock_count !== null && product.stock_count !== undefined && product.stock_count <= 5 && product.stock_count > 0 && (
                      <span className="bg-indigo-950 text-indigo-200 border border-indigo-900 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm w-max animate-pulse">
                        Only {product.stock_count} Left!
                      </span>
                    )}
                    {product.stock_count === 0 && (
                      <span className="bg-neutral-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm w-max">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-0 block overflow-hidden bg-black border-b border-border/10 rounded-t-2xl">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 bg-muted text-5xl grayscale">
                        ⌚
                      </div>
                    )}
                    {product.stock_count === 0 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Details Area */}
                <div className="flex-1 p-3 sm:p-4 w-full flex flex-col justify-between transition-colors rounded-b-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] bg-white dark:bg-slate-950 min-h-[100px] relative z-20">
                  <div className="mb-2">
                    <h3 className="text-[14px] sm:text-[16px] font-bold transition-colors line-clamp-1 leading-tight tracking-tight text-left text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
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
                        if (product.stock_count !== 0) {
                          router.push(`/products/detail/${product.id}`)
                        }
                      }}
                      className={`p-2 rounded-full transition-all shadow-sm flex items-center justify-center flex-shrink-0 z-30 relative ${product.stock_count === 0
                        ? "bg-neutral-200 text-neutral-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95"
                        }`}
                      disabled={product.stock_count === 0}
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </GlowCard>
          </HoverBorderGradient>
        </div>
      ))
      }
    </div >
  )
}





function DynamicPremiumStack() {
  const [premium, setPremium] = useState<StackProduct[]>([])

  useEffect(() => {
    const fetchPremium = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, image_url, homepageslot, stock_count")
        .in("homepageslot", [11, 12, 13, 14, 15])
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
    <section className="py-20 text-foreground overflow-hidden">
      {/* Use real data if available, otherwise placeholders */}
      <VerticalImageStack products={premium.length > 0 ? premium : placeholders} />
    </section>
  )
}

/* ---------------- PAGE ---------------- */



export default function LandingPage() {


  return (
    <main className="min-h-screen relative">
      {/* VIDEO SECTION */}
      <div className="-mt-32">
        <LandingVideo />
      </div>

      {/* CATEGORIES */}
      <CategorySection />

      {/* FEATURED */}
      <section className="pt-14 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-primary text-xs uppercase tracking-[0.4em] mb-2 font-bold">
            Handpicked Perfection
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
            Featured Collection
          </h3>

          <DynamicFeaturedProducts />
        </div>
      </section>

      {/* PREMIUM STACK */}
      <DynamicPremiumStack />

      {/* SCROLL */}
      <section className="pt-4 pb-12 overflow-hidden relative z-10">
        <ContainerScroll
          titleComponent={
            <div className="mb-6 px-6 text-center">
              <h2 className="text-primary text-sm uppercase tracking-[0.3em] mb-2">
                Unrivaled Quality
              </h2>
              <h1 className="text-4xl md:text-7xl font-bold text-foreground">
                Crafted for the <br />
                <span className="text-primary">Next Generation</span>
              </h1>
            </div>
          }
        >
          <div className="w-full h-full bg-card relative rounded-2xl overflow-hidden border border-border shadow-xl">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>

            {/* SAFE OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </ContainerScroll>
      </section>

      {/* INSTAGRAM */}
      <InstagramReels />

      {/* FOOTER */}
      <Footer />

    </main>
  )
}
