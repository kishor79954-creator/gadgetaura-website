"use client"

import { useEffect, useState, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

function InfinitySpinner() {
  return (
    <div className="flex items-center justify-center mb-6 relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]"
      >
        <path
          d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"
          style={{
            strokeDasharray: "65",
            strokeDashoffset: "65",
            animation: "dash-anim 2s ease-in-out infinite"
          }}
        />
      </svg>
      {/* Inline style for the CSS animation to offload work from main JS thread */}
      <style suppressHydrationWarning>{`
        @keyframes dash-anim {
          0% {
            stroke-dashoffset: 65;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -65;
          }
        }
      `}</style>
    </div>
  )
}


// Create a component that specifically tracks URL changes
function NavigationTracker({
  setGlobalLoading,
}: {
  setGlobalLoading: (val: boolean) => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Whenever the URL changes, it means the new page has fully mounted.
    // Turn off the loader shortly after.
    const timeout = setTimeout(() => {
      setGlobalLoading(false)
    }, 100)
    
    return () => clearTimeout(timeout)
  }, [pathname, searchParams, setGlobalLoading])

  return null
}

export function PageTransitionLoader() {
  const [isGlobalLoading, setGlobalLoading] = useState(false)

  // Because Next.js App Router doesn't provide a native "routeChangeStart" event,
  // we have to patch the browser's history API to know when a push/replace happens.
  useEffect(() => {
    const handleStart = () => {
      // Defer state update to avoid React 'useInsertionEffect must not schedule updates' error
      setTimeout(() => setGlobalLoading(true), 0)
    }

    // Intercept Next.js client-side navigations (which use pushState/replaceState under the hood)
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      handleStart()
      return originalPushState.apply(this, args)
    }

    window.history.replaceState = function (...args) {
      handleStart()
      return originalReplaceState.apply(this, args)
    }

    // Intercept standard link clicks meant for same-origin routing
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      
      if (
        anchor &&
        anchor.href &&
        anchor.target !== "_blank" &&
        anchor.origin === window.location.origin && // Same origin
        (!anchor.pathname.startsWith('/#') && anchor.pathname !== window.location.pathname) // Not just a hash link to the same page
      ) {
         // The user clicked a Next.js link to a new page
         handleStart()
      }
    }

    document.addEventListener("click", handleAnchorClick, true)

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      document.removeEventListener("click", handleAnchorClick, true)
    }
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <NavigationTracker
          setGlobalLoading={setGlobalLoading}
        />
      </Suspense>

      <AnimatePresence>
        {isGlobalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center justify-center">
              <InfinitySpinner />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
