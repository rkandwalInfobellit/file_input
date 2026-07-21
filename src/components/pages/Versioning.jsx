import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GitBranch, Loader2, File } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox-select";
import { FieldLabel, Field } from "@/components/ui/field";
import { Separator } from "../ui/separator";
import { DataTable } from "@/components/DataTable/DataTable";

import { fetchClouds, fetchApplications } from "@/store/slice/app.slice";
import {
  fetchVersionFileOptions,
  fetchVersionHistory,
  setVersioningAppFilter,
  setVersioningCloudFilter,
  setVersioningCategoryFilter,
  clearVersionDetail,
} from "@/store/slice/versioning.slice";
import { selectFilterOptions } from "@/store/selectors/filterOptions.selectors";
import CategoryService from "@/services/category.service";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
function StatusBadge({ status }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const map = {
    pending:  { label: "Pending Approval", variant: "outline" },
    approved: { label: "Approved",         variant: "secondary" },
    rejected: { label: "Rejected",         variant: "destructive" },
    released: { label: "Released",         variant: "secondary" },
  };
  const cfg = map[status.toLowerCase()] ?? { label: status, variant: "outline" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
const fileOptionColumns = [
  {
    accessorKey: "label",
    header: "FILE",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-primary">{row.getValue("label")}</span>
    ),
  },
  {
    accessorKey: "file_name",
    header: "FILE NAME",
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("file_name")}</span>,
  },
  {
    accessorKey: "category_display_name",
    header: "CATEGORY",
    cell: ({ row }) => row.getValue("category_display_name"),
  },
  {
    accessorKey: "version_count",
    header: "VERSIONS",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("version_count")}</Badge>,
  },
  {
    accessorKey: "current_released_version",
    header: "CURRENT RELEASE",
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
        {row.getValue("current_released_version") ?? "—"}
      </code>
    ),
  },
];

