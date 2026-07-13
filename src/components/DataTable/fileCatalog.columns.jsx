import { MoreHorizontal, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CATEGORY_VARIANT = {
  "Business Rules": "secondary",
  "Scaler Data":    "secondary",
  "Remarks":        "secondary",
  "MRD":            "secondary",
  "System / EPDW":  "outline",
  "System / H5":    "outline",
  "Pricing / AWS":  "default",
}

export const STATUS_VARIANT = {
  pending:  "destructive",
  inReview: "secondary",
  rejected: "destructive",
  staged:   "outline",
  released: "default",
}

export const STATUS_LABEL = {
  pending:  "Pending Approval",
  inReview: "In Review",
  rejected: "Rejected",
  staged:   "Staged",
  released: "Released",
}

export const fileCatalogColumns = [
  {
    accessorKey: "name",
    header: "File",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category")
      return (
        <Badge variant={CATEGORY_VARIANT[category] ?? "outline"}>
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "app",
    header: "App",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("app").join(", ")}</span>
    ),
  },
  {
    accessorKey: "cloud",
    header: "Cloud",
    cell: ({ row }) => {
      const clouds = row.getValue("cloud")
      if (!clouds?.length) return <span className="text-muted-foreground">—</span>
      return (
        <div className="flex gap-1 flex-wrap">
          {clouds.map((c) => (
            <Badge key={c} variant="outline" className="font-mono text-xs">{c}</Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue("version")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status")
      if (!status) return <span className="text-sm text-muted-foreground">—</span>
      return (
        <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
          {STATUS_LABEL[status] ?? status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => console.log("edit", row.original.id)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export const LEGEND = [
  { status: "released", label: "Released",       desc: "Tagged to a Recommendation Version" },
  { status: "staged",   label: "Staged",          desc: "Approved, available for tagging" },
  { status: "inReview", label: "In Review",        desc: "With approvers" },
  { status: "pending",  label: "Pending Approval", desc: "Awaiting decision" },
  { status: "rejected", label: "Rejected",         desc: "Returned to contributor" },
]
