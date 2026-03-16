import Link from "next/link"
import Image from "next/image"

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
          <div className="flex gap-4 items-center">
            <Link href="https://www.instagram.com/gadgetaura.in_" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 hover:scale-110 transition-all">
              {/* Instagram official gradient SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7">
                <defs>
                  <radialGradient id="ig-grad" cx="30%" cy="110%" r="150%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="10%" stopColor="#fd5949" />
                    <stop offset="50%" stopColor="#d6249f" />
                    <stop offset="100%" stopColor="#285AEB" />
                  </radialGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
                <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="none" stroke="white" strokeWidth="1.4" />
                <circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.4" />
                <circle cx="17.8" cy="6.2" r="1.1" fill="white" />
              </svg>
            </Link>
            <Link href="https://www.youtube.com/@gadgetaura-in" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 hover:scale-110 transition-all">
              {/* YouTube official red SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-6">
                <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088C19.535 3.6 12 3.6 12 3.6s-7.535 0-9.407.517A3.007 3.007 0 0 0 .505 6.205 31.247 31.247 0 0 0 0 12a31.247 31.247 0 0 0 .505 5.795 3.007 3.007 0 0 0 2.088 2.088C4.465 20.4 12 20.4 12 20.4s7.535 0 9.407-.517a3.007 3.007 0 0 0 2.088-2.088A31.247 31.247 0 0 0 24 12a31.247 31.247 0 0 0-.505-5.795z" fill="#FF0000" />
                <path d="M9.545 15.568V8.432L15.818 12z" fill="#FFFFFF" />
              </svg>
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
