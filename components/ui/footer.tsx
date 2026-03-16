import Link from "next/link"
import { Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-5 gap-12">

        {/* BRAND */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Gadgetaura
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Premium watches, gadgets & lifestyle tech curated
            for the next generation.
          </p>
        </div>

        {/* CATEGORIES */}
        <div>
          <h4 className="text-yellow-500 text-xs uppercase tracking-widest mb-4 font-bold">
            Categories
          </h4>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li><Link href="/products/watches" className="hover:text-foreground transition-colors">Watches</Link></li>
            <li><Link href="/products/audio" className="hover:text-foreground transition-colors">Audio</Link></li>
            <li><Link href="/products/gadgets" className="hover:text-foreground transition-colors">Gadgets</Link></li>
            <li><Link href="/products/accessories" className="hover:text-foreground transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* CUSTOMER SERVICE */}
        <div>
          <h4 className="text-yellow-500 text-xs uppercase tracking-widest mb-4 font-bold">
            Customer Service
          </h4>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-foreground transition-colors">Shipping Policy</Link></li>
            <li><Link href="/policies/refunds" className="hover:text-foreground transition-colors">Returns & Refunds</Link></li>
            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="text-yellow-500 text-xs uppercase tracking-widest mb-4 font-bold">
            Legal
          </h4>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li><Link href="/policies/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h4 className="text-yellow-500 text-xs uppercase tracking-widest mb-4 font-bold">
            Follow Us
          </h4>
          <div className="flex gap-4">
            <Link href="https://instagram.com/gadgetaura" target="_blank">
              <Instagram className="w-6 h-6 text-foreground hover:text-yellow-500 transition" />
            </Link>
            <Link href="https://youtube.com/@gadgetaura" target="_blank">
              <Youtube className="w-6 h-6 text-foreground hover:text-yellow-500 transition" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-muted-foreground/60 text-sm">
        © 2026 Gadgetaura. All rights reserved.
      </div>
    </footer>
  )
}
