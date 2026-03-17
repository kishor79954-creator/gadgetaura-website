"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Heart, Truck, ShieldCheck, Star } from "lucide-react"
import ProductImageGallery from "@/components/product-image-gallery"
import { useCart } from "@/app/context/Cart-Context"


// Helper for Currency
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

import { useWishlist } from "@/app/context/WishlistContext"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { addToCart, buyNow } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Variant Selection State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [displayedImage, setDisplayedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_images ( image_url, sort_order )`)
        .eq("id", id)
        .single()

      if (data) {
        const extraImages = (data.product_images || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any) => img.image_url)

        const allImages = [data.image_url, ...extraImages].filter(Boolean)

        // Check for variants
        const variants = data.variants || []

        setProduct({ ...data, allImages, variants })

        // Select first variant by default if exists
        if (variants.length > 0) {
          setSelectedVariantId(variants[0].name) // Using name as ID for now since we stored it simply
          setDisplayedImage(variants[0].image_url)
        } else {
          setDisplayedImage(data.image_url)
        }
      }
      setLoading(false)
    }
    if (id) fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    // If variants exist, maybe add specific variant info to cart? 
    // For now adding main product.
    // TODO: Update Cart Context to support options
    const cartItem = {
      ...product,
      selectedVariant: selectedVariantId,
      image_url: displayedImage || product.image_url
    }
    addToCart(cartItem)
    alert(`Success! ${product.name} ${selectedVariantId ? `(${selectedVariantId})` : ''} added to your cart. 🛒`)
  }

  const handleVariantSelect = (variant: any) => {
    setSelectedVariantId(variant.name)
    if (variant.image_url) {
      setDisplayedImage(variant.image_url)
    }
  }

  // Calculate Discount
  const discountPercentage = product?.compare_at_price > product?.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  if (loading) return <div className="pt-32 text-center text-foreground min-h-screen bg-background">Loading...</div>
  if (!product) return <div className="pt-32 text-center text-foreground min-h-screen bg-background">Product not found.</div>

  const currentVariant = product.variants?.find((v: any) => v.name === selectedVariantId)
  // Show variant stock if selected, else product stock
  const currentStock = currentVariant ? currentVariant.stock : product.stock

  return (
    <div className="min-h-screen text-foreground p-6 lg:p-20 pt-0 transition-colors duration-300">
      <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
        {/* LEFT: Gallery */}
        <div>
          {/* Pass displayed image as the first one if selected */}
          <ProductImageGallery images={displayedImage ? [displayedImage, ...product.allImages.filter((img: string) => img !== displayedImage)] : product.allImages} />
        </div>

        {/* RIGHT: Product Details */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`font-bold tracking-widest uppercase text-xs ${currentStock > 0 ? "text-green-500" : "text-red-500"}`}>
                {currentStock > 0 ? "In Stock" : "Out of Stock"}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => product && toggleWishlist(product)}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${isInWishlist(product?.id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-serif">{product.name}</h1>

            <div className="flex items-center gap-4">
              {product.compare_at_price > product.price && (
                <span className="text-xl text-muted-foreground line-through decoration-red-500/50">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
              <span className="text-3xl font-light text-foreground">{formatPrice(product.price)}</span>
              {discountPercentage > 0 && (
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
          </div>

          {/* VARIANTS SECTION */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <span className="text-sm font-medium">Available Colors: <span className="text-muted-foreground">{selectedVariantId}</span></span>
              <div className="flex flex-wrap gap-4">
                {product.variants.map((variant: any) => (
                  <div key={variant.name} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => handleVariantSelect(variant)}>
                    <button
                      className={`
                          relative w-16 h-16 rounded-xl border-2 overflow-hidden transition-all
                          ${selectedVariantId === variant.name ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-border group-hover:border-primary/50'}
                        `}
                      title={variant.name}
                    >
                      {variant.image_url ? (
                        <img src={variant.image_url} alt={variant.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-[10px]">{variant.name.substring(0, 2)}</div>
                      )}
                      {/* Selected Indicator */}
                      {selectedVariantId === variant.name && (
                        <div className="absolute inset-0 bg-black/10 dark:bg-white/10" />
                      )}
                    </button>
                    <span className={`text-xs font-medium capitalize transition-colors ${selectedVariantId === variant.name ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {variant.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FEATURES SECTION */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="flex flex-col items-center text-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors shadow-sm">
              <Truck className="w-6 h-6 text-primary" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors shadow-sm">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">7 Day Return</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors shadow-sm">
              <Star className="w-6 h-6 text-primary" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Best Quality</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              disabled={currentStock <= 0}
              className="flex-1 h-14 text-base lg:text-lg rounded-xl border-primary/20 hover:bg-primary/5 text-primary"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> {currentStock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button
              variant="cta"
              disabled={currentStock <= 0}
              className="flex-1 h-14 text-base lg:text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              onClick={() => {
                const cartItem = {
                  ...product,
                  selectedVariant: selectedVariantId,
                  image_url: displayedImage || product.image_url
                }
                buyNow(cartItem)
                window.location.href = "/checkout"
              }}
            >
              Express Checkout
            </Button>
          </div>

          {/* DESCRIPTION SECTION */}
          <div className="prose prose-invert text-muted-foreground leading-relaxed text-sm lg:text-base border-t border-border pt-6 whitespace-pre-line">
            <p>
              {product.description
                ? product.description
                : "Experience premium quality with this exclusive item. Designed for durability and style, it's the perfect addition to your collection."}
            </p>
          </div>

        </div>
      </div>

      {/* SEO: JSON-LD Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: product.allImages || [product.image_url],
            description: product.description || "Premium Gadget from GadgetAura",
            brand: {
              "@type": "Brand",
              name: "GadgetAura",
            },
            offers: {
              "@type": "Offer",
              url: `https://www.gadgetaura.in/products/detail/${product.id}`,
              priceCurrency: "INR",
              price: product.price,
              availability: currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          }),
        }}
      />
    </div>
  )
}