const historyColumns = [
  {
    accessorKey: "version",
    header: "VERSION",
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-sm">
        {row.getValue("version")}
        {row.original.is_current && (
          <span className="ml-2 font-sans text-[10px] text-muted-foreground">← current</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "change_type",
    header: "CHANGE TYPE",
    cell: ({ row }) => <span className="capitalize">{row.getValue("change_type") ?? "—"}</span>,
  },
  {
    accessorKey: "display_status",
    header: "STATUS",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "submitted_by",
    header: "SUBMITTED BY",
    cell: ({ row }) => row.getValue("submitted_by") ?? "—",
  },
  {
    accessorKey: "submitted_at",
    header: "SUBMITTED",
    cell: ({ row }) => {
      const val = row.getValue("submitted_at");
      return val ? new Date(val).toLocaleDateString() : "—";
    },
  },
  {
    accessorKey: "approved_at",
    header: "APPROVED",
    cell: ({ row }) => {
      const val = row.getValue("approved_at");
      return val ? new Date(val).toLocaleDateString() : "—";
    },
  },
  {
    accessorKey: "tagged_to_release",
    header: "TAGGED TO RELEASE",
    cell: ({ row }) => {
      const val = row.getValue("tagged_to_release");
      return val ? <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{val}</code> : "—";
    },
  },
  {
    accessorKey: "change_notes",
    header: "CHANGE NOTES",
    cell: ({ row }) => (
      <span className="block max-w-56 truncate text-sm">{row.getValue("change_notes") ?? "—"}</span>
    ),
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Versioning() {
  const dispatch = useDispatch();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize]   = useState(10);
  const [selectedFile, setSelectedFile] = useState(null);

  const { governed_apps, clouds } = useSelector(selectFilterOptions);
  const {
    items, totalItems, totalPages,
    fetchStatus, error,
    filters,
    detail, detailStatus, detailError,
  } = useSelector((s) => s.versioning);

  useEffect(() => {
    dispatch(fetchClouds());
    dispatch(fetchApplications());
  }, [dispatch]);

  const appOptions   = governed_apps.map((a) => ({ value: a, label: a }));
  const cloudOptions = clouds.map((c) => ({ value: c, label: c }));

  const appAndCloudSelected = !!filters.governed_app && !!filters.cloud;
  const canSubmit = appAndCloudSelected && !!filters.category_id && fetchStatus !== "loading";

  const searchCategories = useCallback(async (query, page) => {
    const result = await CategoryService.list({
      page, limit: 20, search: query, is_active: true,
      governed_apps: filters.governed_app ? [filters.governed_app] : [],
      clouds:        filters.cloud        ? [filters.cloud]        : [],
    });
    return { items: result.items, total_pages: result.total_pages };
  }, [filters.governed_app, filters.cloud]);

  const [selectedCategoryObj, setSelectedCategoryObj] = useState(null);

  useEffect(() => {
    setSelectedCategoryObj(null);
    setSelectedFile(null);
    dispatch(clearVersionDetail());
  }, [filters.governed_app, filters.cloud, dispatch]);

  function handleSubmit() {
    setPageIndex(0);
    setSelectedFile(null);
    dispatch(clearVersionDetail());
    dispatch(fetchVersionFileOptions({
      governed_app: filters.governed_app,
      cloud:        filters.cloud,
      category_id:  filters.category_id,
      page: 1, limit: pageSize,
    }));
  }

  function handlePageChange(newIndex) {
    setPageIndex(newIndex);
    setSelectedFile(null);
    dispatch(clearVersionDetail());
    dispatch(fetchVersionFileOptions({
      governed_app: filters.governed_app,
      cloud:        filters.cloud,
      category_id:  filters.category_id,
      page: newIndex + 1, limit: pageSize,
    }));
  }

  function handleRowClick(fileItem) {
    if (selectedFile?.file_id === fileItem.file_id) {
      setSelectedFile(null);
      dispatch(clearVersionDetail());
      return;
    }
    setSelectedFile(fileItem);
    dispatch(fetchVersionHistory({ file_id: fileItem.file_id, page: 1, limit: 50 }));
  }
  return (
    <section className="flex flex-col gap-6 px-4 py-1">
      <div>
        <h1 className="text-3xl font-extrabold mb-1">Version History</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Select an application, cloud, and category, then click Fetch to view
          version history for matching files.
        </p>
      </div>

      {/* Filter card */}
      <div className="rounded-lg border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <File className="h-4 w-4 text-muted-foreground" />
          Select filters
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel className="text-[11px] font-semibold tracking-wider">APPLICATION</FieldLabel>
            <Combobox
              options={appOptions}
              value={filters.governed_app ? [{ value: filters.governed_app, label: filters.governed_app }] : []}
              onChange={(selected) => dispatch(setVersioningAppFilter(selected[0]?.value ?? null))}
              getValue={(o) => o.value}
              getLabel={(o) => o.label}
              placeholder="Select application"
              multiSelect={false} showSelected={true} searchable={false}
            />
          </Field>
          <Field>
            <FieldLabel className="text-[11px] font-semibold tracking-wider">CLOUD</FieldLabel>
            <Combobox
              options={cloudOptions}
              value={filters.cloud ? [{ value: filters.cloud, label: filters.cloud }] : []}
              onChange={(selected) => dispatch(setVersioningCloudFilter(selected[0]?.value ?? null))}
              getValue={(o) => o.value}
              getLabel={(o) => o.label}
              placeholder={filters.governed_app ? "Select cloud" : "Select app first"}
              multiSelect={false} showSelected={true} searchable={false}
              disabled={!filters.governed_app}
            />
          </Field>
          <Field>
            <FieldLabel className="text-[11px] font-semibold tracking-wider">CATEGORY</FieldLabel>
            <Combobox
              onSearch={searchCategories}
              value={selectedCategoryObj ? [selectedCategoryObj] : []}
              onChange={(selected) => {
                const cat = selected[0] ?? null;
                setSelectedCategoryObj(cat);
                dispatch(setVersioningCategoryFilter(cat?.category_id ?? null));
              }}
              getValue={(o) => o.category_id}
              getLabel={(o) => o.display_name}
              placeholder={appAndCloudSelected ? "Search category…" : "Select app & cloud first"}
              multiSelect={false} showSelected={true}
              disabled={!appAndCloudSelected}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {fetchStatus === "loading"
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
              : "Fetch versions"
            }
          </Button>
        </div>
      </div>

      {fetchStatus === "failed" && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Loading spinner (before mode is known) */}
      {fetchStatus === "loading" && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      )}

      {/* mode === "file_options": show file list for row-click drill-down */}
      {fetchStatus === "succeeded" && items.length > 0 && (
        <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <GitBranch className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <div className="font-semibold text-sm">Files</div>
              <div className="text-xs text-muted-foreground">
                {totalItems} file{totalItems !== 1 ? "s" : ""} found · click a row to view version history
              </div>
            </div>
          </div>
          <DataTable
            columns={fileOptionColumns}
            data={items}
            loading={false}
            error={null}
            emptyMessage="No files match the selected filters."
            onRowClick={handleRowClick}
            pagination={{
              pageIndex,
              pageSize,
              setPageIndex: handlePageChange,
              setPageSize,
              pageCount: totalPages,
              totalItems,
            }}
          />
        </div>
      )}

      {/* History panel — shown when row clicked (file_options mode) OR API returned history directly */}
      {(selectedFile || (fetchStatus === "succeeded" && detail?.mode === "history")) && (
        <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <GitBranch className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-bold text-sm">
                {detail?.label ?? selectedFile?.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {`${detail?.version_count ?? selectedFile?.version_count ?? 0} version${(detail?.version_count ?? selectedFile?.version_count) !== 1 ? "s" : ""} · Current released: ${detail?.current_released_version ?? selectedFile?.current_released_version ?? "—"}`}
              </div>
            </div>
          </div>
          <DataTable
            columns={historyColumns}
            data={detail?.versions ?? []}
            loading={detailStatus === "loading"}
            error={detailStatus === "failed" ? detailError : null}
            emptyMessage="No versions found for this file."
          />
        </div>
      )}
    </section>
  );
}
