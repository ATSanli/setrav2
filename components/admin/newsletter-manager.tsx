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

  const fetchList = async (query = '') => {
    setLoading(true)
    try {
      const url = '/api/admin/newsletter' + (query ? `?q=${encodeURIComponent(query)}` : '')
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) setSubs(data.subscribers)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const onDelete = async (id: string) => {
    if (!confirm('Delete subscriber?')) return
    await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' })
    fetchList(q)
  }

  const onExport = () => {
    window.location.href = '/api/admin/newsletter/export'
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email" className="px-3 py-2 border" />
        <button onClick={() => fetchList(q)} className="px-4 py-2 bg-slate-700 text-white">Search</button>
        <button onClick={() => { setQ(''); fetchList('') }} className="px-4 py-2">Clear</button>
        <button onClick={onExport} className="ml-auto px-4 py-2 bg-green-600 text-white">Export CSV</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
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
      )}
    </div>
  )
}
