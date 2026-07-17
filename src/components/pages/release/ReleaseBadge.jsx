import React from "react"
import { Badge } from "@/components/ui/badge"
import { STATUS_VARIANT } from "./releaseConstants"

export function ReleaseBadge({ status }) {
  const cfg = STATUS_VARIANT[status] ?? { label: status, variant: "outline" }
  return <Badge variant={cfg.variant}>● {cfg.label}</Badge>
}
