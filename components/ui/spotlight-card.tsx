"use client"
import type React from "react"
import { cn } from "@/lib/utils"

import { useEffect, useRef, type ReactNode } from "react"

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: "blue" | "purple" | "green" | "red" | "orange" | "amber" | "emerald"
  size?: "sm" | "md" | "lg"
  width?: string | number
  height?: string | number
  customSize?: boolean
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  emerald: { base: 150, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
  amber: { base: 45, spread: 200 },
}

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
}

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    // Calculate position relative to the element, not the whole document
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Request animation frame ensures we don't trigger style recalculations faster than 60fps
    requestAnimationFrame(() => {
        if (!cardRef.current) return
        cardRef.current.style.setProperty("--x", x.toFixed(2))
        cardRef.current.style.setProperty("--xp", (x / rect.width).toFixed(2))
        cardRef.current.style.setProperty("--y", y.toFixed(2))
        cardRef.current.style.setProperty("--yp", (y / rect.height).toFixed(2))
    })
  }

  const config = glowColorMap[glowColor as keyof typeof glowColorMap] || glowColorMap.blue
  const { base, spread } = config

  const getInlineStyles = () => {
    const baseStyles: any = {
      "--base": base,
      "--spread": spread,
      "--radius": "14",
      "--border": "3",
      "--backdrop": "hsl(var(--card))", // Changed from solid hsl(0 0% 10% / 0.8) to use theme card variable
      "--backup-border": "var(--border)", // Changed from var(--backdrop) to var(--border)

      "--size": "200",
      "--outer": "1",
      "--border-size": "calc(var(--border, 2) * 1px)",
      "--spotlight-size": "calc(var(--size, 150) * 1px)",
      "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) 100% 70% / 0.1), transparent
      )`,
      backgroundColor: "var(--backdrop, transparent)",
      backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",

      border: "var(--border-size) solid var(--backup-border)",
      position: "relative",
      touchAction: "none",
    }
    if (width !== undefined) baseStyles.width = typeof width === "number" ? `${width}px` : width
    if (height !== undefined) baseStyles.height = typeof height === "number" ? `${height}px` : height
    return baseStyles
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        [data-glow]::before, [data-glow]::after {
          pointer-events: none; content: ""; position: absolute;
          inset: calc(var(--border-size) * -1); border: var(--border-size) solid transparent;
          border-radius: calc(var(--radius) * 1px);
          background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
          background-repeat: no-repeat; background-position: 50% 50%;
          mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
          mask-clip: padding-box, border-box; mask-composite: intersect;
        }
        [data-glow]::before {
          background-image: radial-gradient(calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), hsl(var(--hue, 210) 100% 50% / 1), transparent 100%);
          filter: brightness(2);
        }
        [data-glow]::after {
          background-image: radial-gradient(calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), hsl(0 100% 100% / 1), transparent 100%);
        }
      `,
        }}
      />
      <div
        ref={cardRef}
        data-glow
        onPointerMove={handlePointerMove}
        style={getInlineStyles()}
        className={cn(
          customSize ? "" : sizeMap[size],
          !customSize ? "aspect-[3/4]" : "",
          "rounded-2xl relative grid grid-rows-[1fr_auto] shadow-2xl p-4 gap-4 backdrop-blur-xl transition-all",
          className,
        )}
      >
        <div
          data-glow
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        />
        {children}
      </div>
    </>
  )
}

export { GlowCard }
