import '@testing-library/jest-dom';
//@ts-ignore
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserRoleTable from '../UserRoleTable';
import userEvent from '@testing-library/user-event';

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

  it('calls updateUserRoles.mutate when Save is clicked', async () => {
    const mutateMock = jest.fn();
    mockUseUpdateUserRoles.mockReturnValue({
      mutate: mutateMock,
      isLoading: false,
    });

    render(<UserRoleTable />);

    const saveButton = await screen.findByTestId('user-save-btn-1');
    expect(saveButton).toBeDisabled();

    const dropdownWrapper = await screen.findByTestId('user-roles-select-1');
     await userEvent.click(dropdownWrapper);
    await waitFor(() => {
      expect(screen.findByTestId('select-role-menu-item-1')).not.toBeNull();
    });
  
    const adminItem = await screen.findByTestId('select-role-menu-item-1');
    await userEvent.click(adminItem);

    await userEvent.click(document.body);

    await waitFor(() => {
       expect(screen.getByTestId('user-save-btn-1')).not.toBeDisabled();
    });

    await userEvent.click(screen.getByTestId('user-save-btn-1'));
    expect(mutateMock).toHaveBeenCalled();
    const [payload] = mutateMock.mock.calls[0];
    expect(payload.userId).toBe(1);
    expect(payload.roleIds).toEqual(expect.arrayContaining([1, 2]));
    expect(payload.roleIds).toHaveLength(2);
  });
});