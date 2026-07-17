import { useState } from "react"
import { Plus, Pencil, Trash2, ShieldCheck, AlertTriangle, CircleHelp, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { FieldLabel, Field } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DataTable } from "@/components/DataTable/DataTable"

// ---------------------------------------------------------------------------
// Static options
// ---------------------------------------------------------------------------
const CLOUD_OPTIONS     = ["AWS", "AZURE", "GCP", "OCI"]
const APP_OPTIONS       = ["EIA", "CCA", "EIA + CCA", "Memory Advisor"]
const CATEGORY_OPTIONS  = ["Business Rules", "Scaler Data", "Remarks", "MRD", "System / EPDW", "System / H5", "Pricing / AWS"]
const APPROVE_TYPES     = ["Dependent", "Independent"]
const APPROVER_OPTIONS  = ["Sam A.", "J. Peterson", "T. Stark", "S. Smith", "M. Jones", "R. Lee", "A. Patel"]

// Badge variants per cloud — cycle through available Badge variants
const CLOUD_VARIANT = ["default", "secondary", "destructive", "outline"]

// Avatar bg colors cycling through chart CSS vars
const AVATAR_BG = [
  "bg-[hsl(var(--chart-1))]",
  "bg-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-4))]",
  "bg-[hsl(var(--chart-5))]",
]

// ---------------------------------------------------------------------------
// Dummy data
// ---------------------------------------------------------------------------
let nextId = 6
const INITIAL_RULES = [
  { id: 1, cloud: ["AWS", "GCP"],   app: "EIA + CCA", category: "Pricing Rules",  approveType: "Dependent",   approvers: ["Sam A.", "J. Peterson"],        active: true  },
  { id: 2, cloud: ["AWS", "AZURE"], app: "CCA",       category: "Business Rules", approveType: "Dependent",   approvers: ["T. Stark", "S. Smith"],         active: true  },
  { id: 3, cloud: ["AWS"],          app: "CCA",       category: "Pricing Rules",  approveType: "Dependent",   approvers: ["M. Jones"],                     active: true  },
  { id: 4, cloud: ["AZURE", "GCP"], app: "EIA + CCA", category: "Business Rules", approveType: "Independent", approvers: ["M. Jones"],                     active: true  },
  { id: 5, cloud: ["OCI"],          app: "EIA + CCA", category: "Pricing Rules",  approveType: "Independent", approvers: ["S. Smith", "R. Lee", "A. Patel"], active: false },
]

// ---------------------------------------------------------------------------
// Cell helpers
// ---------------------------------------------------------------------------
function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

