"use client"

import React, { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

const AnimatedSignIn: React.FC = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isEmailFocused, setIsEmailFocused] = useState(false)
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    const [isConfirmFocused, setIsConfirmFocused] = useState(false)
    const [isEmailValid, setIsEmailValid] = useState(true)
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    const [mounted, setMounted] = useState(false)

    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { resolvedTheme, setTheme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const router = useRouter()

    useEffect(() => { setMounted(true) }, [])

    const validateEmail = (email: string) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(email).toLowerCase())
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        if (e.target.value) setIsEmailValid(validateEmail(e.target.value))
        else setIsEmailValid(true)
        setError(null)
    }

    // ── Google OAuth ──────────────────────────────────────────────
    const handleGoogleSignIn = async () => {
        setGoogleLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams(window.location.search)
            const from = params.get("redirectedFrom") || "/admin"
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(from)}`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message || "Google sign-in failed")
            setGoogleLoading(false)
        }
    }

    // ── Email/Password submit ──────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsFormSubmitted(true)
        setError(null)

        if (isSignUp && password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (email && password && validateEmail(email)) {
            setLoading(true)
            try {
                if (isSignUp) {
                    const { error } = await supabase.auth.signUp({ email, password })
                    if (error) throw error
                    alert("Check your email for the confirmation link!")
                } else {
                    const { error } = await supabase.auth.signInWithPassword({ email, password })
                    if (error) throw error
                    const params = new URLSearchParams(window.location.search)
                    const from = params.get("redirectedFrom") || "/admin"
                    // Hard navigation ensures cookies are fully written by Supabase listener before request
                    window.location.href = from
                }
            } catch (err: any) {
                setError(err.message || "An authentication error occurred")
            } finally {
                setLoading(false)
            }
        }
    }

    // ── Particle Animation ─────────────────────────────────────────
    const isInView = useInView(canvasRef, { margin: "200px" })

    useEffect(() => {
        if (!mounted) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const setCanvasSize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        setCanvasSize()
        window.addEventListener("resize", setCanvasSize)

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number; color: string
            constructor() {
                this.x = Math.random() * (canvas?.width || window.innerWidth)
                this.y = Math.random() * (canvas?.height || window.innerHeight)
                this.size = Math.random() * 3 + 1
                this.speedX = (Math.random() - 0.5) * 0.5
                this.speedY = (Math.random() - 0.5) * 0.5
                const isDark = resolvedTheme === "dark"
                this.color = isDark ? `rgba(255,255,255,${Math.random() * 0.2})` : `rgba(0,0,0,${Math.random() * 0.1})`
            }
            update() {
                this.x += this.speedX; this.y += this.speedY
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

        const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000))
        const particles: Particle[] = Array.from({ length: particleCount }, () => new Particle())
        let animationFrameId: number
        const animate = () => {
            if (!ctx) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            for (const p of particles) { p.update(); p.draw() }
            
            // Only continue the loop if the component is in view
            if (isInView) {
                animationFrameId = requestAnimationFrame(animate)
            }
        }

        if (isInView) {
            animate()
        }

        return () => {
            window.removeEventListener("resize", setCanvasSize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [mounted, resolvedTheme, isInView])

    if (!mounted) return null
    const isDark = resolvedTheme === "dark"
    const autofillFix = "[&:-webkit-autofill]:bg-background [&:-webkit-autofill]:shadow-[0_0_0_30px_hsl(var(--background))_inset]"

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground transition-colors duration-300">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-20 p-2 rounded-full cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setTheme(isDark ? "light" : "dark")}>
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

                    {/* ── Google Sign-In Button ── */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full h-11 flex items-center justify-center gap-3 border border-border rounded-lg bg-background hover:bg-muted transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 mb-6 font-medium text-sm"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {googleLoading ? "Redirecting..." : `${isSignUp ? "Sign up" : "Sign in"} with Google`}
                    </button>

                    {/* ── Divider ── */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                        </div>
                    </div>

                    {/* ── Email/Password Form ── */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="relative">
                            <Label htmlFor="email" className={cn(
                                "absolute left-3 transition-all duration-200 pointer-events-none z-10",
                                isEmailFocused || email ? "-top-2.5 text-xs bg-card px-1 text-primary" : "top-3 text-muted-foreground"
                            )}>
                                Email Address
                            </Label>
                            <Input type="email" id="email" value={email} onChange={handleEmailChange}
                                onFocus={() => setIsEmailFocused(true)} onBlur={() => setIsEmailFocused(false)}
                                className={cn("h-12 bg-background/50 border-input transition-all duration-300 focus:border-primary",
                                    !isEmailValid && email && "border-destructive focus-visible:ring-destructive", autofillFix)}
                                required />
                            {!isEmailValid && email && (
                                <span className="text-xs text-destructive mt-1 block px-1 animate-in slide-in-from-top-1">
                                    Please enter a valid email
                                </span>
                            )}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Label htmlFor="password" className={cn(
                                "absolute left-3 transition-all duration-200 pointer-events-none z-10",
                                isPasswordFocused || password ? "-top-2.5 text-xs bg-card px-1 text-primary" : "top-3 text-muted-foreground"
                            )}>
                                Password
                            </Label>
                            <Input type={showPassword ? "text" : "password"} id="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)}
                                className={cn("h-12 bg-background/50 border-input pr-10 focus:border-primary transition-all duration-300", autofillFix)}
                                required />
                            <button type="button" className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Confirm Password — only on Sign Up */}
                        {isSignUp && (
                            <div className="relative animate-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="confirm-password" className={cn(
                                    "absolute left-3 transition-all duration-200 pointer-events-none z-10",
                                    isConfirmFocused || confirmPassword ? "-top-2.5 text-xs bg-card px-1 text-primary" : "top-3 text-muted-foreground"
                                )}>
                                    Confirm Password
                                </Label>
                                <Input type={showConfirmPassword ? "text" : "password"} id="confirm-password"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => setIsConfirmFocused(true)} onBlur={() => setIsConfirmFocused(false)}
                                    className={cn("h-12 bg-background/50 border-input pr-10 focus:border-primary transition-all duration-300",
                                        confirmPassword && password !== confirmPassword && "border-destructive", autofillFix)}
                                    required />
                                <button type="button" className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {confirmPassword && password !== confirmPassword && (
                                    <span className="text-xs text-destructive mt-1 block px-1">Passwords do not match</span>
                                )}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="text-sm text-destructive text-center animate-in fade-in slide-in-from-top-1">{error}</div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(!!c)} />
                                <Label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer">
                                    Remember me
                                </Label>
                            </div>
                            {!isSignUp && (
                                <a href="#" className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
                                    Forgot Password?
                                </a>
                            )}
                        </div>

                        <Button type="submit"
                            className={cn("w-full h-11 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all duration-300",
                                loading && "opacity-70 cursor-not-allowed")}
                            disabled={loading}>
                            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setConfirmPassword("") }}
                            className="font-medium text-primary hover:underline underline-offset-4 bg-transparent border-0 p-0 cursor-pointer align-baseline">
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnimatedSignIn
