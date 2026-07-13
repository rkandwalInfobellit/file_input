import React, { useState } from "react";
import {
  Folder,
  UploadCloud,
  CheckSquare,
  GitBranch,
  Tag,
  Settings,
  ChevronDown,
  Download,
  Play,
  Bell,
  Headphones,
  UserCircle2,
  XCircle,
  CheckCircle2,
  Inbox,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Design tokens (lifted directly from the product's index.css / globals.css)
// ---------------------------------------------------------------------------
const tokens = {
  background: "oklch(0.985 0.004 247)",
  foreground: "oklch(0.205 0.02 252)",
  card: "oklch(1 0 0)",
  primary: "oklch(48.1% 0.194 263.4)",
  mutedForeground: "oklch(0.5 0.02 252)",
  border: "oklch(0.9 0.01 250)",
  statusReady: "oklch(0.5 0.11 155)",
  statusReadyFg: "oklch(0.98 0.01 155)",
  statusWarning: "oklch(0.68 0.14 65)",
  statusWarningFg: "oklch(0.22 0.03 65)",
  statusOverdue: "oklch(0.5 0.17 25)",
  statusOverdueFg: "oklch(0.98 0.005 25)",
  statusInfo: "oklch(0.42 0.09 252)",
  sidebar: "oklch(95.5% 0 0)",
};

const navItems = [
  { label: "File Catalog", icon: Folder },
  { label: "Upload & Validate", icon: UploadCloud, active: true },
  { label: "Approvals", icon: CheckSquare, badge: 2 },
  { label: "Versioning", icon: GitBranch },
  { label: "Release", icon: Tag },
  { label: "Configuration", icon: Settings },
];

function Select({ placeholder }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between rounded-md border bg-white px-3.5 py-2.5 text-sm text-left"
      style={{ borderColor: tokens.border, color: tokens.mutedForeground }}
    >
      {placeholder}
      <ChevronDown size={16} className="shrink-0" />
    </button>
  );
}

function FieldLabel({ children }) {
  return (
    <div
      className="text-[11px] font-semibold tracking-wider mb-2"
      style={{ color: tokens.mutedForeground }}
    >
      {children}
    </div>
  );
}

function StatusChip({ label, value, tone }) {
  const toneMap = {
    good: { bg: "oklch(0.95 0.03 155)", fg: tokens.statusReady },
    warn: { bg: "oklch(0.96 0.04 65)", fg: "#92600a" },
    bad: { bg: "oklch(0.96 0.03 25)", fg: tokens.statusOverdue },
  };
  const c = toneMap[tone];
  return (
    <div
      className="flex-1 rounded-lg px-4 py-3"
      style={{ backgroundColor: c.bg }}
    >
      <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: c.fg }}>
        {label}
      </div>
      <div className="text-base font-bold" style={{ color: c.fg }}>
        {value}
      </div>
    </div>
  );
}

function ValidationRow({ row, field, message, mono }) {
  return (
    <div className="flex items-start gap-6 py-3 border-t text-sm" style={{ borderColor: tokens.border }}>
      <div className="w-40 shrink-0" style={{ color: tokens.mutedForeground }}>
        {row} · {field}
      </div>
      <div>
        {message}
      </div>
    </div>
  );
}

