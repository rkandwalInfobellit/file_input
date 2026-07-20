import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export default function DeleteDialog({ open, rule, onClose, onConfirm }) {
  if (!rule) return null

  function handleConfirm() {
    if (!rule.category_id) {
      throw new Error(`DeleteDialog: rule is missing category_id — got: ${JSON.stringify(rule)}`)
    }
    onConfirm(rule.category_id)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            Delete category
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{rule.display_name}</span>?
          <div className="mt-2 rounded-md border bg-muted/40 px-4 py-3 text-sm space-y-1">
            <div><span className="text-muted-foreground">Category ID:</span> {rule.category_id}</div>
            <div><span className="text-muted-foreground">Apps:</span> {(rule.governed_apps ?? []).join(", ") || "—"}</div>
            <div><span className="text-muted-foreground">Clouds:</span> {(rule.clouds ?? []).join(", ") || "—"}</div>
          </div>
          <p className="mt-3 text-xs">This action cannot be undone.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
