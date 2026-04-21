 'use client'

import React, { useEffect, useState } from 'react'

type Subscriber = {
  id: string
  email: string
  createdAt: string
}

export default function NewsletterManager() {
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)

  const fetchList = async (query = '', p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      params.set('page', String(p))
      params.set('pageSize', String(pageSize))
      const url = '/api/admin/newsletter' + `?${params.toString()}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setSubs(data.subscribers)
        setTotal(data.total || 0)
        setPage(data.page || p)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList('', page)
  }, [])

  const onDelete = async (id: string) => {
    if (!confirm('Delete subscriber?')) return
    await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' })
    fetchList(q, page)
  }

  const onExport = () => {
    window.location.href = '/api/admin/newsletter/export'
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email" className="px-3 py-2 border" />
        <button onClick={() => fetchList(q, 1)} className="px-4 py-2 bg-slate-700 text-white">Search</button>
        <button onClick={() => { setQ(''); fetchList('', 1) }} className="px-4 py-2">Clear</button>
        <button onClick={onExport} className="ml-auto px-4 py-2 bg-green-600 text-white">Export CSV</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Created</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="border px-2 py-1">{s.email}</td>
                  <td className="border px-2 py-1">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-1">
                    <button onClick={() => onDelete(s.id)} className="px-3 py-1 bg-red-600 text-white">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Toplam: {total}</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => fetchList(q, page - 1)} className="px-3 py-1 border">Önceki</button>
              <span>Sayfa {page}</span>
              <button disabled={page * pageSize >= total} onClick={() => fetchList(q, page + 1)} className="px-3 py-1 border">Sonraki</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
