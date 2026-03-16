"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ProductCategory =
  | "Watches"
  | "Headphones & Audio"
  | "Smart Gadgets"
  | "Trending Accessories"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: ProductCategory
  subCategory?: string
  brand?: string
  rating?: number
  inStock?: boolean
  features?: string[]
  specs?: any
}

export interface CartItem extends Product {
  quantity: number
}

interface StoreState {
  products: Product[]
  cart: CartItem[]
  hasHydrated: boolean

  setProducts: (products: Product[]) => void
  addToCart: (product: Product) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: [],
      cart: [],
      hasHydrated: false,

      setProducts: (products) => set({ products }),

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === product.id)
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, qty) =>
        set((state) => ({
          cart: state.cart
            .map((i) => (i.id === id ? { ...i, quantity: qty } : i))
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "gadgetaura-cart",
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true
      },
    }
  )
)
