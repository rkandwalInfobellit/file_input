import { z } from "zod";

export const uploadSchema = z.object({
  name: z.string().min(1,"Name is required field"),
  application: z.string().min(1, "Application is required"),
  cloud: z.string().min(1, "Cloud is required"),
  fileCategory: z.string().min(1, "File category is required"),
  changeType: z.string().min(1, "Change type is required"),
  approvers: z.array(z.string()).min(1, "Select at least one approver"),
  description: z.string().optional(),
  file: z
    .any()
    .refine((f) => f instanceof File, "Please upload a file")
    .refine(
      (f) => !(f instanceof File) || f.size <= 200 * 1024 * 1024,
      "Max file size is 200 MB",
    ),
});

export const CHANGE_TYPE_OPTIONS = [
  { value: "major", label: "Major — breaking change" },
  { value: "minor", label: "Minor — additive" },
  { value: "bugfix", label: "Bug fix" },
  { value: "no-change", label: "No change / Carried forward" },
];

export const APPROVER_OPTIONS = [
  { value: "approver-a", label: "Approver A" },
  { value: "approver-b", label: "Approver B" },
  { value: "approver-c", label: "Approver C" },
];

export const CURRENT_VERSION = "0.0.0";

export function bumpVersion(version, changeType) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (changeType === "major") return `${major + 1}.0.0`;
  if (changeType === "minor") return `${major}.${minor + 1}.0`;
  if (changeType === "bugfix") return `${major}.${minor}.${patch + 1}`;
  return version;
}
