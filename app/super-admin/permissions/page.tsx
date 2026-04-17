"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function PermissionsPage() {
  const { data: session, status } = useSession()

  const [users, setUsers] = useState<any[]>([])
  const [perms, setPerms] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [userPerms, setUserPerms] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const u = await fetch('/api/admin/users').then(r=>r.json())
      setUsers(u.users || [])
      const p = await fetch('/api/admin/permissions').then(r=>r.json())
      const rawPerms = p.permissions || []
      if (Array.isArray(rawPerms)) {
        // array of permission objects
        setPerms(rawPerms.map((pp:any) => (pp && pp.name) ? pp.name : String(pp)))
      } else if (typeof rawPerms === 'string') {
        try { setPerms(JSON.parse(rawPerms)) } catch { setPerms([]) }
      } else {
        setPerms([])
      }
    } catch (err) {
      toast.error('Failed to load users or permissions')
    }
  }

  async function openPanel(user:any) {
    setSelectedUser(user)
    setDrawerOpen(true)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/permissions/${user.id}`)
      const data = await res.json()
      const map: Record<string, boolean> = {}
      const basePerms = Array.isArray(perms) ? perms : (typeof perms === 'string' ? (()=>{try{return JSON.parse(perms)}catch{return []}})() : [])
      basePerms.forEach((p:any)=> map[String(p)]= false)
      ;((data.permissions && Array.isArray(data.permissions)) ? data.permissions : []).forEach((p:string)=> map[p]=true)
      setUserPerms(map)
    } catch (err) {
      toast.error('Failed to load user permissions')
    } finally {
      setLoading(false)
    }
  }

  function closePanel() {
    setDrawerOpen(false)
    setSelectedUser(null)
    setUserPerms({})
  }

  async function save() {
    if (!selectedUser) return
    setLoading(true)
    try {
      const selected = Object.keys(userPerms).filter(k=> userPerms[k])
      const res = await fetch(`/api/admin/permissions/${selectedUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissions: selected }) })
      if (!res.ok) {
        const errBody = await res.json().catch(()=>({ error: 'Save failed' }))
        throw new Error(errBody?.error || 'Save failed')
      }
      toast.success('Permissions saved')
      await fetchAll()
      closePanel()
    } catch (err) {
      // show server error if available
      toast.error((err as Error).message || 'Failed to save permissions')
    } finally {
      setLoading(false)
    }
  }

  function toggleAll(val:boolean) {
    const newMap = {...userPerms}
    Object.keys(newMap).forEach(k=> newMap[k]=val)
    setUserPerms(newMap)
  }

  const filtered = users.filter(u => {
    if (query && !(u.email||'').toLowerCase().includes(query.toLowerCase())) return false
    if (roleFilter && u.role !== roleFilter) return false
    return true
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Permission Management</h1>
      <div className="mb-4 flex gap-2">
        <input className="input" placeholder="Search by email" value={query} onChange={e=>setQuery(e.target.value)} />
        <select className="input" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
      </div>

      <div className="bg-card p-4 rounded">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">Email</th>
              <th className="text-left">Name</th>
              <th className="text-left">Role</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=> (
              <tr key={u.id} className="border-t">
                <td>{u.email}</td>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.role}</td>
                <td>
                  <Button onClick={()=> openPanel(u)} size="sm">Manage Permissions</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md" data-vaul-drawer-direction="right">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle>Manage Permissions</DrawerTitle>
                <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              </div>
              <DrawerClose asChild>
                <button className="btn-ghost">Close</button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input id="select-all" type="checkbox" className="form-checkbox" onChange={(e)=> toggleAll(e.target.checked)} />
                <label htmlFor="select-all" className="text-sm">Select All</label>
              </div>
              <button className="btn-ghost" onClick={()=> toggleAll(false)}>Clear All</button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {perms.map(p=> (
                <label key={p} className="flex items-center gap-3 p-2 border rounded">
                  <input type="checkbox" checked={!!userPerms[p]} onChange={(e)=> setUserPerms({...userPerms, [p]: e.target.checked})} />
                  <div>
                    <div className="font-medium">{p.replaceAll('_',' ').replace(/\b\w/g, c=>c.toUpperCase())}</div>
                    <div className="text-xs text-muted-foreground">{p}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <DrawerFooter>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={closePanel}>Cancel</Button>
              <Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
