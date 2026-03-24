"use client"

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"

// Define the shape of a Cart Item
export type CartItem = {
  id: string // Cart unique ID (product.id + variant)
  product_id: string // Actual DB UUID
  selectedVariant?: string
  name: string
  price: number
  image_url: string
  quantity: number
}

// Define the shape of the Context
type CartContextType = {
  items: CartItem[]
  addToCart: (product: any) => void
  removeFromCart: (id: string) => void
  buyNow: (product: any) => void
  totalPrice: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("cart")
        if (saved) {
          try {
            setItems(JSON.parse(saved))
          } catch (error) {
            console.error("Failed to parse cart data", error)
          }
        }
      } catch (error) {
        console.warn("localStorage is not available", error)
      }
    }
  }, [])

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("cart", JSON.stringify(items))
      } catch (error) {
        console.warn("localStorage is not available", error)
      }
    }
  }, [items])

  const addToCart = useCallback((product: any) => {
    setItems((prev) => {
      const cartItemId = product.selectedVariant ? `${product.id}-${product.selectedVariant}` : product.id
      const existing = prev.find((item) => item.id === cartItemId)

      if (existing) {
        // If item exists, increase quantity
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      // If new, add it (handle different image structures safely)
      const imageUrl = product.image_url
        || (product.allImages && product.allImages[0])
        || (product.images && product.images[0])
        || ""

      return [...prev, {
        id: cartItemId,
        product_id: product.id,
        selectedVariant: product.selectedVariant,
        name: product.selectedVariant ? `${product.name} (${product.selectedVariant})` : product.name,
        price: product.price,
        image_url: imageUrl,
        quantity: 1
      }]
    })
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const buyNow = useCallback((product: any) => {
    const imageUrl = product.image_url
      || (product.allImages && product.allImages[0])
      || (product.images && product.images[0])
      || ""

    const cartItemId = product.selectedVariant ? `${product.id}-${product.selectedVariant}` : product.id

    const newItem = {
      id: cartItemId,
      product_id: product.id,
      selectedVariant: product.selectedVariant,
      name: product.selectedVariant ? `${product.name} (${product.selectedVariant})` : product.name,
      price: product.price,
      image_url: imageUrl,
      quantity: 1
    }

    setItems([newItem])
  }, [])

  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    buyNow,
    totalPrice,
    cartCount
  }), [items, addToCart, removeFromCart, buyNow, totalPrice, cartCount])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
