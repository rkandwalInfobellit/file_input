import React, { useEffect, useState } from "react"
import { Tag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "./releaseConstants"

// Column definitions for the file selection table inside the sheet
function makeSheetColumns({ selected, versions, toggleFile, setVersion, versionOptionsFor, fileAppCloud }) {
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
      cell: ({ row }) => <span className="font-semibold text-sm">{row.getValue("name")}</span>,
    },
    {
      id: "appCloud",
      header: "APP / CLOUD",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{fileAppCloud(row.original)}</span>,
    },
    {
      id: "includeVersion",
      header: "INCLUDE VERSION",
      cell: ({ row }) => {
        const f = row.original
        const opts = versionOptionsFor(f)
        const chosen = versions[f.id] ?? opts[0]?.value
        return (
          <Select
            value={chosen}
            onValueChange={(v) => { setVersion(f.id, v); if (!selected[f.id]) toggleFile(f.id) }}
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
        const f = row.original
        const opts = versionOptionsFor(f)
        const chosen = versions[f.id] ?? opts[0]?.value
        const chosenOpt = opts.find((o) => o.value === chosen) ?? opts[0]
        return chosenOpt?.isRollback ? (
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

export function CreateReleaseSheet({ open, onClose, files, onSubmit, submitting }) {
  const [releaseType, setReleaseType] = useState("")
  const [selected, setSelected]       = useState({})
  const [versions, setVersions]       = useState({})
  const [rollbackOpen, setRollbackOpen] = useState(false)

  const newVersion  = releaseType ? bumpReleaseVersion(CURRENT_RELEASE_VERSION, releaseType) : CURRENT_RELEASE_VERSION
  const releaseName = releaseType ? `Release v${newVersion}` : ""

  useEffect(() => {
    if (open) { setReleaseType(""); setSelected({}); setVersions({}) }
  }, [open])

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

  const selectedFiles = files.filter((f) => selected[f.id])

  const rollbackFiles = selectedFiles
    .filter((f) => (versions[f.id] ?? "")?.endsWith("-rollback"))
    .map((f) => {
      const opts = versionOptionsFor(f)
      const rb = opts.find((o) => o.isRollback)
      return { ...f, selectedVersion: versions[f.id], rollbackVersion: rb?.value?.replace("-rollback", "") ?? "—" }
    })

  function handleCreateClick() {
    rollbackFiles.length > 0 ? setRollbackOpen(true) : doCreate({})
  }

  function doCreate(rollbackReasons) {
    setRollbackOpen(false)
    const manifest = selectedFiles.map((f) => {
      const opts = versionOptionsFor(f)
      const chosenVal = versions[f.id] ?? opts[0]?.value
      return {
        id: f.id,
        name: f.name,
        app: Array.isArray(f.app) ? f.app.join(", ") : f.app,
        cloud: Array.isArray(f.cloud) ? f.cloud.join(", ") || "—" : f.cloud || "—",
        version: chosenVal?.replace("-rollback", ""),
        contributor: f.submittedBy ?? f.contributor,
        approvedDate: f.submittedAt ?? "—",
        approvedBy: f.approver,
      }
    })
    onSubmit({ name: releaseName, type: releaseType, files: manifest, rollbackReasons })
  }

  const columns = makeSheetColumns({ selected, versions, toggleFile, setVersion, versionOptionsFor, fileAppCloud })
  const canCreate = releaseType && selectedFiles.length > 0

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
                <span className="font-mono">{CURRENT_RELEASE_VERSION}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono text-primary">{newVersion}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Release name will be: <span className="font-semibold">{releaseName || "—"}</span>
            </p>
          </SheetHeader>

          <p className="px-6 pt-3 pb-1 text-xs text-muted-foreground">
            For each file, select the version to include. Both newly approved and previously approved versions are allowed.
          </p>

          <div className="flex-1 overflow-auto">
            <DataTable
              columns={columns}
              data={files}
              emptyMessage="No files available."
              loading={false}
              error={null}
            />
          </div>

          <SheetFooter className="border-t pt-4 px-6">
            <Button className="w-full" disabled={!canCreate || submitting} onClick={handleCreateClick}>
              {submitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</>
                : <><Tag className="mr-2 h-4 w-4" />Create New Release</>}
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
