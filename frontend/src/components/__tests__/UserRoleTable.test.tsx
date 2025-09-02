import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserRoleTable from '../UserRoleTable';

jest.mock('@/hooks/useUsers', () => ({
  useUsers: jest.fn(),
  useUpdateUserRoles: jest.fn(),
}));
jest.mock('@/hooks/useRoles', () => ({
  useRoles: jest.fn(),
}));

const mockUseUsers = require('@/hooks/useUsers').useUsers;
const mockUseUpdateUserRoles = require('@/hooks/useUsers').useUpdateUserRoles;
const mockUseRoles = require('@/hooks/useRoles').useRoles;

const users = [
  {
    id: 1,
    name: 'Test User',
    email: 'test1@example.com',
    roles: [{ id: 2, name: 'User' }],
  },
  {
    id: 2,
    name: 'Test Admin',
    email: 'admin@example.com',
    roles: [{ id: 1, name: 'Admin' }],
  },
];

const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' },
];

describe('UserRoleTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUsers.mockReturnValue({
      data: users,
      isLoading: false,
      error: null,
    });
    mockUseRoles.mockReturnValue({
      data: roles,
      isLoading: false,
      error: null,
    });
    mockUseUpdateUserRoles.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
  });

  it('renders table with users', async () => {
    render(<UserRoleTable />);
    expect(screen.getByTestId('user-role-heading')).toHaveTextContent(/user role management/i);

    expect(await screen.findByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Admin')).toBeInTheDocument();
  });

  it('shows loading indicator when users or roles are loading', () => {
    mockUseUsers.mockReturnValueOnce({ data: undefined, isLoading: true, error: null });
    render(<UserRoleTable />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error when fetching users fails', () => {
    mockUseUsers.mockReturnValueOnce({ data: undefined, isLoading: false, error: new Error('Oops') });
    render(<UserRoleTable />);
    expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
  });

  it('can search users by name', async () => {
    render(<UserRoleTable />);
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Test Admin' } });
    expect(await screen.findByText('Test Admin')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('shows "No users found" if search yields no results', async () => {
    render(<UserRoleTable />);
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'NOBODY' } });
    expect(await screen.findByTestId('no-users-found')).toBeInTheDocument();
  });

  it('calls updateUserRoles.mutate when Save is clicked', async () => {
    const mutateMock = jest.fn();
    mockUseUpdateUserRoles.mockReturnValue({
      mutate: mutateMock,
      isLoading: false,
    });

    render(<UserRoleTable />);
    const saveButton = await screen.findByTestId('user-save-btn-1');
    fireEvent.click(saveButton);

    expect(mutateMock).toHaveBeenCalledWith(
      { userId: 1, roleIds: [2] },
      expect.any(Object)
    );
  });
});