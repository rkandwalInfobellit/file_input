import { versionOptionsFor } from "./releaseConstants"

// ---------------------------------------------------------------------------
// Maps the /release/draft/files API item → internal shape
// ---------------------------------------------------------------------------
export function mapDraftFile(item) {
  return {
    id:                   item.file_id,
    name:                 item.file_name,
    app:                  item.governed_app  ?? [],
    cloud:                item.cloud         ?? [],
    status:               item.status        ?? "",
    displayStatus:        item.display_status ?? item.status ?? "",
    latestVersionId:      item.latest_version_id,
    latestInputVersion:   item.latest_input_version,
    categoryId:           item.category_id,
    categoryDisplayName:  item.category_display_name,
    versions: (item.versions ?? []).map((v) => ({
      version_id: v.version_id,
      version:    v.input_version,
      is_latest:  v.is_latest,
      ui_state:   v.ui_state,   // "Latest" | "Rollback"
      approvedAt: v.approved_at,
      status:     v.status,     // "approved"
    })),
  }
}

// ---------------------------------------------------------------------------
// Builds a single payload item for the create-release API
// ---------------------------------------------------------------------------
export function buildPayloadItem(file, chosenVal, rollbackReasons) {
  const isRollback   = chosenVal?.endsWith("-rollback")
  const cleanVersion = chosenVal?.replace("-rollback", "")
  const opts         = versionOptionsFor(file)
  const matchedOpt   = opts.find((o) => o.value === chosenVal)

  const versionEntry =
    (file.versions ?? []).find(
      (v) =>
        v.version === cleanVersion &&
        (isRollback ? v.ui_state === "Rollback" : v.is_latest)
    ) ?? (file.versions ?? []).find((v) => v.version === cleanVersion)

  return {
    category_id:       file.categoryId,
    governed_app:      file.app,
    cloud:             file.cloud,
    version:           cleanVersion,
    version_id:        versionEntry?.version_id ?? matchedOpt?.versionId ?? "",
    is_latest_version: !isRollback,
    ...(isRollback && rollbackReasons[file.id]
      ? { rollback_reason: rollbackReasons[file.id] }
      : {}),
  }
}

// ---------------------------------------------------------------------------
// Builds the file shape the SingleRollbackDialog expects
// ---------------------------------------------------------------------------
export function buildRollbackDialogFile(pendingRollback) {
  if (!pendingRollback) return null
  const { file, newVersion } = pendingRollback
  const opts = versionOptionsFor(file)
  const rb   = opts.find((o) => o.value === newVersion)
  return {
    ...file,
    selectedVersion: newVersion,
    rollbackVersion: rb?.value?.replace("-rollback", "") ?? "—",
  }
}
