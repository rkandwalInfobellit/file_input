import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  useGetDraftFilesQuery,
  useCreateReleaseMutation,
} from "@/store/api/endpoints/release.endpoints"
import { versionOptionsFor, bumpReleaseVersion } from "./releaseConstants"
import { mapDraftFile, buildPayloadItem, buildRollbackDialogFile } from "./release.utils"

export function useReleaseSheet({ open, onClose, currentVersion }) {
  const [draftPage, setDraftPageLocal] = useState(1)
  const draftLimit = 50

  const {
    data: draftData,
    isFetching: draftFetching,
    isError:    draftError,
  } = useGetDraftFilesQuery(
    { page: draftPage, limit: draftLimit },
    { skip: !open }
  )

  const draftFiles      = draftData?.items ?? []
  const draftPageCount  = draftData?.pages ?? 1
  const draftTotal      = draftData?.total ?? 0

  const [createRelease, { isLoading: creating }] = useCreateReleaseMutation()

  const [releaseType,     setReleaseType]     = useState("")
  const [selected,        setSelected]        = useState({})
  const [versions,        setVersions]        = useState({})
  const [rollbackReasons, setRollbackReasons] = useState({})
  const [pendingRollback, setPendingRollback] = useState(null)

  // Reset local state when sheet opens
  useEffect(() => {
    if (!open) return
    setReleaseType("")
    setSelected({})
    setVersions({})
    setRollbackReasons({})
    setPendingRollback(null)
    setDraftPageLocal(1)
  }, [open])

  const newVersion  = releaseType ? bumpReleaseVersion(currentVersion, releaseType) : currentVersion
  const releaseName = releaseType ? `Release ${newVersion}` : ""

  // ── File selection ──────────────────────────────────────────────────────────
  function toggleFile(id) {
    setSelected((s) => {
      const next = { ...s }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })
  }

  // ── Version change — opens rollback dialog for previous versions ────────────
  function onVersionChange(file, newVal) {
    const opt = versionOptionsFor(file).find((o) => o.value === newVal)
    if (opt?.isRollback) {
      setPendingRollback({ file, newVersion: newVal })
    } else {
      setVersions((v) => ({ ...v, [file.id]: newVal }))
      setRollbackReasons((r) => { const next = { ...r }; delete next[file.id]; return next })
      if (!selected[file.id]) toggleFile(file.id)
    }
  }

  // ── Rollback dialog handlers ────────────────────────────────────────────────
  function handleRollbackConfirm(reason) {
    if (!pendingRollback) return
    const { file, newVersion: val } = pendingRollback
    setVersions((v) => ({ ...v, [file.id]: val }))
    setRollbackReasons((r) => ({ ...r, [file.id]: reason }))
    if (!selected[file.id]) toggleFile(file.id)
    setPendingRollback(null)
  }

  function handleRollbackCancel() {
    setPendingRollback(null)
  }

  // ── Derived lists ───────────────────────────────────────────────────────────
  const mappedFiles   = draftFiles.map(mapDraftFile)
  const selectedFiles = mappedFiles.filter((f) => selected[f.id])

  const missingReason = selectedFiles.some(
    (f) => (versions[f.id] ?? "").endsWith("-rollback") && !rollbackReasons[f.id]?.trim()
  )

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleCreate() {
    const items = selectedFiles.map((f) => {
      const opts      = versionOptionsFor(f)
      const chosenVal = versions[f.id] ?? opts[0]?.value
      return buildPayloadItem(f, chosenVal, rollbackReasons)
    })

    try {
      await createRelease({ release_type: releaseType, items }).unwrap()
      toast.success("Release created successfully")
      onClose()
    } catch (err) {
      toast.error(err?.data ?? "Failed to create release")
    }
  }

  // draftFetchStatus shape expected by CreateReleaseSheet
  const draftFetchStatus = draftFetching ? "loading" : draftError ? "failed" : "succeeded"

  return {
    // State
    releaseType, setReleaseType,
    newVersion,
    releaseName,
    // Files
    mappedFiles,
    selectedFiles,
    // Selection
    selected, toggleFile,
    // Versions
    versions,
    // Rollback reasons
    rollbackReasons,
    // Rollback dialog
    pendingRollback,
    rollbackDialogFile: buildRollbackDialogFile(pendingRollback),
    handleRollbackConfirm,
    handleRollbackCancel,
    // Validation
    missingReason,
    canCreate: !!(releaseType && selectedFiles.length > 0 && !missingReason),
    // Submission
    submitting: creating,
    handleCreate,
    onVersionChange,
    // Pagination
    draftPage,
    draftPageCount,
    draftTotal,
    draftLimit,
    draftFetchStatus,
    setDraftPage: (idx) => setDraftPageLocal(idx + 1),
  }
}
