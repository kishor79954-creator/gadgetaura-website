"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const reels = [
  { id: 1, image: "/placeholder.jpg", url: "https://www.instagram.com/reel/XXXXXXXX/" },
  { id: 2, image: "/placeholder.jpg", url: "https://www.instagram.com/reel/XXXXXXXX/" },
  { id: 3, image: "/placeholder.jpg", url: "https://www.instagram.com/reel/XXXXXXXX/" },
  { id: 4, image: "/placeholder.jpg", url: "https://www.instagram.com/reel/XXXXXXXX/" },
]

export function InstagramReels() {
  return (
    <section className="py-24 bg-background overflow-hidden flex flex-col items-center justify-center relative">
      {/* Optional: Add a subtle glow behind the card, like in the image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative w-[300px] mx-auto mt-12 mb-8">
        {/* Overlapping Profile Image */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 rounded-full p-1 bg-background">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-border bg-background flex items-center justify-center p-1">
            <img src="/logo.png" alt="Gadgetaura" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* The White Card */}
        <div className="bg-card rounded-[2rem] pt-14 pb-6 px-6 shadow-xl w-full text-center relative z-0 border border-border/50">
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
            className="inline-block font-bold text-[#0095f6] text-[15px] font-sans hover:text-blue-600 transition-colors"
          >
            See profile
          </a>
        </div>
      </div>
    </section>
  )
}

