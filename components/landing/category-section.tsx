"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const categories = [
    {
        name: "Watches",
        image: "/images/real-watches.png",
        href: "/products?category=watches",
    },
    {
        name: "Audio",
        image: "/images/final-audio.png",
        href: "/products?category=audio",
    },
    {
        name: "Gadgets",
        image: "/images/real-gadgets.png",
        href: "/products?category=gadgets",
    },
    {
        name: "Accessories",
        image: "/images/final-accessories.png",
        href: "/products?category=accessories",
    },
]

export function CategorySection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section
            ref={ref}
            className="w-full py-24 relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* HEADER SECTION */}
                <div className="flex flex-col items-center justify-center mb-16 space-y-6 text-center">

                    {/* ANIMATED LINE */}
                    <motion.div
                        initial={{ width: "40px", opacity: 0 }}
                        animate={isInView ? { width: "120px", opacity: 1 } : {}}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-[2px] bg-gradient-to-r from-transparent via-foreground/50 to-transparent"
                    />

                    {/* HEADING */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{
                            delay: 0.8, // Wait for line to extend
                            duration: 0.8,
                            ease: "easeOut"
                        }}
                        className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-foreground"
                    >
                        Shop by Category
                    </motion.h1>
                </div>

                {/* CARDS GRID */}
                <motion.div
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2,
                                delayChildren: 1.2, // Wait for header
                            },
                        },
                    }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                >
                    {categories.map((cat, index) => (
                        <motion.div
                            key={cat.name}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.8, ease: "easeOut" }
                                },
                            }}
                        >
                            <Link
                                href={cat.href}
                                className="group flex flex-col aspect-[4/5] rounded-[2rem] overflow-hidden bg-black dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-black/30 dark:hover:border-white/30"
                            >
                                {/* Image Half */}
                                <div className="flex-1 w-full relative flex items-center justify-center p-4 xl:p-8">
                                    <div className="w-full h-full relative group-hover:scale-110 transition-transform duration-700">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Text Half */}
                                <div className="h-16 md:h-24 w-full flex items-center justify-center bg-black dark:bg-[#0a0a0a]">
                                    <span className="uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                                        {cat.name}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
