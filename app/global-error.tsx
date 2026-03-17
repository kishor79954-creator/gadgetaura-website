"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

// global-error.tsx must be a client component and replaces the root layout on catastrophic failures
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <head>
        <title>Critial Error | GadgetAura</title>
      </head>
      <body className="bg-black text-white antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4 font-serif">Critical Application Error</h1>
          <p className="text-gray-400 max-w-lg mb-8 text-lg">
            A fatal error occurred at the root level of the application. The layout could not be rendered.
          </p>

          <Button
            onClick={() => window.location.href = '/'}
            className="h-14 px-8 rounded-full font-bold bg-white text-black hover:bg-gray-200"
          >
            Hard Reload Application
          </Button>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-12 text-left max-w-3xl w-full p-6 bg-gray-900 rounded-xl overflow-auto text-xs text-gray-400 border border-gray-800">
              <p className="font-bold text-red-400 mb-2">Error Details:</p>
              <pre className="whitespace-pre-wrap">{error.message}</pre>
              <pre className="mt-2 text-gray-500 whitespace-pre-wrap">{error.stack}</pre>
            </div>
          )}
        </div>
      </body>
    </html>
  )
}
