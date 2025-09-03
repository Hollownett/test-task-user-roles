import * as React from 'react'
import { useUsers, useUpdateUserRoles } from '../hooks/useUsers'
import { useRoles } from '../hooks/useRoles'
import { Progress } from './ui/progress'
import { toast } from 'sonner'
import { DataTable } from './data-table'
import { makeUserColumns } from './columns'
import type { User } from './columns'

const UserRoleTable = () => {
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<Record<number, number[]>>({})

  const { data: users, isLoading: loadingUsers, error: usersError } = useUsers()
  const { data: roles, isLoading: loadingRoles, error: rolesError } = useRoles()
  const updateUserRoles = useUpdateUserRoles()

  React.useEffect(() => {
    if (users) {
      const init = users.reduce<Record<number, number[]>>((acc, u) => {
        acc[u.id] = u.roles.map(r => r.id)
        return acc
      }, {})
      setSelectedRoleIds(init)
    }
  }, [users])

  if (loadingUsers || loadingRoles) {
    return (
      <div className="py-8 max-w-4xl mx-auto">
        <Progress />
      </div>
    )
  }
  if (usersError || rolesError) {
    return (
      <div className="py-8 text-center text-red-600">
        Error loading data: {(usersError as any)?.message || (rolesError as any)?.message}
      </div>
    )
  }

  const data = (users ?? []) as User[]
  const rolesOptions = (roles ?? []).map(r => ({ value: r.id, label: r.name }))

  return (
    <div className="bg-white shadow-lg border rounded-xl p-6 max-w-7xl mx-auto" data-testid="user-role-table-wrapper">
      <h2 className="scroll-m-20 mb-4 text-3xl font-semibold tracking-tight" data-testid="user-role-heading">
        User Role Management
      </h2>

      <DataTable
        columns={makeUserColumns()}
        data={data}
        pageSize={5}
        meta={{
          rolesOptions,
          selectedRoleIds,
          onChangeRoles: (userId, vals) =>
            setSelectedRoleIds(prev => ({ ...prev, [userId]: vals })),
          onSave: userId => {
            const payload = selectedRoleIds[userId]
            if (!payload) return
            updateUserRoles.mutate(
              { userId, roleIds: payload },
              {
                onSuccess: () => toast.success('Roles updated successfully!'),
                onError: (err: any) => toast.error(`Error updating roles: ${err.message}`),
              }
            )
          },
        }}
      />
    </div>
  )
}

export default UserRoleTable
