import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import CloudCell from "./CloudCell";
import ApproverCell from "./ApproverCell";
import { Button } from "@/components/ui/button";

export function makeColumns(onEdit, onDelete, onToggle, togglingId) {
  return [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "clouds",
      header: "CLOUD",
      cell: ({ row }) => <CloudCell cloud={row.getValue("clouds") ?? []} />,
    },
    {
      accessorKey: "governed_apps",
      header: "APPLICATION",
       cell: ({ row }) => <CloudCell variant="outline" cloud={row.getValue("governed_apps") ?? []} className="text-xs font-medium" />,
    },
    {
      accessorKey: "display_name",
      header: "CATEGORY",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-medium">
          {row.getValue("display_name")}
        </Badge>
      ),
    },
    {
      accessorKey: "approval_mode",
      header: "APPROVE TYPE",
      cell: ({ row }) => {
        const mode = row.getValue("approval_mode") ?? "";
        return <span className="text-sm text-secondary-foreground capitalize">{mode}</span>;
      },
    },
    {
      accessorKey: "approvers",
      header: "APPROVER",
      cell: ({ row }) => {
        const approvers = (row.getValue("approvers") ?? []).map(
          (a) => a.full_name,
        );
        return <ApproverCell approvers={approvers} />;
      },
    },
    {
      accessorKey: "is_active",
      header: "ACTIVE",
      cell: ({ row }) => (
        <Switch
        className="cursor-pointer"
          checked={!!row.getValue("is_active")}
          disabled={togglingId === row.original.category_id}
          onCheckedChange={(checked) =>
            onToggle(row.original.category_id, checked)
          }
        />
      ),
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
          variant="ghost"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onEdit(row.original)}
            title="Edit category"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
          variant="ghost"
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onDelete(row.original)}
            title="Delete category"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
