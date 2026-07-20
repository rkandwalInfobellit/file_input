import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { CLOUD_VARIANT } from "./constants"
import { cn } from "@/lib/utils";

export default function CloudCell({ cloud, variant="default", className="" }) {
  const tags    = Array.isArray(cloud) ? cloud : [cloud]
  const visible = tags.slice(0, 2)
  const hidden  = tags.slice(2)

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 flex-wrap">
        {visible.map((t, i) => (
          <Badge key={t} variant = {variant} color={ variant =="default"?[i== 0 ? "ghost" : "accent"]:""} className={cn("text-xs font-semibold cursor-default", className)}>
            {t}
          </Badge>
        ))}

        {hidden.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] cursor-pointer">
                +{hidden.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              {hidden.join(", ")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
