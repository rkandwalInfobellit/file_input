import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GitBranch, Download, Loader2, ChevronDown, File } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/DataTable/DataTable";
import { Separator } from "../ui/separator";

import { fetchFiles } from "@/store/slice/fileCatalog.slice";
import { fetchFilterOptions } from "@/store/slice/filterOptions.slice";
import {
  fetchVersions,
  setVersioningCategoryFilter,
  setVersioningAppFilter,
  setVersioningCloudFilter,
  setVersioningStatusFilter,
} from "@/store/slice/versioning.slice";
import { selectFileCatalogState } from "@/store/selectors/fileCatalog.selectors";
import { selectFilterOptions } from "@/store/selectors/filterOptions.selectors";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function MultiFilterButton({ label, options, value, onChange }) {
  const selected = new Set(value);
  const triggerLabel = selected.size > 0 ? `${label} (${selected.size})` : label;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold tracking-wider">
          {triggerLabel}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt}
            checked={selected.has(opt)}
            onCheckedChange={(checked) => {
              const next = new Set(selected);
              checked ? next.add(opt) : next.delete(opt);
              onChange([...next]);
            }}
          >
            {opt}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VersionBadge({ status }) {
  if (!status) return null;
  if (status === "Released")   return <Badge variant="secondary">{status}</Badge>;
  if (status === "Superseded") return <Badge variant="outline">{status}</Badge>;
  return <Badge status={status}>{status}</Badge>;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
const versionColumns = [
  {
    accessorKey: "_fileLabel",
    header: "FILE",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-primary">
        {row.getValue("_fileLabel")}
      </span>
    ),
  },
  {
    accessorKey: "version",
    header: "FILE VERSION",
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-sm">
        {row.getValue("version")}
        {row.original.isCurrent && (
          <span className="ml-2 font-sans text-[10px] font-medium text-muted-foreground">
            ← current
          </span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => <VersionBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "submittedBy",
    header: "SUBMITTED BY",
    cell: ({ row }) => row.getValue("submittedBy") ?? "—",
  },
  {
    accessorKey: "approvedBy",
    header: "APPROVED BY",
    cell: ({ row }) => row.getValue("approvedBy") ?? "—",
  },
  {
    accessorKey: "submittedAt",
    header: "SUBMITTED",
    cell: ({ row }) => row.getValue("submittedAt") ?? "—",
  },
  {
    accessorKey: "approvedAt",
    header: "APPROVED",
    cell: ({ row }) => row.getValue("approvedAt") ?? "—",
  },
  {
    accessorKey: "taggedRelease",
    header: "TAGGED TO RELEASE",
    cell: ({ row }) => {
      const val = row.getValue("taggedRelease");
      return val
        ? <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{val}</code>
        : "—";
    },
  },
  {
    accessorKey: "changeNotes",
    header: "CHANGE NOTES",
    cell: ({ row }) => (
      <span className="block max-w-56 truncate text-sm">
        {row.getValue("changeNotes") ?? "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const fileUrl = row.original.file;
      const fileName = row.original._fileName ?? "file";
      const version  = row.original.version;
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={!fileUrl}
          onClick={async () => {
            try {
              const res = await fetch(fileUrl);
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${fileName}_${version}`;
              a.click();
              URL.revokeObjectURL(url);
            } catch {
              window.open(fileUrl, "_blank");
            }
          }}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Download
        </Button>
      );
    },
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Versioning() {
  const dispatch = useDispatch();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize]   = useState(10);

  const { fetchStatus: filesFetchStatus } = useSelector(selectFileCatalogState);
  const { apps, clouds, categories, statuses, fetchStatus: optFetchStatus } = useSelector(selectFilterOptions);
  const {
    versions,
    fileCount,
    fetchStatus: versionFetchStatus,
    error: versionError,
    filters,
  } = useSelector((s) => s.versioning);

  useEffect(() => {
    if (filesFetchStatus === "idle") dispatch(fetchFiles());
  }, [filesFetchStatus, dispatch]);

  useEffect(() => {
    if (optFetchStatus === "idle") dispatch(fetchFilterOptions());
  }, [optFetchStatus, dispatch]);

  // Status filter applied client-side after fetch
  const filteredVersions = versions.filter(
    (v) => filters.status.length === 0 || filters.status.includes(v.status)
  );

  return (
    <section className="flex flex-col gap-6 px-4 py-1">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold mb-1">Version History</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Versions are assigned only after approval. Maintained per-file,
          per-application, per-cloud. Use filters then click Fetch to load history.
        </p>
      </div>

      {/* Filter card */}
      <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <File className="h-4 w-4 text-muted-foreground" />
          Select files
        </div>

        <Separator />

        <div className="flex items-center gap-2 flex-wrap">
          <MultiFilterButton
            label="APP"
            options={apps}
            value={filters.app}
            onChange={(v) => dispatch(setVersioningAppFilter(v))}
          />
          <MultiFilterButton
            label="CLOUD"
            options={clouds}
            value={filters.cloud}
            onChange={(v) => dispatch(setVersioningCloudFilter(v))}
          />
          <MultiFilterButton
            label="CATEGORY"
            options={categories}
            value={filters.category}
            onChange={(v) => dispatch(setVersioningCategoryFilter(v))}
          />
          <MultiFilterButton
            label="STATUS"
            options={statuses}
            value={filters.status}
            onChange={(v) => dispatch(setVersioningStatusFilter(v))}
          />

          <Button
            className="ml-auto"
            disabled={versionFetchStatus === "loading"}
            onClick={() => { dispatch(fetchVersions()); setPageIndex(0); }}
          >
            {versionFetchStatus === "loading" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
            ) : (
              "Fetch versions"
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {versionFetchStatus === "failed" && (
        <p className="text-sm text-destructive">{versionError}</p>
      )}

      {/* Results card */}
      {versionFetchStatus === "succeeded" && (
        <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <GitBranch className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <div className="font-semibold text-sm">Version history</div>
              <div className="text-xs text-muted-foreground">
                {filteredVersions.length} version{filteredVersions.length !== 1 ? "s" : ""} across {fileCount} file{fileCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <DataTable
            columns={versionColumns}
            data={filteredVersions}
            emptyMessage="No versions match the selected filters."
            loading={false}
            error={null}
            pagination={{ pageIndex, pageSize, setPageIndex, setPageSize }}
          />

          <div className="px-5 py-3 border-t text-xs text-muted-foreground">
            ℹ Version number is assigned only after approval. Rejected files do not receive a version number and are not shown here.
          </div>
        </div>
      )}
    </section>
  );
}
