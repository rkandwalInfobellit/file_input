import { Tag } from "lucide-react"

export default function Release() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
      <Tag className="h-10 w-10 opacity-40" />
      <p className="text-sm font-medium">Release</p>
      <p className="text-xs">Create and manage file releases.</p>
    </div>
  )
}
