"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

type Props = {
  watchImages: string[]
  autoRotate?: boolean
  rotationInterval?: number
}

export function RotatingWatchCarousel({
  watchImages,
  autoRotate = true,
  rotationInterval = 5000,
}: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!autoRotate) return

    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % watchImages.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotate, watchImages.length, rotationInterval])

  return (
    <div className="relative aspect-[3/5] w-full flex items-center justify-center overflow-hidden" style={{ perspective: "1000px" }}>
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={watchImages[index]}
          alt="Luxury Watch"
          className="absolute w-full h-full object-contain select-none"
          initial={{
            rotateY: -180,
            scale: 0.8,
            opacity: 0,
            zIndex: 0
          }}
          animate={{
            rotateY: 0,
            scale: 1,
            opacity: 1,
            zIndex: 1
          }}
          exit={{
            rotateY: 180,
            scale: 0.8,
            opacity: 0,
            zIndex: 0
          }}
          transition={{
            rotateY: {
              duration: rotationInterval / 1000, // Sync with interval
              ease: "linear", // linear for continuous rotation feel
            },
            scale: {
              duration: rotationInterval / 1000,
              ease: "easeInOut",
            },
            opacity: {
              duration: rotationInterval / 1000,
              ease: "easeInOut"
            }
          }}
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            perspective: 1000
          }}
        />
      </AnimatePresence>
    </div>
  )
}
