"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service like Sentry
    console.error("App boundary caught an error:", error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      
      <h1 className="text-3xl font-bold font-serif mb-2">Something went wrong!</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We apologize for the inconvenience. An unexpected error occurred while loading this page. 
        Our team has been notified.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button
          onClick={() => reset()}
          variant="default"
          className="h-12 px-8 rounded-xl font-bold flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-12 px-8 rounded-xl font-bold flex items-center gap-2 border-border"
        >
          <Link href="/">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </Button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 text-left max-w-2xl w-full p-6 bg-muted rounded-xl overflow-auto text-xs text-muted-foreground border border-border">
          <p className="font-bold text-red-400 mb-2">Development Details:</p>
          <pre>{error.message}</pre>
          <pre className="mt-2 opacity-50">{error.stack}</pre>
        </div>
      )}
    </div>
  )
}
