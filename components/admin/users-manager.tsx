'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function UsersManager() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER' })

  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', role: 'USER' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const json = await res.json()
    setUsers(json.users || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const [creating, setCreating] = useState(false)

  async function createUser(e: any) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const j = await res.json()
      // debug
      // eslint-disable-next-line no-console
      console.log('createUser response', res.status, j)
      if (res.ok) {
        setShowForm(false)
        setForm({ firstName: '', lastName: '', email: '', password: '', role: 'USER' })
        await load()
        toast({ title: 'User created', description: 'New user created successfully.' })
      } else {
        toast({ title: 'Create failed', description: j.error || 'Failed to create user.' })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      toast({ title: 'Create failed', description: 'Network error.' })
    } finally {
      setCreating(false)
    }
  }

  async function removeUser(id: string) {
    if (!confirm('Delete user?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) { await load(); toast({ title: 'Deleted', description: 'User deleted.' }) } else { toast({ title: 'Delete failed', description: 'Could not delete user.' }) }
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
        toast({ title: 'Update failed', description: j.error || 'Could not update user.' })
      } else {
        toast({ title: 'Saved', description: 'User updated successfully.' })
        setEditingUser(null)
      }
    } catch (err) {
      setUsers(prev)
      toast({ title: 'Update failed', description: 'Network error.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} className="bg-emerald-600">Create User</Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <form onSubmit={createUser} className="relative bg-slate-900 p-6 rounded w-full max-w-lg z-10 transform transition-all">
            <h3 className="text-lg font-semibold mb-4">Create User</h3>
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
              <Button type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-800 rounded p-4">
        {loading ? <p>Loading...</p> : (
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
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
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="text-emerald-400">Edit</button>
                      <button onClick={() => removeUser(u.id)} className="text-red-400">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingUser(null)} />
          <form onSubmit={saveEdit} className="relative bg-slate-900 p-6 rounded w-full max-w-lg z-10 transform transition-all">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
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
              <Button type="button" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
