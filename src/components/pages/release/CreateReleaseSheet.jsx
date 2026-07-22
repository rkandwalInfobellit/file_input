import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Tag, Loader2 } from "lucide-react"
import { toast } from "sonner"
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
import { SingleRollbackDialog } from "./RollbackDialog"
import {
  RELEASE_TYPE_OPTIONS,
  CURRENT_RELEASE_VERSION,
  bumpReleaseVersion,
  versionOptionsFor,
  mapDraftFile,
} from "./releaseConstants"
import {
  fetchDraftFiles,
  setDraftPage,
  resetDraftFilesStatus,
  createRelease,
  resetCreateStatus,
} from "@/store/slice/release.slice"

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function TableSkeleton({ rows = 5, cols = 6 }) {
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
// Column factory — needs access to state setters so it's created inside render
// ---------------------------------------------------------------------------
function makeColumns({ selected, versions, rollbackReasons, toggleFile, onVersionChange }) {
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
      id: "governed_app",
      header: "APP",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {(row.original.app ?? []).join(", ") || "—"}
        </span>
      ),
    },
    {
      id: "cloud",
      header: "CLOUD",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {(row.original.cloud ?? []).join(", ") || "—"}
        </span>
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
            onValueChange={(v) => onVersionChange(f, v)}
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
        const hasReason = !!rollbackReasons[f.id]?.trim()
        return opt?.isRollback ? (
          <Badge
            variant="outline"
            className={`text-[10px] ${hasReason ? "text-amber-600 border-amber-400" : "text-muted-foreground"}`}
          >
            {hasReason ? "Rollback · reason set" : "Pinned · reason needed"}
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
export function CreateReleaseSheet({ open, onClose, currentVersion }) {
  const dispatch = useDispatch()
  const {
    draftFiles,
    draftPage,
    draftPageCount,
    draftTotal,
    draftLimit,
    draftFetchStatus,
    createStatus,
    error: createError,
  } = useSelector((s) => s.release)

  const [releaseType, setReleaseType]       = useState("")
  const [selected, setSelected]             = useState({})  // { [fileId]: true }
  const [versions, setVersions]             = useState({})  // { [fileId]: versionString }
  const [rollbackReasons, setRollbackReasons] = useState({}) // { [fileId]: reason }

  // Rollback dialog state — one file at a time
  const [pendingRollback, setPendingRollback] = useState(null) // { file, newVersion }

  const baseVersion = currentVersion ?? CURRENT_RELEASE_VERSION
  const newVersion  = releaseType ? bumpReleaseVersion(baseVersion, releaseType) : baseVersion
  const releaseName = releaseType ? `Release v${newVersion}` : ""

  // Reset & fetch on open
  useEffect(() => {
    if (open) {
      setReleaseType("")
      setSelected({})
      setVersions({})
      setRollbackReasons({})
      dispatch(resetDraftFilesStatus())
      dispatch(fetchDraftFiles({ page: 1, limit: draftLimit }))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch on page change
  useEffect(() => {
    if (open && draftFetchStatus !== "idle") {
      dispatch(fetchDraftFiles({ page: draftPage, limit: draftLimit }))
    }
  }, [draftPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to createStatus changes
  useEffect(() => {
    if (createStatus === "succeeded") {
      toast.success("Release created successfully")
      dispatch(resetCreateStatus())
      onClose()
    }
    if (createStatus === "failed") {
      toast.error(createError ?? "Failed to create release")
      dispatch(resetCreateStatus())
      // Do NOT close — user keeps their selections
    }
  }, [createStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  function toggleFile(id) {
    setSelected((s) => {
      const next = { ...s }
      if (next[id]) { delete next[id] } else { next[id] = true }
      return next
    })
  }

  function onVersionChange(file, newVal) {
    const opts = versionOptionsFor(file)
    const opt  = opts.find((o) => o.value === newVal)

    if (opt?.isRollback) {
      // Open the rollback dialog for this file before committing the version
      setPendingRollback({ file, newVersion: newVal })
    } else {
      // Clear any previous rollback reason for this file
      setVersions((v) => ({ ...v, [file.id]: newVal }))
      setRollbackReasons((r) => { const next = { ...r }; delete next[file.id]; return next })
      if (!selected[file.id]) toggleFile(file.id)
    }
  }

  function handleRollbackConfirm(reason) {
    if (!pendingRollback) return
    const { file, newVersion: val } = pendingRollback
    setVersions((v) => ({ ...v, [file.id]: val }))
    setRollbackReasons((r) => ({ ...r, [file.id]: reason }))
    if (!selected[file.id]) toggleFile(file.id)
    setPendingRollback(null)
  }

  function handleRollbackCancel() {
    // Don't change the version — just close the dialog
    setPendingRollback(null)
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const mappedFiles   = draftFiles.map(mapDraftFile)
  const selectedFiles = mappedFiles.filter((f) => selected[f.id])

  // Validation: rollback files must have a reason set
  const missingReason = selectedFiles.some(
    (f) => (versions[f.id] ?? "").endsWith("-rollback") && !rollbackReasons[f.id]?.trim()
  )
  const canCreate = releaseType && selectedFiles.length > 0 && !missingReason
  const submitting = createStatus === "loading"

  function handleCreate() {
    const items = selectedFiles.map((f) => {
      const opts         = versionOptionsFor(f)
      const chosenVal    = versions[f.id] ?? opts[0]?.value
      const isRollback   = chosenVal?.endsWith("-rollback")
      const cleanVersion = chosenVal?.replace("-rollback", "")
      const matchedOpt   = opts.find((o) => o.value === chosenVal)

      // Find the version entry to get version_id
      const versionEntry = (f.versions ?? []).find(
        (v) => v.version === cleanVersion && (isRollback ? v.ui_state === "Rollback" : v.is_latest)
      ) ?? (f.versions ?? []).find((v) => v.version === cleanVersion)

      return {
        category_id:        f.categoryId,
        governed_app:       f.app,
        cloud:              f.cloud,
        version:            cleanVersion,
        version_id:         versionEntry?.version_id ?? matchedOpt?.versionId ?? "",
        is_latest_version:  !isRollback,
        ...(isRollback && rollbackReasons[f.id]
          ? { rollback_reason: rollbackReasons[f.id] }
          : {}),
      }
    })

    dispatch(createRelease({
      release_type:    releaseType,
      release_version: `v${newVersion}`,
      release_name:    releaseName,
      items,
    }))
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const loading = draftFetchStatus === "loading" || draftFetchStatus === "idle"

  const columns = makeColumns({
    selected,
    versions,
    rollbackReasons,
    toggleFile,
    onVersionChange,
  })

  // For the rollback dialog — build the single-file shape it expects
  const rollbackDialogFile = pendingRollback
    ? (() => {
        const f    = pendingRollback.file
        const opts = versionOptionsFor(f)
        const rb   = opts.find((o) => o.value === pendingRollback.newVersion)
        return {
          ...f,
          selectedVersion: pendingRollback.newVersion,
          rollbackVersion: rb?.value?.replace("-rollback", "") ?? "—",
        }
      })()
    : null

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
              Select files and versions to include. Picking a previous version opens a rollback reason dialog.
            </p>
            {selectedFiles.length > 0 && (
              <Badge variant="outline" className="text-xs shrink-0 ml-2">
                {selectedFiles.length} selected
              </Badge>
            )}
          </div>

          {/* Validation hint */}
          {missingReason && (
            <p className="px-6 text-xs text-amber-600">
              Some rollback files are missing a reason. Click the version dropdown and confirm to set it.
            </p>
          )}

          <div className="flex-1 overflow-auto">
            {loading ? (
              <TableSkeleton rows={6} cols={6} />
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
              onClick={handleCreate}
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

      {/* Per-row rollback dialog — fires immediately when a previous version is chosen */}
      <SingleRollbackDialog
        open={!!pendingRollback}
        file={rollbackDialogFile}
        onConfirm={handleRollbackConfirm}
        onCancel={handleRollbackCancel}
      />
    </>
  )
}
