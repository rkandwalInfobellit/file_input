import { useState, useEffect } from "react"

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * silence. Pass the debounced value as the RTK Query arg — never debounce the
 * hook call itself.
 */
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
