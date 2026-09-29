 'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Subscriber = {
  id: string
  email: string
  createdAt: string
  isActive: boolean
  unsubscribedAt: string | null
}

export default function NewsletterManager() {
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)

  const fetchList = async (query = '', p = 1, nextStatus = 'all') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      params.set('page', String(p))
      params.set('pageSize', String(pageSize))
      if (nextStatus !== 'all') params.set('status', nextStatus)
      const url = '/api/admin/newsletter' + `?${params.toString()}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error('Bülten listesi yüklenemedi. Lütfen tekrar deneyin.')
      const data = await res.json()
      if (data.success && Array.isArray(data.subscribers) && typeof data.total === 'number') {
        if (data.total > 0 && p > Math.ceil(data.total / pageSize)) {
          await fetchList(query, Math.ceil(data.total / pageSize), nextStatus)
          return
        }
        setSubs(data.subscribers)
        setTotal(data.total)
        setPage(data.page)
        setAppliedQuery(query)
        setAppliedStatus(nextStatus)
      } else {
        throw new Error('Bülten listesi yüklenemedi.')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Bülten listesi yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList('', 1, 'all')
  }, [])

  const onDelete = async (id: string) => {
    if (!confirm('Bu adresin bülten aboneliğini sonlandırmak istiyor musunuz?')) return
    try {
      const res = await fetch(`/api/admin/newsletter/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Abonelik sonlandırıldı')
        fetchList(appliedQuery, page, appliedStatus)
      } else {
        toast.error(data?.error || 'Delete failed')
        if (res.status === 404) fetchList(appliedQuery, page, appliedStatus)
      }
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const onExport = () => {
    window.location.href = '/api/admin/newsletter/export'
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="E-posta ara" aria-label="E-posta ara" className="px-3 py-2 border" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Abonelik durumu" className="px-3 py-2 border bg-background"><option value="all">Tümü</option><option value="active">Aktif</option><option value="inactive">Abonelikten çıkan</option></select>
        <button onClick={() => fetchList(q, 1, status)} className="px-4 py-2 bg-slate-700 text-white">Ara</button>
        <button onClick={() => { setQ(''); setStatus('all'); fetchList('', 1, 'all') }} className="px-4 py-2">Temizle</button>
        <button onClick={onExport} className="ml-auto px-4 py-2 bg-green-600 text-white">Export CSV</button>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : error ? (
        <div role="alert" className="flex items-center gap-3"><p>{error}</p><button className="border px-3 py-2" onClick={() => fetchList(appliedQuery, page, appliedStatus)}>Tekrar dene</button></div>
      ) : subs.length === 0 ? (
        <p>Bu filtreye uygun bülten abonesi bulunamadı.</p>
      ) : (
        <>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Durum</th>
                <th className="border px-2 py-1">Kayıt tarihi</th>
                <th className="border px-2 py-1">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="border px-2 py-1">{s.email}</td>
                  <td className="border px-2 py-1">{s.isActive ? 'Aktif' : 'Abonelikten çıktı'}</td>
                  <td className="border px-2 py-1">{new Date(s.createdAt).toLocaleString('tr-TR')}</td>
                  <td className="border px-2 py-1">
                    {s.isActive && <button onClick={() => onDelete(s.id)} className="px-3 py-1 bg-red-600 text-white">Abonelikten çıkar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Toplam: {total}</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => fetchList(appliedQuery, page - 1, appliedStatus)} className="px-3 py-1 border">Önceki</button>
              <span>Sayfa {page}</span>
              <button disabled={page * pageSize >= total} onClick={() => fetchList(appliedQuery, page + 1, appliedStatus)} className="px-3 py-1 border">Sonraki</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
