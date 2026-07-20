import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { z } from "zod"
import { Tag, X, Loader2, UploadCloud, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { selectCloudOptions, selectApplicationOptions } from "@/store/selectors/app.selectors"
import { fetchClouds, fetchApplications } from "@/store/slice/app.slice"
import { createCategory, updateCategory } from "@/store/slice/category.slice"
import { selectCategorySaving } from "@/store/selectors/category.selectors"
import AppService from "@/services/app.service"

import { APPROVE_TYPES, EMPTY_FORM, slugify } from "./constants"

const ACCEPTED = ".xlsx,.json,.csv,.pdf,.h5"
const MAX_MB   = 200

// ── Zod schemas ───────────────────────────────────────────────────────────────
const approverSchema = z.object({
  type:      z.literal("user"),
  email:     z.string().email("Approver email is invalid"),
  full_name: z.string().min(1, "Approver name is required"),
})

const baseSchema = z.object({
  approval_mode: z.enum(["dependent", "independent"], { message: "Select an approval type" }),
  approvers:     z.array(approverSchema).min(1, "Select at least one approver"),
})

const createSchema = baseSchema.extend({
  display_name:      z.string()
    .min(1, "Category name is required")
    .refine((v) => !/\s/.test(v), "Category name must not contain spaces"),
  governed_apps:     z.array(z.string()).min(1, "Select at least one app"),
  clouds:            z.array(z.string()).min(1, "Select at least one cloud"),
  template_file_name: z.string().min(1, "Template file is required"),
})

const updateSchema = baseSchema

// ── File drop zone ─────────────────────────────────────────────────────────────
function FileDropZone({ file, onChange, hasError = false }) {
  const inputRef        = useRef(null)
  const [drag, setDrag] = useState(false)

  function validate(f) {
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) { toast.error(`File exceeds ${MAX_MB} MB`); return }
    onChange(f)
  }

  function onDrop(e) {
    e.preventDefault(); setDrag(false)
    validate(e.dataTransfer.files[0])
  }

  const borderClass = drag
    ? "border-primary bg-primary/5"
    : hasError
      ? "border-destructive bg-destructive/5"
      : "border-border bg-muted/20 hover:border-primary/50"

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-colors ${borderClass}`}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => validate(e.target.files[0])} />
      {file ? (
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <span className="truncate max-w-55">{file.name}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Drop file here</p>
          <p className="text-xs text-primary">or browse</p>
          <p className="text-xs text-muted-foreground">.xlsx · .json · .csv · .pdf · .h5 · max {MAX_MB} MB</p>
        </>
      )}
    </div>
  )
}

// ── onSearch adapter for the approvers endpoint ───────────────────────────────
async function searchApprovers(query, page) {
  const data = await AppService.fetchUsers({ page, limit: 10, search: query })
  const items = (data.items ?? []).map((u) => ({
    type:      "user",
    email:     u.email,
    full_name: u.full_name,
  }))
  return { items, total_pages: data.total_pages ?? 1 }
}

// ── Main sheet ────────────────────────────────────────────────────────────────
export default function RuleSheet({ open, onClose, initial, onSaved }) {
  const dispatch     = useDispatch()
  const saving       = useSelector(selectCategorySaving)
  const cloudOptions = useSelector(selectCloudOptions)
  const appOptions   = useSelector(selectApplicationOptions)

  const isEdit = !!initial

  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setErrors({})
      setForm(initial ? {
        display_name:  initial.display_name  ?? "",
        governed_apps: initial.governed_apps ?? [],   // string[]
        clouds:        initial.clouds        ?? [],   // string[]
        approval_mode: initial.approval_mode ?? "",
        approvers:     initial.approvers     ?? [],   // [{ type, email, full_name }]
        file:          null,
      } : EMPTY_FORM)
    }
  }, [open, initial])

  useEffect(() => {
    if (open) {
      if (cloudOptions.length === 0)  dispatch(fetchClouds())
      if (appOptions.length === 0)    dispatch(fetchApplications())
    }
  }, [open, cloudOptions.length, appOptions.length, dispatch])

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
    // Clear field error on change
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  // ── Zod validate and return flat error map ────────────────────────────────
  function validate() {
    const schema = isEdit ? updateSchema : createSchema
    const data   = isEdit
      ? { approval_mode: form.approval_mode, approvers: form.approvers }
      : {
          display_name:       form.display_name,
          governed_apps:      form.governed_apps,
          clouds:             form.clouds,
          approval_mode:      form.approval_mode,
          approvers:          form.approvers,
          template_file_name: form.file?.name ?? "",
        }

    const result = schema.safeParse(data)
    if (result.success) return null

    const flat = {}
    result.error.issues.forEach((issue) => {
      const key = issue.path[0] ?? "root"
      if (!flat[key]) flat[key] = issue.message
    })
    return flat
  }

  const canSave = !saving

  async function handleSave() {
    const errs = validate()
    if (errs) { setErrors(errs); toast.error("Please fix the errors before saving"); return }

    if (isEdit) {
      try {
        await dispatch(updateCategory({
          category_id:   initial.category_id,
          approval_mode: form.approval_mode,
          approvers:     form.approvers,
          is_active:     initial.is_active ?? true,
        })).unwrap()
        toast.success("Category updated")
        onSaved(); onClose()
      } catch (err) { toast.error(err ?? "Update failed") }
    } else {
      const category_id = slugify(form.display_name)
      try {
        await dispatch(createCategory({
          payload: {
            category_id,
            display_name:  form.display_name.trim(),
            governed_apps: form.governed_apps,   // string[]
            clouds:        form.clouds,           // string[]
            approval_mode: form.approval_mode,
            approvers:     form.approvers,
            ...(form.file ? { template_file_name: form.file.name } : {}),
          },
          file: form.file,
        })).unwrap()
        toast.success("Category created")
        onSaved(); onClose()
      } catch (err) { toast.error(err ?? "Create failed") }
    }
  }

  // ── Combobox bridge helpers ───────────────────────────────────────────────
  // governed_apps / clouds: form stores string[], Combobox works with option objects
  // → convert on the way in (value prop) and out (onChange)
  const appsAsObjects   = form.governed_apps.map((v) => appOptions.find((o) => o.value === v) ?? { value: v, label: v })
  const cloudsAsObjects = form.clouds.map((v) => cloudOptions.find((o) => o.value === v) ?? { value: v, label: v })

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between border-b px-5 py-4 gap-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <SheetTitle className="text-base font-bold">
              {isEdit ? "Edit File Configuration" : "Create File Configuration"}
            </SheetTitle>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

          {/* Apps — stores string[] */}
          <div>
            <Combobox
              options={appOptions}
              value={appsAsObjects}
              onChange={(selected) => set("governed_apps", selected.map((o) => o.value))}
              getValue={(o) => o.value}
              getLabel={(o) => o.label}
              placeholder="Select the Apps"
              disabled={isEdit}
            />
            {errors.governed_apps && <p className="mt-1 text-xs text-destructive">{errors.governed_apps}</p>}
          </div>

          {/* Clouds — stores string[] */}
          <div>
            <Combobox
              options={cloudOptions}
              value={cloudsAsObjects}
              onChange={(selected) => set("clouds", selected.map((o) => o.value))}
              getValue={(o) => o.value}
              getLabel={(o) => o.label}
              placeholder="Select the Clouds"
              disabled={isEdit}
            />
            {errors.clouds && <p className="mt-1 text-xs text-destructive">{errors.clouds}</p>}
          </div>

          {/* Category name — no spaces allowed */}
          <div>
            <Input
              placeholder="Enter the file category (no spaces)"
              value={form.display_name}
              onChange={(e) => {
                const val = e.target.value.replace(/\s/g, "")
                set("display_name", val)
              }}
              disabled={isEdit}
              className="h-10"
            />
            {errors.display_name && <p className="mt-1 text-xs text-destructive">{errors.display_name}</p>}
          </div>

          {/* Approve Type — native select, selected value shown as plain text */}
          <div>
            <Select value={form.approval_mode} onValueChange={(v) => set("approval_mode", v)}>
              <SelectTrigger className={`h-10 w-full capitalize ${errors.approval_mode ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select the Approve Type" />
              </SelectTrigger>
              <SelectContent>
                {APPROVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label} — {t.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.approval_mode && <p className="mt-1 text-xs text-destructive">{errors.approval_mode}</p>}
          </div>

          {/* Approvers — stores [{ type, email, full_name }] */}
          <div>
            <Combobox
              value={form.approvers}
              onChange={(v) => set("approvers", v)}
              onSearch={searchApprovers}
              getValue={(a) => a.email}
              getLabel={(a) => a.full_name}
              placeholder="Select the Approver"
            />
            {errors.approvers && <p className="mt-1 text-xs text-destructive">{errors.approvers}</p>}
          </div>

          {/* File upload */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mb-1.5">UPLOAD TEMPLATE</p>
            {isEdit && initial?.template_s3_key ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate text-muted-foreground">{initial.template_s3_key.split("/").pop()}</span>
                <span className="ml-auto text-xs text-muted-foreground">existing template</span>
              </div>
            ) : (
              <>
                <FileDropZone
                  file={form.file}
                  onChange={(f) => set("file", f)}
                  hasError={!!errors.template_file_name}
                />
                {errors.template_file_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.template_file_name}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave || saving}>
            {saving
              ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</>
              : isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
