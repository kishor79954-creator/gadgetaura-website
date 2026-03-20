"use client"

import Link from "next/link"
import dynamic from "next/dynamic"



const HoverBorderGradient = dynamic(
  () => import("@/components/ui/hover-border-gradient").then(m => m.HoverBorderGradient),
  { ssr: false }
)

export function InstagramReels() {
  return (
    <section className="py-24 overflow-hidden flex flex-col items-center justify-center relative">



      {/* ── Ambient glow behind card ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-yellow-500/10 blur-[110px] rounded-full pointer-events-none z-0" />

      {/* ── Profile card with animated border ── */}
      <div className="relative z-10 mt-12 mb-8">
        <HoverBorderGradient
          containerClassName="rounded-[2rem] p-0"
          className="rounded-[2rem] p-0 bg-transparent"
          duration={1.5}
          as="div"
        >
          <div className="relative w-[300px]">
            {/* Overlapping Profile Image */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 rounded-full p-1 bg-card">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-border bg-background flex items-center justify-center p-1">
                <img src="/logo.png" alt="Gadgetaura" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Card body */}
            <div className="bg-card rounded-[2rem] pt-14 pb-6 px-6 shadow-2xl w-full text-center relative z-0">
              <h2 className="text-[17px] font-bold text-card-foreground uppercase tracking-tight font-sans">
                GADGETAURA
              </h2>
              <p className="text-[13px] text-muted-foreground mb-4 font-sans">
                @gadgetaura.in_
              </p>

              <div className="text-[13.5px] text-card-foreground space-y-1 mb-6 font-medium leading-relaxed font-sans">
                <p>💫 Viral Tech • Clean Aesthetics</p>
                <p>📦 DM Orders</p>
                <p>COD + Fast Delivery 🚀</p>
              </div>

              <a
                href="https://www.instagram.com/gadgetaura.in_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-bold text-[#0095f6] text-[15px] font-sans hover:text-blue-400 transition-colors"
              >
                See profile
              </a>
            </div>
          </div>
        </HoverBorderGradient>
      </div>
    </section>
  )
}
