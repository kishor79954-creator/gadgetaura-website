"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, ShieldAlert } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

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
