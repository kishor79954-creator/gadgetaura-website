"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Cookie } from "lucide-react"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    try {
      const consent = window.localStorage.getItem("gadgetaura-cookie-consent")
      if (!consent) {
        // Delay showing it slightly for a smoother experience
        const timer = setTimeout(() => setShowConsent(true), 1500)
        return () => clearTimeout(timer)
      }
    } catch (e) {
      console.warn("localStorage is not available")
      const timer = setTimeout(() => setShowConsent(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    try {
      window.localStorage.setItem("gadgetaura-cookie-consent", "true")
    } catch (e) {
      console.warn("localStorage is not available")
    }
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-black/50 overflow-hidden relative">
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />

          <div className="flex items-start sm:items-center gap-4 relative z-10 w-full">
            <div className="p-3 bg-primary/10 rounded-full hidden sm:block shrink-0">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-bold tracking-tight mb-1">
                We use cookies 🍪
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pr-4">
                We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. By clicking "Accept", you agree to our website's cookie use as described in our Privacy Policy.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0 relative z-10 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              className="flex-1 sm:w-full rounded-xl"
              variant="cta"
              onClick={acceptCookies}
            >
              Accept All
            </Button>
            <Button
              className="flex-1 sm:w-full rounded-xl"
              variant="outline"
              onClick={() => setShowConsent(false)}
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
