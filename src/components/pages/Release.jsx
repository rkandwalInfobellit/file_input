import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Tag, Plus, Loader2, ChevronDown, ChevronUp,  } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { fetchFiles } from "@/store/slice/fileCatalog.slice"
import { fetchReleases, createRelease, resetCreateStatus } from "@/store/slice/release.slice"
import { selectFileCatalogState } from "@/store/selectors/fileCatalog.selectors"
import { FILE_STATUS } from "@/store/slice/filterOptions.slice"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const RELEASE_TYPE_OPTIONS = [
  { value: "major",  label: "Major — breaking change" },
  { value: "minor",  label: "Minor — additive" },
  { value: "bugfix", label: "Bug fix" },
]

const CURRENT_RELEASE_VERSION = "7.1.1"

function bumpReleaseVersion(version, type) {
  const [major, minor, patch] = version.split(".").map(Number)
  if (type === "major") return `${major + 1}.0.0`
  if (type === "minor") return `${major}.${minor + 1}.0`
  if (type === "bugfix") return `${major}.${minor}.${patch + 1}`
  return version
}

const STATUS_VARIANT = {
  active:   { label: "Active",   variant: "default" },
  released: { label: "Released", variant: "secondary" },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ReleaseBadge({ status }) {
  const cfg = STATUS_VARIANT[status] ?? { label: status, variant: "outline" }
  return <Badge variant={cfg.variant}>● {cfg.label}</Badge>
}

function fileAppCloud(f) {
  const cloud = Array.isArray(f.cloud) ? f.cloud.join(", ") || "—" : f.cloud || "—"
  const app   = Array.isArray(f.app)   ? f.app.join(", ")         : f.app   || "—"
  return `${app} / ${cloud}`
}

// Version options for a file row in the sheet
function versionOptionsFor(file) {
  const opts = []

  // Latest approved — prefer from versions[], fall back to file.version
  const latestApprovedVer = (file.versions ?? []).find(
    (v) => v.status === FILE_STATUS.APPROVED || v.status === "Released"
  )
  const approvedVersion = latestApprovedVer?.version ?? file.version
  opts.push({ value: approvedVersion, label: `${approvedVersion} — Latest version`, isRollback: false })

  // Rollback — check versions[] first, then check if the file itself is in rollback state
  const rollbackVer = (file.versions ?? []).find((v) => v.status === FILE_STATUS.ROLLBACK)
  if (rollbackVer) {
    opts.push({ value: `${rollbackVer.version}-rollback`, label: `${rollbackVer.version} — Previous version (rollback)`, isRollback: true })
  } else if (file.status === FILE_STATUS.ROLLBACK) {
    opts.push({ value: `${file.version}-rollback`, label: `${file.version} — Previous version (rollback)`, isRollback: true })
  }

  return opts
}

// ---------------------------------------------------------------------------
// Release accordion item
// ---------------------------------------------------------------------------
function ReleaseAccordion({ release }) {
  const [open, setOpen] = useState(release.status === "active")

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm">{release.name}</span>
          <span className="text-xs text-muted-foreground">{release.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <ReleaseBadge status={release.status} />
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Content */}
      {open && release.files.length > 0 && (
        <>
          <Separator />
          <div className="px-5 pb-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">FILE</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">VERSION</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">CONTRIBUTED NAME</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">APPROVED DATE</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">APPROVED BY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {release.files.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="text-sm font-medium">{f.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/80 border-primary text-primary-foreground text-xs">{f.version}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{f.contributor}</TableCell>
                    <TableCell className="text-sm">{f.approvedDate}</TableCell>
                    <TableCell className="text-sm">{f.approvedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {release.tag && (
            <div className="px-5 py-3 border-t text-xs text-muted-foreground">
              Engine used these exact versions. All outputs carry{" "}
              <code className="bg-muted px-1 py-0.5 rounded">{release.tag}</code>.
            </div>
          )}
        </>
      )}

      {open && release.files.length === 0 && (
        <div className="px-5 py-6 text-sm text-muted-foreground border-t">
          No files in this release.
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rollback confirmation dialog
// ---------------------------------------------------------------------------
function RollbackDialog({ open, onClose, rollbackFiles, onConfirm }) {
  const [reasons, setReasons] = useState({})

  function setReason(fileId, val) {
    setReasons((r) => ({ ...r, [fileId]: val }))
  }

  const allFilled = rollbackFiles.every((f) => reasons[f.id]?.trim())

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            Roll back file
            <Badge variant="destructive" className="text-[10px] tracking-wider">SUPER ADMIN</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 py-2">
          {/* Left: files with reason inputs */}
          <div className="flex-1 flex flex-col gap-5">
            {rollbackFiles.map((f) => (
              <div key={f.id} className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground font-medium">Roll back from</div>
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2.5 text-sm font-medium">
                  <span>{f.name} {f.selectedVersion?.replace("-rollback", "")}</span>
                  <Badge variant="secondary" className="text-[10px]">APPROVED</Badge>
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1">Roll back to</div>
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2.5 text-sm font-medium">
                  <span>{f.rollbackVersion}</span>
                  <Badge variant="secondary" className="text-[10px]">APPROVED</Badge>
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1">
                  Reason for rollback <span className="text-destructive">(required)</span>
                </div>
                <textarea
                  className="w-full min-h-20 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="Describe why this version is being rolled back…"
                  value={reasons[f.id] ?? ""}
                  onChange={(e) => setReason(f.id, e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  This reason will be included in notifications sent to approvers.
                </p>
              </div>
            ))}
          </div>

          {/* Right: what happens */}
          <div className="w-56 shrink-0 flex flex-col gap-3">
            <p className="text-sm font-semibold">What happens on confirm</p>
            <ul className="text-xs text-muted-foreground space-y-2.5 list-disc pl-4">
              <li>The release file list updates to tag the rollback version for this file.</li>
              <li>An email + notification is sent to the file approver(s) and contributor with the rollback reason.</li>
              <li>The rolled-back version stays in history; nothing is deleted.</li>
              <li>The super-admin can then tag files and create the release.</li>
            </ul>

            <Separator />

            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground">NOTIFICATION PREVIEW</p>
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 flex items-start gap-2">
              <span className="mt-0.5 h-3 w-3 rounded-sm bg-destructive shrink-0" />
              <div>
                <p className="text-xs font-semibold">File Rolled Back</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                  "{Object.values(reasons)[0]?.slice(0, 60) ?? "…"}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button variant="destructive" disabled={!allFilled} onClick={() => onConfirm(reasons)}>
            Confirm rollback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Create Release sheet
// ---------------------------------------------------------------------------
function CreateReleaseSheet({ open, onClose, files, onSubmit, submitting }) {
  const [releaseType, setReleaseType] = useState("")
  const [selected, setSelected]       = useState({})
  const [versions, setVersions]       = useState({})
  const [rollbackOpen, setRollbackOpen] = useState(false)

  const newVersion = releaseType ? bumpReleaseVersion(CURRENT_RELEASE_VERSION, releaseType) : CURRENT_RELEASE_VERSION
  const releaseName = releaseType ? `Release v${newVersion}` : ""

  // Reset when opened
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

  function toggleAll(checked) {
    if (checked) {
      const all = {}
      files.forEach((f) => { all[f.id] = true })
      setSelected(all)
    } else {
      setSelected({})
    }
  }

  function setVersion(fileId, val) {
    setVersions((v) => ({ ...v, [fileId]: val }))
  }

  const selectedFiles = files.filter((f) => selected[f.id])
  const allSelected   = files.length > 0 && selectedFiles.length === files.length
  const someSelected  = selectedFiles.length > 0 && !allSelected

  // Files where the chosen version is a rollback
  const rollbackFiles = selectedFiles
    .filter((f) => {
      const chosen = versions[f.id]
      return chosen?.endsWith("-rollback")
    })
    .map((f) => {
      const opts = versionOptionsFor(f)
      const rb = opts.find((o) => o.isRollback)
      return { ...f, selectedVersion: versions[f.id], rollbackVersion: rb?.value?.replace("-rollback", "") ?? "—" }
    })

  function handleCreateClick() {
    if (rollbackFiles.length > 0) {
      setRollbackOpen(true)
    } else {
      doCreate({})
    }
  }

  function doCreate(rollbackReasons) {
    setRollbackOpen(false)
    const manifest = selectedFiles.map((f) => {
      const opts = versionOptionsFor(f)
      const chosenVal = versions[f.id] ?? opts[0]?.value
      const chosenOpt = opts.find((o) => o.value === chosenVal) ?? opts[0]
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

            {/* Release type select — same pattern as upload page */}
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

            {/* Version preview — mirrors upload page */}
            <div className="flex items-center justify-between rounded-md border bg-muted px-2 py-2">
              <span className="text-sm text-muted-foreground">Version update</span>
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="font-mono">{CURRENT_RELEASE_VERSION}</span>
                <span className="text-muted-foreground">→</span>
                {releaseType ? (
                  <span className="font-mono text-primary">{newVersion}</span>
                ) : (
                  <span className="font-mono text-primary">{CURRENT_RELEASE_VERSION}</span>
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Release name will be: <span className="font-semibold">{releaseName || "—"}</span>
            </p>
          </SheetHeader>

          <p className="px-6 pt-3 pb-1 text-xs text-muted-foreground">
            For each file, select the version to include. Both newly approved and previously approved versions are allowed.
          </p>

          {/* File table */}
          <div className="flex-1 overflow-auto px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={allSelected}
                      data-indeterminate={someSelected || undefined}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">FILE</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">APP / CLOUD</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">INCLUDE VERSION</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((f) => {
                  const opts = versionOptionsFor(f)
                  const chosen = versions[f.id] ?? opts[0]?.value
                  const chosenOpt = opts.find((o) => o.value === chosen) ?? opts[0]
                  const isSelected = !!selected[f.id]
                  return (
                    <TableRow key={f.id} className={isSelected ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleFile(f.id)} />
                      </TableCell>
                      <TableCell className="font-semibold text-sm">{f.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fileAppCloud(f)}</TableCell>
                      <TableCell>
                        <Select
                          value={chosen}
                          onValueChange={(v) => { setVersion(f.id, v); if (!isSelected) toggleFile(f.id) }}
                          disabled={opts.length === 0}
                        >
                          <SelectTrigger className="h-7 text-xs w-52">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {opts.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {chosenOpt?.isRollback ? (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Pinned · prev. version
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] text-status-ready">
                            Approved
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <SheetFooter className="border-t pt-4">
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

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
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

  // Close sheet and reset after successful create
  useEffect(() => {
    if (createStatus === "succeeded") {
      setSheetOpen(false)
      dispatch(resetCreateStatus())
    }
  }, [createStatus, dispatch])

  function handleSubmit(payload) {
    dispatch(createRelease(payload))
  }

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      {/* Header */}
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

      {/* Release list */}
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

      {/* Sheet */}
      <CreateReleaseSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        files={files}
        onSubmit={handleSubmit}
        submitting={createStatus === "loading"}
      />
    </section>
  )
}
