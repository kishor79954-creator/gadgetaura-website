"use client"

import Link from "next/link"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { RotatingWatchCarousel } from "@/components/ui/rotating-watch-carousel"
import { BeamsBackground } from "@/components/ui/beams-background"
import { useEffect } from "react"

export function HeroSection() {
  useEffect(() => { }, [])

  return (
    /* 🔴 Disable pointer events for background layers */
    <main className="overflow-x-hidden relative pointer-events-none">

      <BeamsBackground intensity="strong">

        {/* ✅ Enable pointer events only for content */}
        <section className="relative z-10 pointer-events-auto">
          <div className="pb-16 pt-20 md:pb-20 lg:pb-24 lg:pt-20 min-h-screen flex items-center justify-center">
            <div className="relative w-full flex flex-col lg:flex-row items-center justify-between px-6 gap-8">

              {/* LEFT TEXT */}
              <div className="flex-shrink-0 text-center lg:text-left">
                <h1 className="text-balance text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.85] text-foreground space-y-3">
                  <div>Aura</div>
                  <div className="flex justify-center lg:justify-start">
                    <span>of</span>
                  </div>
                  <div>
                    <span className="text-[#D4AF37]">Excellence</span>
                  </div>
                </h1>
              </div>

              {/* RIGHT — WATCH CAROUSEL */}
              <div className="flex-shrink-0 flex items-center justify-center lg:justify-end w-full lg:w-auto">
                <div className="w-64 sm:w-72 md:w-80 lg:w-96">
                  <RotatingWatchCarousel
                    watchImages={[
                      "/images/premium-watch1.png",
                      "/images/premium-watch2.png",
                      "/images/premium-watch3.png",
                      "/images/premium-watch4.png",
                      "/images/premium-watch5.png",
                      "/images/premium-watch6.png",
                      "/images/premium-watch7.png",
                      "/images/premium-watch8.png",
                      "/images/premium-watch9.png",
                    ]}
                    autoRotate
                    rotationInterval={3000} // continuous slow rotation
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      </BeamsBackground>

      {/* BRAND STRIP + GLASS BUTTON */}
      <section className="bg-background/50 backdrop-blur-sm pb-16 border-y border-border/10 pointer-events-auto">
        <div className="group relative m-auto max-w-7xl px-6">
          <div className="flex flex-col items-center md:flex-row gap-8">

            {/* TEXT + BUTTON */}
            <div className="md:max-w-60 flex flex-col items-center md:items-end gap-4 border-b md:border-b-0 md:border-r border-[#D4AF37]/20 pb-6 md:pb-0 md:pr-8">
              <p className="text-center md:text-right text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]/60">
                Trusted by Connoisseurs
              </p>

              {/* ✅ GLASS BUTTON */}
              <Link href="/products/watches">
                <button
                  className="
                    relative px-6 py-2.5 rounded-full
                    bg-white/10 backdrop-blur-xl
                    border border-white/20
                    text-xs font-bold uppercase tracking-widest
                    text-white
                    hover:bg-white/20 hover:border-white/40
                    transition-all duration-300
                    shadow-lg shadow-black/30
                  "
                >
                  Explore Premium Watches
                </button>
              </Link>
            </div>

            {/* BRANDS SLIDER */}
            <div className="relative py-4 md:w-[calc(100%-11rem)]">
              <InfiniteSlider duration={30} gap={80}>
                {[
                  "Rolex",
                  "Patek Philippe",
                  "Audemars Piguet",
                  "Omega",
                  "Cartier",
                ].map((brand) => (
                  <div
                    key={brand}
                    className="text-xl font-serif font-bold text-white/20 uppercase tracking-[0.5em]"
                  >
                    {brand}
                  </div>
                ))}
              </InfiniteSlider>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}
