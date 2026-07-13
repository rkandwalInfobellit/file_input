import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Search, ChevronDown, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
 
function FilterDropdown({ label, options, value, setValue, isMultiSelect }) {
  const selectedSet = new Set(isMultiSelect ? (value ?? []) : [])

  const triggerLabel =
    isMultiSelect && selectedSet.size > 0
      ? `${label} (${selectedSet.size})`
      : label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          {triggerLabel}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isMultiSelect ? (
          options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt}
              checked={selectedSet.has(opt)}
              onCheckedChange={(checked) => {
                const next = new Set(selectedSet)
                checked ? next.add(opt) : next.delete(opt)
                setValue([...next])
              }}
            >
              {opt}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <>
            <DropdownMenuCheckboxItem
              checked={value == null}
              onCheckedChange={() => setValue(null)}
            >
              All
            </DropdownMenuCheckboxItem>
            {options.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt}
                checked={value === opt}
                onCheckedChange={() => setValue(value === opt ? null : opt)}
              >
                {opt}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------
export function DataTable({ columns, data, filters, loading, error, emptyMessage = "No results." }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="rounded-lg border bg-card">
      {/* Toolbar */}
      {filters && (
        <div className="flex items-center gap-3 p-4 border-b">
          {filters.search && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.search.value}
                onChange={(e) => filters.search.setValue(e.target.value)}
                placeholder="Search…"
                className="pl-9"
              />
            </div>
          )}
          {filters.dropdowns?.map((dropdown) => (
            <FilterDropdown key={dropdown.label} {...dropdown} />
          ))}
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-destructive">{error}</div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
