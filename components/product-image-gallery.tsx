"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface GalleryProps {
  images: string[]
}

export default function ProductImageGallery({ images }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Safety check: if no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center text-muted-foreground border border-border">
        No Image
      </div>
    )
  }

  const next = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <div className="space-y-4">
      {/* MAIN LARGE IMAGE */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-card group">
        <Image
          src={images[currentIndex]}
          alt="Product image"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Navigation Arrows (Only show if >1 image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS (Click to switch) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${idx === currentIndex
                  ? "border-primary ring-2 ring-primary/20 opacity-100"
                  : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
                }`}
            >
              <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
