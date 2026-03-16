"use client"

import { useEffect, useState, use } from "react"
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
import { ArrowLeft, Trash2, Plus, X, Upload, ChevronLeft, GripVertical } from "lucide-react"
import { ImageCropper } from "@/components/image-cropper"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id } = use(params)

  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fields
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [compareAtPrice, setCompareAtPrice] = useState("")
  const [stock, setStock] = useState("")
  const [status, setStatus] = useState("active")
  const [isTrending, setIsTrending] = useState(false)
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [description, setDescription] = useState("") // NOTE: Add description field if it exists in DB, otherwise ignore. Assuming it exists based on new page.

  // Data
  const [categories, setCategories] = useState<any[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])

  // Variants
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<{ id: string; name: string; stock: number; image_url: string; imageFile: File | null }[]>([])

  // New Images Upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])

  // Drag and Drop State
  // We'll treat all images (existing + new) as one continuous list for drag-and-drop visually.
  // existingImages: index 0 to existingImages.length - 1
  // newImageFiles: index existingImages.length to existingImages.length + newImageFiles.length - 1
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Cropping Queue
  const [cropQueue, setCropQueue] = useState<File[]>([])
  const [isCropping, setIsCropping] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 1. Fetch Categories
      const { data: cats } = await supabase.from("categories").select("*").order("name")
      if (cats) setCategories(cats)

      // 2. Fetch Product
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !product) {
        alert("Product not found")
        router.push("/admin/products")
        return
      }

      setName(product.name)
      setPrice(product.price)
      setCompareAtPrice(product.compare_at_price || "")
      setStock(product.stock)
      setStatus(product.status)
      setIsTrending(product.is_trending || false)
      setDescription(product.description || "")

      // Fetch product categories
      const { data: pcData } = await supabase
        .from("product_categories")
        .select("category_id")
        .eq("product_id", id)

      if (pcData && pcData.length > 0) {
        setCategoryIds(pcData.map((pc: any) => pc.category_id))
      } else if (product.category_id) {
        // Fallback to old single category relation
        setCategoryIds([product.category_id])
      }

      // Load Variants
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        setHasVariants(true)
        // Ensure each variant has a unique ID for React keys if not present (DB variants might not have 'id' if just stored as JSON, but we need it for UI)
        // actually we should probably generate a temp ID for UI if one doesn't exist.
        const loadedVariants = product.variants.map((v: any) => ({
          ...v,
          id: v.id || crypto.randomUUID(), // Ensure ID exists for UI key
          imageFile: null
        }))
        setVariants(loadedVariants)
      }

      // 3. Fetch Extra Images
      const { data: images } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("sort_order")

      if (images) setExistingImages(images)

      setLoading(false)
    }

    fetchData()
  }, [id, router])

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

  // Variant Handlers
  const handleAddVariant = () => {
    setVariants([...variants, { id: crypto.randomUUID(), name: "", stock: 0, image_url: "", imageFile: null }])
  }

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const handleVariantChange = (id: string, field: keyof typeof variants[0], value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const handleVariantImageUpload = async (id: string, file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setVariants(variants.map(v => v.id === id ? { ...v, imageFile: file, image_url: previewUrl } : v))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // 1. Upload NEW images if any
      const newImageUrls: string[] = []
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const url = await uploadOneImage(file)
          newImageUrls.push(url)
        }

        // Insert into product_images
        const currentMaxSort = existingImages.length > 0
          ? Math.max(...existingImages.map(img => img.sort_order || 0))
          : 0

        const imagesPayload = newImageUrls.map((url, index) => ({
          product_id: id,
          image_url: url,
          sort_order: currentMaxSort + index + 1,
        }))

        const { error: imagesError } = await supabase.from("product_images").insert(imagesPayload)
        if (imagesError) throw new Error("Failed to upload new images: " + imagesError.message)
      }

      // 2. Process Variants
      const finalVariants = []
      if (hasVariants) {
        for (const v of variants) {
          if (!v.name) throw new Error("All variants must have a name")

          let vImageUrl = v.image_url
          if (v.imageFile) {
            vImageUrl = await uploadOneImage(v.imageFile)
          }

          finalVariants.push({
            id: v.id, // Keep the ID
            name: v.name,
            stock: Number(v.stock),
            image_url: vImageUrl
          })
        }
      }

      // DETERMINE PRIMARY IMAGE
      let primaryImageUrl = ""
      if (existingImages.length > 0) {
        primaryImageUrl = existingImages[0].image_url
      } else if (newImageUrls.length > 0) {
        primaryImageUrl = newImageUrls[0]
      } else if (hasVariants && finalVariants.length > 0) {
        primaryImageUrl = finalVariants[0].image_url
      } else {
        primaryImageUrl = "" // Fallback if no images
      }

      // 3. Update Product Fields
      const primaryCategoryId = categoryIds.length > 0 ? categoryIds[0] : null
      const { error } = await supabase
        .from("products")
        .update({
          name,
          price: parseFloat(price),
          compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
          stock: parseInt(stock),
          status,
          category_id: primaryCategoryId,
          description,
          is_trending: isTrending,
          image_url: primaryImageUrl || null,
          variants: hasVariants ? finalVariants : null
        })
        .eq("id", id)

      if (error) throw error

      // 4. Update product_categories
      // First, delete existing
      await supabase.from("product_categories").delete().eq("product_id", id)

      // Insert new
      if (categoryIds.length > 0) {
        const pcPayload = categoryIds.map((cId) => ({
          product_id: id,
          category_id: cId,
        }))
        const { error: pcError } = await supabase.from("product_categories").insert(pcPayload)
        if (pcError) console.error("Failed to update product categories", pcError)
      }

      alert("Product updated successfully!")
      router.push("/admin/products")

    } catch (err: any) {
      console.error(err)
      alert("Error updating: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    const ok = confirm("Delete this image?")
    if (!ok) return

    // Delete from DB
    await supabase.from("product_images").delete().eq("id", imageId)
    // Update local state
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleNewFilesChange = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    if (arr.length > 0) {
      setCropQueue(arr)
      setIsCropping(true)
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    setNewImageFiles(prev => [...prev, croppedFile])
    setCropQueue(prev => {
      const remaining = prev.slice(1)
      if (remaining.length === 0) setIsCropping(false)
      return remaining
    })
  }

  const handleCropCancel = () => {
    setCropQueue(prev => {
      const remaining = prev.slice(1)
      if (remaining.length === 0) setIsCropping(false)
      return remaining
    })
  }

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (globalIndex: number) => {
    setDraggedIndex(globalIndex)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault() // Required to allow drop
  }

  const handleDrop = async (dropGlobalIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropGlobalIndex) return

    // Create a combined array representing the current visual state
    const combined = [
      ...existingImages.map(img => ({ type: 'existing', data: img })),
      ...newImageFiles.map(file => ({ type: 'new', data: file }))
    ]

    // Reorder
    const [draggedItem] = combined.splice(draggedIndex, 1)
    combined.splice(dropGlobalIndex, 0, draggedItem)

    // Split back into existing and new state arrays
    const newExistingImages: any[] = []
    const newNewFiles: File[] = []

    // We also need to update the sort_order of existing images immediately in DB
    // to reflect their new relative positions, or update them all on save.
    // The safest approach is to let 'handleUpdate' handle changes, but since 'existingImages'
    // are already in DB, keeping their sort_order synced is important if we don't update them all on Save.
    // Given the current architecture, 'handleUpdate' does NOT update sort_order of existing images.
    // So we must update the DB right now for existing images.

    let globalSortOrder = 1
    for (const item of combined) {
      if (item.type === 'existing') {
        const imgParams = item.data as any
        newExistingImages.push({ ...imgParams, sort_order: globalSortOrder })

        // Update DB silently
        await supabase.from("product_images")
          .update({ sort_order: globalSortOrder })
          .eq("id", imgParams.id)
      } else {
        newNewFiles.push(item.data as File)
      }
      globalSortOrder++
    }

    setExistingImages(newExistingImages)
    setNewImageFiles(newNewFiles)
    setDraggedIndex(null)

    // Silently update primary image on products table so storefront updates immediately
    if (newExistingImages.length > 0) {
      await supabase.from("products").update({ image_url: newExistingImages[0].image_url }).eq("id", id)
    }
  }

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading product...</div>

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Product</h1>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. DETAILS */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Manage title and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. MEDIA */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Drag and drop to reorder images. Changes to order are saved automatically.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* EXISTING IMAGES */}
                  {existingImages.map((img, idx) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className={`relative group aspect-square rounded-lg overflow-hidden border-2 bg-muted cursor-move transition-all
                        ${draggedIndex === idx ? 'opacity-50 border-primary' : 'border-border hover:border-primary/50'}`}
                    >
                      <img src={img.image_url} alt="product" className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute top-2 left-2 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 bg-destructive/90 text-white rounded-full p-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] py-1 text-center font-bold uppercase pointer-events-none">Primary</div>
                      )}
                      {idx !== 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Position {idx + 1}</div>
                      )}
                    </div>
                  ))}

                  {/* NEW IMAGES PREVIEW */}
                  {newImageFiles.map((file, localIdx) => {
                    const globalIdx = existingImages.length + localIdx
                    return (
                      <div
                        key={`new-${localIdx}`}
                        draggable
                        onDragStart={() => handleDragStart(globalIdx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(globalIdx)}
                        className={`relative group aspect-square rounded-lg overflow-hidden border-2 bg-muted cursor-move transition-all
                        ${draggedIndex === globalIdx ? 'opacity-50 border-primary' : 'border-green-500/50 hover:border-primary/50'}`}
                      >
                        <img src={URL.createObjectURL(file)} alt="new preview" className="w-full h-full object-cover opacity-80 pointer-events-none" />
                        <div className="absolute top-2 left-2 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(localIdx)}
                          className="absolute top-2 right-2 bg-destructive/90 text-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[10px] py-1 text-center font-bold pointer-events-none">NEW: Pos {globalIdx + 1}</div>
                      </div>
                    )
                  })}

                  {/* UPLOAD TRIGGER */}
                  <label className="border-2 border-dashed border-border rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground font-medium">Add Media</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleNewFilesChange(e.target.files)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* VARIANTS SECTION */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Variants</CardTitle>
                  <CardDescription>Add colors or options</CardDescription>
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
                      <div className="md:col-span-4 space-y-2">
                        <Label>Color Name</Label>
                        <Input placeholder="e.g. Obsidian" value={variant.name} onChange={e => handleVariantChange(variant.id, "name", e.target.value)} />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label>Stock</Label>
                        <Input type="number" placeholder="0" value={variant.stock} onChange={e => handleVariantChange(variant.id, "stock", e.target.value)} />
                      </div>
                      <div className="md:col-span-4 space-y-2">
                        <Label>Variant Image</Label>
                        <div className="flex items-center gap-2">
                          {variant.image_url ? (
                            <img src={variant.image_url} className="w-10 h-10 rounded border object-cover" />
                          ) : <div className="w-10 h-10 rounded border bg-muted" />}
                          <Input type="file" className="text-xs" accept="image/*" onChange={e => e.target.files?.[0] && handleVariantImageUpload(variant.id, e.target.files[0])} />
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariant(variant.id)}><X className="w-4 h-4" /></Button>
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
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (₹)</Label>
                  <Input
                    type="number"
                    value={compareAtPrice}
                    onChange={e => setCompareAtPrice(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4. STOCK */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={stock}
                      onChange={e => setStock(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">

            {/* STATUS */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
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
              <CardContent>
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <Badge
                        key={c.id}
                        variant={categoryIds.includes(c.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (categoryIds.includes(c.id)) {
                            setCategoryIds(categoryIds.filter((cid) => cid !== c.id))
                          } else {
                            setCategoryIds([...categoryIds, c.id])
                          }
                        }}
                      >
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </form>

        <div className="mt-8 flex justify-end gap-3 sticky bottom-4">
          <Button variant="secondary" onClick={() => router.push("/admin/products")}>Discard</Button>
          <Button onClick={handleUpdate} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]">
            {saving ? "Saving..." : "Update Product"}
          </Button>
        </div>

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

