'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Check, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function OrderActions({ id, status }: { id: string, status?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatus(newStatus: string) {
    if (!confirm(`Change status to ${newStatus}?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      const j = await res.json()
      if (!res.ok) {
        toast({ title: 'Update failed', description: j.error || 'Failed to update order' })
      } else {
        toast({ title: 'Updated', description: j.message || 'Order status updated' })
        router.refresh()
      }
    } catch (err) {
      toast({ title: 'Network error', description: '' })
    } finally {
      setLoading(false)
    }
  }

  async function cancelOrder() {
    const reason = prompt('Cancellation reason (optional)')
    if (!confirm('Cancel this order?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CANCELLED', cancelReason: reason }) })
      const j = await res.json()
      if (!res.ok) {
        toast({ title: 'Cancel failed', description: j.error || '' })
      } else {
        toast({ title: j.message ? 'Cancelled' : 'Cancelled', description: j.message || 'Order cancelled' })
        router.refresh()
      }
    } catch (err) {
      toast({ title: 'Network error', description: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/siparisler/${id}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Görüntüle</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => updateStatus('PROCESSING')}>
            <Check className="h-4 w-4 mr-2" /> Onayla (Hazırlanıyor)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateStatus('SHIPPED')}>
            <Check className="h-4 w-4 mr-2" /> Kargoya Ver
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={cancelOrder}>
            <X className="h-4 w-4 mr-2" /> Reddet / İptal Et
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
