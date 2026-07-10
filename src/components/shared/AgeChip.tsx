import { cn } from "@/lib/utils"

type Status = "info" | "warning" | "overdue" | "ready"

interface AgeChipProps {
  /** e.g. "2d 3h" */
  age: string
  status: Status
  className?: string
}

const styles: Record<Status, string> = {
  info: "bg-status-info/10 text-status-info",
  warning: "bg-status-warning/15 text-status-warning-foreground dark:text-status-warning",
  overdue: "bg-status-overdue/10 text-status-overdue",
  ready: "bg-status-ready/10 text-status-ready",
}

const dotStyles: Record<Status, string> = {
  info: "bg-status-info",
  warning: "bg-status-warning",
  overdue: "bg-status-overdue",
  ready: "bg-status-ready",
}

/**
 * Renders a duration as a colored SLA chip. This is the one visual idiom
 * repeated everywhere in the app: every age, once it crosses 48h, turns
 * from steel to amber to red — consistently, regardless of where it's shown.
 */
export function AgeChip({ age, status, className }: AgeChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-xs font-medium tabular-nums",
        styles[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[status], status === "overdue" && "animate-pulse")} />
      {age}
    </span>
  )
}

/** Derives a chip status from an elapsed-hours count against the 48h SLA. */
export function statusFromHours(hours: number): Status {
  if (hours >= 48) return "overdue"
  if (hours >= 36) return "warning"
  return "info"
}
