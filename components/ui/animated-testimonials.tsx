"use client"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Testimonial = {
  quote: string
  name: string
  designation: string
  src: string
}

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Testimonial[]
  autoplay?: boolean
  className?: string
}) => {
  const [active, setActive] = useState(0)

  const handleNext = () => setActive((prev) => (prev + 1) % testimonials.length)
  const handlePrev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000)
      return () => clearInterval(interval)
    }
  }, [autoplay])

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10

  return (
    <div className={cn("max-w-sm md:max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-20", className)}>
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="relative h-80 w-full">
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.src}
                initial={{ opacity: 0, scale: 0.9, z: -100, rotate: randomRotateY() }}
                animate={{
                  opacity: index === active ? 1 : 0,
                  scale: index === active ? 1 : 0.9,
                  zIndex: index === active ? 10 : 0,
                  rotate: index === active ? 0 : randomRotateY(),
                  y: index === active ? [0, -20, 0] : 0,
                }}
                exit={{ opacity: 0, scale: 0.9, rotate: randomRotateY() }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={testimonial.src || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={500}
                  height={500}
                  className="h-full w-full rounded-3xl object-cover"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex flex-col justify-center">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-white tracking-tight">{testimonials[active].name}</h3>
            <p className="text-sm text-[#D4AF37] uppercase tracking-widest font-semibold">
              {testimonials[active].designation}
            </p>
            <p className="text-lg text-gray-400 mt-6 leading-relaxed italic">"{testimonials[active].quote}"</p>
          </motion.div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePrev}
              className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition-all"
            >
              <IconArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition-all"
            >
              <IconArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
