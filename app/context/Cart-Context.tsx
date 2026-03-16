"use client"

import { createContext, useContext, useEffect, useState } from "react"

// Define the shape of a Cart Item
export type CartItem = {
  id: string
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
      const saved = localStorage.getItem("cart")
      if (saved) {
        try {
          setItems(JSON.parse(saved))
        } catch (error) {
          console.error("Failed to parse cart data", error)
        }
      }
    }
  }, [])

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items])

  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)

      if (existing) {
        // If item exists, increase quantity
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      // If new, add it (handle different image structures safely)
      const imageUrl = product.image_url
        || (product.allImages && product.allImages[0])
        || (product.images && product.images[0])
        || ""

      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: imageUrl,
        quantity: 1
      }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const buyNow = (product: any) => {
    const imageUrl = product.image_url
      || (product.allImages && product.allImages[0])
      || (product.images && product.images[0])
      || ""

    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: imageUrl,
      quantity: 1
    }

    setItems([newItem])
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, buyNow, totalPrice, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
