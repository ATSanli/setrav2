"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function ProductForm({ initialData, productId, categories }: { initialData?: any, productId?: string, categories?: { id: string; name: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price: initialData?.price ? String(initialData.price) : '',
    comparePrice: initialData?.comparePrice ? String(initialData.comparePrice) : '',
    sku: initialData?.sku || '',
    categoryId: initialData?.categoryId || (categories && categories[0] ? categories[0].id : ''),
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    isNew: initialData?.isNew ?? true,
    isBestSeller: initialData?.isBestSeller ?? false,
  }))

  const [variants, setVariants] = useState<any[]>(initialData?.variants || [])
  const [sizes, setSizes] = useState<string[]>(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      return Array.from(new Set(initialData.variants.map((v: any) => v.size)))
    }
    // default sizes for new products
    return ['36', '38', '40', '42']
  })
  const [colors, setColors] = useState<string[]>(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      return Array.from(new Set(initialData.variants.map((v: any) => v.color)))
    }
    return []
  })
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [applyStock, setApplyStock] = useState<number | ''>('')
  const [images, setImages] = useState<string[]>(initialData?.images?.map((i: any) => i.url) || [])
  const [newFiles, setNewFiles] = useState<Array<{ file: File; preview: string }>>([])

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleFileSelect = (files: FileList | File[]) => {
    const list = Array.from(files as any as File[])
    const imgs = list.filter(f => f.type.startsWith('image/'))
    const mapped = imgs.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setNewFiles(prev => [...prev, ...mapped])
  }

  // keep variants in sync with sizes/colors: auto-generate combinations but preserve existing stocks
  useEffect(() => {
    const existingMap = new Map(variants.map(v => [`${v.size}::${v.color}`, v]))
    const combos: any[] = []
    for (const s of sizes) {
      for (const c of colors.length ? colors : ['']) {
        const key = `${s}::${c}`
        const existing = existingMap.get(key)
        combos.push({
          size: s,
          color: c,
          colorHex: existing?.colorHex || '',
          stock: typeof existing?.stock === 'number' ? existing.stock : 0,
          sku: existing?.sku || ''
        })
      }
    }
    setVariants(combos)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes, colors])

  const addSize = () => {
    const v = sizeInput.trim()
    if (!v) return
    if (!sizes.includes(v)) setSizes(prev => [...prev, v])
    setSizeInput('')
  }

  const removeSize = (s: string) => setSizes(prev => prev.filter(x => x !== s))

  const addColor = () => {
    const v = colorInput.trim()
    if (!v) return
    if (!colors.includes(v)) setColors(prev => [...prev, v])
    setColorInput('')
  }

  const removeColor = (c: string) => setColors(prev => prev.filter(x => x !== c))

  const updateVariant = (index: number, patch: Partial<any>) => {
    setVariants(prev => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  const duplicateVariant = (index: number) => {
    setVariants(prev => {
      const next = [...prev]
      const v = { ...next[index], sku: '' }
      next.splice(index + 1, 0, v)
      return next
    })
  }

  const applyStockToAll = () => {
    if (applyStock === '') return
    const s = Number(applyStock)
    setVariants(prev => prev.map(v => ({ ...v, stock: s })))
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer?.files) handleFileSelect(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault() }

  const removeNewFile = (idx: number) => {
    setNewFiles(prev => {
      const next = [...prev]
      const f = next.splice(idx, 1)[0]
      if (f) URL.revokeObjectURL(f.preview)
      return next
    })
  }

  const deleteExistingImage = async (url: string) => {
    try {
      // remove from UI optimistically
      setImages(prev => prev.filter(u => u !== url))
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: url }) })
    } catch (err) { /* ignore */ }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill required fields')
      return
    }
    // validate variants
    for (const v of variants) {
      if (!v.size) { toast.error('All variants must have a size'); return }
      if (!v.color) { toast.error('All variants must have a color'); return }
      if (typeof v.stock !== 'number' || v.stock < 0) { toast.error('Stock must be a number >= 0'); return }
    }
    setLoading(true)
    try {
      // upload new files first
      let uploadedPaths: string[] = []
      if (newFiles.length > 0) {
        const fd = new FormData()
        newFiles.forEach(nf => fd.append('files', nf.file))
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        const upj = await up.json()
        if (!up.ok) throw new Error(upj?.error || 'Upload failed')
        // normalize upload response: accept array of strings or objects { url, public_id }
        uploadedPaths = (upj.paths || []).map((p: any) => (typeof p === 'string' ? p : p.url))
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        variants,
        images: [...images, ...uploadedPaths]
      }

      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products'
      const method = productId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      toast.success(productId ? 'Product updated' : 'Product created')
      router.push('/admin/urunler')
    } catch (err: any) {
      toast.error(err.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/urunler">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif">{productId ? 'Edit Product' : 'New Product'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Product name, description and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={4} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (TL) *</Label>
                <Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare Price (TL)</Label>
                <Input id="comparePrice" type="number" step="0.01" value={formData.comparePrice} onChange={e => setFormData(prev => ({ ...prev, comparePrice: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={formData.sku} onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select id="category" value={formData.categoryId} onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))} required className="w-full rounded-md border px-3 py-2">
                <option value="">-- Select Category --</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Images</Label>
              <div onDrop={onDrop} onDragOver={onDragOver} className="border-dashed border-2 border-gray-200 rounded p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Drag & drop images here or click to select</div>
                  <div>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => { if (e.target.files) handleFileSelect(e.target.files) }} />
                    <Button type="button" onClick={() => fileInputRef.current?.click()}>Select Files</Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {images.map((url, idx) => (
                    <div key={url} className="relative w-28 h-28 border rounded overflow-hidden">
                      <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => deleteExistingImage(url)} className="absolute top-1 right-1 bg-white/70 rounded-full p-1"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  {newFiles.map((n, idx) => (
                    <div key={n.preview} className="relative w-28 h-28 border rounded overflow-hidden">
                      <img src={n.preview} alt={`new-${idx}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-white/70 rounded-full p-1"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-2">
              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                  <CardDescription>Manage sizes, colors and stock per variant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <Label>Sizes</Label>
                      <div className="flex gap-2 mt-2 items-center">
                        <Input placeholder="Add size (e.g. 36)" value={sizeInput} onChange={e => setSizeInput(e.target.value)} />
                        <Button type="button" onClick={addSize}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sizes.map(s => (
                          <div key={s} className="px-2 py-1 border rounded flex items-center gap-2">
                            <span>{s}</span>
                            <button type="button" onClick={() => removeSize(s)} className="text-red-500"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Colors</Label>
                      <div className="flex gap-2 mt-2 items-center">
                        <Input placeholder="Add color (e.g. Black)" value={colorInput} onChange={e => setColorInput(e.target.value)} />
                        <Button type="button" onClick={addColor}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {colors.map(c => (
                          <div key={c} className="px-2 py-1 border rounded flex items-center gap-2">
                            <span>{c}</span>
                            <button type="button" onClick={() => removeColor(c)} className="text-red-500"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Bulk</Label>
                      <div className="flex gap-2 mt-2 items-center">
                        <Input type="number" placeholder="Stock" value={applyStock === '' ? '' : String(applyStock)} onChange={e => setApplyStock(e.target.value === '' ? '' : Number(e.target.value))} />
                        <Button type="button" onClick={applyStockToAll}>Apply stock to all</Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Variants</Label>
                    <div className="overflow-x-auto border rounded mt-2">
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="text-left">
                            <th className="px-2 py-2">Size</th>
                            <th className="px-2 py-2">Color</th>
                            <th className="px-2 py-2">Stock</th>
                            <th className="px-2 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, idx) => (
                            <tr key={`${v.size}-${v.color}-${idx}`} className="border-t">
                              <td className="px-2 py-2">
                                <select value={v.size} onChange={e => updateVariant(idx, { size: e.target.value })} className="w-full rounded border px-2 py-1">
                                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <input value={v.color} onChange={e => updateVariant(idx, { color: e.target.value })} className="w-full rounded border px-2 py-1" list="colors-list" />
                                <datalist id="colors-list">
                                  {colors.map(c => <option key={c} value={c} />)}
                                </datalist>
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min={0} value={v.stock} onChange={e => updateVariant(idx, { stock: Number(e.target.value) })} className="w-24 rounded border px-2 py-1" />
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-2">
                                  <Button type="button" variant="ghost" onClick={() => duplicateVariant(idx)}><Copy className="h-4 w-4" /></Button>
                                  <Button type="button" variant="ghost" onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}><X className="h-4 w-4 text-red-500" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Switch checked={formData.isActive} onCheckedChange={(val: boolean) => setFormData(prev => ({ ...prev, isActive: val }))} />
                <span className="text-sm">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                <Switch checked={formData.isBestSeller} onCheckedChange={async (val: boolean) => {
                  setFormData(prev => ({ ...prev, isBestSeller: val }))
                  if (!productId) return
                  try {
                    await fetch(`/api/admin/products/${productId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isBestSeller: val }) })
                    toast.success(val ? 'Marked as Best Seller' : 'Removed from Best Sellers')
                  } catch (err) {
                    toast.error('Failed to update Best Seller')
                  }
                }} />
                <span className="text-sm">Mark as Best Seller</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" asChild>
            <Link href="/admin/urunler">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (productId ? 'Update' : 'Create')}</Button>
        </div>
      </form>
    </div>
  )
}
