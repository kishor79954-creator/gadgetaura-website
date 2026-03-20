"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InfiniteSlider } from "@/components/ui/infinite-slider"

const videos = [
    "/landing/vid1.mp4",
]

export function LandingVideo() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    }

    return (
        <div className="relative w-full h-screen overflow-hidden" style={{ maskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)" }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentVideoIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 w-full h-full"
                >
                    <video
                        ref={videoRef}
                        src={videos[currentVideoIndex]}
                        autoPlay
                        muted
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover"
                        onEnded={handleVideoEnd}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* HERO CONTENT OVERLAY */}
            <div className="absolute inset-0 flex flex-col items-center justify-end text-center z-10 px-4 pb-24">
                <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 drop-shadow-xl tracking-tighter">
                    Aura of <span className="text-[#D4AF37]">Excellence</span>
                </h1>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/products?category=watches">
                        <button
                            className="
                relative px-8 py-4 rounded-full
                bg-white/10 backdrop-blur-xl
                border border-white/20
                text-sm font-bold uppercase tracking-widest
                text-white
                hover:bg-white/20 hover:border-white/40 hover:scale-105
                transition-all duration-300
                shadow-lg shadow-black/30
                "
                        >
                            Shop Watches
                        </button>
                    </Link>
                    <Link href="/products">
                        <Button
                            variant="default"
                            className="px-8 py-7 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            View Collection
                        </Button>
                    </Link>
                </div>
            </div>

            {/* BRAND STRIP */}
            <div className="absolute bottom-0 left-0 w-full z-20 bg-gradient-to-t from-black/90 to-transparent pb-8 pt-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* TRUSTED TEXT */}
                        <div className="hidden md:block md:w-48 border-r border-white/20 pr-6 text-right">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">
                                Trusted by Connoisseurs
                            </p>
                        </div>

                        {/* SCROLLING BRANDS */}
                        <div className="w-full overflow-hidden">
                            <InfiniteSlider duration={40} gap={80}>
                                {[
                                    "Rolex",
                                    "Patek Philippe",
                                    "Audemars Piguet",
                                    "Omega",
                                    "Cartier",
                                    "Fossil",
                                    "Armani Exchange",
                                    "Emporio Armani",
                                    "Boat",
                                    "JBL",
                                    "Marshall",
                                    "Apple",
                                    "Samsung",
                                    "Sony"
                                ].map((brand) => (
                                    <div
                                        key={brand}
                                        className="text-xl md:text-2xl font-serif font-bold text-white/40 uppercase tracking-[0.3em] whitespace-nowrap"
                                    >
                                        {brand}
                                    </div>
                                ))}
                            </InfiniteSlider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
