import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-12 w-12 transition-transform hover:scale-110">
        <Image src="/images/logo-removebg-preview.png" alt="Gadgetaura Logo" fill className="object-contain" priority />
      </div>
      <span className="text-xl font-bold tracking-widest text-primary uppercase hidden sm:block">Gadgetaura</span>
    </div>
  )
}