export default function UploadValidatePage() {
  const [approvalMode, setApprovalMode] = useState("independent");

  return (
    <div
      className="min-h-screen w-full flex flex-col font-sans"
      style={{ backgroundColor: tokens.background, color: tokens.foreground }}
    >
      {/* Top bar */}
      <header className="h-16 shrink-0 bg-black flex items-center justify-between px-6">
        <div className="flex items-center gap-1">
          <span className="text-white font-extrabold text-xl tracking-tight">AMD</span>
          <span className="text-white text-lg -ml-0.5">⊿</span>
        </div>
        <div className="flex items-center gap-5 text-white">
          <Play size={18} fill="white" />
          <div className="relative">
            <Bell size={18} />
            <span className="absolute -top-2 -right-2 bg-red-600 text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              197
            </span>
          </div>
          <Headphones size={18} />
          <div className="flex items-center gap-2 text-sm">
            <UserCircle2 size={20} />
            <span>testuser@infobellit.com</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="w-60 shrink-0 border-r px-3 py-5"
          style={{ backgroundColor: tokens.sidebar, borderColor: tokens.border }}
        >
          <ul className="space-y-0.5">
            {navItems.map(({ label, icon: Icon, active, badge }) => (
              <li key={label}>
                <button
                  type="button"
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? "bg-black text-white font-semibold" : "text-slate-700 hover:bg-black/5"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="flex-1 text-left">{label}</span>
                  {badge != null && (
                    <span
                      className="text-white text-[11px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
                      style={{ backgroundColor: tokens.statusOverdue }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-10 py-8">
          {/* Page header */}
          <div className="mb-7">
            <div className="text-xs font-bold tracking-wider mb-1" style={{ color: tokens.primary }}>
              §7.1 · §7.2 · §7.3
            </div>
            <h1 className="text-3xl font-extrabold mb-2">Upload &amp; Validate</h1>
            <p className="text-sm max-w-2xl" style={{ color: tokens.mutedForeground }}>
              Upload an input file, select approvers, and run schema validation. Files
              that fail validation are not submitted — fix and re-upload.
            </p>
          </div>

          <div className="flex gap-6 items-start">
            {/* Left: Upload form */}
            <div
              className="flex-1 rounded-lg border bg-white p-7"
              style={{ borderColor: tokens.border }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <UploadCloud size={18} />
                <span className="font-bold text-[15px]">Upload file</span>
              </div>
              <div className="border-t mb-6" style={{ borderColor: tokens.border }} />

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <FieldLabel>APPLICATION</FieldLabel>
                  <Select placeholder="Select an option" />
                </div>
                <div>
                  <FieldLabel>CLOUD</FieldLabel>
                  <Select placeholder="Select an option" />
                </div>
              </div>

              <div className="mb-2">
                <FieldLabel>FILE CATEGORY (TEMPLATE)</FieldLabel>
                <Select placeholder="Select option" />
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
                style={{ color: tokens.primary }}
              >
                <Download size={14} />
                Download template for selected category
              </a>

              <div className="mb-2">
                <FieldLabel>CHANGE TYPE · SETS INPUT-FILE VERSION</FieldLabel>
                <Select placeholder="Select an option" />
              </div>

              <div
                className="flex items-center justify-between rounded-md border px-4 py-3 mt-3 mb-1.5"
                style={{ borderColor: tokens.border, backgroundColor: "oklch(0.97 0.006 250)" }}
              >
                <span className="text-sm" style={{ color: tokens.mutedForeground }}>
                  Version update
                </span>
                <span className="text-sm font-semibold flex items-center gap-2">
                  v1.4.2 <span style={{ color: tokens.mutedForeground }}>→</span>{" "}
                  <span style={{ color: tokens.primary }}>v2.0.0</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-6" style={{ color: tokens.mutedForeground }}>
                Input file version = X.Y.Z (X major · Y minor · Z bug fix). "No change /
                carried forward" keeps the version and routes to the approver to challenge
                (see below).
              </p>

              <div className="mb-6">
                <FieldLabel>APPROVERS · PICK ONE OR MORE</FieldLabel>
                <Select placeholder="Select approver" />
              </div>

              <div className="mb-6">
                <FieldLabel>APPROVAL MODE</FieldLabel>
                <div className="space-y-2.5">
                  <label
                    className="flex items-start gap-3 rounded-md border px-4 py-3.5 cursor-pointer"
                    style={{ borderColor: tokens.border }}
                  >
                    <input
                      type="radio"
                      name="approvalMode"
                      className="mt-1"
                      checked={approvalMode === "dependent"}
                      onChange={() => setApprovalMode("dependent")}
                    />
                    <span className="text-sm leading-relaxed">
                      <span className="font-semibold">Dependent</span> — all selected
                      approvers must approve for final approval; otherwise it stays{" "}
                      <em>partially approved</em>.
                    </span>
                  </label>
                  <label
                    className="flex items-start gap-3 rounded-md border px-4 py-3.5 cursor-pointer"
                    style={{
                      borderColor: approvalMode === "independent" ? tokens.primary : tokens.border,
                      backgroundColor: approvalMode === "independent" ? "oklch(0.96 0.02 252)" : "white",
                    }}
                  >
                    <input
                      type="radio"
                      name="approvalMode"
                      className="mt-1"
                      checked={approvalMode === "independent"}
                      onChange={() => setApprovalMode("independent")}
                    />
                    <span className="text-sm leading-relaxed">
                      <span className="font-semibold">Independent</span> — any one selected
                      approver approving is enough for final approval.
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <FieldLabel>FILE</FieldLabel>
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-14 text-center"
                  style={{ borderColor: tokens.border }}
                >
                  <Inbox size={34} className="mb-3" style={{ color: tokens.primary }} />
                  <div className="font-semibold mb-1">Drop file here</div>
                  <a href="#" className="text-sm font-medium mb-2" style={{ color: tokens.primary }}>
                    or browse
                  </a>
                  <div className="text-xs" style={{ color: tokens.mutedForeground }}>
                    .xlsx · .json · .csv · .pdf · .h5 · max 200 MB
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Validation results */}
            <div className="w-[520px] shrink-0 flex flex-col gap-5">
              {/* Failed result */}
              <div className="rounded-lg border bg-white p-6" style={{ borderColor: tokens.border }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-2.5">
                    <XCircle size={20} style={{ color: tokens.statusOverdue }} className="mt-0.5" />
                    <div>
                      <div className="font-bold text-[15px]">
                        Validation result —{" "}
                        <span className="font-mono font-normal text-sm">aws_rules.json</span>
                      </div>
                      <div className="text-xs" style={{ color: tokens.mutedForeground }}>
                        Uploaded by Contributor A · 22 Jun 14:31
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold rounded-full px-2.5 py-1 flex items-center gap-1 shrink-0"
                    style={{ backgroundColor: "oklch(0.96 0.03 25)", color: tokens.statusOverdue }}
                  >
                    ● Failed
                  </span>
                </div>

                <div className="flex gap-3 mb-4">
                  <StatusChip label="TEMPLATE" value="Pass" tone="good" />
                  <StatusChip label="SCHEMA" value="1 warn" tone="warn" />
                  <StatusChip label="REFERENCES" value="2 errors" tone="bad" />
                </div>

                <div>
                  <ValidationRow
                    row="Row 14"
                    field="cpu_gen"
                    message={
                      <>
                        <span className="font-semibold">Value not in vocabulary</span> — got{" "}
                        <code className="font-mono">"TURIN"</code>, expected{" "}
                        <code className="font-mono">"turin"</code>
                      </>
                    }
                  />
                  <ValidationRow
                    row="Row 22"
                    field="generation"
                    message={
                      <>
                        <span className="font-semibold">Required field missing</span> — for{" "}
                        <code className="font-mono">c4d-standard-16</code>
                      </>
                    }
                  />
                  <ValidationRow
                    row="Row 8"
                    field="family_id"
                    message={
                      <>
                        <span className="font-semibold">Unresolved reference</span> —{" "}
                        <code className="font-mono">n4d</code> not in instance vocabulary
                      </>
                    }
                  />
                </div>

                <div
                  className="mt-3 pt-3 border-t text-sm font-medium flex items-center gap-1.5"
                  style={{ borderColor: tokens.border, color: tokens.statusOverdue }}
                >
                  ✕ File not submitted. Fix errors and re-upload.
                </div>
              </div>

              {/* Passed result */}
              <div className="rounded-lg border bg-white p-6" style={{ borderColor: tokens.border }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={20} style={{ color: tokens.statusReady }} className="mt-0.5" />
                    <div>
                      <div className="font-bold text-[15px]">
                        Validation result —{" "}
                        <span className="font-mono font-normal text-sm">azure_rules.json</span>
                      </div>
                      <div className="text-xs" style={{ color: tokens.mutedForeground }}>
                        Uploaded by Contributor B · 19 Jun 11:02
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold rounded-full px-2.5 py-1 flex items-center gap-1 shrink-0"
                    style={{ backgroundColor: "oklch(0.95 0.03 155)", color: tokens.statusReady }}
                  >
                    ● Passed
                  </span>
                </div>

                <div className="flex gap-3 mb-5">
                  <StatusChip label="TEMPLATE" value="Pass" tone="good" />
                  <StatusChip label="SCHEMA" value="Pass" tone="good" />
                  <StatusChip label="REFERENCES" value="Pass" tone="good" />
                </div>

                <div
                  className="rounded-md px-4 py-3 text-sm mb-5"
                  style={{ backgroundColor: "oklch(0.95 0.03 155)", color: "#14532d" }}
                >
                  <span className="font-semibold">✓ File submitted successfully.</span> Status
                  is now{" "}
                  <span
                    className="text-xs font-semibold rounded-full px-2 py-0.5"
                    style={{ backgroundColor: "white", color: tokens.statusReady }}
                  >
                    Submitted
                  </span>
                  . Assigned approvers have been notified via UI and Email.
                </div>

                <p className="text-sm leading-relaxed mb-4">
                  <span className="font-semibold">Next step:</span> Approvers review and
                  approve or reject per the chosen mode (dependent = all; independent = any
                  one). On final approval, the file's input-file version (X.Y.Z) is
                  committed and it becomes available for release tagging.
                </p>

                <div
                  className="rounded-md px-4 py-3 text-sm leading-relaxed"
                  style={{ backgroundColor: "oklch(0.96 0.04 65)", color: "#7a4d0a" }}
                >
                  <span className="font-semibold">Carried-forward path:</span> if change type
                  = "No change / Carried forward", the file still goes to the approver, who
                  is notified to <span className="font-semibold">challenge/reject</span> the
                  no-change. If the approver doesn't act within{" "}
                  <span className="font-semibold">2 working days</span>, it{" "}
                  <span className="font-semibold">auto-approves</span> and the version stays
                  unchanged.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}