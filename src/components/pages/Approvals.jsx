import { SquareCheckBig } from "lucide-react"

export default function Approvals() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
      <SquareCheckBig className="h-10 w-10 opacity-40" />
      <p className="text-sm font-medium">Approvals</p>
      <p className="text-xs">Review and act on files pending your approval.</p>
    </div>
  )
}
