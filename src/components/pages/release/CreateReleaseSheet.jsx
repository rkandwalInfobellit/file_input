import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Tag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { RollbackDialog } from "./RollbackDialog"
import {
  RELEASE_TYPE_OPTIONS,
  CURRENT_RELEASE_VERSION,
  bumpReleaseVersion,
  fileAppCloud,
  versionOptionsFor,
  mapDraftFile,
} from "./releaseConstants"
import {
  fetchDraftFiles,
  setDraftPage,
  resetDraftFilesStatus,
} from "@/store/slice/release.slice"

// ---------------------------------------------------------------------------
// Skeleton rows shown while the draft-files API call is in-flight
// ---------------------------------------------------------------------------
function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="px-4 py-2 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((__, j) => (
            <Skeleton key={j} className={`h-5 rounded ${j === 0 ? "w-5" : j === 1 ? "w-40" : j === 3 ? "w-32" : "w-20"}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
function makeSheetColumns({ selected, versions, toggleFile, setVersion }) {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={!!selected[row.original.id]}
          onCheckedChange={() => toggleFile(row.original.id)}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "FILE",
      cell: ({ row }) => (
        <span className="font-semibold text-sm">{row.getValue("name")}</span>
      ),
    },
    {
      id: "appCloud",
      header: "APP / CLOUD",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{fileAppCloud(row.original)}</span>
      ),
    },
    {
      id: "includeVersion",
      header: "INCLUDE VERSION",
      cell: ({ row }) => {
        const f    = row.original
        const opts = versionOptionsFor(f)
        const chosen = versions[f.id] ?? opts[0]?.value
        return (
          <Select
            value={chosen}
            onValueChange={(v) => {
              setVersion(f.id, v)
              if (!selected[f.id]) toggleFile(f.id)
            }}
            disabled={opts.length === 0}
          >
            <SelectTrigger className="h-7 text-xs w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      id: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const f      = row.original
        const opts   = versionOptionsFor(f)
        const chosen = versions[f.id] ?? opts[0]?.value
        const opt    = opts.find((o) => o.value === chosen) ?? opts[0]
        return opt?.isRollback ? (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Pinned · prev. version
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] text-status-ready">
            Approved
          </Badge>
        )
      },
    },
  ]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function CreateReleaseSheet({ open, onClose, onSubmit, submitting, currentVersion }) {
  const dispatch = useDispatch()
  const {
    draftFiles,
    draftPage,
    draftPageCount,
    draftTotal,
    draftLimit,
    draftFetchStatus,
  } = useSelector((s) => s.release)

  const [releaseType, setReleaseType] = useState("")
  const [selected, setSelected]       = useState({})   // { [fileId]: true }
  const [versions, setVersions]       = useState({})   // { [fileId]: versionString }
  const [rollbackOpen, setRollbackOpen] = useState(false)

  // Derived version display
  const baseVersion = currentVersion ?? CURRENT_RELEASE_VERSION
  const newVersion  = releaseType ? bumpReleaseVersion(baseVersion, releaseType) : baseVersion
  const releaseName = releaseType ? `Release v${newVersion}` : ""

  // Fetch first page when sheet opens
  useEffect(() => {
    if (open) {
      setReleaseType("")
      setSelected({})
      setVersions({})
      dispatch(resetDraftFilesStatus())
      dispatch(fetchDraftFiles({ page: 1, limit: draftLimit }))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch when page changes (only while open)
  useEffect(() => {
    if (open && draftFetchStatus !== "idle") {
      dispatch(fetchDraftFiles({ page: draftPage, limit: draftLimit }))
    }
  }, [draftPage]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleFile(id) {
    setSelected((s) => {
      const next = { ...s }
      if (next[id]) { delete next[id] } else { next[id] = true }
      return next
    })
  }

  function setVersion(fileId, val) {
    setVersions((v) => ({ ...v, [fileId]: val }))
  }

  // Map raw API items to the internal shape the columns/helpers expect
  const mappedFiles = draftFiles.map(mapDraftFile)
  const selectedFiles = mappedFiles.filter((f) => selected[f.id])

  const rollbackFiles = selectedFiles
    .filter((f) => (versions[f.id] ?? "").endsWith("-rollback"))
    .map((f) => {
      const opts = versionOptionsFor(f)
      const rb   = opts.find((o) => o.isRollback)
      return {
        ...f,
        selectedVersion: versions[f.id],
        rollbackVersion: rb?.value?.replace("-rollback", "") ?? "—",
      }
    })

  function handleCreateClick() {
    rollbackFiles.length > 0 ? setRollbackOpen(true) : doCreate({})
  }

  function doCreate(rollbackReasons) {
    setRollbackOpen(false)
    const manifest = selectedFiles.map((f) => {
      const opts      = versionOptionsFor(f)
      const chosenVal = versions[f.id] ?? opts[0]?.value
      return {
        file_id:       f.id,
        file_name:     f.name,
        version:       chosenVal?.replace("-rollback", ""),
        category_id:   f.categoryId,
        governed_app:  f.app,
        cloud:         f.cloud,
      }
    })
    onSubmit({
      name:            releaseName,
      type:            releaseType,
      files:           manifest,
      rollbackReasons,
    })
  }

  const columns  = makeSheetColumns({ selected, versions, toggleFile, setVersion })
  const canCreate = releaseType && selectedFiles.length > 0
  const loading   = draftFetchStatus === "loading" || draftFetchStatus === "idle"

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <SheetContent side="right" className="flex flex-col sm:max-w-4xl!">
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
                  <SelectValue placeholder="Select release type" />
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
                <span className="font-mono">{baseVersion}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono text-primary">{newVersion}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Release name will be: <span className="font-semibold">{releaseName || "—"}</span>
            </p>
          </SheetHeader>

          <div className="px-6 pt-3 pb-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Select the files and versions to include in this release.
            </p>
            {selectedFiles.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {selectedFiles.length} selected
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <TableSkeleton rows={6} cols={5} />
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
                  setPageIndex: (idx) => dispatch(setDraftPage(idx + 1)),
                  setPageSize:  () => {},
                }}
              />
            )}
          </div>

          <SheetFooter className="border-t pt-4 px-6">
            <Button
              className="w-full"
              disabled={!canCreate || submitting}
              onClick={handleCreateClick}
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</>
              ) : (
                <><Tag className="mr-2 h-4 w-4" />Create New Release</>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <RollbackDialog
        open={rollbackOpen}
        onClose={() => setRollbackOpen(false)}
        rollbackFiles={rollbackFiles}
        onConfirm={doCreate}
      />
    </>
  )
}
