"use client"

import React, { useState, useEffect, useRef } from "react"
import {
    Eye,
    EyeOff,
    Github,
    Twitter,
    Linkedin,
    Sun,
    Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
// Ensure supabase client is properly imported from your setup
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

const AnimatedSignIn: React.FC = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isEmailFocused, setIsEmailFocused] = useState(false)
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    const [isEmailValid, setIsEmailValid] = useState(true)
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    const [mounted, setMounted] = useState(false)

    // NEW: State for Auth Logic and Sign Up Toggle
    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { resolvedTheme, setTheme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const router = useRouter()

    // Wait for hydration
    useEffect(() => {
        setMounted(true)
    }, [])

    // Email validation
    const validateEmail = (email: string) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(email).toLowerCase())
    }

    // Handle email change
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        if (e.target.value) {
            setIsEmailValid(validateEmail(e.target.value))
        } else {
            setIsEmailValid(true)
        }
        setError(null) // Clear error on change
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsFormSubmitted(true)
        setError(null)

        if (email && password && validateEmail(email)) {
            setLoading(true)
            try {
                if (isSignUp) {
                    // Sign Up Logic
                    const { error } = await supabase.auth.signUp({
                        email,
                        password,
                    })
                    if (error) throw error
                    alert("Check your email for the confirmation link!")
                } else {
                    // Sign In Logic
                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    })
                    if (error) throw error
                    // Redirect to home and refresh to update auth state
                    router.push("/")
                    router.refresh()
                }
            } catch (err: any) {
                setError(err.message || "An authentication error occurred")
            } finally {
                setLoading(false)
            }
        }
    }

    // Particle Animation (kept as is)
    useEffect(() => {
        if (!mounted) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas size
        const setCanvasSize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        setCanvasSize()
        window.addEventListener("resize", setCanvasSize)

        // Particle class
        class Particle {
            x: number
            y: number
            size: number
            speedX: number
            speedY: number
            color: string

            constructor() {
                this.x = Math.random() * (canvas?.width || window.innerWidth)
                this.y = Math.random() * (canvas?.height || window.innerHeight)
                this.size = Math.random() * 3 + 1
                this.speedX = (Math.random() - 0.5) * 0.5
                this.speedY = (Math.random() - 0.5) * 0.5

                // Colors adaptation based on theme
                const isDark = resolvedTheme === "dark"
                this.color = isDark
                    ? `rgba(255, 255, 255, ${Math.random() * 0.2})`
                    : `rgba(0, 0, 0, ${Math.random() * 0.1})`
            }

            update() {
                this.x += this.speedX
                this.y += this.speedY

                if (this.x > (canvas?.width || 0)) this.x = 0
                if (this.x < 0) this.x = canvas?.width || 0
                if (this.y > (canvas?.height || 0)) this.y = 0
                if (this.y < 0) this.y = canvas?.height || 0
            }

            draw() {
                if (!ctx) return
                ctx.fillStyle = this.color
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        const particles: Particle[] = []
        const particleCount = Math.min(
            100,
            Math.floor((canvas.width * canvas.height) / 15000)
        )

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle())
        }

        let animationFrameId: number

        const animate = () => {
            if (!ctx) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            for (const particle of particles) {
                particle.update()
                particle.draw()
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", setCanvasSize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [mounted, resolvedTheme])

    if (!mounted) return null

    const isDark = resolvedTheme === "dark"

    // Custom CSS to fix yellow autofill background in dark mode
    const autofillFix = "[&:-webkit-autofill]:bg-background [&:-webkit-autofill]:shadow-[0_0_0_30px_hsl(var(--background))_inset] [&:-webkit-autofill]:-webkit-text-fill-color-foreground"

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground transition-colors duration-300">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

            {/* Theme Toggle in Top Right */}
            <div
                className="absolute top-6 right-6 z-20 p-2 rounded-full cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setTheme(isDark ? "light" : "dark")}
            >
                {isDark ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-slate-700" />}
            </div>

            <div className="relative z-10 w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isSignUp ? "Sign up to get started" : "Please sign in to continue"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="relative">
                            <div
                                className={cn(
                                    "relative transition-all duration-300",
                                    isEmailFocused || email ? "scale-100" : "scale-100"
                                )}
                            >
                                <Label
                                    htmlFor="email"
                                    className={cn(
                                        "absolute left-3 transition-all duration-200 pointer-events-none z-10",
                                        isEmailFocused || email
                                            ? "-top-2.5 text-xs bg-card px-1 text-primary"
                                            : "top-3 text-muted-foreground"
                                    )}
                                >
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                    className={cn(
                                        "h-12 bg-background/50 border-input transition-all duration-300 focus:border-primary",
                                        !isEmailValid && email && "border-destructive focus-visible:ring-destructive",
                                        autofillFix
                                    )}
                                    required
                                />
                            </div>
                            {!isEmailValid && email && (
                                <span className="text-xs text-destructive mt-1 block px-1 animate-in slide-in-from-top-1">
                                    Please enter a valid email
                                </span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <div
                                className={cn(
                                    "relative transition-all duration-300",
                                )}
                            >
                                <Label
                                    htmlFor="password"
                                    className={cn(
                                        "absolute left-3 transition-all duration-200 pointer-events-none z-10",
                                        isPasswordFocused || password
                                            ? "-top-2.5 text-xs bg-card px-1 text-primary"
                                            : "top-3 text-muted-foreground"
                                    )}
                                >
                                    Password
                                </Label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    className={cn(
                                        "h-12 bg-background/50 border-input pr-10 focus:border-primary transition-all duration-300",
                                        autofillFix
                                    )}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message Display */}
                        {error && (
                            <div className="text-sm text-destructive text-center animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(c) => setRememberMe(!!c)}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Remember me
                                </Label>
                            </div>

                            {!isSignUp && (
                                <a href="#" className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
                                    Forgot Password?
                                </a>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className={cn(
                                "w-full h-11 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all duration-300",
                                (loading || (isFormSubmitted && (!email || !password || !isEmailValid))) && "opacity-70 cursor-not-allowed"
                            )}
                            disabled={loading || (isFormSubmitted && (!email || !password || !isEmailValid))}
                        >
                            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Button variant="outline" className="h-11 hover:bg-muted hover:scale-105 transition-transform duration-200">
                            <Github className="h-5 w-5" />
                            <span className="sr-only">GitHub</span>
                        </Button>
                        <Button variant="outline" className="h-11 hover:bg-muted hover:scale-105 transition-transform duration-200">
                            <Twitter className="h-5 w-5 text-sky-500" />
                            <span className="sr-only">Twitter</span>
                        </Button>
                        <Button variant="outline" className="h-11 hover:bg-muted hover:scale-105 transition-transform duration-200">
                            <Linkedin className="h-5 w-5 text-blue-600" />
                            <span className="sr-only">LinkedIn</span>
                        </Button>
                    </div>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setError(null)
                            }}
                            className="font-medium text-primary hover:underline underline-offset-4 bg-transparent border-0 p-0 cursor-pointer align-baseline"
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnimatedSignIn
