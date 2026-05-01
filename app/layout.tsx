import type { Metadata } from "next"
import React from "react"
import "./globals.css"

import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/Cart-Context"
import { WishlistProvider } from "./context/WishlistContext"

import { PageTransitionLoader } from "@/components/ui/page-transition-loader"
import { CookieConsent } from "@/components/cookie-consent"


export const metadata: Metadata = {
  metadataBase: new URL("https://www.gadgetaura.in"),
  title: {
    default: "GadgetAura | Premium Gadgets Store",
    template: "%s | GadgetAura",
  },
  description: "Discover the latest premium gadgets, electronics, and accessories at GadgetAura. Compare products and shop with confidence.",
  keywords: ["gadgets", "electronics", "premium tech", "tech accessories", "GadgetAura", "mobile", "laptops", "smartwatches"],
  authors: [{ name: "GadgetAura" }],
  creator: "GadgetAura",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.gadgetaura.in",
    title: "GadgetAura | Premium Gadgets Store",
    description: "Discover the latest premium gadgets, electronics, and accessories at GadgetAura.",
    siteName: "GadgetAura",
    images: [
      {
        url: "https://www.gadgetaura.in/logo.png",
        width: 512,
        height: 512,
        alt: "GadgetAura Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GadgetAura | Premium Gadgets Store",
    description: "Discover the latest premium gadgets, electronics, and accessories at GadgetAura.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground antialiased relative">


        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>

                {/* ✅ NAVBAR — isolated & clickable */}
                <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
                  <Navbar />
                </div>

                {/* 
                  ✅ PAGE CONTENT
                  - padding-top accounts for fixed navbar
                  - pointer-events-auto ensures no blocking
                */}
                <main className="min-h-screen pt-32 pointer-events-auto relative z-0">
                  {children}
                </main>

              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>

        {/* Global Components */}
        <CookieConsent />
        <PageTransitionLoader />

        {/* SEO: Organization & WebSite Schema for Google Logo + Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "GadgetAura",
                url: "https://www.gadgetaura.in",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.gadgetaura.in/logo.png",
                  width: 512,
                  height: 512,
                },
                email: "customersupport@gadgetaura.in",
                telephone: "+917995473593",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Hyderabad",
                  addressRegion: "Telangana",
                  addressCountry: "IN",
                },
                areaServed: "IN",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+917995473593",
                  email: "customersupport@gadgetaura.in",
                  contactType: "customer support",
                  areaServed: "IN",
                  availableLanguage: ["English", "Hindi", "Telugu"],
                  hoursAvailable: {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                    opens: "10:00",
                    closes: "19:00",
                  },
                },
                sameAs: [
                  "https://www.instagram.com/gadgetaura.in_",
                  "https://www.youtube.com/@gadgetaura-in",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "GadgetAura",
                url: "https://www.gadgetaura.in",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://www.gadgetaura.in/products?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
      </body>
    </html>
  )
}
