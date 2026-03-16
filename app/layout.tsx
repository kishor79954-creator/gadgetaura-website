import type { Metadata } from "next"
import React from "react"
import "./globals.css"

import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/Cart-Context"
import { WishlistProvider } from "./context/WishlistContext"

import { EtheralShadow } from "@/components/ui/etheral-shadow"

export const metadata: Metadata = {
  title: "Gadgetura",
  description: "Premium gadgets store",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground antialiased relative">
        {/* Global Background Effect */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <EtheralShadow
            color="rgba(128, 128, 128, 0.4)"
            animation={{ scale: 100, speed: 90 }}
            noise={{ opacity: 0.2, scale: 1.2 }}
            sizing="fill"
          />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
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
      </body>
    </html>
  )
}
