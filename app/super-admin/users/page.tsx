import React from 'react'

export default async function UsersPage() {
  const res = await fetch('/api/admin/users')
  const data = await res.json()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="bg-card p-4 rounded">
        {data?.users?.length ? (
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
              {data.users.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td>{u.email}</td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.role}</td>
                  <td>
                    <form action={async (formData: FormData) => {
                      'use server'
                      const role = formData.get('role') as string
                      await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
                      // no refresh here; user can refresh page
                    }}>
                      <select name="role" defaultValue={u.role} className="mr-2">
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                      <button type="submit" className="btn">Update</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  )
}
