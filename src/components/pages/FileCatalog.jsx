import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/DataTable/DataTable"
import { fileCatalogColumns, LEGEND, STATUS_VARIANT } from "@/components/DataTable/fileCatalog.columns"

import {
  fetchFiles,
  setSearch,
  setCategoryFilter,
  setAppFilter,
  setCloudFilter,
  setStatusFilter,
  CLOUDS,
} from "@/store/slice/fileCatalog.slice"
import { selectFileCatalogState, selectFilteredFiles } from "@/store/selectors/fileCatalog.selectors"
import { navigateTo, PAGE } from "@/store/slice/navigation.slice"

export default function FileCatalogPage() {
  const dispatch = useDispatch()
  const filteredFiles = useSelector(selectFilteredFiles) ?? []
  const { files: allFiles, fetchStatus, error, search, filters } = useSelector(selectFileCatalogState)

  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchFiles())
  }, [fetchStatus, dispatch])

  // Derived from allFiles so options never shrink when filters are active
  const categories = [...new Set(allFiles.map((f) => f.category))]
  const apps       = [...new Set(allFiles.flatMap((f) => f.app))]
  const statuses   = [...new Set(allFiles.map((f) => f.status).filter(Boolean))]

  const tableFilters = {
    search: {
      value: search,
      setValue: (v) => dispatch(setSearch(v)),
    },
    dropdowns: [
      {
        label:         "Category",
        value:         filters.category,
        setValue:      (v) => dispatch(setCategoryFilter(v)),
        options:       categories,
        isMultiSelect: true,
      },
      {
        label:         "App",
        value:         filters.app,
        setValue:      (v) => dispatch(setAppFilter(v)),
        options:       apps,
        isMultiSelect: true,
      },
      {
        label:         "Cloud",
        value:         filters.cloud,
        setValue:      (v) => dispatch(setCloudFilter(v)),
        options:       CLOUDS,
        isMultiSelect: true,
      },
      {
        label:         "Status",
        value:         filters.status,
        setValue:      (v) => dispatch(setStatusFilter(v)),
        options:       statuses,
        isMultiSelect: true,
      },
    ],
  }

  return (
    <section className="flex flex-col gap-6 px-10 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">File Catalog</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            All governed input files for CCA, EIA, and Scaler. Tracked per-application and per-cloud.
          </p>
        </div>
        <Button size="lg" onClick={() => dispatch(navigateTo(PAGE.UPLOAD_VALIDATE))}>
          <Plus className="h-4 w-4" />
          Upload new file
        </Button>
      </div>

      <DataTable
        columns={fileCatalogColumns}
        data={filteredFiles}
        filters={tableFilters}
        loading={fetchStatus === "loading" && filteredFiles.length === 0}
        error={fetchStatus === "failed" ? (error ?? "Failed to load files.") : null}
        emptyMessage="No files match your search or filters."
      />
    </section>
  )
}
