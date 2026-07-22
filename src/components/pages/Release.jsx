import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReleaseList } from "./release/ReleaseList"
import { CreateReleaseSheet } from "./release/CreateReleaseSheet"
import { useGetReleasesQuery } from "@/store/api/endpoints/release.endpoints"
import { useEndpointPermission } from "@/hooks/useEndpointPermission"

export default function Release() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const canCreate = useEndpointPermission("ifgapi/release/create")

  // Page-1 data is always in cache (loaded by ReleaseList on mount)
  const { data } = useGetReleasesQuery({ page: 1, limit: 10 })
  const releases = data?.items ?? []
  const currentVersion = releases.find((r) => r.isActive)?.version ?? "v0.0.1"

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold">Release History</h1>
            <Badge variant="outline" className="text-xs">
              {releases.length} release{releases.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Create a Recommendation Version by selecting approved file versions.
            All included files are tagged to this version. The recommendation
            engine uses exactly these tagged versions.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Release
          </Button>
        )}
      </div>

      <ReleaseList />

      <CreateReleaseSheet
        currentVersion={currentVersion}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </section>
  )
}
