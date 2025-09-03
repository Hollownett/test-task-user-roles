import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from './ui/dropdown-menu'
import { Button } from './ui/button'

export interface Role { id: number; name: string }
export interface User { id: number; email: string; name: string; roles: Role[] }

const toIdSet = (ids: number[]) => new Set(ids)
const diffAdded = (selected: number[], original: number[]) =>
  selected.filter(id => !toIdSet(original).has(id))

const isChanged = (selected: number[], original: number[]) => {
  if (selected.length !== original.length) return true
  const a = [...selected].sort((x, y) => x - y)
  const b = [...original].sort((x, y) => x - y)
  return a.some((v, i) => v !== b[i])
}

export const makeUserColumns = (): ColumnDef<User, any>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.original.id,
    enableSorting: false,
    size: 60,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.name,
    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email,
    enableSorting: true,
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ table, row }) => {
      const meta: any = table.options.meta
      const userId = row.original.id
      const originalIds = row.original.roles.map(r => r.id)
      const selected = meta?.selectedRoleIds?.[userId] ?? originalIds
      const removedIds = originalIds.filter(id => !selected.includes(id))
      const rolesMap = new Map<number, string>(
        (meta?.rolesOptions ?? []).map((o: any) => [o.value, o.label]),
      )

      const added = diffAdded(selected, originalIds)


      return (
        <div className="flex flex-wrap gap-1">
          {[...new Set([...originalIds ,...selected])].map((id: number) => {
            const label = rolesMap.get(id) ?? id
            const isAdded = added.includes(id)
            const isRemoved = removedIds.includes(id)
            return (
              <Badge
                key={id}
                variant={isAdded ? 'default' : isRemoved ? 'outline' : 'secondary'}
                className={isAdded ? 'ring-2 ring-primary/60' : isRemoved ? 'ring-2 ring-outline/60 line-through' : ''}
                title={isAdded ? 'New (unsaved)' : isRemoved ? 'Removed' : 'Existing'}
              >
                {isAdded ? `+ ${label}` : label}
              </Badge>
            )
          })}
        </div>
      )
    },
    filterFn: (row, _id, value: number[]) => {
      if (!value?.length) return true
      const ids = row.original.roles.map(r => r.id)
      return value.every(v => ids.includes(v))
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ table, row }) => {
      const meta: any = table.options.meta
      const userId = row.original.id
      const originalIds = row.original.roles.map(r => r.id)
      const selected: number[] = meta?.selectedRoleIds?.[userId] ?? originalIds
      const opts: { value: number; label: string }[] =
        meta?.rolesOptions ?? row.original.roles.map(r => ({ value: r.id, label: r.name }))
      const changed = isChanged(selected, originalIds)

      return (
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid={`user-roles-select-${userId}`}>
                  Edit roles
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {opts.map(o => (
                  <DropdownMenuCheckboxItem
                    key={o.value}
                    checked={selected.includes(o.value)}
                    onCheckedChange={() => {
                      const next = selected.includes(o.value)
                        ? selected.filter(v => v !== o.value)
                        : [...selected, o.value]
                      meta?.onChangeRoles?.(userId, next)
                    }}
                  >
                    {o.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={() => meta?.onSave?.(userId)}
              data-testid={`user-save-btn-${userId}`}
              disabled={!changed}
            >
              Save
            </Button>
          </div>
        </div>
      )
    },
  },
]
