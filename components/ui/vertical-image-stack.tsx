"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, type PanInfo } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

export interface StackProduct {
    id: string
    name: string
    image_url: string | null
    price: number
    compare_at_price?: number | null
}

interface VerticalImageStackProps {
    products: StackProduct[]
}

export function VerticalImageStack({ products }: VerticalImageStackProps) {
    const displayProducts = products.length > 0 ? products : [
        { id: "1", name: "Premium Widget", image_url: null, price: 999 },
        { id: "2", name: "Luxury Item", image_url: null, price: 1299 },
        { id: "3", name: "Exclusive Gear", image_url: null, price: 1599 },
    ]

    const router = useRouter()

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const lastNavigationTime = useRef(0)
    const navigationCooldown = 400 // ms between navigations

    const navigate = useCallback((newDirection: number) => {
        const now = Date.now()
        if (now - lastNavigationTime.current < navigationCooldown) return
        lastNavigationTime.current = now

        setCurrentIndex((prev) => {
            if (newDirection > 0) {
                return prev === displayProducts.length - 1 ? 0 : prev + 1
            }
            return prev === 0 ? displayProducts.length - 1 : prev - 1
        })
    }, [displayProducts.length])

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)")
        setIsMobile(mq.matches)
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [])

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50
        // Horizontal: using offset.x
        if (info.offset.x < -threshold) {
            navigate(1) // Drag left -> Next
        } else if (info.offset.x > threshold) {
            navigate(-1) // Drag right -> Prev
        }
    }

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            // For horizontal feel, we can still use vertical scroll to navigate or check deltaX
            if (Math.abs(e.deltaY) > 30 || Math.abs(e.deltaX) > 30) {
                if (e.deltaY > 0 || e.deltaX > 0) {
                    navigate(1)
                } else {
                    navigate(-1)
                }
            }
        },
        [navigate],
    )

    useEffect(() => {
        return () => { }
    }, [handleWheel])

    const getCardStyle = (index: number) => {
        const total = displayProducts.length
        let diff = index - currentIndex
        if (diff > total / 2) diff -= total
        if (diff < -total / 2) diff += total

        // On mobile: simpler 2D-only animations (no 3D rotateY) to prevent GPU lag
        if (isMobile) {
            if (diff === 0) return { x: 0, scale: 1, opacity: 1, zIndex: 5, rotateY: 0 }
            if (diff === -1) return { x: -200, scale: 0.85, opacity: 0.5, zIndex: 4, rotateY: 0 }
            if (diff === 1) return { x: 200, scale: 0.85, opacity: 0.5, zIndex: 4, rotateY: 0 }
            return { x: diff > 0 ? 400 : -400, scale: 0.7, opacity: 0, zIndex: 0, rotateY: 0 }
        }

        if (diff === 0) {
            return { x: 0, scale: 1, opacity: 1, zIndex: 5, rotateY: 0 }
        } else if (diff === -1) {
            return { x: -260, scale: 0.82, opacity: 0.6, zIndex: 4, rotateY: -15 }
        } else if (diff === -2) {
            return { x: -480, scale: 0.7, opacity: 0.3, zIndex: 3, rotateY: -25 }
        } else if (diff === 1) {
            return { x: 260, scale: 0.82, opacity: 0.6, zIndex: 4, rotateY: 15 }
        } else if (diff === 2) {
            return { x: 480, scale: 0.7, opacity: 0.3, zIndex: 3, rotateY: 25 }
        } else {
            return { x: diff > 0 ? 800 : -800, scale: 0.6, opacity: 0, zIndex: 0, rotateY: diff > 0 ? 40 : -40 }
        }
    }

    const isVisible = (index: number) => {
        const total = displayProducts.length
        let diff = index - currentIndex
        if (diff > total / 2) diff -= total
        if (diff < -total / 2) diff += total
        return Math.abs(diff) <= 2
    }

    return (
        <div className="relative flex h-[600px] w-full items-center justify-center overflow-hidden">
            {/* Section Title */}
            <div className="absolute top-10 left-0 right-0 text-center z-10 px-4">
                <h2 className="text-primary text-xs uppercase tracking-[0.4em] mb-2 font-bold">
                    Exclusive Selection
                </h2>
                <h3 className="text-4xl md:text-5xl font-bold text-foreground">
                    Premium Products
                </h3>
            </div>

            {/* Subtle ambient glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Card Stack - wider container for horizontal layout */}
            <div className="relative flex h-[460px] w-full max-w-[1000px] items-center justify-center mt-20" style={{ perspective: "1200px" }}>
                {displayProducts.map((product, index) => {
                    if (!isVisible(index)) return null
                    const style = getCardStyle(index)
                    const isCurrent = index === currentIndex

                    return (
                        <motion.div
                            key={product.id}
                            className="absolute cursor-grab active:cursor-grabbing"
                            animate={{
                                x: style.x, // Animate X
                                scale: style.scale,
                                opacity: style.opacity,
                                rotateY: style.rotateY, // Rotate Y
                                zIndex: style.zIndex,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                mass: 1,
                            }}
                            drag={isCurrent ? "x" : false} // Drag X
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            style={{
                                transformStyle: isMobile ? "flat" : "preserve-3d",
                                zIndex: style.zIndex,
                            }}
                        >
                            <div onClick={() => router.push(`/products/detail/${product.id}`)} className="block h-full w-full group cursor-pointer">
                                <div
                                    className="relative h-[420px] w-[280px] overflow-hidden rounded-3xl bg-card ring-1 ring-border/20 transition-all duration-300 dark:group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]"
                                    style={{
                                        boxShadow: isCurrent
                                            ? "0 25px 50px -12px hsl(var(--foreground) / 0.15), 0 0 0 1px hsl(var(--foreground) / 0.05)"
                                            : "0 10px 30px -10px hsl(var(--foreground) / 0.1)",
                                    }}
                                >
                                    {/* Card inner glow */}
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-foreground/5 via-transparent to-transparent pointer-events-none z-10" />

                                    {/* DISCOUNT TOP RIGHT */}
                                    {product.compare_at_price && product.compare_at_price > product.price && (
                                        <div className="absolute top-4 right-4 z-30 pointer-events-none">
                                            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-md">
                                                {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                                            </span>
                                        </div>
                                    )}

                                    {product.image_url ? (
                                        <div className="absolute inset-0 z-0">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="object-cover w-full h-full"
                                                draggable={false}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center text-5xl">💎</div>
                                    )}

                                    {/* Bottom gradient overlay with Text */}
                                    <div className="absolute inset-x-0 bottom-0 pb-6 pt-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 flex flex-col justify-end px-6">
                                        <h3 className="text-white text-xl font-bold truncate mb-1">{product.name}</h3>
                                        <div className="flex items-center gap-2">
                                            {product.compare_at_price && product.compare_at_price > product.price && (
                                                <span className="text-white/50 text-sm line-through decoration-white/50">
                                                    ₹{product.compare_at_price.toLocaleString()}
                                                </span>
                                            )}
                                            <span className="text-white font-bold text-lg">
                                                ₹{product.price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Navigation dots - Horizontal Layout at bottom */}
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-row gap-2">
                {displayProducts.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (index !== currentIndex) {
                                setCurrentIndex(index)
                            }
                        }}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-6 bg-foreground" : "bg-foreground/30 hover:bg-foreground/50"
                            }`}
                        aria-label={`Go to product ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
