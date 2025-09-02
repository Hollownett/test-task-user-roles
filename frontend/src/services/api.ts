import { BASE_API } from '@/lib/config'

export type Role = { id: number; name: string }
export type User = { id: number; name: string; email: string; roles: Role[] }

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_API}/users`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function fetchRoles(): Promise<Role[]> {
  const res = await fetch(`${BASE_API}/roles`)
  if (!res.ok) throw new Error('Failed to fetch roles')
  return res.json()
}

export async function updateUserRoles(userId: number, roleIds: number[]) {
  const res = await fetch(`${BASE_API}/users/${userId}/roles`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleIds }),
  })
  if (!res.ok) throw new Error('Failed to update user roles')
  return res.json()
}
