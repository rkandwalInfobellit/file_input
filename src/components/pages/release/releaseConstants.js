// Maps the /release/draft/files API item shape → internal file shape used by the sheet
export function mapDraftFile(item) {
  return {
    id:          item.file_id,
    name:        item.file_name,
    app:         item.governed_app  ?? [],
    cloud:       item.cloud         ?? [],
    status:      item.status        ?? "",
    displayStatus: item.display_status ?? item.status ?? "",
    // Normalise versions: input_version → version, approved_at → approvedAt
    versions: (item.versions ?? []).map((v) => ({
      version_id:    v.version_id,
      version:       v.input_version,
      is_latest:     v.is_latest,
      ui_state:      v.ui_state,      // "Latest" | "Rollback"
      approvedAt:    v.approved_at,
      status:        v.status,        // "approved"
    })),
    latestVersionId:      item.latest_version_id,
    latestInputVersion:   item.latest_input_version,
    categoryId:           item.category_id,
    categoryDisplayName:  item.category_display_name,
  }
}

import { FILE_STATUS } from "@/store/slice/filterOptions.slice"

export const RELEASE_TYPE_OPTIONS = [
  { value: "major",  label: "Major — breaking change" },
  { value: "minor",  label: "Minor — additive" },
  { value: "bugfix", label: "Bug fix" },
]

export const STATUS_VARIANT = {
  active:   { label: "Active",   variant: "default" },
  released: { label: "Released", variant: "secondary" },
}

export const CURRENT_RELEASE_VERSION = "7.1.1"

export function bumpReleaseVersion(version, type) {
  const [major, minor, patch] = version.split(".").map(Number)
  if (type === "major") return `${major + 1}.0.0`
  if (type === "minor") return `${major}.${minor + 1}.0`
  if (type === "bugfix") return `${major}.${minor}.${patch + 1}`
  return version
}

export function fileAppCloud(f) {
  const cloud = Array.isArray(f.cloud) ? f.cloud.join(", ") || "—" : f.cloud || "—"
  const app   = Array.isArray(f.app)   ? f.app.join(", ")         : f.app   || "—"
  return `${app} / ${cloud}`
}

export function versionOptionsFor(file) {
  const opts = []
  const versions = file.versions ?? []

  // Latest version — prefer ui_state === "Latest", fallback to is_latest flag or latestInputVersion
  const latestVer = versions.find((v) => v.ui_state === "Latest" || v.is_latest)
  const latestVersion = latestVer?.version ?? file.latestInputVersion ?? file.version
  if (latestVersion) {
    opts.push({ value: latestVersion, label: `${latestVersion} — Latest version`, isRollback: false })
  }

  // Rollback versions — ui_state === "Rollback"
  const rollbackVers = versions.filter((v) => v.ui_state === "Rollback")
  rollbackVers.forEach((rv) => {
    opts.push({
      value:      `${rv.version}-rollback`,
      label:      `${rv.version} — Previous version (rollback)`,
      isRollback: true,
      versionId:  rv.version_id,
    })
  })

  // Legacy fallback for old FILE_STATUS shape
  if (opts.length === 0) {
    const legacyApproved = versions.find(
      (v) => v.status === FILE_STATUS.APPROVED || v.status === "Released"
    )
    const approvedVersion = legacyApproved?.version ?? file.version
    if (approvedVersion) {
      opts.push({ value: approvedVersion, label: `${approvedVersion} — Latest version`, isRollback: false })
    }
    const legacyRollback = versions.find((v) => v.status === FILE_STATUS.ROLLBACK)
    if (legacyRollback) {
      opts.push({ value: `${legacyRollback.version}-rollback`, label: `${legacyRollback.version} — Previous version (rollback)`, isRollback: true })
    } else if (file.status === FILE_STATUS.ROLLBACK) {
      opts.push({ value: `${file.version}-rollback`, label: `${file.version} — Previous version (rollback)`, isRollback: true })
    }
  }

  return opts
}
