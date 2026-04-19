"use client"

import Link from 'next/link'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
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

export default function CategoryActionMenu({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(translations.tr.confirm_delete_category)) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Failed')
      toast.success(translations.tr.category_deleted)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || translations.tr.delete_failed)
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
          <Link href={`/admin/kategoriler/${id}`}>
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
