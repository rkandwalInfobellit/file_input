import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Loader2 } from "lucide-react"
import { fetchReleases } from "@/store/slice/release.slice"
import { ReleaseAccordion } from "./ReleaseAccordion"

const PAGE_LIMIT = 10

export function ReleaseList() {
  const dispatch = useDispatch()
  const { releases, fetchStatus, releasePage, releaseHasMore } = useSelector((s) => s.release)

  const sentinelRef = useRef(null)
  const isLoading   = fetchStatus === "loading"

  // Initial fetch
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchReleases({ page: 1, limit: PAGE_LIMIT }))
    }
  }, [fetchStatus, dispatch])

  // IntersectionObserver — fires when the sentinel div scrolls into view
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && releaseHasMore && fetchStatus === "succeeded") {
          dispatch(fetchReleases({ page: releasePage + 1, limit: PAGE_LIMIT }))
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [releaseHasMore, fetchStatus, releasePage, dispatch])

  // -------------------------------------------------------------------------
  // Initial loading skeleton
  // -------------------------------------------------------------------------
  if (fetchStatus === "idle" || (fetchStatus === "loading" && releases.length === 0)) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card h-16 animate-pulse" />
        ))}
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Error (first load only)
  // -------------------------------------------------------------------------
  if (fetchStatus === "failed" && releases.length === 0) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        Failed to load releases. Please refresh the page.
      </p>
    )
  }

  // -------------------------------------------------------------------------
  // Empty
  // -------------------------------------------------------------------------
  if (fetchStatus === "succeeded" && releases.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No releases yet. Create the first one above.
      </p>
    )
  }

  // -------------------------------------------------------------------------
  // List + infinite scroll sentinel
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-3">
      {releases.map((r) => (
        <ReleaseAccordion key={r.id} release={r} />
      ))}

      {/* Sentinel — observed by IntersectionObserver */}
      <div ref={sentinelRef} className="h-4" />

      {/* Inline loader shown while fetching next page */}
      {isLoading && releases.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more…
        </div>
      )}

      {/* End of list indicator */}
      {!releaseHasMore && releases.length > 0 && fetchStatus === "succeeded" && (
        <p className="text-center text-xs text-muted-foreground py-2">
          All releases loaded · {releases.length} total
        </p>
      )}
    </div>
  )
}
