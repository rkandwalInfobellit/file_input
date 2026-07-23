import React from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { versionOptionsFor } from "./releaseConstants"

// ---------------------------------------------------------------------------
// Draft-file columns (used inside CreateReleaseSheet)
// Accepts live state refs via a single config object so columns stay stable.
// ---------------------------------------------------------------------------
export function makeDraftColumns({ selected, versions, rollbackReasons, toggleFile, onVersionChange }) {
  return [
    {
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <Checkbox
          checked={!!selected[row.original.id]}
          onCheckedChange={() => toggleFile(row.original.id)}
        />
      ),
    },
    {
      accessorKey: "categoryDisplayName",
      header: "FILE",
      cell: ({ row }) => (
        <span className="font-semibold text-sm">{row.getValue("categoryDisplayName")}</span>
      ),
    },
    {
      id: "app",
      header: "APP",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {(row.original.app ?? []).join(", ") || "—"}
        </span>
      ),
    },
    {
      id: "cloud",
      header: "CLOUD",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {(row.original.cloud ?? []).join(", ") || "—"}
        </span>
      ),
    },
    {
      id: "includeVersion",
      header: "INCLUDE VERSION",
      cell: ({ row }) => {
        const f      = row.original
        const opts   = versionOptionsFor(f)
        const chosen = versions[f.id] ?? opts[0]?.value
        return (
          <Select
            value={chosen}
            onValueChange={(v) => onVersionChange(f, v)}
            disabled={opts.length === 0}
          >
            <SelectTrigger className="h-7 text-xs w-56">
              <SelectValue>
                {opts.find((o) => o.value === chosen)?.label ?? chosen}
              </SelectValue>
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
        const f         = row.original
        const opts      = versionOptionsFor(f)
        const chosen    = versions[f.id] ?? opts[0]?.value
        const opt       = opts.find((o) => o.value === chosen) ?? opts[0]
        const hasReason = !!rollbackReasons[f.id]?.trim()

        return opt?.isRollback ? (
          <Badge
            variant="outline"
            className={`text-[10px] ${hasReason ? "text-amber-600 border-amber-400" : "text-muted-foreground"}`}
          >
            {hasReason ? "Rollback · reason set" : "Pinned · reason needed"}
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

// ---------------------------------------------------------------------------
// Release-history file columns (used inside ReleaseAccordion)
// ---------------------------------------------------------------------------
export const releaseFileColumns = [
  {
    accessorKey: "name",
    header: "FILE",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    id: "app",
    header: "APP",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.app || "—"}
      </span>
    ),
  },
  {
    id: "cloud",
    header: "CLOUD",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.cloud || "—"}
      </span>
    ),
  },
  {
    accessorKey: "version",
    header: "VERSION",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="bg-primary/80 border-primary text-primary-foreground text-xs font-mono"
      >
        {row.getValue("version") ?? "—"}
      </Badge>
    ),
  },
  {
    id: "versionState",
    header: "STATE",
    cell: ({ row }) => {
      const state = row.original.uiState
      return (
        <Badge variant={state === "Latest" ? "secondary" : "outline"} className="text-[10px]">
          {state ?? "—"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "contributor",
    header: "CONTRIBUTOR",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("contributor") ?? "—"}</span>
    ),
  },
  {
    accessorKey: "approvedDate",
    header: "APPROVED DATE",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("approvedDate") ?? "—"}</span>
    ),
  },
  {
    accessorKey: "approvedBy",
    header: "APPROVED BY",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("approvedBy") ?? "—"}</span>
    ),
  },
]
