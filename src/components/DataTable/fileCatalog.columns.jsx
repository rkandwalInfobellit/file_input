import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
        <Badge variant="outline" color="secondary">
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "app",
    header: "App",
    cell: ({ row }) => (
      <span >{row.getValue("app").join(" / ")}</span>
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
          {clouds.join (" / ")}
        </div>
      )
    },
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => (
      <Badge variant="outline" color="primary">
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
    cell: ({ row }) => {
      const fileUrl = row.original.file
      const fileName = row.original.name
      return (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!fileUrl}
                onClick={async () => {
                  try {
                    const res = await fetch(fileUrl)
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = fileName
                    a.click()
                    URL.revokeObjectURL(url)
                  } catch {
                    window.open(fileUrl, "_blank")
                  }
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download {fileName}</TooltipContent>
          </Tooltip>
        </div>
      )
    },
  },
]

export const LEGEND = [
  { status: "released", label: "Released",       desc: "Tagged to a Recommendation Version" },
  { status: "staged",   label: "Staged",          desc: "Approved, available for tagging" },
  { status: "inReview", label: "In Review",        desc: "With approvers" },
  { status: "pending",  label: "Pending Approval", desc: "Awaiting decision" },
  { status: "rejected", label: "Rejected",         desc: "Returned to contributor" },
]
