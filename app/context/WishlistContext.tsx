"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type WishlistItem = {
    id: string
    name: string
    price: number
    image_url: string
}

type WishlistContextType = {
    items: WishlistItem[]
    toggleWishlist: (product: any) => void
    removeFromWishlist: (id: string) => void
    isInWishlist: (id: string) => boolean
    wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([])
    const [mounted, setMounted] = useState(false)

    // Load wishlist from localStorage on mount
    useEffect(() => {
        setMounted(true)
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("wishlist")
            if (saved) {
                try {
                    setItems(JSON.parse(saved))
                } catch (error) {
                    console.error("Failed to parse wishlist data", error)
                }
            }
        }
    }, [])

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        if (mounted && typeof window !== "undefined") {
            localStorage.setItem("wishlist", JSON.stringify(items))
        }
    }, [items, mounted])

    const toggleWishlist = (product: any) => {
        setItems((prev) => {
            const exists = prev.some((item) => item.id === product.id)

            if (exists) {
                // Remove if it already exists
                return prev.filter((item) => item.id !== product.id)
            } else {
                // Add if it doesn't exist safely handling different image structures
                const imageUrl = product.image_url
                    || (product.allImages && product.allImages[0])
                    || (product.images && product.images[0])
                    || ""

                return [...prev, {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: imageUrl,
                }]
            }
        })
    }

    const removeFromWishlist = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    const isInWishlist = (id: string) => {
        return items.some((item) => item.id === id)
    }

    const wishlistCount = items.length

    return (
        <WishlistContext.Provider value={{ items, toggleWishlist, removeFromWishlist, isInWishlist, wishlistCount }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (!context) throw new Error("useWishlist must be used within a WishlistProvider")
    return context
}
