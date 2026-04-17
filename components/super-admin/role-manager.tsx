'use client'

import { useState } from 'react'

const ALLOWED_PERMISSIONS = [
  'admin_panel_access',
  'dashboard_view',
  'product_create',
  'product_edit',
  'product_delete',
  'order_manage',
  'stock_manage',
  'user_manage',
  'role_manage',
  'permission_manage'
]

export default function RoleManager({ initialRoles }: { initialRoles: { id: string, name: string, permissions: string[] }[] }) {
  const [roles, setRoles] = useState(initialRoles)
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || null)
  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0]
  const [saving, setSaving] = useState(false)

  function togglePermission(perm: string) {
    if (!selectedRoleId) return
    if (selectedRole?.name === 'SUPER_ADMIN') return
    setRoles(prev => prev.map(r => {
      if (r.id !== selectedRoleId) return r
      const has = r.permissions.includes(perm)
      return { ...r, permissions: has ? r.permissions.filter(p => p !== perm) : [...r.permissions, perm] }
    }))
  }

  function selectAll() {
    if (!selectedRoleId) return
    setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, permissions: ALLOWED_PERMISSIONS.slice() } : r))
  }

  function resetDefault() {
    if (!selectedRoleId) return
    setRoles(prev => prev.map(r => {
      if (r.id !== selectedRoleId) return r
      if (r.name === 'USER') return { ...r, permissions: ['browse_products', 'place_orders', 'view_own_orders'] }
      if (r.name === 'ADMIN') return { ...r, permissions: ['admin_panel_access','dashboard_view','product_create','product_edit','product_delete','order_manage','stock_manage'] }
      if (r.name === 'SUPER_ADMIN') return { ...r, permissions: ALLOWED_PERMISSIONS.slice() }
      return r
    }))
  }

  async function save() {
    if (!selectedRoleId) return
    setSaving(true)
    const role = roles.find(r => r.id === selectedRoleId)!
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: role.id, permissions: role.name === 'SUPER_ADMIN' ? ALLOWED_PERMISSIONS : role.permissions })
      })
      if (!res.ok) throw new Error('Save failed')
      alert('Saved')
    } catch (e) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-1 bg-slate-800 p-4 rounded">
        <h3 className="font-semibold mb-4">Roles</h3>
        <ul className="space-y-2">
          {roles.map(r => (
            <li key={r.id}>
              <button onClick={() => setSelectedRoleId(r.id)} className={`w-full text-left px-3 py-2 rounded ${r.id === selectedRoleId ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="col-span-3 bg-slate-800 p-6 rounded">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Permissions — {selectedRole?.name}</h3>
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-3 py-1 bg-slate-700 rounded">Select all</button>
            <button onClick={resetDefault} className="px-3 py-1 bg-slate-700 rounded">Reset to default</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {ALLOWED_PERMISSIONS.map(p => (
            <label key={p} className="flex items-center gap-3 p-2 bg-slate-900 rounded">
              <input type="checkbox" checked={selectedRole?.permissions.includes(p)} onChange={() => togglePermission(p)} disabled={selectedRole?.name === 'SUPER_ADMIN'} />
              <span className="capitalize">{p.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-emerald-600 rounded">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
