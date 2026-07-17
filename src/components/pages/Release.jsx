import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { fetchFiles } from "@/store/slice/fileCatalog.slice"
import { fetchReleases, createRelease, resetCreateStatus } from "@/store/slice/release.slice"
import { selectFileCatalogState } from "@/store/selectors/fileCatalog.selectors"

import { ReleaseAccordion } from "./release/ReleaseAccordion"
import { CreateReleaseSheet } from "./release/CreateReleaseSheet"

export default function Release() {
  const dispatch = useDispatch()
  const [sheetOpen, setSheetOpen] = useState(false)

  const { files, fetchStatus: filesFetchStatus } = useSelector(selectFileCatalogState)
  const { releases, fetchStatus, createStatus } = useSelector((s) => s.release)

  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchReleases())
  }, [fetchStatus, dispatch])

  useEffect(() => {
    if (filesFetchStatus === "idle") dispatch(fetchFiles())
  }, [filesFetchStatus, dispatch])

  useEffect(() => {
    if (createStatus === "succeeded") {
      setSheetOpen(false)
      dispatch(resetCreateStatus())
    }
  }, [createStatus, dispatch])

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold">Release History</h1>
            <Badge variant="outline" className="text-xs">
              Total Release: {releases.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Create a Recommendation Version by selecting approved file versions.
            All included files are tagged to this version. The recommendation
            engine uses exactly these tagged versions.
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Release
        </Button>
      </div>

      {fetchStatus === "loading" && (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading releases…
        </div>
      )}

      {fetchStatus === "succeeded" && (
        <div className="flex flex-col gap-3">
          {releases.map((r) => (
            <ReleaseAccordion key={r.id} release={r} />
          ))}
        </div>
      )}

      <CreateReleaseSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        files={files}
        onSubmit={(payload) => dispatch(createRelease(payload))}
        submitting={createStatus === "loading"}
      />
    </section>
  )
}
