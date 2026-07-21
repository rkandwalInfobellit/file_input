import { Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export const fileCatalogColumns = [
  {
    accessorKey: "file_name",
    header: "FILE",
    cell: ({ row }) => (
      <p className="text-primary font-semibold truncate max-w-44">
        {row.getValue("file_name") ?? "-"}
      </p>
    ),
  },
  {
    accessorKey: "governed_app",
    header: "APP"
  },
  {
    accessorKey: "cloud",
    header: "CLOUD",
  },
  {
    accessorKey: "category_display_name",
    header: "FILE TYPE", 
  },
  {
    accessorKey: "input_version",
    header: "VERSION"
  },
  {
    accessorKey: "approvers",
    header: "APPROVER",
    cell: ({ row }) => {
      const approvers = row.getValue("approvers") ?? []
      if (!approvers.length) return <span className="text-muted-foreground text-xs">—</span>
      const visible = approvers.slice(0, 1)
      const rest    = approvers.length - 1
      return (
        <TooltipProvider>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs">{visible[0]?.full_name}</span>
            {rest > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] cursor-default">+{rest}</Badge>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {approvers.slice(1).map((a) => a.full_name).join(", ")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "submitted_by",
    header: "Contributor",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground truncate max-w-32 block">
        {row.getValue("submitted_by") ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "display_status",
    header: "STATUS",
    cell: ({ row }) => {
      const raw     = row.original.status ?? ""
      const display = row.getValue("display_status") ?? raw;
      return display ? <Badge status={raw} className="text-xs capitalize">{display}</Badge> : "-"
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const fileId   = row.original.file_id
      const fileName = row.original.file_name
      return (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.options.meta?.onView?.(fileId)}
                >
                  <Eye className="h-4 w-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View {fileName}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    },
  },
]
