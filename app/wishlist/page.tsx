"use client"

import { useWishlist } from "@/app/context/WishlistContext"
import { useCart } from "@/app/context/Cart-Context"
import { Button } from "@/components/ui/button"
import { HeartCrack, ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function WishlistPage() {
    const { items, removeFromWishlist } = useWishlist()
    const { addToCart } = useCart()

    return (
        <main className="min-h-screen pt-32 pb-24 px-4 md:px-6 text-foreground bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                </Link>
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif text-primary">Your Wishlist</h1>
                    <span className="text-muted-foreground font-medium bg-muted px-4 py-1.5 rounded-full text-sm">
                        {items.length} Items
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center border border-dashed border-border rounded-2xl bg-card/50">
                        <HeartCrack className="w-16 h-16 text-muted-foreground/30 mb-6" />
                        <h2 className="text-2xl font-bold mb-3 text-foreground">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Save your favorite gadgets here to easily find them later or add them to your cart when you're ready.
                        </p>
                        <Button asChild size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                            <Link href="/products">Explore Gadgets</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-colors shadow-sm relative flex flex-col">
                                <Link href={`/products/detail/${item.id}`} className="block relative aspect-square overflow-hidden bg-muted border-b border-border">
                                    {item.image_url ? (
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                                            No Image
                                        </div>
                                    )}
                                </Link>

                                <div className="p-5 flex flex-col flex-grow">
                                    <Link href={`/products/detail/${item.id}`}>
                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                                    </Link>
                                    <p className="text-muted-foreground font-medium mb-6">
                                        ₹{Number(item.price).toLocaleString("en-IN")}
                                    </p>

                                    <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
                                        <Button
                                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider text-xs uppercase rounded-xl"
                                            onClick={() => {
                                                addToCart({ ...item, quantity: 1 })
                                                alert(`Added ${item.name} to cart!`)
                                            }}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                                        >
                                            <HeartCrack className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
