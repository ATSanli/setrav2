'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SyncButton() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  return <div><button className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={busy} onClick={async () => {
    setBusy(true); setMessage('Eşitleme sürüyor…')
    try { const response = await fetch('/api/admin/trendyol/sync', { method: 'POST' }); const data = await response.json(); setMessage(response.ok ? `${data.status}: ${data.processed} işlendi` : data.error || 'Eşitleme başarısız'); router.refresh() }
    catch { setMessage('Bağlantı hatası') }
    finally { setBusy(false) }
  }}>Şimdi eşitle</button><p role="status" className="text-sm">{message}</p></div>
}

export function CategoryMapping({ id, name, categories }: { id: number; name: string; categories: { id: string; name: string }[] }) {
  const [categoryId, setCategoryId] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  return <div className="flex flex-wrap items-center gap-3 border-t pt-3">
    <span>{name} ({id})</span>
    <select aria-label={`${name} site kategorisi`} className="rounded border p-2" value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="">Site kategorisi seçin</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <button className="rounded border px-3 py-2" disabled={!categoryId} onClick={async () => {
      const response = await fetch('/api/admin/trendyol/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trendyolCategoryId: id, categoryId }) })
      setMessage(response.ok ? 'Eşlendi; yayın için yeniden eşitleyin' : 'Eşleme başarısız'); router.refresh()
    }}>Eşle</button><span role="status">{message}</span>
  </div>
}
