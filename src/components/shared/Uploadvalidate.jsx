import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { Download, ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldLabel, FieldError, Field } from "@/components/ui/field";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { selectFilterOptions } from "@/store/selectors/filterOptions.selectors";
import { fetchFilterOptions } from "@/store/slice/filterOptions.slice";
import { ROUTES } from "@/lib/routes";
import {
  uploadSchema,
  CHANGE_TYPE_OPTIONS,
  CURRENT_VERSION,
  bumpVersion,
} from "./upload/uploadSchema";
import { SelectField } from "./upload/SelectField";
import { ApproverField } from "./upload/ApproverField";
import { FileDropZone } from "./upload/FileDropZone";
import { ResultDialog } from "./upload/ResultDialog";
import { Badge } from "../ui/badge";

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function UploadValidatePage() {
  const dispatch = useDispatch();
  const { apps, clouds, categories } = useSelector(selectFilterOptions);

  const [submitResult, setSubmitResult] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFilterOptions());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: "",
      application: "",
      cloud: "",
      fileCategory: "",
      changeType: "",
      approvers: [],
      approvalMode: "independent",
      description: "",
      file: null,
    },
  });

  const navigate = useNavigate();

  const changeType = watch("changeType");
  const approvalMode = watch("approvalMode");
  const [watchApplication, watchCloud, watchCategory] = watch([
    "application",
    "cloud",
    "fileCategory",
  ]);
  const approverDisabled = !watchApplication || !watchCloud || !watchCategory;
  const newVersion =
    changeType && changeType !== "no-change"
      ? bumpVersion(CURRENT_VERSION, changeType)
      : CURRENT_VERSION;

  function onInvalid() {
    toast.error("Please fill in all required fields.", {
      id: "form-validation",
      duration: 4000,
    });
  }

  function onSubmit(data) {
    const validationErrors = [];
    if (data.changeType === "no-change") {
      validationErrors.push({
        row: "—",
        field: "change_type",
        message: (
          <>
            <span className="font-semibold">No-change path</span> — will route
            to approver for challenge/rejection within 2 working days.
          </>
        ),
      });
    }
    setSubmitResult({
      status: validationErrors.length === 0 ? "passed" : "failed",
      fileName: data.file?.name ?? "uploaded_file",
      validationErrors,
    });
    setDialogOpen(true);
    setTimeout(() => {
      navigate(ROUTES.FILE_CATALOG);
    }, 2000);
  }

  const appOptions = apps.map((a) => ({ value: a, label: a }));
  const cloudOptions = clouds.map((c) => ({ value: c, label: c }));
  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  const handleRedirectBack = () => navigate(-1);

  return (
    <section className="flex flex-col gap-4 px-4 py-1 ">
      {/* Page header */}
      <div>
        <Button variant="ghost" className="py-4" onClick={handleRedirectBack}>
          <ArrowLeft />
          Back
        </Button>
        <h1 className="text-3xl font-extrabold mb-2">Upload &amp; Validate</h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Upload an input file, select approvers, and run schema validation.
          Files that fail validation are not submitted — fix and re-upload.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="flex gap-6 items-start">
          {/* Left: Upload form */}
          <div className="flex-1 rounded-lg border bg-card p-7">
            {/* Name + Application */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <Field className="mb-5">
                <FieldLabel
                  htmlFor="name"
                  className="text-[11px] font-semibold tracking-wider"
                >
                  NAME
                </FieldLabel>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="name"
                      placeholder="Enter a name for this upload"
                      aria-invalid={!!errors.name}
                      {...field}
                    />
                  )}
                />
                <FieldError errors={errors.name ? [errors.name] : []} />
              </Field>
              <SelectField
                name="application"
                control={control}
                label="APPLICATION"
                errors={errors}
                hasError={!!errors.application}
                options={appOptions}
                placeholder="Select application"
              />
            </div>
            {/* Cloud + File Category */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <SelectField
                name="cloud"
                control={control}
                label="CLOUD"
                errors={errors}
                hasError={!!errors.cloud}
                options={cloudOptions}
                placeholder="Select cloud"
              />
              <div>
                <SelectField
                  name="fileCategory"
                  control={control}
                  label="FILE CATEGORY (TEMPLATE)"
                  errors={errors}
                  hasError={!!errors.fileCategory}
                  options={categoryOptions}
                  placeholder="Select category"
                  className="mb-2"
                />
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 text-primary"
                >
                  <Download size={14} />
                  Download template for selected category
                </a>
              </div>
            </div>

            {/* Change Type */}
            <div className="flex gap-2">
              <SelectField
                name="changeType"
                control={control}
                label="CHANGE TYPE · SETS INPUT-FILE VERSION"
                errors={errors}
                hasError={!!errors.changeType}
                options={CHANGE_TYPE_OPTIONS}
                placeholder="Select change type"
                className="mb-3"
              />

              {/* Version preview */}
              <div className="flex gap-2 items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Version update:
                </span>
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm font-semibold">{CURRENT_VERSION}</Badge>
                  <span className="text-muted-foreground">→</span>
                  {changeType && changeType !== "no-change" && (
                    <Badge variant="secondary" className="text-sm font-semibold">{newVersion}</Badge>
                  )}
                  {changeType === "no-change" && (
                    <Badge variant="secondary" className="text-sm font-semibold">{CURRENT_VERSION}</Badge>
                  )}
                  {!changeType && (
                    <Badge variant="secondary" className="text-sm font-semibold">
                      {CURRENT_VERSION}
                    </Badge>
                  )}
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-6 text-muted-foreground">
              Input file version = X.Y.Z (X major · Y minor · Z bug fix). "No
              change / carried forward" keeps the version and routes to the
              approver to challenge (see below).
            </p>

            {/* Approvers — multi-select chips combobox */}
            <ApproverField
              control={control}
              errors={errors}
              disabled={approverDisabled}
            />

            {/* Approval Mode */}
            <Field className="mb-6">
              <FieldLabel className="text-[11px] font-semibold tracking-wider capitalize">
                APPROVAL MODE
              </FieldLabel>
              <RadioGroup
                value={approvalMode}
                onValueChange={(val) => setValue("approvalMode", val)}
                className="space-y-2.5"
              >
                {[
                  {
                    value: "dependent",
                    title: "Dependent",
                    desc: "all selected approvers must approve for final approval; otherwise it stays partially approved.",
                  },
                  {
                    value: "independent",
                    title: "Independent",
                    desc: "any one selected approver approving is enough for final approval.",
                  },
                ].map((opt) => {
                  const isSelected = approvalMode === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 rounded-md border px-4 py-3.5 cursor-pointer transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <RadioGroupItem value={opt.value} className="mt-1" />
                      <span className="text-sm leading-relaxed">
                        <span className="font-semibold capitalize">
                          {opt.title}
                        </span>{" "}
                        — {opt.desc}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </Field>

            {/* File drop zone */}
            <Field>
              <FieldLabel className="text-[11px] font-semibold tracking-wider capitalize">
                FILE
              </FieldLabel>
              <FileDropZone control={control} errors={errors} />
              <FieldError errors={errors.file ? [errors.file] : []} />
            </Field>

            {/* Description */}
            <Field className="mt-6">
              <FieldLabel
                htmlFor="description"
                className="text-[11px] font-semibold tracking-wider capitalize"
              >
                DESCRIPTION
              </FieldLabel>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    placeholder="What changed and why…"
                    aria-invalid={!!errors.description}
                    className="resize-none min-h-24"
                    {...field}
                  />
                )}
              />
              <FieldError
                errors={errors.description ? [errors.description] : []}
              />
            </Field>

            <div className="mt-6 flex gap-2 justify-end">
              <Button size="lg" variant="outline" className="capitalize">
                Cancel
              </Button>
              <Button size="lg" type="submit" className="capitalize">
                <Upload />
                {" Validate & Submit"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <ResultDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        result={submitResult}
      />
    </section>
  );
}
