import React, { useState } from "react"
import { Tag, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/DataTable/DataTable"
import { ReleaseBadge } from "./ReleaseBadge"

const releaseFileColumns = [
  {
    accessorKey: "name",
    header: "FILE",
    cell: ({ row }) => <span className="text-sm font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "version",
    header: "VERSION",
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-primary/80 border-primary text-primary-foreground text-xs font-mono">
        {row.getValue("version")}
      </Badge>
    ),
  },
  {
    accessorKey: "contributor",
    header: "CONTRIBUTED NAME",
    cell: ({ row }) => <span className="text-sm">{row.getValue("contributor") ?? "—"}</span>,
  },
  {
    accessorKey: "approvedDate",
    header: "APPROVED DATE",
    cell: ({ row }) => <span className="text-sm">{row.getValue("approvedDate") ?? "—"}</span>,
  },
  {
    accessorKey: "approvedBy",
    header: "APPROVED BY",
    cell: ({ row }) => <span className="text-sm">{row.getValue("approvedBy") ?? "—"}</span>,
  },
]

export function ReleaseAccordion({ release }) {
  const [open, setOpen] = useState(release.status === "active")

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
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
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && release.files.length > 0 && (
        <>
          <Separator />
          <DataTable
            columns={releaseFileColumns}
            data={release.files}
            emptyMessage="No files in this release."
            loading={false}
            error={null}
          />
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
