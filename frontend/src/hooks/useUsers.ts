import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUsers, updateUserRoles } from '@/services/api'
import type { User } from '@/services/api'

export function useUsers() {
  return useQuery<User[], Error>(['users'], fetchUsers)
}

import type { UseMutationOptions } from '@tanstack/react-query'

export function useUpdateUserRoles(options?: UseMutationOptions<any, any, { userId: number; roleIds: number[] }>) {
  const qc = useQueryClient()
  return useMutation<any, Error, { userId: number; roleIds: number[] }>(
    ({ userId, roleIds }: { userId: number; roleIds: number[] }) => updateUserRoles(userId, roleIds),
    {
      onSuccess: (...args: any[]) => {
        qc.invalidateQueries({ queryKey: ['users'] })
        if (options && options.onSuccess) {
          // @ts-ignore
          options.onSuccess(...args)
        }
      },
      ...options,
    }
  )
}
