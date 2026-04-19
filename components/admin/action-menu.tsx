"use client"

import Link from 'next/link'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { translations } from '@/translations'

export default function ActionMenu({ id, slug }: { id: string; slug: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(translations.tr.confirm_delete_product || 'Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Failed')
      toast.success(translations.tr.product_deleted || 'Product deleted')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || translations.tr.delete_failed || 'Failed to delete')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/urun/${slug}`}>
            <Eye className="mr-2 h-4 w-4" />
            {translations.tr.view}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/urunler/${id}`}>
            <Edit className="mr-2 h-4 w-4" />
            {translations.tr.edit}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {translations.tr.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
