import { useState, useEffect, useRef, useCallback } from "react"
import { X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

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
 * searchable   boolean  Show the search input. Defaults to true when onSearch is
 *                       provided, false otherwise.
 * disabled     boolean
 */
export function Combobox({
  value = [],
  onChange,
  options = [],
  onSearch,
  getLabel    = (item) => String(item),
  getValue    = (item) => String(item),
  placeholder = "Select…",
  multiSelect = true,
  searchable,
  disabled    = false,
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
  }, [open])  // eslint-disable-line

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

  function removeItem(e, key) {
    e.stopPropagation()
    onChange(value.filter((v) => getValue(v) !== key))
  }

  // ── Trigger content ───────────────────────────────────────────────────────
  // Single: always show placeholder (selected value reflected only in dropdown state)
  // Multi:  chips for first 2, "+N more" with tooltip for the rest
  const CHIP_LIMIT = 2
  const visibleChips = multiSelect ? value.slice(0, CHIP_LIMIT) : []
  const hiddenChips  = multiSelect ? value.slice(CHIP_LIMIT) : []

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="min-h-10 w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-left transition-colors hover:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {/* Left side */}
        <span className="flex-1 flex items-center flex-wrap gap-1 min-w-0">
          {!multiSelect || value.length === 0 ? (
            <span className="text-muted-foreground truncate capita">{placeholder}</span>
          ) : (
            <>
              {visibleChips.map((item) => {
                const key = getValue(item)
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0"
                  >
                    {getLabel(item)}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => removeItem(e, key)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}

              {hiddenChips.length > 0 && (
                <span
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0 cursor-default"
                  title={hiddenChips.map(getLabel).join(", ")}
                >
                  +{hiddenChips.length} more
                </span>
              )}
            </>
          )}
        </span>

        {/* Chevron */}
        <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full min-w-50 rounded-md border border-border bg-popover shadow-lg">
            {showSearch && (
              <div className="p-2 border-b border-border">
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => handleQuery(e.target.value)}
                  placeholder="Search…"
                  className="h-8 text-sm"
                />
              </div>
            )}
            <div ref={listRef} onScroll={handleScroll} className="max-h-52 overflow-y-auto">
              {filteredOptions.map((item) => {
                const key = getValue(item)
                return (
                  <label
                    key={key}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-accent text-sm select-none"
                  >
                    <input
                      type={multiSelect ? "checkbox" : "radio"}
                      checked={selectedKeys.has(key)}
                      onChange={() => toggle(item)}
                      className="accent-primary shrink-0"
                    />
                    <span className="flex-1 truncate">{getLabel(item)}</span>
                  </label>
                )
              })}

              {loading && (
                <div className="flex justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!loading && filteredOptions.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">No results</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
