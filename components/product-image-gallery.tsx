"use client"

import { useState, useRef } from "react"
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

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollTo = (index: number) => {
    setCurrentIndex(index)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: index * scrollContainerRef.current.clientWidth,
        behavior: "smooth"
      })
    }
  }

  const next = () => {
    const nextIdx = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    scrollTo(nextIdx)
  }

  const prev = () => {
    const prevIdx = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    scrollTo(prevIdx)
  }

  return (
    <div className="space-y-4 w-full">
      {/* MAIN LARGE IMAGE CAROUSEL */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square overflow-hidden rounded-2xl border border-border bg-card group">
        
        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => {
             const scrollLeft = e.currentTarget.scrollLeft;
             const width = e.currentTarget.clientWidth;
             const newIndex = Math.round(scrollLeft / width);
             if (newIndex !== currentIndex) setCurrentIndex(newIndex);
          }}
        >
          {images.map((img, idx) => (
             <div key={idx} className="relative w-full h-full flex-shrink-0 snap-center">
               <Image
                 src={img}
                 alt={`Product View ${idx + 1}`}
                 fill
                 className="object-cover"
               />
             </div>
          ))}
        </div>

        {/* CSS rule injection to hide scrollbar explicitly on WebKit */}
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}} />

        {/* Navigation Arrows (Only show if >1 image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all sm:opacity-0 group-hover:opacity-100 border border-white/10"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all sm:opacity-0 group-hover:opacity-100 border border-white/10"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
              onClick={() => scrollTo(idx)}
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
