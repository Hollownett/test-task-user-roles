import '@testing-library/jest-dom';
import React, { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dropdown from '../Dropdown'

const options = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'User' },
  { value: 3, label: 'PM' },
]

function DropdownShellComponent({
  initial = [],
  placeholder,
  onChangeSpy,
}: {
  initial?: number[]
  placeholder?: string
  onChangeSpy?: (vals: number[]) => void
}) {
  const [value, setValue] = useState<number[]>(initial)
  return (
    <Dropdown
      options={options}
      value={value}
      placeholder={placeholder}
      onChange={(vals) => {
        setValue(vals)
        onChangeSpy?.(vals)
      }}
    />
  )
}

describe('Dropdown', () => {
  test('renders default placeholder "Select"', () => {
    render(<DropdownShellComponent />)
    const trigger = screen.getByTestId('dropdown-control')
    expect(trigger).toBeInTheDocument()
    expect(within(trigger).getByText('Select')).toBeInTheDocument()
  })

  test('renders custom placeholder', () => {
    render(<DropdownShellComponent placeholder="Choose roles" />)
    const trigger = screen.getByTestId('dropdown-control')
    expect(within(trigger).getByText('Choose roles')).toBeInTheDocument()
  })

  test('filters options case-insensitively and trims whitespace', async () => {
    const user = userEvent.setup()
    render(<DropdownShellComponent />)

    await user.click(screen.getByTestId('dropdown-control'))
    const search = await screen.findByRole('textbox', { name: /search options/i })

    await user.type(search, '  uS  ')

    expect(screen.getByTestId('select-role-menu-item-2')).toBeInTheDocument()
    expect(screen.queryByTestId('select-role-menu-item-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('select-role-menu-item-3')).not.toBeInTheDocument()
  })

  test('selects an option', async () => {
    const user = userEvent.setup()
    const onChangeSpy = jest.fn()
    render(<DropdownShellComponent onChangeSpy={onChangeSpy} />)

    await user.click(screen.getByTestId('dropdown-control'))

    const adminItem = await screen.findByTestId('select-role-menu-item-1')
    await user.click(adminItem)

    expect(onChangeSpy).toHaveBeenLastCalledWith([1])
    expect(within(screen.getByTestId('dropdown-control')).getByText('Admin')).toBeInTheDocument()

  })

  test('supports multi-select and shows joined labels in trigger', async () => {
    const user = userEvent.setup()
    render(<DropdownShellComponent initial={[1]}/>)

    await user.click(screen.getByTestId('dropdown-control'))

    const pm = await screen.findByTestId('select-role-menu-item-3')

    await user.click(pm)

    const trigger = screen.getByTestId('dropdown-control')

    expect(within(trigger).getByText('Admin, PM')).toBeInTheDocument()
  })

  test('checkbox items reflect checked state based on value', async () => {
    const user = userEvent.setup()
    render(<DropdownShellComponent initial={[2]} />)

    await user.click(screen.getByTestId('dropdown-control'))

    const userItem = await screen.findByTestId('select-role-menu-item-2')
    const adminItem = screen.getByTestId('select-role-menu-item-1')

    expect(userItem).toHaveAttribute('aria-checked', 'true')
    expect(adminItem).toHaveAttribute('aria-checked', 'false')
  })

  test('shows no items when search has no matches', async () => {
    const user = userEvent.setup()
    render(<DropdownShellComponent />)

    await user.click(screen.getByTestId('dropdown-control'))
    const search = await screen.findByRole('textbox', { name: /search options/i })

    await user.type(search, 'XXXX')

    expect(screen.queryByTestId('select-role-menu-item-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('select-role-menu-item-2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('select-role-menu-item-3')).not.toBeInTheDocument()
  })
})
