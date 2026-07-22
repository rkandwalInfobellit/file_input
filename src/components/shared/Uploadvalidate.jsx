import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { Download, ArrowLeft, Upload, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldLabel, FieldError, Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox-select";
import { Badge } from "@/components/ui/badge";

import { selectFilterOptions } from "@/store/selectors/filterOptions.selectors";
import { ROUTES } from "@/lib/routes";
import CategoryService from "@/services/category.service";
import FileUploadService from "@/services/fileUpload.service";

import { useGetCloudsQuery }       from "@/store/api/endpoints/app.endpoints";
import { useGetApplicationsQuery } from "@/store/api/endpoints/app.endpoints";
import { useSubmitFileMutation }   from "@/store/api/endpoints/approvalDetail.endpoints";

import {
  uploadSchema,
  CHANGE_TYPE_OPTIONS,
  bumpVersion,
} from "./upload/uploadSchema";
import { SelectField }  from "./upload/SelectField";
import { FileDropZone } from "./upload/FileDropZone";
import { ResultDialog } from "./upload/ResultDialog";

export default function UploadValidatePage() {
  const navigate = useNavigate();

  // Ensure clouds + apps are in cache (served to selectFilterOptions selector)
  useGetCloudsQuery();
  useGetApplicationsQuery();

  const { governed_apps, clouds } = useSelector(selectFilterOptions);

  const [submitFile]                             = useSubmitFileMutation();
  const [submitting, setSubmitting]              = useState(false);
  const [submitResult, setSubmitResult]          = useState(null);
  const [dialogOpen, setDialogOpen]              = useState(false);
  const [selectedCategory, setSelectedCategory]  = useState(null);
  const [latestVersion, setLatestVersion]        = useState(null);
  const [templateDownloadUrl, setTemplateDownloadUrl] = useState(null);
  const [versionLoading, setVersionLoading]      = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      governed_apps: [],
      clouds:        [],
      category_id:   "",
      change_type:   "",
      description:   "",
      file:          null,
    },
  });

  const watchApps       = watch("governed_apps");
  const watchClouds     = watch("clouds");
  const watchCategory   = watch("category_id");
  const watchChangeType = watch("change_type");

  const appAndCloudSelected = watchApps.length > 0 && watchClouds.length > 0;
  const categorySelected    = !!watchCategory;
  const changeTypeEnabled   = categorySelected && latestVersion !== null;

  const newVersion = watchChangeType && watchChangeType !== "no-change"
    ? bumpVersion(latestVersion ?? "0.0.0", watchChangeType)
    : (latestVersion ?? "0.0.0");

  useEffect(() => {
    if (!watchCategory) {
      setSelectedCategory(null);
      setLatestVersion(null);
      setTemplateDownloadUrl(null);
      setValue("change_type", "");
      return;
    }
    setVersionLoading(true);
    setLatestVersion(null);
    setTemplateDownloadUrl(null);
    setValue("change_type", "");
    CategoryService.detail(watchCategory)
      .then((detail) => {
        setLatestVersion(detail?.latest_version ?? "0.0.0");
        setTemplateDownloadUrl(detail?.template_download_url ?? null);
      })
      .catch(() => setLatestVersion("0.0.0"))
      .finally(() => setVersionLoading(false));
  }, [watchCategory, setValue]);

  const searchCategories = useCallback(async (query, page) => {
    const result = await CategoryService.list({
      page, limit: 20, search: query, is_active: true,
      governed_apps: watchApps,
      clouds:        watchClouds,
    });
    return { items: result.items, total_pages: result.total_pages };
  }, [watchApps, watchClouds]);

  function onInvalid() {
    toast.error("Please fill in all required fields.", { id: "form-validation", duration: 4000 });
  }

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      const response = await submitFile({
        governed_apps: data.governed_apps,
        clouds:        data.clouds,
        category_id:   data.category_id,
        file_name:     data.file.name,
        change_type:   data.change_type,
        description:   data.description ?? "",
      }).unwrap();

      const uploadUrl = response?.upload_url ?? response?.template_upload_url;
      if (uploadUrl) {
        await FileUploadService.uploadToS3(uploadUrl, data.file);
      }

      setSubmitResult({ status: "passed", fileName: data.file.name, validationErrors: [] });
      setDialogOpen(true);
      setTimeout(() => navigate(ROUTES.FILE_CATALOG), 2000);
    } catch (err) {
      setSubmitResult({ status: "error", message: err?.data ?? "Submission failed. Please try again." });
      setDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  const appOptions   = governed_apps.map((a) => ({ value: a, label: a }));
  const cloudOptions = clouds.map((c) => ({ value: c, label: c }));

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      <div>
        <Button variant="ghost" className="py-4" onClick={() => navigate(-1)}>
          <ArrowLeft />
          Back
        </Button>
        <h1 className="text-3xl font-extrabold mb-2">Upload &amp; Validate</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Upload an input file and run schema validation. Files that fail
          validation are not submitted — fix and re-upload.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="flex gap-6 items-start">
          <div className="flex-1 rounded-lg border bg-card p-7">

            <div className="grid grid-cols-2 gap-5 mb-5">
              <Field>
                <FieldLabel className="text-[11px] font-semibold tracking-wider">APPLICATION</FieldLabel>
                <Controller
                  name="governed_apps"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={appOptions}
                      value={field.value.map((v) => ({ value: v, label: v }))}
                      onChange={(selected) => field.onChange(selected.map((o) => o.value))}
                      getValue={(o) => o.value}
                      getLabel={(o) => o.label}
                      placeholder="Select applications"
                      multiSelect={true}
                      showSelected={true}
                      searchable={false}
                    />
                  )}
                />
                <FieldError errors={errors.governed_apps ? [errors.governed_apps] : []} />
              </Field>

              <Field>
                <FieldLabel className="text-[11px] font-semibold tracking-wider">CLOUD</FieldLabel>
                <Controller
                  name="clouds"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={cloudOptions}
                      value={field.value.map((v) => ({ value: v, label: v }))}
                      onChange={(selected) => field.onChange(selected.map((o) => o.value))}
                      getValue={(o) => o.value}
                      getLabel={(o) => o.label}
                      placeholder="Select clouds"
                      multiSelect={true}
                      showSelected={true}
                      searchable={false}
                    />
                  )}
                />
                <FieldError errors={errors.clouds ? [errors.clouds] : []} />
              </Field>
            </div>

            <div className="mb-5">
              <Field>
                <FieldLabel className="text-[11px] font-semibold tracking-wider">
                  FILE CATEGORY (TEMPLATE)
                </FieldLabel>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      onSearch={searchCategories}
                      value={selectedCategory ? [selectedCategory] : []}
                      onChange={(selected) => {
                        const cat = selected[0] ?? null;
                        setSelectedCategory(cat);
                        field.onChange(cat?.category_id ?? "");
                      }}
                      getValue={(o) => o.category_id}
                      getLabel={(o) => o.display_name}
                      placeholder={appAndCloudSelected ? "Search category…" : "Select app & cloud first"}
                      multiSelect={false}
                      showSelected={true}
                      disabled={!appAndCloudSelected}
                    />
                  )}
                />
                <FieldError errors={errors.category_id ? [errors.category_id] : []} />
              </Field>
              {categorySelected && templateDownloadUrl && (
                <a
                  href={templateDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium mt-2 text-primary"
                >
                  <Download size={14} />
                  Download template for selected category
                </a>
              )}
            </div>

            <div className="flex gap-4 items-end mb-2">
              <div className="flex-1">
                <SelectField
                  name="change_type"
                  control={control}
                  label="CHANGE TYPE · SETS INPUT-FILE VERSION"
                  errors={errors}
                  hasError={!!errors.change_type}
                  options={CHANGE_TYPE_OPTIONS}
                  placeholder={
                    !categorySelected      ? "Select category first" :
                    latestVersion === null ? "Loading version…" :
                    "Select change type"
                  }
                  disabled={latestVersion === null}
                />
              </div>

              <div className="flex gap-2 items-center pb-1.5 shrink-0 min-h-9">
                {categorySelected && versionLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {changeTypeEnabled && (
                  <>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Version:</span>
                    <Badge variant="secondary" className="text-sm font-semibold">
                      {latestVersion}
                    </Badge>
                    {watchChangeType && watchChangeType !== "no-change" && (
                      <>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="secondary" className="text-sm font-semibold">
                          {newVersion}
                        </Badge>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-6 text-muted-foreground">
              Input file version = X.Y.Z (X major · Y minor · Z bug fix). "No
              change / carried forward" keeps the version.
            </p>

            <Field className="mb-6">
              <FieldLabel className="text-[11px] font-semibold tracking-wider">FILE</FieldLabel>
              <FileDropZone control={control} errors={errors} />
              <FieldError errors={errors.file ? [errors.file] : []} />
            </Field>

            <Field>
              <FieldLabel htmlFor="description" className="text-[11px] font-semibold tracking-wider">
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
              <FieldError errors={errors.description ? [errors.description] : []} />
            </Field>

            <div className="mt-6 flex gap-2 justify-end">
              <Button size="lg" variant="outline" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button size="lg" type="submit" disabled={submitting}>
                {submitting
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Upload className="h-4 w-4" />
                }
                {submitting ? "Submitting…" : "Validate & Submit"}
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