function CloudCell({ cloud }) {
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

function ApproverCell({ approvers }) {
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

// ---------------------------------------------------------------------------
// Conflict detection
// ---------------------------------------------------------------------------
function detectConflicts(rules) {
  const seen = []
  rules.forEach((r) => {
    if (r.approvers.length > 1) {
      seen.push({ ruleId: r.id, message: `Senior Analyst is assigned both Approve and Request Changes for ${Array.isArray(r.cloud) ? r.cloud.join("/") : r.cloud} / ${r.app} / ${r.category}.` })
    }
  })
  return seen.slice(0, 1)
}

// ---------------------------------------------------------------------------
// DataTable column definitions (built per render to capture handlers)
// ---------------------------------------------------------------------------
function makeColumns(onEdit, onDelete, onToggle) {
  return [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.index + 1}</span>,
    },
    {
      accessorKey: "cloud",
      header: "CLOUD",
      cell: ({ row }) => <CloudCell cloud={row.getValue("cloud")} />,
    },
    {
      accessorKey: "app",
      header: "APPLICATION",
      cell: ({ row }) => <Badge variant="outline" className="text-xs">{row.getValue("app")}</Badge>,
    },
    {
      accessorKey: "category",
      header: "FILE CATEGORY",
      cell: ({ row }) => <Badge variant="outline" className="text-xs">{row.getValue("category")}</Badge>,
    },
    {
      accessorKey: "approveType",
      header: "APPROVE TYPE",
      cell: ({ row }) => <span className="text-sm">{row.getValue("approveType")}</span>,
    },
    {
      accessorKey: "approvers",
      header: "APPROVER",
      cell: ({ row }) => <ApproverCell approvers={row.getValue("approvers")} />,
    },
    {
      accessorKey: "active",
      header: "ACTIVE",
      cell: ({ row }) => (
        <Switch
          checked={row.getValue("active")}
          onCheckedChange={() => onToggle(row.original.id)}
        />
      ),
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onEdit(row.original)}
            title="Edit rule"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onDelete(row.original)}
            title="Delete rule"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// Add / Edit sheet
// ---------------------------------------------------------------------------
const EMPTY_FORM = { cloud: [], app: "", category: "", approveType: "", approvers: [], active: true }

function RuleSheet({ open, onClose, initial, onSave }) {
  const isEdit = !!initial
  const [form, setForm] = useState(initial ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const cloudAnchor    = useComboboxAnchor()
  const approverAnchor = useComboboxAnchor()

  function handleOpenChange(o) {
    if (!o) { onClose(); setForm(initial ?? EMPTY_FORM) }
  }

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })) }

  function handleSave() {
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave(form) }, 300)
  }

  const canSave = form.cloud.length > 0 && form.app && form.category && form.approveType && form.approvers.length > 0

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-lg! p-0">
        {/* Header with title + action buttons */}
        <SheetHeader className="flex-row items-center justify-between border-b px-6 py-4 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <SheetTitle className="text-base font-bold">
              {isEdit ? "Edit Rule" : "Add New Rule"}
            </SheetTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={!canSave || saving} onClick={handleSave}>
              {saving
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</>
                : isEdit ? "Update" : "Save"}
            </Button>
            <button
              onClick={onClose}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <p className="px-6 pt-3 pb-0 text-xs text-muted-foreground">
          Map a role to the file scope it can approve and assign named approvers.
        </p>

        <div className="flex-1 overflow-auto px-6 py-4 flex flex-col gap-4">
          {/* Cloud — multi-select chips combobox */}
          <Field>
            <FieldLabel className="text-[11px] font-semibold tracking-wider">CLOUD · PICK ONE OR MORE</FieldLabel>
            <Combobox multiple value={form.cloud} onValueChange={(v) => set("cloud", v)}>
              <ComboboxChips ref={cloudAnchor}>
                {form.cloud.map((c) => (
                  <ComboboxChip key={c} value={c}>{c}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={form.cloud.length === 0 ? "Select cloud" : ""}
                  readOnly
                />
              </ComboboxChips>
              <ComboboxContent anchor={cloudAnchor.current} align="start">
                <ComboboxList>
                  {CLOUD_OPTIONS.map((o) => (
                    <ComboboxItem key={o} value={o}>{o}</ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          {/* Application */}
          <Field>
            <FieldLabel className="text-[11px] font-semibold tracking-wider">APPLICATION</FieldLabel>
            <Select value={form.app} onValueChange={(v) => set("app", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select application" /></SelectTrigger>
              <SelectContent>
                {APP_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          {/* File Category */}
          <Field>
            <FieldLabel className="text-[11px] font-semibold tracking-wider">FILE CATEGORY</FieldLabel>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          {/* Approve Type */}
          <Field>
            <FieldLabel className="text-[11px] font-semibold tracking-wider">APPROVE TYPE</FieldLabel>
            <div className="flex flex-col gap-2">
              {APPROVE_TYPES.map((t) => (
                <label
                  key={t}
                  className={`flex items-start gap-3 rounded-md border px-4 py-3 cursor-pointer transition-colors ${form.approveType === t ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <input type="radio" className="mt-0.5 accent-primary" checked={form.approveType === t} onChange={() => set("approveType", t)} />
                  <span className="text-sm">
                    <span className="font-semibold">{t}</span>
                    {t === "Dependent" && " — all selected approvers must approve"}
                    {t === "Independent" && " — any one approver is enough"}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          {/* Approvers — multi-select chips combobox */}
          <Field>
            <FieldLabel className="text-[11px] font-semibold tracking-wider">APPROVERS · PICK ONE OR MORE</FieldLabel>
            <Combobox multiple value={form.approvers} onValueChange={(v) => set("approvers", v)}>
              <ComboboxChips ref={approverAnchor}>
                {form.approvers.map((a) => (
                  <ComboboxChip key={a} value={a}>{a}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={form.approvers.length === 0 ? "Select approver" : ""}
                  readOnly
                />
              </ComboboxChips>
              <ComboboxContent anchor={approverAnchor.current} align="start">
                <ComboboxList>
                  {APPROVER_OPTIONS.map((o) => (
                    <ComboboxItem key={o} value={o}>{o}</ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          {/* Active toggle */}
          <Field>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <FieldLabel className="text-[11px] font-semibold tracking-wider">ACTIVE</FieldLabel>
                <p className="text-[11px] text-muted-foreground">Rule applies to new submissions when active.</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
            </div>
          </Field>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Delete dialog
// ---------------------------------------------------------------------------
function DeleteDialog({ open, rule, onClose, onConfirm }) {
  if (!rule) return null
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            Delete rule
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          Are you sure you want to delete rule <span className="font-semibold text-foreground">#{rule.id}</span>?
          <div className="mt-2 rounded-md border bg-muted/40 px-4 py-3 text-sm space-y-1">
            <div><span className="text-muted-foreground">Cloud:</span> {Array.isArray(rule.cloud) ? rule.cloud.join(", ") : rule.cloud}</div>
            <div><span className="text-muted-foreground">App:</span> {rule.app}</div>
            <div><span className="text-muted-foreground">Category:</span> {rule.category}</div>
          </div>
          <p className="mt-3 text-xs">This action cannot be undone. Changes apply to new submissions only.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => onConfirm(rule.id)}>Delete rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Configuration() {
  const [rules, setRules]           = useState(INITIAL_RULES)
  const [search, setSearch]         = useState("")
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [editRule, setEditRule]     = useState(null)
  const [deleteRule, setDeleteRule] = useState(null)

  const conflicts  = detectConflicts(rules)
  const activeCount = rules.filter((r) => r.active).length

  const filtered = rules.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (Array.isArray(r.cloud) ? r.cloud.join(" ") : r.cloud).toLowerCase().includes(q) ||
      r.app.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.approvers.join(" ").toLowerCase().includes(q)
    )
  })

  function handleAdd()       { setEditRule(null); setSheetOpen(true) }
  function handleEdit(rule)  { setEditRule({ ...rule }); setSheetOpen(true) }

  function handleSave(form) {
    if (editRule) {
      setRules((rs) => rs.map((r) => r.id === editRule.id ? { ...r, ...form } : r))
    } else {
      setRules((rs) => [...rs, { ...form, id: nextId++ }])
    }
    setSheetOpen(false)
    setEditRule(null)
  }

  function handleDelete(id) {
    setRules((rs) => rs.filter((r) => r.id !== id))
    setDeleteRule(null)
  }

  function toggleActive(id) {
    setRules((rs) => rs.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  const columns = makeColumns(handleEdit, setDeleteRule, toggleActive)

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      <div>
        <h1 className="text-3xl font-extrabold mb-1">Approval Configuration</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Define who can approve files based on role, cloud, application, and file category.
          Rules apply globally unless overridden by a category-specific exception.
        </p>
      </div>

      {/* <Alert>
        <CircleHelp className="h-4 w-4" />
        <AlertTitle className="font-semibold">How this works:</AlertTitle>
        <AlertDescription>
          Each rule maps a Role to the file scope it can approve (Cloud → Application → Category),
          and assigns named Approvers who hold that role. A user must appear in the Approver list
          to be available for that file type. Changes apply to new submissions only.
        </AlertDescription>
      </Alert>

      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">{conflicts.length} conflict detected</span> — {conflicts[0].message}
          </AlertDescription>
        </Alert>
      )} */}

      {/* Rules card */}
      <div className="rounded-lg border bg-card">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <div className="font-semibold text-sm">Role-Based Approver Rules</div>
              <div className="text-xs text-muted-foreground">
                {activeCount} rule{activeCount !== 1 ? "s" : ""} active · Last modified 30 Jun 2026 by Admin
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 pl-8"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add rule
            </Button>
          </div>
        </div>

        {/* DataTable — no toolbar (search is in card header above) */}
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No rules match your search."
          loading={false}
          error={null}
        />
      </div>

      <RuleSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditRule(null) }}
        initial={editRule}
        onSave={handleSave}
      />

      <DeleteDialog
        open={!!deleteRule}
        rule={deleteRule}
        onClose={() => setDeleteRule(null)}
        onConfirm={handleDelete}
      />
    </section>
  )
}
