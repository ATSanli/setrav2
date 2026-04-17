'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = (params as any)?.id

  const { data: catData, error: catErr } = useSWR(id ? `/api/admin/categories/${id}` : null, fetcher)
  const { data: allData } = useSWR('/api/admin/categories', fetcher)
  const categories = allData?.categories || []

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true,
    sortOrder: 0,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (catData?.category) {
      const c = catData.category
      setForm({
        name: c.name || '',
        slug: c.slug || '',
        description: c.description || '',
        image: c.image || '',
        parentId: c.parentId || '',
        isActive: c.isActive ?? true,
        sortOrder: c.sortOrder ?? 0,
      })
      setPreview(c.image || null)
    }
  }, [catData])

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    setForm(prev => ({ ...prev, name, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return toast.error('Name is required')

    setLoading(true)
    try {
      let imagePath = form.image
      if (imageFile) {
        const fd = new FormData()
        fd.append('files', imageFile)
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        const upj = await up.json()
        if (!up.ok) throw new Error(upj?.error || 'Upload failed')
        imagePath = upj.paths?.[0] || imagePath
      }

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          image: imagePath,
          parentId: form.parentId || null,
          sortOrder: Number(form.sortOrder)
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(data?.error || 'Failed to update category')
      }

      toast.success('Category updated')
      router.push('/admin/kategoriler')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update category'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!id) return <div>Invalid category</div>
  if (catErr) return <div>Error loading category</div>
  if (!catData) return <div>Loading...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/kategoriler">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif">Kategori Düzenle</h1>
          <p className="text-muted-foreground">Kategori bilgilerini düzenleyin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>Kategori adı, slug ve açıklama</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={e => handleNameChange(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                  <div onClick={() => fileRef.current?.click()} className="border-dashed border-2 p-3 rounded cursor-pointer">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files?.[0] || null
                      setImageFile(f)
                      if (f) setPreview(URL.createObjectURL(f))
                    }} />
                    <div className="text-sm text-muted-foreground">Click to select an image (or drag into browser)</div>
                    {preview && <div className="mt-2 w-32 h-32"><img src={preview} className="w-full h-full object-cover rounded"/></div>}
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent">Parent</Label>
                <select id="parent" className="input" value={form.parentId} onChange={e => setForm(prev => ({ ...prev, parentId: e.target.value }))}>
                  <option value="">None</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id} disabled={c.id === id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Switch checked={form.isActive} onCheckedChange={(val: boolean) => setForm(prev => ({ ...prev, isActive: val }))} />
                <span className="text-sm">Active</span>
              </div>

              <div className="space-y-2 w-40">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input id="sortOrder" type="number" value={String(form.sortOrder)} onChange={e => setForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" asChild>
            <Link href="/admin/kategoriler">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  )
}
