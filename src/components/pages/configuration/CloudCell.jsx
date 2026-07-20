import { Badge } from "@/components/ui/badge"
import { CLOUD_VARIANT } from "./constants"

export default function CloudCell({ cloud }) {
  const tags    = Array.isArray(cloud) ? cloud : [cloud]
  const visible = tags.slice(0, 2)
  const rest    = tags.length - 2
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((t, i) => (
        <Badge key={t} variant={CLOUD_VARIANT[i % CLOUD_VARIANT.length]} className="text-xs font-semibold">
          {t}
        </Badge>
      ))}
      {rest > 0 && <Badge variant="outline" className="text-[10px]">+{rest}</Badge>}
    </div>
  )
}
