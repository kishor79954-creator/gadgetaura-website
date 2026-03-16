"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/app/context/Cart-Context"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

// Currency Helper
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartPage() {
  const { items, removeFromCart, totalPrice } = useCart()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    checkUser()
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen text-foreground flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="bg-muted p-6 rounded-full mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-8 rounded-xl">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  const progressPercentage = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const amountAway = FREE_SHIPPING_THRESHOLD - totalPrice;
  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="min-h-screen text-foreground pt-32 pb-20 px-4 md:px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 font-serif">Shopping Cart ({items.length})</h1>

        {/* PROGRESSIVE FREE SHIPPING BAR */}
        <div className="bg-card border border-border p-5 rounded-2xl mb-10 shadow-sm relative overflow-hidden">
          {/* Subtle background gradient based on progress */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none transition-all duration-700"
            style={{ width: `${progressPercentage}%` }}
          />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Free Shipping</span>
              {isFreeShipping ? (
                <span className="text-sm font-bold text-green-500 flex items-center gap-1">
                  Unlocked! 🎉
                </span>
              ) : (
                <span className="text-sm font-medium">
                  <span className="font-bold text-primary">{formatPrice(amountAway)}</span> away
                </span>
              )}
            </div>

            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-in-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Shine effect on the progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3 font-medium">
              {isFreeShipping
                ? "Congratulations! Your order qualifies for free standard shipping."
                : "Add more items to your cart to qualify for free shipping."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 md:gap-6 bg-card border border-border p-4 rounded-2xl group transition-all hover:border-primary/20 shadow-sm hover:shadow-md"
              >
                <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-xl overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1 text-card-foreground">{item.name}</h3>
                      <p className="text-muted-foreground text-sm font-medium">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-3 bg-secondary/50 border border-border rounded-lg px-3 py-1 text-secondary-foreground">
                      <span className="text-sm font-bold">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border p-6 md:p-8 rounded-3xl sticky top-32 shadow-lg">
              <h2 className="text-xl font-bold mb-6 text-card-foreground">Order Summary</h2>

              <div className="space-y-4 mb-6 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {isFreeShipping ? (
                    <span className="text-green-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs">Free</span>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Calculated at checkout</span>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</div>
                    <div className="text-xs text-muted-foreground">Including taxes</div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              {loading ? (
                <Button disabled className="w-full bg-primary/50 text-primary-foreground font-bold h-14 text-lg rounded-xl">
                  Loading...
                </Button>
              ) : user ? (
                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/auth?redirect=/checkout")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                  >
                    Login to Checkout
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Sign in required to place order
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
                <ShieldCheckIcon className="w-4 h-4" /> Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
