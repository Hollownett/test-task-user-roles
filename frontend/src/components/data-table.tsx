import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './ui/pagination'
import { ArrowUpDown, Filter, FilterX } from 'lucide-react'

type RolesOption = { value: number; label: string }

type Meta = {
  onChangeRoles?: (userId: number, vals: number[]) => void
  onSave?: (userId: number) => void
  selectedRoleIds?: Record<number, number[]>
  rolesOptions?: RolesOption[]
}

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: Meta
  pageSize?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  pageSize = 5,
}: Props<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pageSizeState, setPageSizeState] = React.useState<number>(pageSize)
 
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: pageSizeState } },
    meta,
  })

  const roleCol = table.getColumn('roles')
  const currentRoles = (roleCol?.getFilterValue() as number[] | undefined) ?? []
  const rolesOptions = (meta?.rolesOptions ?? []) as RolesOption[]
  const anyFilter = currentRoles.length > 0


  const totalRows = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSizeState + 1
  const lastRow = Math.min(totalRows, (pageIndex + 1) * pageSizeState)

  const buildPageItems = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    const total = pageCount
    const current = pageIndex + 1
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      const left = Math.max(2, current - 1)
      const right = Math.min(total - 1, current + 1)
      if (left > 2) pages.push('ellipsis')
      for (let i = left; i <= right; i++) pages.push(i)
      if (right < total - 1) pages.push('ellipsis')
      pages.push(total)
    }
    return pages
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2" data-testid="filter-role-trigger">
              <Filter className="h-4 w-4" />
              Filter roles
              {currentRoles.length > 0 && <Badge variant="secondary">{currentRoles.length}</Badge>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Select roles</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {rolesOptions.map(opt => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={currentRoles.includes(opt.value)}
                onCheckedChange={() => {
                  const next = currentRoles.includes(opt.value)
                    ? currentRoles.filter(v => v !== opt.value)
                    : [...currentRoles, opt.value]
                  roleCol?.setFilterValue(next)
                  table.setPageIndex(0)
                }}
                data-testid={`filter-role-item-${opt.value}`}
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
            {rolesOptions.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No roles</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {anyFilter && (
          <Button
            variant="ghost"
            className="flex items-center gap-1"
            onClick={() => {
              roleCol?.setFilterValue(undefined)
              table.setPageIndex(0)
            }}
            data-testid="clear-filters-btn"
          >
            <FilterX className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table data-testid="user-role-table">
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => {
                  const col = header.column
                  const isSortable = col.getCanSort()
                  const isFiltered = col.getIsFiltered()
                  const testId =
                    col.id === 'name'
                      ? 'column-header-name'
                      : col.id === 'email'
                      ? 'column-header-email'
                      : undefined

                  return (
                    <TableHead
                      key={header.id}
                      data-testid={testId}
                      className={isSortable ? 'cursor-pointer select-none' : ''}
                      onClick={isSortable ? col.getToggleSortingHandler() : undefined}
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />}
                          {isFiltered && <Filter className="h-3.5 w-3.5 text-primary" aria-label="filtered" />}
                        </span>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-testid={`user-row-${(row.original as any).id}`}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center" data-testid="no-users-found">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mt-1">
        <div className="text-sm text-muted-foreground">
          {firstRow}-{lastRow} of {totalRows} • Page {pageIndex + 1} of {pageCount || 1}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => table.previousPage()} aria-disabled={!table.getCanPreviousPage()} />
            </PaginationItem>

            {buildPageItems().map((p, idx) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`e-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === pageIndex + 1}
                    onClick={() => table.setPageIndex((p as number) - 1)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext onClick={() => table.nextPage()} aria-disabled={!table.getCanNextPage()} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center gap-2">
          <label className="text-sm">Rows</label>
          <select
            className="border rounded px-2 py-1"
            value={pageSizeState}
            onChange={(e) => {
              const v = Number(e.target.value)
              setPageSizeState(v)
              table.setPageSize(v)
              table.setPageIndex(0)
            }}
            data-testid="rows-per-page-select"
          >
            {[5, 10, 20, 50].map(pageCount => (
              <option key={pageCount} value={pageCount}>{pageCount}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
