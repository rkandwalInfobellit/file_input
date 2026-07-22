import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useGetReleasesQuery } from "@/store/api/endpoints/release.endpoints"
import { ReleaseAccordion } from "./ReleaseAccordion"

const PAGE_LIMIT = 10

export function ReleaseList() {
  const [page, setPage] = useState(1)

  const { data, isFetching, isError, isSuccess } = useGetReleasesQuery({ page, limit: PAGE_LIMIT })

  const releases   = data?.items       ?? []
  const totalPages = data?.total_pages ?? 1
  const hasMore    = page < totalPages

  const sentinelRef = useRef(null)

  // IntersectionObserver — load next page when sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetching) {
          setPage((p) => p + 1)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, isFetching])

  if (isFetching && releases.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card h-16 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError && releases.length === 0) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        Failed to load releases. Please refresh the page.
      </p>
    )
  }

  if (isSuccess && releases.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No releases yet. Create the first one above.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {releases.map((r) => (
        <ReleaseAccordion key={r.id} release={r} />
      ))}

      <div ref={sentinelRef} className="h-4" />

      {isFetching && releases.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more…
        </div>
      )}

      {!hasMore && releases.length > 0 && !isFetching && (
        <p className="text-center text-xs text-muted-foreground py-2">
          All releases loaded · {releases.length} total
        </p>
      )}
    </div>
  )
}
