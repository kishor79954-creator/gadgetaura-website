'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from "@/lib/store"

export function CartButton() {
const count = useStore(
  (state) => state.cart.reduce((sum, i) => sum + i.quantity, 0)
)

  return (
    <Button variant="outline" className="relative">
      <ShoppingCart />

      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Button>
  )
}
