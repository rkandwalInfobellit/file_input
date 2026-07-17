import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export function RollbackDialog({ open, onClose, rollbackFiles, onConfirm }) {
  const [reasons, setReasons] = useState({})

  function setReason(fileId, val) {
    setReasons((r) => ({ ...r, [fileId]: val }))
  }

  const allFilled = rollbackFiles.every((f) => reasons[f.id]?.trim())

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            Roll back file
            <Badge variant="destructive" className="text-[10px] tracking-wider">SUPER ADMIN</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 py-2">
          {/* Left: per-file reason inputs */}
          <div className="flex-1 flex flex-col gap-5">
            {rollbackFiles.map((f) => (
              <div key={f.id} className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground font-medium">Roll back from</div>
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2.5 text-sm font-medium">
                  <span>{f.name} {f.selectedVersion?.replace("-rollback", "")}</span>
                  <Badge variant="secondary" className="text-[10px]">APPROVED</Badge>
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1">Roll back to</div>
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2.5 text-sm font-medium">
                  <span>{f.rollbackVersion}</span>
                  <Badge variant="secondary" className="text-[10px]">APPROVED</Badge>
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1">
                  Reason for rollback <span className="text-destructive">(required)</span>
                </div>
                <textarea
                  className="w-full min-h-20 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="Describe why this version is being rolled back…"
                  value={reasons[f.id] ?? ""}
                  onChange={(e) => setReason(f.id, e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  This reason will be included in notifications sent to approvers.
                </p>
              </div>
            ))}
          </div>

          {/* Right: consequences + notification preview */}
          <div className="w-56 shrink-0 flex flex-col gap-3">
            <p className="text-sm font-semibold">What happens on confirm</p>
            <ul className="text-xs text-muted-foreground space-y-2.5 list-disc pl-4">
              <li>The release file list updates to tag the rollback version for this file.</li>
              <li>An email + notification is sent to the file approver(s) and contributor with the rollback reason.</li>
              <li>The rolled-back version stays in history; nothing is deleted.</li>
              <li>The super-admin can then tag files and create the release.</li>
            </ul>

            <Separator />

            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground">NOTIFICATION PREVIEW</p>
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 flex items-start gap-2">
              <span className="mt-0.5 h-3 w-3 rounded-sm bg-destructive shrink-0" />
              <div>
                <p className="text-xs font-semibold">File Rolled Back</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                  "{Object.values(reasons)[0]?.slice(0, 60) ?? "…"}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button variant="destructive" disabled={!allFilled} onClick={() => onConfirm(reasons)}>
            Confirm rollback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
