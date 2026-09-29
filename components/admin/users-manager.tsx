'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { translations } from '@/translations'

export default function UsersManager({ customerOnly = false }: { customerOnly?: boolean }) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER' })

  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', role: 'USER' })
  const [saving, setSaving] = useState(false)

  async function load(query = appliedSearch, nextPage = page) {
    setLoading(true)
    setLoadError(null)
    try {
      const params = new URLSearchParams({ q: query, page: String(nextPage), pageSize: String(pageSize) })
      if (customerOnly) params.set('role', 'USER')
      const res = await fetch(`/api/admin/users?${params}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Kullanıcı listesi yüklenemedi. Lütfen tekrar deneyin.')
      const json = await res.json()
      if (!Array.isArray(json.users) || typeof json.total !== 'number') throw new Error('Kullanıcı listesi yüklenemedi.')
      if (json.total > 0 && nextPage > Math.ceil(json.total / pageSize)) {
        await load(query, Math.ceil(json.total / pageSize))
        return
      }
      setUsers(json.users)
      setTotal(json.total)
      setPage(json.page)
      setAppliedSearch(query)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Kullanıcı listesi yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load('', 1) }, [customerOnly])

  const [creating, setCreating] = useState(false)

  async function createUser(e: any) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const j = await res.json()
      if (res.ok) {
        setShowForm(false)
        setForm({ firstName: '', lastName: '', email: '', password: '', role: 'USER' })
        await load()
        toast({ title: translations.tr.user_created, description: '' })
      } else {
        toast({ title: translations.tr.create_failed, description: j.error || '' })
      }
    } catch {
      toast({ title: 'Create failed', description: 'Network error.' })
    } finally {
      setCreating(false)
    }
  }

  async function removeUser(id: string) {
    if (!confirm(translations.tr.delete_user_confirm || 'Delete user?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) { await load(); toast({ title: translations.tr.deleted, description: '' }) } else { toast({ title: translations.tr.delete_failed, description: '' }) }
  }

  function openEdit(user: any) {
    setEditingUser(user)
    setEditForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', role: user.role || 'USER' })
  }

  async function saveEdit(e: any) {
    e.preventDefault()
    if (!editingUser) return
    // Confirm role change if different
    if (editingUser.role !== editForm.role) {
      const ok = confirm(`Change role from ${editingUser.role} to ${editForm.role}?`)
      if (!ok) return
    }

    const prev = users
    const updated = users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u)
    setUsers(updated)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
        if (!res.ok) {
        const j = await res.json()
        setUsers(prev)
        toast({ title: translations.tr.update_failed, description: j.error || '' })
      } else {
        toast({ title: translations.tr.saved, description: translations.tr.user_updated })
        setEditingUser(null)
      }
    } catch (err) {
      setUsers(prev)
      toast({ title: translations.tr.update_failed, description: '' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{customerOnly ? 'Kayıtlı müşteriler' : translations.tr.users}</h2>
        <div className="flex gap-2">
          {!customerOnly && <Button onClick={() => setShowForm(true)} className="bg-emerald-600">{translations.tr.create_user}</Button>}
        </div>
      </div>

      <form className="mb-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); load(search, 1) }}>
        <input className="min-w-0 flex-1 rounded border bg-background px-3 py-2" type="search" aria-label="Kullanıcı ara" placeholder="Ad veya e-posta ara" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Button type="submit">Ara</Button>
      </form>

      {!customerOnly && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <form onSubmit={createUser} className="relative bg-slate-900 p-6 rounded w-full max-w-lg z-10 transform transition-all">
            <h3 className="text-lg font-semibold mb-4">{translations.tr.create_user}</h3>
            <div className="grid grid-cols-2 gap-2">
              <input className="p-2 bg-slate-800 rounded" placeholder="First name" value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} />
              <input className="p-2 bg-slate-800 rounded" placeholder="Last name" value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <input className="p-2 bg-slate-800 rounded w-full mt-3" placeholder="Email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            <input className="p-2 bg-slate-800 rounded w-full mt-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
            <select className="p-2 bg-slate-800 rounded w-full mt-3" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN" disabled={session?.user?.role !== 'SUPER_ADMIN'}>SUPER_ADMIN</option>
            </select>
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button type="button" onClick={() => setShowForm(false)}>{translations.tr.cancel}</Button>
              <Button type="submit" disabled={creating}>{creating ? translations.tr.creating : translations.tr.create}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-800 rounded p-4">
        {loading ? <p>{translations.tr.loading}</p> : loadError ? <div role="alert" className="flex items-center gap-3"><p>{loadError}</p><Button onClick={() => load(appliedSearch, page)}>Tekrar dene</Button></div> : users.length === 0 ? <p>{customerOnly ? 'Kayıtlı müşteri bulunamadı.' : 'Kullanıcı bulunamadı.'}</p> : (
          <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th>{translations.tr.customer_label}</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>{translations.tr.joined_label}</th>
                    <th></th>
                  </tr>
                </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-slate-700">
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td><span className={`px-2 py-1 rounded ${u.role === 'SUPER_ADMIN' ? 'bg-amber-600' : u.role === 'ADMIN' ? 'bg-sky-600' : 'bg-slate-600'}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    {!customerOnly &&
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="text-emerald-400">{translations.tr.edit}</button>
                      <button onClick={() => removeUser(u.id)} className="text-red-400">{translations.tr.delete}</button>
                    </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !loadError && <div className="mt-4 flex items-center justify-between gap-3 text-sm"><span>Toplam: {total}</span><div className="flex items-center gap-2"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => load(appliedSearch, page - 1)}>Önceki</Button><span>Sayfa {page}</span><Button type="button" variant="outline" disabled={page * pageSize >= total} onClick={() => load(appliedSearch, page + 1)}>Sonraki</Button></div></div>}

      {!customerOnly && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingUser(null)} />
          <form onSubmit={saveEdit} className="relative bg-slate-900 p-6 rounded w-full max-w-lg z-10 transform transition-all">
            <h3 className="text-lg font-semibold mb-4">{translations.tr.edit_user}</h3>
            <div className="grid grid-cols-2 gap-2">
              <input className="p-2 bg-slate-800 rounded" placeholder="First name" value={editForm.firstName} onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
              <input className="p-2 bg-slate-800 rounded" placeholder="Last name" value={editForm.lastName} onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <input className="p-2 bg-slate-800 rounded w-full mt-3" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
            <select className="p-2 bg-slate-800 rounded w-full mt-3" value={editForm.role} onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN" disabled={session?.user?.role !== 'SUPER_ADMIN'}>SUPER_ADMIN</option>
            </select>
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button type="button" onClick={() => setEditingUser(null)}>{translations.tr.cancel}</Button>
              <Button type="submit" disabled={saving}>{saving ? translations.tr.saving : translations.tr.save}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
