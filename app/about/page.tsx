import Link from "next/link"
import { Watch, Headphones, Cpu, Zap, ShieldCheck, Truck, Star, Users } from "lucide-react"

export const metadata = {
  title: "About GadgetAura | Premium Gadgets Store India",
  description: "GadgetAura is a premium online gadgets store based in Hyderabad, India. We curate the best watches, audio gear, and smart accessories for the next generation.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-12 pb-24 px-4 md:px-6 text-foreground bg-background">

      {/* JSON-LD for this page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About GadgetAura",
            url: "https://www.gadgetaura.in/about",
            description: "GadgetAura is a premium online gadgets store based in Hyderabad, Telangana, India.",
            mainEntity: {
              "@type": "Organization",
              name: "GadgetAura",
              url: "https://www.gadgetaura.in",
              foundingLocation: "Hyderabad, Telangana, India",
              description: "Premium gadgets, watches, and lifestyle tech for the next generation.",
              telephone: "+917995473593",
              email: "customersupport@gadgetaura.in",
            },
          }),
        }}
      />

      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-20">
          <p className="text-primary text-xs uppercase tracking-[0.4em] mb-3 font-bold">Our Story</p>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">About GadgetAura</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            We're a premium gadgets store based in Hyderabad, India — curating the finest watches, audio gear,
            and smart accessories for those who refuse to settle for ordinary.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-card border border-border rounded-3xl p-10 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <h2 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-3xl">
            GadgetAura was founded with a simple belief — premium technology should be accessible to everyone.
            We handpick every product in our catalog, testing for quality, durability, and real-world performance
            before it ever reaches your doorstep. From smartwatches that track your health to headphones that
            deliver studio-quality audio, we bring you the best of modern tech at honest prices.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">What We Offer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Watch, label: "Premium Watches", desc: "From classic analog to smart fitness trackers" },
              { icon: Headphones, label: "Audio Gear", desc: "Headphones, earbuds & speakers" },
              { icon: Cpu, label: "Smart Gadgets", desc: "Cutting-edge tech for modern living" },
              { icon: Zap, label: "Accessories", desc: "Everything to complement your lifestyle" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{label}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Why Shop With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Secure & Trusted",
                desc: "SSL-secured checkout. Payments processed via Razorpay — India's most trusted payment gateway. Your data is always safe.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "We ship within 1-2 business days. Standard delivery in 3-5 days across India. Free shipping on all orders.",
                color: "text-green-500",
                bg: "bg-green-500/10",
              },
              {
                icon: Star,
                title: "Quality Curated",
                desc: "Every product is handpicked and reviewed by our team before being listed. No fakes, no compromises.",
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Contact CTA */}
        <div className="bg-card border border-border rounded-3xl p-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">📍</span>
            <p className="text-muted-foreground font-medium">Based in <strong className="text-foreground">Hyderabad, Telangana, India</strong></p>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Have a Question?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Our support team is available Monday to Saturday, 10 AM – 7 PM IST.
            We typically respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-black font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center px-8 py-3 border border-border text-foreground font-semibold rounded-full hover:border-primary/50 transition-colors"
            >
              View FAQ
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
