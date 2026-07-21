import { z } from "zod";

export const uploadSchema = z.object({
  governed_apps: z.array(z.string()).min(1, "Select at least one application"),
  clouds:        z.array(z.string()).min(1, "Select at least one cloud"),
  category_id:   z.string().min(1, "File category is required"),
  change_type:   z.string().min(1, "Change type is required"),
  description:   z.string().optional(),
  file: z
    .any()
    .refine((f) => f instanceof File, "Please upload a file")
    .refine(
      (f) => !(f instanceof File) || f.size <= 200 * 1024 * 1024,
      "Max file size is 200 MB",
    ),
});

export const CHANGE_TYPE_OPTIONS = [
  { value: "major",     label: "Major — breaking change" },
  { value: "minor",     label: "Minor — additive" },
  { value: "bugfix",    label: "Bug fix" },
  { value: "no-change", label: "No change / Carried forward" },
];

export const CURRENT_VERSION = "0.0.0";

export function bumpVersion(version, changeType) {
  const raw = version.startsWith("v") ? version.slice(1) : version;
  const [major, minor, patch] = raw.split(".").map(Number);
  const prefix = version.startsWith("v") ? "v" : "";
  if (changeType === "major") return `${prefix}${major + 1}.0.0`;
  if (changeType === "minor") return `${prefix}${major}.${minor + 1}.0`;
  if (changeType === "bugfix") return `${prefix}${major}.${minor}.${patch + 1}`;
  return version;
}
