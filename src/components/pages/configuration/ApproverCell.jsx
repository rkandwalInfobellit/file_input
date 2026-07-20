import { Badge } from "@/components/ui/badge"
import { AVATAR_BG, initials } from "./constants"

export default function ApproverCell({ approvers }) {
  const visible = approvers.slice(0, 2)
  const rest    = approvers.length - 2
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visible.map((a, i) => (
        <div key={a} className="flex items-center gap-1">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold shrink-0 text-white ${AVATAR_BG[i % AVATAR_BG.length]}`}
            title={a}
          >
            {initials(a)}
          </span>
          <span className="text-xs font-medium">{a}</span>
        </div>
      ))}
      {rest > 0 && <Badge variant="outline" className="text-[10px]">+{rest} more</Badge>}
    </div>
  )
}
