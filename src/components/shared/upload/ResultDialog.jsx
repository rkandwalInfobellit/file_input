import React from "react";
import { XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

function StatusChip({ label, value, tone }) {
  const toneMap = {
    good: {
      bg: "bg-[color-mix(in_oklch,var(--status-ready)_15%,white)]",
      fg: "text-[var(--status-ready)]",
    },
    warn: {
      bg: "bg-[color-mix(in_oklch,var(--status-warning)_15%,white)]",
      fg: "text-[var(--status-warning-foreground)]",
    },
    bad: {
      bg: "bg-[color-mix(in_oklch,var(--destructive)_15%,white)]",
      fg: "text-destructive",
    },
  };
  const c = toneMap[tone];
  return (
    <div className={`flex-1 rounded-lg px-4 py-3 ${c.bg}`}>
      <div className={`text-[10px] font-bold tracking-wider mb-1 ${c.fg}`}>
        {label}
      </div>
      <div className={`text-base font-bold ${c.fg}`}>{value}</div>
    </div>
  );
}

function ValidationRow({ row, field, message }) {
  return (
    <div className="flex items-start gap-6 py-3 border-t text-sm">
      <div className="w-40 shrink-0 text-muted-foreground">
        {row} · {field}
      </div>
      <div>{message}</div>
    </div>
  );
}

function FailedCard({ fileName, validationErrors }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-2.5">
          <XCircle size={20} className="mt-0.5 text-destructive" />
          <div>
            <div className="font-bold text-[15px]">
              Validation result —{" "}
              <span className="font-mono font-normal text-sm">{fileName}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Submitted just now
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold rounded-full px-2.5 py-1 flex items-center gap-1 shrink-0 bg-[color-mix(in_oklch,var(--destructive)_15%,white)] text-destructive">
          ● Failed
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <StatusChip label="TEMPLATE" value="Pass" tone="good" />
        <StatusChip label="SCHEMA" value="1 warn" tone="warn" />
        <StatusChip
          label="REFERENCES"
          value={`${validationErrors.length} error${validationErrors.length !== 1 ? "s" : ""}`}
          tone="bad"
        />
      </div>

      {validationErrors.map((e, i) => (
        <ValidationRow
          key={i}
          row={e.row}
          field={e.field}
          message={e.message}
        />
      ))}

      <div className="mt-3 pt-3 border-t text-sm font-medium flex items-center gap-1.5 text-destructive">
        ✕ File not submitted. Fix errors and re-upload.
      </div>
    </div>
  );
}

function ApiErrorCard({ message }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start gap-2.5 mb-4">
        <XCircle size={20} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <div className="font-bold text-[15px]">Submission failed</div>
          <div className="text-xs text-muted-foreground">The server rejected this request</div>
        </div>
      </div>
      <div className="rounded-md border border-destructive/30 bg-[color-mix(in_oklch,var(--destructive)_10%,white)] px-4 py-3 text-sm text-destructive leading-relaxed">
        {message}
      </div>
    </div>
  );
}

function PassedCard({ fileName }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-2.5">
          <CheckCircle2
            size={20}
            className="mt-0.5 text-[var(--status-ready)]"
          />
          <div>
            <div className="font-bold text-[15px]">
              Validation result —{" "}
              <span className="font-mono font-normal text-sm">{fileName}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Submitted just now
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold rounded-full px-2.5 py-1 flex items-center gap-1 shrink-0 bg-[color-mix(in_oklch,var(--status-ready)_15%,white)] text-[var(--status-ready)]">
          ● Passed
        </span>
      </div>

      <div className="flex gap-3 mb-5">
        <StatusChip label="TEMPLATE" value="Pass" tone="good" />
        <StatusChip label="SCHEMA" value="Pass" tone="good" />
        <StatusChip label="REFERENCES" value="Pass" tone="good" />
      </div>

      <div className="rounded-md px-4 py-3 text-sm mb-5 bg-[color-mix(in_oklch,var(--status-ready)_12%,white)] text-[var(--status-ready)]">
        <span className="font-semibold">✓ File submitted successfully.</span>{" "}
        Status is now{" "}
        <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-card text-[var(--status-ready)]">
          Submitted
        </span>
        . Assigned approvers have been notified via UI and Email.
      </div>

      <p className="text-sm leading-relaxed mb-4">
        <span className="font-semibold">Next step:</span> Approvers review and
        approve or reject per the chosen mode (dependent = all; independent =
        any one). On final approval, the file's input-file version (X.Y.Z) is
        committed and becomes available for release tagging.
      </p>

      <div className="rounded-md px-4 py-3 text-sm leading-relaxed bg-[color-mix(in_oklch,var(--status-warning)_15%,white)] text-[var(--status-warning-foreground)]">
        <span className="font-semibold">Carried-forward path:</span> if change
        type = "No change / Carried forward", the file still goes to the
        approver, who is notified to{" "}
        <span className="font-semibold">challenge/reject</span> the no-change.
        If the approver doesn't act within{" "}
        <span className="font-semibold">2 working days</span>, it{" "}
        <span className="font-semibold">auto-approves</span> and the version
        stays unchanged.
      </div>
    </div>
  );
}

export function ResultDialog({ open, onClose, result }) {
  if (!result) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-semibold text-xl">
            {result.status === "passed"
              ? "Validation Passed"
              : result.status === "error"
              ? "Submission Error"
              : "Validation Failed"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {result.status === "passed" ? (
            <PassedCard fileName={result.fileName} />
          ) : result.status === "error" ? (
            <ApiErrorCard message={result.message} />
          ) : (
            <FailedCard
              fileName={result.fileName}
              validationErrors={result.validationErrors}
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
