"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ChevronLeft, Plus, GripVertical } from "lucide-react"
import { ImageCropper } from "@/components/image-cropper"

type Category = { id: string; name: string }

export default function NewProductPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Product fields
  const [name, setName] = useState("")
  const [price, setPrice] = useState<string>("")
  const [compareAtPrice, setCompareAtPrice] = useState<string>("")
  const [stock, setStock] = useState<string>("0")
  const [status, setStatus] = useState<string>("active")
  const [isTrending, setIsTrending] = useState(false)
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [description, setDescription] = useState("")

  // Images (up to 10)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)

  // Cropping Queue
  const [cropQueue, setCropQueue] = useState<File[]>([])
  const [isCropping, setIsCropping] = useState(false)

  // Categories list
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  // Variants
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<{ id: string; name: string; stock: number; image_url: string; imageFile: File | null; price?: string }[]>([])

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)

      const { data, error } = await supabase
        .from("categories")
        .select("id,name")
        .order("name", { ascending: true })

      if (error) {
        alert(error.message)
        setCategories([])
      } else {
        const rows = (data as Category[]) || []
        setCategories(rows)
        // Don't auto-select category, let user choose
      }

      setLoadingCategories(false)
    }

    loadCategories()
  }, [])

  async function uploadOneImage(file: File) {
    const ext = file.name.split(".").pop() || "jpg"
    const safeExt = ext.toLowerCase()

    const path = `products/${crypto.randomUUID()}.${safeExt}`

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("product-images").getPublicUrl(path)
    return data.publicUrl
  }

  const handleFilesChange = (files: FileList | null) => {
    const arr = Array.from(files ?? [])

    if (imageFiles.length + arr.length > 10) {
      alert("You can only have up to 10 images total. Some will be ignored.")
    }

    const currentCount = imageFiles.length
    const remainingSlots = 10 - currentCount
    const newFiles = arr.slice(0, remainingSlots)

    if (newFiles.length > 0) {
      setCropQueue(newFiles)
      setIsCropping(true)
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    // Add cropped file to our final array
    setImageFiles(prev => [...prev, croppedFile])

    // Move to next in queue
    setCropQueue(prev => {
      const remaining = prev.slice(1)
      if (remaining.length === 0) {
        setIsCropping(false)
      }
      return remaining
    })
  }

  const handleCropCancel = () => {
    // Skip current image and move to next
    setCropQueue(prev => {
      const remaining = prev.slice(1)
      if (remaining.length === 0) {
        setIsCropping(false)
      }
      return remaining
    })
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault() // Necessary to allow dropping
  }

  const handleDrop = (index: number) => {
    if (draggedImageIndex === null || draggedImageIndex === index) return

    setImageFiles(prev => {
      const newFiles = [...prev]
      const [draggedItem] = newFiles.splice(draggedImageIndex, 1)
      newFiles.splice(index, 0, draggedItem)
      return newFiles
    })
    setDraggedImageIndex(null)
  }

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) {
      alert("Enter category name")
      return
    }

    setCreatingCategory(true)

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: trimmed }])
      .select("id,name")

    setCreatingCategory(false)

    if (error) {
      alert(error.message)
      return
    }

    const created = (data as Category[] | null)?.[0]
    if (!created) {
      alert("Category created but could not read it back. Refresh categories.")
      return
    }

    setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    setCategoryIds((prev) => [...prev, created.id])
    setNewCategoryName("")
    setShowNewCategoryInput(false)
  }



  // ... (existing helper functions)

  const handleAddVariant = () => {
    setVariants([...variants, { id: crypto.randomUUID(), name: "", stock: 0, image_url: "", imageFile: null, price: "" }])
  }

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const handleVariantChange = (id: string, field: keyof typeof variants[0], value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const handleVariantImageUpload = async (id: string, file: File) => {
    // Optimistic preview
    const previewUrl = URL.createObjectURL(file)
    setVariants(variants.map(v => v.id === id ? { ...v, imageFile: file, image_url: previewUrl } : v))
  }

  // Modified handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return alert("Enter product name")
    if (!price || Number(price) <= 0) return alert("Enter valid price")
    if (categoryIds.length === 0) return alert("Select at least one category")

    if (imageFiles.length === 0 && !hasVariants) return alert("Please choose at least 1 image")
    if (hasVariants && variants.length === 0) return alert("Please add at least one variant")

    setLoading(true)

    try {
      const imageUrls: string[] = []

      // 1. Upload Main Images
      for (const file of imageFiles) {
        const url = await uploadOneImage(file)
        imageUrls.push(url)
      }

      // 2. Upload Variant Images
      const finalVariants = []
      if (hasVariants) {
        for (const v of variants) {
          if (!v.name) throw new Error("All variants must have a name")

          let vImageUrl = v.image_url
          if (v.imageFile) {
            vImageUrl = await uploadOneImage(v.imageFile)
          }

          finalVariants.push({
            name: v.name,
            stock: Number(v.stock),
            price: v.price ? Number(v.price) : null,
            image_url: vImageUrl
          })
        }
      }

      // Use first variant image as main image if no main images uploaded (edge case)
      const primaryImageUrl = imageUrls[0] || (finalVariants[0]?.image_url ?? "")

      // category_id is kept for backward compatibility (using the first selected category)
      const primaryCategoryId = categoryIds.length > 0 ? categoryIds[0] : null

      const productPayload = {
        name: name.trim(),
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        stock: Number(stock || 0),
        status,
        category_id: primaryCategoryId,
        image_url: primaryImageUrl,
        description: description,
        is_trending: isTrending,
        variants: hasVariants ? finalVariants : null // Save to JSONB column
      }

      const { data: createdProduct, error: productError } = await supabase
        .from("products")
        .insert([productPayload])
        .select("id")
        .single()

      if (productError) throw productError

      // Insert product categories
      if (categoryIds.length > 0) {
        const productCategoriesPayload = categoryIds.map((cId) => ({
          product_id: createdProduct.id,
          category_id: cId,
        }))
        const { error: pcError } = await supabase.from("product_categories").insert(productCategoriesPayload)
        if (pcError) {
          console.error("Failed to link categories:", pcError)
        }
      }

      // Save main images to product_images table
      if (imageUrls.length > 0) {
        const imagesPayload = imageUrls.map((url, index) => ({
          product_id: createdProduct.id,
          image_url: url,
          sort_order: index + 1,
        }))
        await supabase.from("product_images").insert(imagesPayload)
      }

      alert("Product created successfully!")
      router.push("/admin/products")

    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-[1000px] mx-auto p-6 md:p-8">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Add new product</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN - MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. PRODUCT DETAILS */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Title, description, and media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Premium Leather Watch"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product..."
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. MEDIA UPLOAD */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Upload up to 10 images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imageFiles.map((file, idx) => {
                    const previewUrl = URL.createObjectURL(file)
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                        className={`relative group aspect-square rounded-lg overflow-hidden border-2 bg-muted transition-all cursor-move 
                          ${draggedImageIndex === idx ? 'opacity-50 border-primary' : 'border-border hover:border-primary/50'}`}
                      >
                        <img src={previewUrl} alt="preview" className="w-full h-full object-cover pointer-events-none" />
                        <div className="absolute top-2 left-2 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-destructive/90 text-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] py-1 text-center font-bold uppercase pointer-events-none">Primary Image</div>
                        )}
                        {idx !== 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Position {idx + 1}</div>
                        )}
                      </div>
                    )
                  })}

                  {/* UPLOAD BUTTON */}
                  {imageFiles.length < 10 && (
                    <label className="border-2 border-dashed border-border rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground font-medium">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleFilesChange(e.target.files)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Top left image will be the primary image.</p>
              </CardContent>
            </Card>

            {/* VARIANTS SECTION (NEW) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Variants</CardTitle>
                  <CardDescription>Add colors or options (e.g. Blue, Red)</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="has-variants">Enable</Label>
                  <input
                    id="has-variants"
                    type="checkbox"
                    className="w-4 h-4"
                    checked={hasVariants}
                    onChange={e => setHasVariants(e.target.checked)}
                  />
                </div>
              </CardHeader>
              {hasVariants && (
                <CardContent className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border p-4 rounded-lg">
                      <div className="md:col-span-3 space-y-2">
                        <Label>Color Name</Label>
                        <Input placeholder="e.g. Obsidian" value={variant.name} onChange={e => handleVariantChange(variant.id, "name", e.target.value)} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Stock</Label>
                        <Input type="number" placeholder="0" value={variant.stock} onChange={e => handleVariantChange(variant.id, "stock", e.target.value)} />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label>Custom Price (₹)</Label>
                        <Input type="number" placeholder="Optional" value={variant.price || ""} onChange={e => handleVariantChange(variant.id, "price", e.target.value)} />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label>Variant Image</Label>
                        <div className="flex items-center gap-2">
                          {variant.image_url ? (
                            <img src={variant.image_url} className="w-10 h-10 rounded border object-cover" />
                          ) : <div className="w-10 h-10 rounded border bg-muted" />}
                          <Input type="file" className="text-xs" accept="image/*" onChange={e => e.target.files?.[0] && handleVariantImageUpload(variant.id, e.target.files[0])} />
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveVariant(variant.id)}><X className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddVariant} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Variant
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* 3. PRICING */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Compare-at Price</Label>
                  <Input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-[10px] text-muted-foreground">Original price before discount</p>
                </div>
              </CardContent>
            </Card>

            {/* 4. INVENTORY */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="space-y-8">

            {/* STATUS */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* BADGES */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Highlight this product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-trending"
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                  />
                  <Label htmlFor="is-trending" className="font-medium cursor-pointer">
                    Trending Product 🔥
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* CATEGORY */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Categories</Label>
                  {loadingCategories ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <Badge
                          key={c.id}
                          variant={categoryIds.includes(c.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (categoryIds.includes(c.id)) {
                              setCategoryIds(categoryIds.filter((id) => id !== c.id))
                            } else {
                              setCategoryIds([...categoryIds, c.id])
                            }
                          }}
                        >
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {!showNewCategoryInput ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-0 text-blue-500 hover:text-blue-600 hover:bg-transparent"
                    onClick={() => setShowNewCategoryInput(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add new category
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Name"
                      className="h-9 text-xs"
                    />
                    <Button type="button" size="sm" onClick={handleCreateCategory} disabled={creatingCategory}>
                      Add
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNewCategoryInput(false)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Footer Actions */}
          <div className="col-span-1 lg:col-span-3 flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="min-w-[150px]">
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </div>

        </form>
      </div>

      {/* Cropper Modal */}
      {isCropping && cropQueue.length > 0 && (
        <ImageCropper
          imageFile={cropQueue[0]}
          isOpen={isCropping}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
