import { Cog } from "lucide-react"

export default function Configuration() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
      <Cog className="h-10 w-10 opacity-40" />
      <p className="text-sm font-medium">Configuration</p>
      <p className="text-xs">Manage governance settings and rules.</p>
    </div>
  )
}
