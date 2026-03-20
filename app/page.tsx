"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"

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
  { loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl mx-6 mb-12" /> }
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

const DynamicPremiumStack = dynamic(
  () => import("@/components/landing/dynamic-premium-stack").then(m => m.DynamicPremiumStack),
  { loading: () => <div className="h-96 animate-pulse bg-muted mx-6 mb-12" /> }
)

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
      <section className="pt-8 pb-6 px-6 relative z-10">
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
            {/* MOBILE FALLBACK: Still provides the Scrollpane UI layout but without the crippling video processing overhead */}
            <div className="block md:hidden absolute inset-0 bg-gradient-to-br from-zinc-800 to-black w-full h-full">
              <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
            </div>

            {/* DESKTOP EXCLUSIVE VIDEO: Loaded only when computing power is abundant */}
            <video
              className="hidden md:block w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
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
