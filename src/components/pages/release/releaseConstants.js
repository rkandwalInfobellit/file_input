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

  const latestApprovedVer = (file.versions ?? []).find(
    (v) => v.status === FILE_STATUS.APPROVED || v.status === "Released"
  )
  const approvedVersion = latestApprovedVer?.version ?? file.version
  opts.push({ value: approvedVersion, label: `${approvedVersion} — Latest version`, isRollback: false })

  const rollbackVer = (file.versions ?? []).find((v) => v.status === FILE_STATUS.ROLLBACK)
  if (rollbackVer) {
    opts.push({ value: `${rollbackVer.version}-rollback`, label: `${rollbackVer.version} — Previous version (rollback)`, isRollback: true })
  } else if (file.status === FILE_STATUS.ROLLBACK) {
    opts.push({ value: `${file.version}-rollback`, label: `${file.version} — Previous version (rollback)`, isRollback: true })
  }

  return opts
}
