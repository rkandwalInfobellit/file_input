import { Badge } from "@/components/ui/badge" 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ApproverCell({ approvers }) {
  const visible = approvers.slice(0, 2)
  const rest    = approvers.length - 2
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-secondary-foreground">{visible.join(", ")}</span>
      {rest > 0 && <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="text-[10px] cursor-pointer">+{rest} more</Badge>
          </TooltipTrigger>
          <TooltipContent >
            {approvers.slice(2)?.join(", ")}
          </TooltipContent>
          </Tooltip></TooltipProvider>}
    </div>
  )
}
