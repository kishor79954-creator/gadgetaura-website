"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

type Product = {
    id: string
    name: string
    price: number
    image_url: string | null
}

export function SearchCommand() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [products, setProducts] = React.useState<Product[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    React.useEffect(() => {
        if (open && products.length === 0) {
            const fetchProducts = async () => {
                setLoading(true)
                const { data } = await supabase
                    .from("products")
                    .select("id, name, price, image_url")
                    .eq("status", "active")

                if (data) setProducts(data)
                setLoading(false)
            }
            fetchProducts()
        }
    }, [open, products.length])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="
          w-10 h-10
          flex items-center justify-center
          rounded-md
          text-white/70 hover:text-white
          hover:bg-white/10
          transition-colors
        "
                aria-label="Search products"
            >
                <Search className="w-5 h-5" />
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search for watches, audio, gadgets..." />
                <CommandList>
                    <CommandEmpty>
                        {loading ? "Loading products..." : "No results found."}
                    </CommandEmpty>
                    <CommandGroup heading="Products">
                        {products.map((product) => (
                            <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => runCommand(() => router.push(`/products/detail/${product.id}`))}
                                className="flex items-center gap-4 py-3 cursor-pointer"
                            >
                                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0 border border-border">
                                    {product.image_url ? (
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Search className="w-4 h-4 m-auto text-muted-foreground mt-3" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm text-foreground">{product.name}</span>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        ₹{Number(product.price).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
