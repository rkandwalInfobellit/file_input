import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Search, ChevronDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ---------------------------------------------------------------------------
// Filter dropdown
// ---------------------------------------------------------------------------
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
// Pagination bar
// Props shape:
//   pagination: {
//     pageIndex: number,       // 0-based
//     pageSize: number,
//     setPageIndex: fn,
//     setPageSize: fn,
//   }
// ---------------------------------------------------------------------------
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total]
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "...", current - 1, current, current + 1, "...", total]
}

function PaginationBar({ pagination, totalRows, pageCount }) {
  const { pageIndex, pageSize, setPageIndex, setPageSize } = pagination
  const from  = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const to    = Math.min((pageIndex + 1) * pageSize, totalRows)
  const total = Math.max(pageCount, 1)
  const pages = getPageNumbers(pageIndex + 1, total)

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <span className="text-xs text-muted-foreground">
        {totalRows === 0 ? "No records" : `${from}–${to} of ${totalRows} records`}
      </span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Rows per page
          <Select
            value={String(pageSize)}
            onValueChange={(v) => { setPageSize(Number(v)); setPageIndex(0) }}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(pageIndex - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground select-none">…</span>
            ) : (
              <Button
                key={p}
                variant={p === pageIndex + 1 ? "default" : "outline"}
                size="icon"
                className="h-7 w-7 text-xs"
                onClick={() => setPageIndex(p - 1)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={pageIndex >= total - 1}
            onClick={() => setPageIndex(pageIndex + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DataTable
// pagination prop shape: { pageIndex, pageSize, setPageIndex, setPageSize }
// Omit pagination to disable it.
// ---------------------------------------------------------------------------
export function DataTable({ columns, data, filters, loading, error, emptyMessage = "No results.", pagination, meta, onRowClick, className="", }) {
  const isManual = !!pagination?.pageCount
  const table = useReactTable({
    data,
    columns,
    meta,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(isManual && { rowCount: pagination.totalItems ?? (pagination.pageCount ?? 1) * (pagination.pageSize ?? 10) }),
    state: pagination ? {
      pagination: { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize },
    } : undefined,
    onPaginationChange: pagination ? (updater) => {
      const next = typeof updater === "function"
        ? updater({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize })
        : updater
      pagination.setPageIndex(next.pageIndex)
      if (pagination.setPageSize) pagination.setPageSize(next.pageSize)
    } : undefined,
    manualPagination: isManual,
  })

  return (
    <div className={cn("flex flex-col flex-1 rounded-lg border bg-card", className)}>
      {/* Toolbar */}
      {filters && (
        <div className="flex items-center gap-3 p-4 border-b">
          {filters.search && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.search.value}
                onChange={(e) => filters.search.setValue(e.target.value)}
                placeholder={filters.search.placeholder ??"Search…"}
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
                  <TableHead key={header.id} className="text-muted-foreground font-semibold">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
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

      {/* Pagination */}
      {pagination && (
        <PaginationBar
          pagination={pagination}
          totalRows={pagination.totalItems ?? table.getFilteredRowModel().rows.length}
          pageCount={pagination.pageCount ?? table.getPageCount()}
        />
      )}
    </div>
  )
}
