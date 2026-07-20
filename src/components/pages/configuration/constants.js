export const APPROVE_TYPES = [
  { value: "dependent",   label: "Dependent",   description: "All selected approvers must approve" },
  { value: "independent", label: "Independent", description: "Any one approver is enough" },
]

export const CLOUD_VARIANT = ["default", "secondary", "destructive", "outline"]

export const AVATAR_BG = [
  "bg-[hsl(var(--chart-1))]",
  "bg-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-4))]",
  "bg-[hsl(var(--chart-5))]",
]

export const EMPTY_FORM = {
  display_name:  "",
  governed_apps: [],
  clouds:        [],
  approval_mode: "",
  approvers:     [],   // [{ type, email, full_name }]
  file:          null, // File object for template upload
}

export function slugify(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
}

export function initials(name) {
  return (name ?? "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}
