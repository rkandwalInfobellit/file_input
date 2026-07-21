import { useState, useEffect, useCallback, useRef } from "react"
import { Loader2 } from "lucide-react"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * Generic combobox — multi-select or single-select dropdown.
 *
 * Props
 * ─────
 * value        Array<any>      Selected items (always an array, even in single mode)
 * onChange     (items) => void
 * options      Array<any>      Static option list. Used for local filtering when
 *                              onSearch is not provided.
 * onSearch     async (query: string, page: number) =>
 *                { items: any[], total_pages: number }
 *              When provided, search + scroll pagination are delegated to the
 *              caller. options is ignored.
 * getLabel     (item) => string   How to display an item. Default: String(item)
 * getValue     (item) => string   Unique key per item.    Default: String(item)
 * placeholder  string
 * multiSelect  boolean  true (default) = chips inside trigger (max 2 + "+N more" tooltip).
 *                       false = single-select: trigger always shows placeholder,
 *                       selecting closes the dropdown; no chips shown.
 * showSelected boolean  false = always show placeholder in trigger, regardless of selection
 * searchable   boolean  Show the search input. Defaults to true when onSearch is
 *                       provided, false otherwise.
 * disabled     boolean
 */
export function Combobox({
  value = [],
  onChange,
  options = [],
  onSearch,
  getLabel        = (item) => String(item),
  getValue        = (item) => String(item),
  placeholder     = "Select…",
  multiSelect     = true,
  showSelected    = true,
  searchable,
  disabled        = false,
  triggerClassName = "",
}) {
  const isAsync    = typeof onSearch === "function"
  const showSearch = searchable ?? isAsync

  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState("")
  const [items, setItems]     = useState([])
  const [page, setPage]       = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const listRef               = useRef(null)
  const searchTimer           = useRef(null)

  const selectedKeys = new Set(value.map(getValue))

  // ── Async mode ────────────────────────────────────────────────────────────
  const loadAsync = useCallback(async (pg, q) => {
    setLoading(true)
    try {
      const result = await onSearch(q, pg)
      const newItems = result?.items ?? []
      setItems((prev) => (pg === 1 ? newItems : [...prev, ...newItems]))
      setHasMore(pg < (result?.total_pages ?? 1))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [onSearch])

  // ── Static mode: local filter ─────────────────────────────────────────────
  const filteredOptions = isAsync
    ? items
    : (showSearch && query
        ? options.filter((o) => getLabel(o).toLowerCase().includes(query.toLowerCase()))
        : options)

  useEffect(() => {
    if (open && isAsync) { setPage(1); loadAsync(1, query) }
    if (!open) { setQuery("") }
  }, [open]) // eslint-disable-line

  function handleQuery(val) {
    setQuery(val)
    if (isAsync) {
      clearTimeout(searchTimer.current)
      searchTimer.current = setTimeout(() => { setPage(1); loadAsync(1, val) }, 350)
    }
  }

  function handleScroll() {
    const el = listRef.current
    if (!el || loading || !hasMore || !isAsync) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      const next = page + 1; setPage(next); loadAsync(next, query)
    }
  }

  function toggle(item) {
    const key = getValue(item)
    if (!multiSelect) {
      onChange(selectedKeys.has(key) ? [] : [item])
      setOpen(false)
      return
    }
    onChange(selectedKeys.has(key)
      ? value.filter((v) => getValue(v) !== key)
      : [...value, item])
  }

  // ── Active state styling for the trigger ─────────────────────────────────
  const isActive = !showSelected && value.length > 0
  const triggerBase = `min-h-8 w-full flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm text-left transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50`
  const triggerState = isActive
    ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
    : "border-input bg-background hover:border-ring"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={`${triggerBase} ${triggerState} ${triggerClassName}`}
      >
        {/* Left side */}
        <span className="flex-1 flex items-center flex-wrap gap-1 min-w-0">
          {!showSelected || value.length === 0 ? (
            <span className="text-muted-foreground truncate">{placeholder}</span>
          ) : (
            <span className="truncate text-foreground">{value.map(getLabel).join(", ")}</span>
          )}
        </span>

        {/* Chevron */}
        <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-52 min-w-(--anchor-width) p-0"
      >
        <Command shouldFilter={false}>
          {showSearch && (
            <CommandInput
              value={query}
              onValueChange={handleQuery}
              placeholder="Search…"
            />
          )}
          <CommandList
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-52"
          >
            <CommandEmpty>No results</CommandEmpty>

            {filteredOptions.map((item) => {
              const key     = getValue(item)
              const checked = selectedKeys.has(key)
              return (
                <CommandItem
                  key={key}
                  value={key}
                  onSelect={() => toggle(item)}
                  // data-checked={checked}
                  className="gap-2.5 [&>svg:last-child]:hidden"
                >
                  {multiSelect && (
                    <Checkbox
                      checked={checked}
                      tabIndex={-1}
                      className="pointer-events-none"
                    />
                  )}
                  <span className="flex-1 truncate">{getLabel(item)}</span>
                </CommandItem>
              )
            })}

            {loading && (
              <div className="flex justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
