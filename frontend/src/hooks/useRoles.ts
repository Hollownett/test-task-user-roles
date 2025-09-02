import { useQuery } from '@tanstack/react-query'
import { fetchRoles } from '@/services/api'
import type { Role } from '@/services/api'

export function useRoles() {
  return useQuery<Role[], Error>(['roles'], fetchRoles)
}
