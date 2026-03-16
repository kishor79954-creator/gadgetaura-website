'use client'

import { Button } from '@/components/ui/button'
import { useStore } from "@/lib/store"

export function AddToCartButton({ product }: { product: any }) {
  const addToCart = useStore((state) => state.addToCart)

  return (
    <Button
      variant="cta"
      size="cta-sm"
      className="uppercase tracking-wider"
      onClick={() =>
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        } as any)
      }
    >
      Add
    </Button>
  )
}
