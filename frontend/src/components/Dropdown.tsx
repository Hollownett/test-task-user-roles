import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from './ui/dropdown-menu'

interface Option { value: number; label: string }

interface Props {
  options: Option[];
  value: number[];
  onChange: (vals: number[]) => void;
  placeholder?: string;
}

export default function Dropdown({ options, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  const toggle = (v: number) => {
    if (value.includes(v)) onChange(value.filter(x => x !== v))
    else onChange([...value, v])
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} >
      <DropdownMenuTrigger className="w-full text-left border rounded px-2 py-1" data-testid="dropdown-control">
        <div className="truncate">{value.length ? options.filter(o => value.includes(o.value)).map(o => o.label).join(', ') : (placeholder || 'Select')}</div>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={6} className="w-64">
        <div className="p-2">
          <input
            ref={inputRef}
            className="w-full border rounded px-2 py-1"
            placeholder="Search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search options"
          />
        </div>
        <div className="max-h-48 overflow-auto">
          {filtered.map(opt => (
            <DropdownMenuCheckboxItem key={opt.value} data-testid={`select-role-menu-item-${opt.value}`} checked={value.includes(opt.value)} onCheckedChange={() => toggle(opt.value)}>
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
