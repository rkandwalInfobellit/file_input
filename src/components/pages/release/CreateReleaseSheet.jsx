import React, { useMemo } from "react"
import { Tag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FieldLabel, Field } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { DataTable } from "@/components/DataTable/DataTable"
import { SingleRollbackDialog } from "./RollbackDialog"
import { RELEASE_TYPE_OPTIONS } from "./releaseConstants"
import { makeDraftColumns } from "./release.columns"
import { useReleaseSheet } from "./useReleaseSheet"

// ---------------------------------------------------------------------------
// Skeleton shown while draft files are loading
// ---------------------------------------------------------------------------
function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <div className="px-4 py-2 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((__, j) => (
            <Skeleton
              key={j}
              className={`h-5 rounded ${j === 0 ? "w-5" : j === 1 ? "w-40" : j === 4 ? "w-32" : "w-20"}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CreateReleaseSheet — pure render component
// All logic lives in useReleaseSheet
// ---------------------------------------------------------------------------
export function CreateReleaseSheet({ open, onClose, currentVersion }) {
  const {
    releaseType, setReleaseType,
    newVersion, releaseName,
    mappedFiles, selectedFiles,
    selected, toggleFile,
    versions, rollbackReasons,
    pendingRollback, rollbackDialogFile,
    handleRollbackConfirm, handleRollbackCancel,
    missingReason, canCreate, submitting,
    handleCreate, onVersionChange,
    draftPage, draftPageCount, draftTotal, draftLimit, draftFetchStatus,
    setDraftPage,
  } = useReleaseSheet({ open, onClose, currentVersion })

  // Columns are stable as long as the state references don't change
  const columns = useMemo(
    () => makeDraftColumns({ selected, versions, rollbackReasons, toggleFile, onVersionChange }),
    [selected, versions, rollbackReasons, toggleFile, onVersionChange]
  )

  const loading = draftFetchStatus === "loading" || draftFetchStatus === "idle"

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <SheetContent side="right" className="flex flex-col sm:max-w-4xl!">

          {/* Header */}
          <SheetHeader className="border-b pb-4 px-6">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <SheetTitle className="text-base font-bold">Create New Release</SheetTitle>
            </div>

            <Field className="mt-3 mb-1">
              <FieldLabel className="text-[11px] font-semibold tracking-wider">
                RELEASE TYPE · SETS RELEASE VERSION
              </FieldLabel>
              <Select value={releaseType} onValueChange={setReleaseType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select release type">
                    {RELEASE_TYPE_OPTIONS.find((o) => o.value === releaseType)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RELEASE_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-center justify-between rounded-md border bg-muted px-2 py-2">
              <span className="text-sm text-muted-foreground">Version update</span>
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="font-mono">{currentVersion}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono text-primary">{newVersion}</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Release name will be:{" "}
              <span className="font-semibold">{releaseName || "—"}</span>
            </p>
          </SheetHeader>

          {/* Subheader */}
          <div className="px-6 pt-3 pb-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Select files and versions to include. Picking a previous version opens a rollback reason dialog.
            </p>
            {selectedFiles.length > 0 && (
              <Badge variant="outline" className="text-xs shrink-0 ml-2">
                {selectedFiles.length} selected
              </Badge>
            )}
          </div>

          {missingReason && (
            <p className="px-6 text-xs text-amber-600">
              Some rollback files are missing a reason. Select the version again to set it.
            </p>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <TableSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={mappedFiles}
                emptyMessage="No approved files available for release."
                loading={false}
                error={draftFetchStatus === "failed" ? "Failed to load files. Please try again." : null}
                pagination={{
                  pageIndex:    draftPage - 1,
                  pageSize:     draftLimit,
                  pageCount:    draftPageCount,
                  totalItems:   draftTotal,
                  setPageIndex: setDraftPage,
                  setPageSize:  () => {},
                }}
              />
            )}
          </div>

          {/* Footer */}
          <SheetFooter className="border-t pt-4 px-6">
            <Button className="w-full" disabled={!canCreate || submitting} onClick={handleCreate}>
              {submitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</>
                : <><Tag className="mr-2 h-4 w-4" />Create New Release</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <SingleRollbackDialog
        open={!!pendingRollback}
        file={rollbackDialogFile}
        onConfirm={handleRollbackConfirm}
        onCancel={handleRollbackCancel}
      />
    </>
  )
}
