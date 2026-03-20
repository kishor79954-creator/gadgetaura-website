"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

// ─── Heavy components: lazy-loaded so they DON'T block first paint ───────────

import { LandingVideo } from "@/components/landing-video"

const CategorySection = dynamic(
  () => import("@/components/landing/category-section").then(m => m.CategorySection),
  { loading: () => <div className="h-40 animate-pulse bg-muted rounded-xl mx-6" /> }
)

const GlowCard = dynamic(
  () => import("@/components/ui/spotlight-card").then(m => m.GlowCard)
)

const HoverBorderGradient = dynamic(
  () => import("@/components/ui/hover-border-gradient").then(m => m.HoverBorderGradient)
)

const ContainerScroll = dynamic(
  () => import("@/components/ui/container-scroll-animation").then(m => m.ContainerScroll),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl mx-6 mb-12" /> }
)

const InstagramReels = dynamic(
  () => import("@/components/ui/instagram-reels").then(m => m.InstagramReels),
  { loading: () => <div className="h-64 animate-pulse bg-muted rounded-2xl mx-6 mb-12" /> }
)

const Footer = dynamic(
  () => import("@/components/ui/footer").then(m => m.Footer),
  { loading: () => <div className="h-32 bg-muted" /> }
)

const VerticalImageStack = dynamic(
  () => import("@/components/ui/vertical-image-stack").then(m => m.VerticalImageStack),
  { loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl mx-6" /> }
)


const DynamicFeaturedProducts = dynamic(
  () => import("@/components/landing/dynamic-featured-products").then(m => m.DynamicFeaturedProducts),
  { loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl mx-6 mb-12" /> }
)

const DynamicTopSellingWatches = dynamic(
  () => import("@/components/landing/dynamic-top-selling-watches").then(m => m.DynamicTopSellingWatches),
  { loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl mx-6 mb-12" /> }
)

const DynamicPremiumStack = dynamic(
  () => import("@/components/landing/dynamic-premium-stack").then(m => m.DynamicPremiumStack),
  { loading: () => <div className="h-96 animate-pulse bg-muted mx-6 mb-12" /> }
)

/* ---------------- PAGE ---------------- */



export default function LandingPage() {
  return (
    <main className="min-h-screen relative">
      {/* 🚀 Next.js natively hoists these elements to the <head> of the document immediately! */}
      <link rel="preload" as="video" href="/landing/vid1.mp4" type="video/mp4" fetchPriority="high" />
      <link rel="preload" as="video" href="/landing/scrollpanevideo.mp4" type="video/mp4" fetchPriority="high" />
      
      {/* VIDEO SECTION */}
      <div className="-mt-32">
        <LandingVideo />
      </div>

      {/* CATEGORIES */}
      <CategorySection />

      {/* FEATURED */}
      <section className="pt-8 pb-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-primary text-xs uppercase tracking-[0.4em] mb-2 font-bold">
                Handpicked Perfection
              </h2>
              <h3 className="text-4xl md:text-6xl font-bold text-foreground">
                Featured Collection
              </h3>
            </div>
            <Link href="/products" className="text-sm md:text-base font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group pb-1 md:pb-2">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <DynamicFeaturedProducts />
        </div>
      </section>

      {/* TOP SELLING WATCHES */}
      <section className="pt-2 pb-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-secondary text-xs uppercase tracking-[0.4em] mb-2 font-bold opacity-80">
                Fan Favorites
              </h2>
              <h3 className="text-3xl md:text-5xl font-bold text-foreground">
                Top Selling Watches
              </h3>
            </div>
            <Link href="/products" className="text-sm md:text-base font-semibold text-muted-foreground hover:text-secondary hover:opacity-100 transition-colors flex items-center gap-1 group pb-1 md:pb-2">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <DynamicTopSellingWatches />
        </div>
      </section>

      {/* PREMIUM STACK */}
      <DynamicPremiumStack />

      {/* SCROLL — Enabled for all devices */}
      <div className="block">
      <section className="pt-0 pb-8 overflow-hidden relative z-10">
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
          <div className="w-full h-full bg-black relative rounded-2xl overflow-hidden border border-border shadow-xl">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src="/landing/scrollpanevideo.mp4" type="video/mp4" />
            </video>

            {/* SAFE OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </ContainerScroll>
      </section>
      </div>

      {/* INSTAGRAM */}
      <InstagramReels />

      {/* FOOTER */}
      <Footer />

    </main>
  )
}
