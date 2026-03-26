"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react"

type CategoryRel = { name: string }
type ProductRow = {
  id: string
  created_at: string
  name: string
  price: number
  stock: number
  status: string
  image_url: string | null
  category_id: string | null
  categories: CategoryRel | CategoryRel[] | null
  homepageslot: number | null
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductRow[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Hydration fix
  const [mounted, setMounted] = useState(false)

  const load = async () => {
    setError(null)
    setLoading(true)

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        created_at,
        name,
        price,
        stock,
        status,
        image_url,
        category_id,
        homepageslot,
        product_categories(categories(name))
      `)
      .order("created_at", { ascending: false })

    if (error) {
      setError(`Query failed: ${error.message}`)
      setProducts([])
      setLoading(false)
      return
    }

    const rows = (data ?? []).map((p: any) => ({
      ...p,
      categories: p.product_categories?.map((pc: any) => pc.categories) || null
    })) as unknown as ProductRow[]
    setProducts(rows)
    setLoading(false)
  }

  useEffect(() => {
    setMounted(true)
    load()
  }, [])

  // Filter effect
  useEffect(() => {
    let result = products

    // 1. Search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        (Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name)?.toLowerCase().includes(lower)
      )
    }

    // 2. Status Tab
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter)
    }

    // 3. Sort by Category
    result = [...result].sort((a, b) => {
      const catA = Array.isArray(a.categories) ? a.categories[0]?.name : a.categories?.name;
      const catB = Array.isArray(b.categories) ? b.categories[0]?.name : b.categories?.name;
      const nameA = catA || "Uncategorized";
      const nameB = catB || "Uncategorized";
      // First by category name, then by product name
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB);
      }
      return a.name.localeCompare(b.name);
    })

    setFilteredProducts(result)
  }, [products, searchQuery, statusFilter])

  // Group filtered products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const catName = Array.isArray(product.categories) ? product.categories[0]?.name : product.categories?.name
    const key = catName || "Uncategorized"
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(product)
    return acc
  }, {} as Record<string, ProductRow[]>)

  // Sort groups alphabetically by category name
  const sortedCategories = Object.keys(groupedProducts).sort()

  const handleDelete = async (id: string) => {
    const ok = confirm("Delete this product?")
    if (!ok) return

    // SOFT DELETE: We archive the product to prevent breaking order history
    // and remove it from homepage slots.
    const { error } = await supabase
      .from("products")
      .update({ status: 'archived', homepageslot: null, is_trending: false })
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    await load()
  }

  const homepageProducts = Array.from({ length: 4 }, (_, i) =>
    products.find(p => p.homepageslot === (i + 1))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-green-500/20'
      case 'draft': return 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 shadow-none border-gray-500/20'
      case 'archived': return 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 shadow-none border-orange-500/20'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  if (!mounted) {
    return (
      <div className="bg-background min-h-screen pb-20 p-4 md:p-8 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading Admin Workspace...</p>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pb-20 p-4 md:p-8 overflow-x-hidden w-full max-w-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your product catalog and inventory.</p>
        </div>
        <Button asChild className="bg-primary text-black font-medium">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* MAIN TABLE SECTION */}
      <Tabs defaultValue="all" className="space-y-4" onValueChange={setStatusFilter}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* TABS */}
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          {/* SEARCH */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={statusFilter} className="mt-0 w-full overflow-x-auto space-y-8">
          {loading ? (
            <Card className="min-w-fit md:min-w-0">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="h-24 text-center text-muted-foreground">Loading products...</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          ) : sortedCategories.length === 0 ? (
            <Card className="min-w-fit md:min-w-0">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Search className="h-6 w-6" />
                        </div>
                        <p className="text-lg font-medium text-foreground">No products found</p>
                        <p className="text-sm">Try adjusting your filters or add a new product.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          ) : (
            sortedCategories.map(category => (
              <div key={category} className="space-y-3">
                <h3 className="text-xl font-bold pl-1 border-l-4 border-primary tracking-tight">
                  {category}
                  <span className="text-sm font-medium text-muted-foreground ml-3">
                    ({groupedProducts[category].length} {groupedProducts[category].length === 1 ? 'item' : 'items'})
                  </span>
                </h3>
                <Card className="min-w-fit md:min-w-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px] hidden md:table-cell">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Inventory</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedProducts[category].map((p) => {
                        return (
                          <TableRow key={p.id} className="group">
                            <TableCell className="hidden md:table-cell">
                              <div className="h-12 w-12 rounded-md bg-muted overflow-hidden border border-border">
                                {p.image_url ? (
                                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">IMG</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <span className="text-foreground">{p.name}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(p.status)}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className={p.stock <= 5 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                                {p.stock} in stock
                              </span>
                            </TableCell>
                            <TableCell>
                              ₹{Number(p.price).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => router.push(`/admin/products/${p.id}`)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/product/${p.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" /> View in Store
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(p.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* MERCHANDISING / HOMEPAGE SLOTS */}
      <div className="mt-8 md:mt-12 space-y-8 md:space-y-12 w-full">
        {/* HOMEPAGE FEATURED (1-4) */}
        <div>
          <h2 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            Features on Homepage
            <Badge variant="secondary" className="text-xs">Merchandising</Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {homepageProducts.map((product, index) => {
              const slotNumber = index + 1
              return (
                <HomepageSlotCard
                  key={slotNumber}
                  slotNumber={slotNumber}
                  product={product}
                  onEdit={() => product && router.push(`/admin/products/${product.id}`)}
                  onAssign={() => router.push(`/admin/products/homepage?slot=${slotNumber}`)}
                />
              )
            })}
          </div>
        </div>

        {/* TOP SELLING WATCHES (5-8) */}
        <div>
          <h2 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            Top Selling Watches
            <Badge variant="outline" className="text-xs border-indigo-500 text-indigo-500">Homepage Merchandising</Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => {
              const slotNumber = 5 + i
              const product = products.find(p => p.homepageslot === slotNumber)
              return (
                <HomepageSlotCard
                  key={slotNumber}
                  slotNumber={slotNumber}
                  product={product}
                  onEdit={() => product && router.push(`/admin/products/${product.id}`)}
                  onAssign={() => router.push(`/admin/products/homepage?slot=${slotNumber}`)}
                />
              )
            })}
          </div>
        </div>

        {/* PREMIUM STACK (11-15) */}
        <div>
          <h2 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            Premium Stack (Vertical Scroll)
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">Premium</Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }, (_, i) => {
              const slotNumber = 11 + i
              // Find product in products array that matches this slot
              const product = products.find(p => p.homepageslot === slotNumber)
              return (
                <HomepageSlotCard
                  key={slotNumber}
                  slotNumber={slotNumber}
                  product={product}
                  onEdit={() => product && router.push(`/admin/products/${product.id}`)}
                  onAssign={() => router.push(`/admin/products/homepage?slot=${slotNumber}`)}
                />
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}

// Homepage slots
function HomepageSlotCard({ slotNumber, product, onEdit, onAssign }: {
  slotNumber: number
  product?: ProductRow
  onEdit: () => void
  onAssign: () => void
}) {
  return (
    <Card className={`overflow-hidden border-2 ${!product ? 'border-dashed' : ''} h-[240px] flex flex-col group relative`}>
      {product ? (
        <>
          {/* Background Image Effect */}
          <div className="absolute inset-0 z-0">
            {product.image_url ? (
              <img src={product.image_url} alt="" className="w-full h-full object-cover opacity-20 blur-sm scale-110 group-hover:scale-100 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <CardContent className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
            <Badge className="mb-4 bg-primary text-black hover:bg-primary/90">Slot {slotNumber}</Badge>

            {product.image_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-border shadow-lg mb-3">
                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <h3 className="font-bold text-foreground truncate w-full">{product.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">₹{Number(product.price).toLocaleString()}</p>

            <div className="flex gap-2 w-full">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onAssign}>Change</Button>
              <Button size="sm" className="flex-1 text-xs" onClick={onEdit}>Edit</Button>
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 opacity-50" />
          </div>
          <p className="font-medium mb-1">Slot {slotNumber}</p>
          <p className="text-xs mb-4">Empty Slot</p>
          <Button size="sm" variant="outline" onClick={onAssign}>Assign Product</Button>
        </CardContent>
      )}
    </Card>
  )
}
