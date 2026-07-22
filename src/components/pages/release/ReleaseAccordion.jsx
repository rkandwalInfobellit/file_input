import React from "react"
import { Tag, User, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/DataTable/DataTable"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ReleaseBadge } from "./ReleaseBadge"

const releaseFileColumns = [
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
        <Badge
          variant={state === "Latest" ? "secondary" : "outline"}
          className="text-[10px]"
        >
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

function fmt(isoString) {
  if (!isoString) return "—"
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

export function ReleaseAccordion({ release }) {
  const files = release.files ?? []

  return (
    <Accordion
      defaultValue={release.isActive ? [release.id] : []}
      className="rounded-lg border bg-card overflow-hidden"
    >
      <AccordionItem value={release.id} className="border-0">
        {/* Trigger */}
        <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline transition-colors text-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-semibold truncate">{release.name}</span>
            <Badge variant="outline" className="text-[10px] font-mono shrink-0">
              {release.version}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] capitalize shrink-0 hidden sm:inline-flex"
            >
              {release.type}
            </Badge>
          </div>
          <ReleaseBadge status={release.status} />
        </AccordionTrigger>

        {/* Content */}
        <AccordionContent className="px-0 pb-0">
          <Separator />

          {/* Meta strip */}
          <div className="px-5 py-3 flex flex-wrap gap-x-6 gap-y-1.5 bg-muted/20 border-b">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>
                Created by{" "}
                <span className="font-medium text-foreground">
                  {release.createdBy ?? "—"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Created{" "}
                <span className="font-medium text-foreground">
                  {fmt(release.createdAt)}
                </span>
              </span>
            </div>
            {release.releasedAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  Released{" "}
                  <span className="font-medium text-foreground">
                    {fmt(release.releasedAt)}
                  </span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span>
                <span className="font-medium text-foreground">
                  {release.totalItems ?? files.length}
                </span>{" "}
                file{(release.totalItems ?? files.length) !== 1 ? "s" : ""}
              </span>
            </div>
            {release.notes && (
              <div className="text-xs text-muted-foreground italic">
                "{release.notes}"
              </div>
            )}
          </div>

          {/* Files table */}
          {files.length > 0 ? (
            <DataTable
              columns={releaseFileColumns}
              data={files}
              emptyMessage="No files in this release."
              loading={false}
              error={null}
            />
          ) : (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              No files in this release.
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
