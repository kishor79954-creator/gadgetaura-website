"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"

const buttonVariants = cva(
  "relative group border text-foreground mx-auto text-center rounded-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 border-[#D4AF37]/20",
        solid: "bg-[#D4AF37] hover:bg-[#B48F27] text-black border-transparent",
        ghost: "border-transparent bg-transparent hover:bg-white/5",
      },
      size: {
        default: "px-7 py-2",
        sm: "px-4 py-1.5 text-xs",
        lg: "px-10 py-3 text-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  neon?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, neon = true, size, variant, children, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
        <span
          className={cn(
            "absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 inset-x-0 inset-y-0 bg-gradient-to-r w-3/4 mx-auto from-transparent via-[#D4AF37] to-transparent",
            neon && "block",
          )}
        />
        {children}
        <span
          className={cn(
            "absolute group-hover:opacity-30 transition-all duration-500 inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-[#D4AF37] to-transparent",
            neon && "block",
          )}
        />
      </button>
    )
  },
)
Button.displayName = "Button"
export { Button, buttonVariants }
