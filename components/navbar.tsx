"use client"

import Link from "next/link"
import {
  ShoppingCart,
  Menu,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  Package,
  UserCircle,
  X,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { useState, useEffect, memo } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/app/context/AuthContext"
import { useCart } from "@/app/context/Cart-Context"
import { useWishlist } from "@/app/context/WishlistContext"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import dynamic from "next/dynamic"

const SearchCommand = dynamic(
  () => import("@/components/search-command").then(m => m.SearchCommand),
  { ssr: false }
)
import Image from "next/image"


export const Navbar = memo(function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  useEffect(() => {
    setMounted(true)
  }, [])

  const categories = [
    { name: "Watches", href: "/products", desc: "Premium timepieces for every occasion." },
    { name: "Headphones & Audio", href: "/products", desc: "Immersive sound and noise cancellation." },
    { name: "Smart Gadgets", href: "/products", desc: "Innovative tech to simplify your life." },
    { name: "Trending Accessories", href: "/products", desc: "Must-have items to enhance your setup." },
  ]

  return (
    <nav
      className="
        fixed top-4 left-1/2 -translate-x-1/2
        z-50 w-[95%] max-w-7xl
        rounded-2xl border border-white/10
        bg-black/50 backdrop-blur-md text-white
      "
    >
      {/* IMPORTANT: no backdrop-blur here */}

      <div className="relative z-50 px-6 flex items-center justify-between h-16 pointer-events-auto">

        {/* LEFT */}
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>

          <div className="hidden md:flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-white/70 hover:text-primary transition-colors"
            >
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-primary transition-colors outline-none"
              >
                Shop <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 bg-white/95 backdrop-blur-sm border border-border text-black"
              >
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.name} asChild>
                    <Link href={cat.href} className="w-full cursor-pointer">
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user?.email === "admin@gadgetura.com" && (
              <Link
                href="/admin"
                className="text-sm font-bold text-primary"
              >
                Admin Console
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <SearchCommand />
          <ThemeToggle className="hidden md:flex" />



          {/* ✅ CART BUTTON — GUARANTEED CLICKABLE */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="
              relative z-50
              flex items-center justify-center
              w-10 h-10
              rounded-md
              text-white/70 hover:text-primary
              hover:bg-white/10
              pointer-events-auto
            "
          >
            <ShoppingCart className="w-5 h-5" />

            {mounted && cartCount > 0 && (
              <span
                className="
                  absolute -top-1 -right-1
                  bg-primary text-primary-foreground
                  font-bold text-[10px]
                  w-4 h-4
                  rounded-full
                  flex items-center justify-center
                "
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* PROFILE */}
          <div className="hidden md:block">
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="
                    w-10 h-10
                    flex items-center justify-center
                    rounded-md
                    text-white/70 hover:text-white
                    hover:bg-white/10
                  "
                  >
                    <User className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 backdrop-blur-sm border border-border text-black"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        My Wishlist
                      </div>
                      {wishlistCount > 0 && (
                        <span className="bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {!user ? (
                    <DropdownMenuItem asChild>
                      <Link href="/auth" className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Login / Sign Up
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <div className="px-2 py-1.5 text-xs text-gray-500 truncate">
                        {user.email}
                      </div>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={logout}
                        className="flex items-center gap-2 text-red-500"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                className="
                w-10 h-10
                flex items-center justify-center
                rounded-md
                text-white/70 hover:text-white
                hover:bg-white/10
              "
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
              md:hidden
              w-10 h-10
              flex items-center justify-center
              rounded-md
              text-white/70 hover:text-primary
              hover:bg-white/10
            "
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU CONTENT */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/90 p-4 space-y-2 rounded-b-2xl backdrop-blur-md">
          <Link
            href="/"
            className="block p-3 rounded-lg text-white/70 hover:text-primary hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="block p-3 rounded-lg text-white/70 hover:text-primary hover:bg-white/10"
          >
            Shop All Products
          </Link>

          {user?.email === "admin@gadgetura.com" && (
            <Link
              href="/admin"
              className="block p-3 rounded-lg text-primary font-bold"
            >
              Admin Console
            </Link>
          )}

          <div className="p-3 flex items-center justify-between pointer-events-auto text-white/70">
            <span className="text-sm font-medium">Appearance</span>
            <ThemeToggle />
          </div>

          <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
            {!user ? (
              <Link
                href="/auth"
                className="flex p-3 rounded-lg text-white/70 hover:text-primary hover:bg-white/10 items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-5 h-5" />
                Login / Sign Up
              </Link>
            ) : (
              <>
                <div className="px-3 py-2 text-sm text-gray-400 truncate">
                  {user.email}
                </div>
                <Link
                  href="/profile"
                  className="flex p-3 rounded-lg text-white/70 hover:text-primary hover:bg-white/10 items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle className="w-5 h-5" />
                  My Profile
                </Link>
                <Link
                  href="/wishlist"
                  className="flex p-3 rounded-lg text-white/70 hover:text-primary hover:bg-white/10 items-center justify-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    My Wishlist
                  </div>
                  {mounted && wishlistCount > 0 && (
                    <span className="bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className="flex p-3 rounded-lg text-white/70 hover:text-primary hover:bg-white/10 items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5" />
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left flex p-3 rounded-lg text-red-500 hover:bg-white/10 items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
})
