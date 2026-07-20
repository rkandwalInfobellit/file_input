import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import CloudCell from "./CloudCell"
import ApproverCell from "./ApproverCell"

export function makeColumns(onEdit, onDelete, onToggle, togglingId) {
  return [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.index + 1}</span>,
    },
    {
      accessorKey: "display_name",
      header: "CATEGORY",
      cell: ({ row }) => <span className="text-sm font-medium">{row.getValue("display_name")}</span>,
    },
    {
      accessorKey: "clouds",
      header: "CLOUD",
      cell: ({ row }) => <CloudCell cloud={row.getValue("clouds") ?? []} />,
    },
    {
      accessorKey: "governed_apps",
      header: "APPLICATION",
      cell: ({ row }) => {
        const apps = row.getValue("governed_apps") ?? []
        return (
          <div className="flex flex-wrap gap-1">
            {apps.map((a) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
          </div>
        )
      },
    },
    {
      accessorKey: "approval_mode",
      header: "APPROVE TYPE",
      cell: ({ row }) => {
        const mode = row.getValue("approval_mode") ?? ""
        return <span className="text-sm capitalize">{mode}</span>
      },
    },
    {
      accessorKey: "approvers",
      header: "APPROVER",
      cell: ({ row }) => {
        const approvers = (row.getValue("approvers") ?? []).map((a) => a.full_name)
        return <ApproverCell approvers={approvers} />
      },
    },
    {
      accessorKey: "is_active",
      header: "ACTIVE",
      cell: ({ row }) => (
        <Switch
          checked={!!row.getValue("is_active")}
          disabled={togglingId === row.original.category_id}
          onCheckedChange={(checked) => onToggle(row.original.category_id, checked)}
        />
      ),
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onEdit(row.original)}
            title="Edit category"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onDelete(row.original)}
            title="Delete category"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]
}
