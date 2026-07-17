import { Download, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const CATEGORY_VARIANT = {
  "Business Rules": "secondary",
  "Scaler Data": "secondary",
  "Remarks": "secondary",
  "MRD": "secondary",
  "System / EPDW": "outline",
  "System / H5": "outline",
  "Pricing / AWS": "default",
}

export const STATUS_VARIANT = {
  pending: "destructive",
  inReview: "secondary",
  rejected: "destructive",
  staged: "outline",
  released: "default",
}

export const STATUS_LABEL = {
  pending: "Pending Approval",
  inReview: "In Review",
  rejected: "Rejected",
  staged: "Staged",
  released: "Released",
}

export const fileCatalogColumns = [
  {
    accessorKey: "name",
    header: "FILE",
    cell: ({ row }) => <p className="text-primary font-semibold truncate line-clamp-1 max-w-41.75"> {row.getValue("name") ?? "-"} </p>,
  },
  {
    accessorKey: "app",
    header: "APP",
    cell: ({ row }) => row.getValue("app")?.join(" / ") ?? "-"
  },
  {
    accessorKey: "cloud",
    header: "CLOUD",
    cell: ({ row }) => row.getValue("cloud")?.join(" / ") ?? "-"
  },
  {
    accessorKey: "category",
    header: "FILE TYPE",

    cell: ({ row }) => <p className="truncate line-clamp-1 max-w-36"> {row.getValue("category") ?? "-"} </p>,
  },
  {
    accessorKey: "version",
    header: "FILE VERSION",
  },
  {
    accessorKey: "approver",
    header: "APPROVER",
  },
  {
    accessorKey: "contributor",
    header: "CONTRIBUTOR",
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => row.original.status ? <Badge status={row.original.status}>{row.original.status}</Badge> : "-",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const fileUrl = row.original.file
      const fileName = row.original.name
      const fileId = row.original.id
      return (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!fileUrl}
                onClick={() => table.options.meta?.onView?.(fileId)}
              >
                <Eye className="h-4 w-4 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View {fileName}</TooltipContent>
          </Tooltip>
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
                <Download className="h-4 w-4  text-primary" />
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
  { status: "released", label: "Released", desc: "Tagged to a Recommendation Version" },
  { status: "staged", label: "Staged", desc: "Approved, available for tagging" },
  { status: "inReview", label: "In Review", desc: "With approvers" },
  { status: "pending", label: "Pending Approval", desc: "Awaiting decision" },
  { status: "rejected", label: "Rejected", desc: "Returned to contributor" },
]
