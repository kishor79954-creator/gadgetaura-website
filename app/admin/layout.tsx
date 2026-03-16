"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, ShieldAlert } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { supabase } from "@/lib/supabaseClient"

// 🔒 Only this email can access the admin panel
const ADMIN_EMAIL = "kishor79954@gmail.com"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authStatus, setAuthStatus] = useState<"loading" | "allowed" | "denied">("loading")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email
      if (email === ADMIN_EMAIL) {
        setAuthStatus("allowed")
      } else {
        setAuthStatus("denied")
      }
    })
  }, [])

  // Show loading spinner while checking
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Block access — redirect non-admins
  if (authStatus === "denied") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center px-6">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          You don't have permission to access the admin panel. This area is restricted to authorised users only.
        </p>
        <Link
          href="/"
          className="mt-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition"
        >
          Go back home
        </Link>
      </div>
    )
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Package, label: "Catalog", href: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  return (
    <div className="flex min-h-screen bg-background text-foreground pt-20">
      {/* GLOBAL SIDEBAR - Fixed Position */}
      <aside className="w-72 border-r border-border bg-sidebar text-sidebar-foreground backdrop-blur-3xl p-8 hidden lg:flex flex-col fixed h-full top-20 left-0 z-40">
        <div className="mb-14">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">
              GA
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">Admin Console</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Gadgetura</p>
            </div>
          </Link>
        </div>

        <nav className="space-y-3 flex-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link href={item.href} key={item.href} className="block">
                <button
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* PAGE CONTENT WRAPPER */}
      <main className="flex-1 lg:ml-72 bg-background min-h-screen">
        {children}
      </main>
    </div>
  )
}
