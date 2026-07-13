import { GitBranch } from "lucide-react"

export default function Versioning() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
      <GitBranch className="h-10 w-10 opacity-40" />
      <p className="text-sm font-medium">Versioning</p>
      <p className="text-xs">Track file versions and diff history.</p>
    </div>
  )
}
