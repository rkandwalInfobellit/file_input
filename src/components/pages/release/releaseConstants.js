import { FILE_STATUS } from "@/store/slice/filterOptions.slice"

export const RELEASE_TYPE_OPTIONS = [
  { value: "major",   label: "Major — breaking change" },
  { value: "minor",   label: "Minor — additive" },
  { value: "bug_fix", label: "Bug fix" },
]

export const STATUS_VARIANT = {
  active:   { label: "Active",   variant: "default" },
  released: { label: "Released", variant: "secondary" },
}

export function bumpReleaseVersion(version, type) {
  const clean = (version ?? "0.0.1").replace(/^v/i, "")
  const [major, minor, patch] = clean.split(".").map(Number)
  if (type === "major")   return `v${major + 1}.0.0`
  if (type === "minor")   return `v${major}.${minor + 1}.0`
  if (type === "bug_fix") return `v${major}.${minor}.${patch + 1}`
  return version
}

export function versionOptionsFor(file) {
  const opts     = []
  const versions = file.versions ?? []

  const latestVer     = versions.find((v) => v.ui_state === "Latest" || v.is_latest)
  const latestVersion = latestVer?.version ?? file.latestInputVersion ?? file.version
  if (latestVersion) {
    opts.push({
      value:      latestVersion,
      label:      `${latestVersion.toUpperCase()} — Latest Version`,
      isRollback: false,
    })
  }

  versions
    .filter((v) => v.ui_state === "Rollback")
    .forEach((rv) => {
      opts.push({
        value:      `${rv.version}-rollback`,
        label:      `${rv.version.toUpperCase()} — Previous Version (Rollback)`,
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
      opts.push({ value: approvedVersion, label: `${approvedVersion.toUpperCase()} — Latest Version`, isRollback: false })
    }
    const legacyRollback = versions.find((v) => v.status === FILE_STATUS.ROLLBACK)
    if (legacyRollback) {
      opts.push({ value: `${legacyRollback.version}-rollback`, label: `${legacyRollback.version.toUpperCase()} — Previous Version (Rollback)`, isRollback: true })
    } else if (file.status === FILE_STATUS.ROLLBACK) {
      opts.push({ value: `${file.version}-rollback`, label: `${file.version.toUpperCase()} — Previous Version (Rollback)`, isRollback: true })
    }
  }

  return opts
}
