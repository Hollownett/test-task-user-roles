import React, { useState, useEffect } from 'react';
import { useUsers, useUpdateUserRoles } from '../hooks/useUsers'
import { useRoles } from '../hooks/useRoles'
import Dropdown from './Dropdown';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './ui/pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/table';

interface Role { id: number; name: string }
interface User { id: number; email: string; name: string; roles: Role[] }

const UserRoleTable = () => {
  const [selectedRoleIds, setSelectedRoleIds] = useState<Record<number, number[]>>({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<{ key: 'name' | 'email'; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: users, isLoading: loadingUsers, error: usersError } = useUsers();
  const { data: roles, isLoading: loadingRoles, error: rolesError } = useRoles();
  const updateUserRolesMutation = useUpdateUserRoles();

  const handleRoleChange = (userId: number, value: number[]) => {
    setSelectedRoleIds(prev => ({
      ...prev,
      [userId]: value,
    }));
  };

  const saveUserRoles = (userId: number) => {
    if (selectedRoleIds[userId]) {
      updateUserRolesMutation.mutate({
        userId,
        roleIds: selectedRoleIds[userId],
      }, {
        onSuccess: () => {
          toast.success('Roles updated successfully!');
        },
        onError: (err: any) => {
          toast.error(`Error updating roles: ${err.message}`);
        }
      });
    }
  };

  useEffect(() => {
    if (users) {
      const initialSelectedRoles = users.reduce((acc: Record<number, number[]>, user: User) => {
        acc[user.id] = user.roles.map((role: Role) => role.id);
        return acc;
      }, {} as Record<number, number[]>);
      setSelectedRoleIds(initialSelectedRoles);
    }
  }, [users]);

  if (loadingUsers || loadingRoles) return (
    <div className="py-8 max-w-4xl mx-auto">
      <Progress />
    </div>
  );

  if (usersError || rolesError) {
    return <div className="py-8 text-center text-red-600">Error loading data: {(usersError as any)?.message || (rolesError as any)?.message}</div>
  }

  const filtered = (users ?? []).filter(u => {
    const q = search.trim().toLowerCase();
    if (q) {
      const matches = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  if (sortBy) {
    filtered.sort((a, b) => {
      const av = (a as any)[sortBy.key];
      const bv = (b as any)[sortBy.key];
      if (av < bv) return sortBy.dir === 'asc' ? -1 : 1;
      if (av > bv) return sortBy.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = filtered.slice((pageSafe - 1) * pageSize, (pageSafe - 1) * pageSize + pageSize);

  return (
    <div className="bg-white shadow-lg border rounded-xl p-6 max-w-7xl mx-auto" data-testid="user-role-table-wrapper">
      <h2
        className="scroll-m-20 mb-4 text-3xl font-semibold tracking-tight first:mt-0"
        data-testid="user-role-heading"
      >
        User Role Management
      </h2>

      <div className="flex gap-3 mb-4">
        <input
          className="border rounded px-3 py-1 w-full"
          placeholder="Search by name or email"
          value={search}
          data-testid="search-input"
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <Table data-testid="user-role-table">
        <TableHeader>
          <TableRow>
            <TableHead
              data-testid="column-header-name"
              onClick={() =>
                setSortBy(s => s && s.key === 'name'
                  ? { key: 'name', dir: s.dir === 'asc' ? 'desc' : 'asc' }
                  : { key: 'name', dir: 'asc' })
              }
              className="cursor-pointer"
            >
              Name
            </TableHead>
            <TableHead
              data-testid="column-header-email"
              onClick={() =>
                setSortBy(s => s && s.key === 'email'
                  ? { key: 'email', dir: s.dir === 'asc' ? 'desc' : 'asc' }
                  : { key: 'email', dir: 'asc' })
              }
              className="cursor-pointer"
            >
              Email
            </TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.length > 0 ? paged.map(user => (
            <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
              <TableCell data-testid={`user-name-${user.id}`}>{user.name}</TableCell>
              <TableCell data-testid={`user-email-${user.id}`}>{user.email}</TableCell>
              <TableCell data-testid={`user-roles-dropdown-${user.id}`} style={{ width: 300 }}>
                <Dropdown
                  options={roles ? roles.map(r => ({ value: r.id, label: r.name })) : []}
                  value={selectedRoleIds[user.id] || []}
                  onChange={(vals: number[]) => handleRoleChange(user.id, vals)}
                  data-testid={`user-roles-select-${user.id}`}
                />
              </TableCell>
              <TableCell>
                <button
                  className="bg-gray-900 text-white px-3 py-1 rounded"
                  onClick={() => saveUserRoles(user.id)}
                  disabled={updateUserRolesMutation.isLoading}
                  data-testid={`user-save-btn-${user.id}`}
                >
                  Save
                </button>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500" data-testid="no-users-found">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <Pagination className="flex-1">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
            </PaginationItem>
            {(() => {
              const pages: (number | 'ellipsis')[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                const left = Math.max(2, pageSafe - 1);
                const right = Math.min(totalPages - 1, pageSafe + 1);
                if (left > 2) pages.push('ellipsis');
                for (let i = left; i <= right; i++) pages.push(i);
                if (right < totalPages - 1) pages.push('ellipsis');
                pages.push(totalPages);
              }

              return pages.map((p, idx) => (
                p === 'ellipsis' ? (
                  <PaginationItem key={`e-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink isActive={p === pageSafe} onClick={() => setPage(Number(p))}>{p}</PaginationLink>
                  </PaginationItem>
                )
              ));
            })()}
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center gap-2">
          <label className="text-sm">Rows</label>
          <select
            className="border rounded px-2 py-1"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserRoleTable;