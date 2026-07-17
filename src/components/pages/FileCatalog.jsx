import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
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
} from "@/store/slice/fileCatalog.slice"
import { fetchFilterOptions } from "@/store/slice/filterOptions.slice"
import { selectFileCatalogState, selectFilteredFiles } from "@/store/selectors/fileCatalog.selectors"
import { selectFilterOptions } from "@/store/selectors/filterOptions.selectors"
import { ROUTES } from "@/lib/routes"

export default function FileCatalogPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const filteredFiles = useSelector(selectFilteredFiles) ?? []
  const { fetchStatus, error, search, filters } = useSelector(selectFileCatalogState)
  const { categories, apps, clouds, statuses, fetchStatus: optionsFetchStatus } = useSelector(selectFilterOptions)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchFiles())
  }, [fetchStatus, dispatch])

  useEffect(() => {
    if (optionsFetchStatus === "idle") dispatch(fetchFilterOptions())
  }, [optionsFetchStatus, dispatch])

  const tableFilters = {
    search: {
      value: search,
      placeholder: "Search files...",
      setValue: (v) => dispatch(setSearch(v)),
    },
    dropdowns: [
      {
        label: "App",
        value: filters.app,
        setValue: (v) => dispatch(setAppFilter(v)),
        options: apps,
        isMultiSelect: true,
      },
      {
        label: "Cloud",
        value: filters.cloud,
        setValue: (v) => dispatch(setCloudFilter(v)),
        options: clouds,
        isMultiSelect: true,
      },
      {
        label: "Category",
        value: filters.category,
        setValue: (v) => dispatch(setCategoryFilter(v)),
        options: categories,
        isMultiSelect: true,
      },
      {
        label: "Status",
        value: filters.status,
        setValue: (v) => dispatch(setStatusFilter(v)),
        options: statuses,
        isMultiSelect: true,
      },
    ],
  }

  const fileFilter = [
    {
      name: "All",
      value: 25,
      active: true,
      onClick: () => {
        console.log("All Files fetched");
      }
    },
    {
      name: "My Files",
      value: 15,
      active: false,
      onClick: () => {
        console.log("My Files fetched");
      }
    },
    {
      name: "Requests",
      value: 10,
      active: false,
      onClick: () => {
        console.log("Requested files fetched");
      }
    },
  ]

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      <div className="flex flex-col items-start justify-between">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-3xl font-extrabold mb-2">File Catalog</h1>
        <Button size="lg" onClick={() => navigate(ROUTES.UPLOAD_VALIDATE)}>
          <Plus className="h-4 w-4" />
          Upload new file
        </Button>
        </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            All governed input files for CCA, EIA, and Scaler. Tracked per-application and per-cloud.
          </p>
      </div>
      <div className="flex gap-2">
        {fileFilter.map((val) => (<Button key={val.name} variant={val.active ? "default" : "secondary"} className="rounded-xl">{`${val.name} (${val.value})`}</Button>))}
      </div>
      <DataTable
        columns={fileCatalogColumns}
        data={filteredFiles}
        filters={tableFilters}
        loading={fetchStatus === "loading" && filteredFiles.length === 0}
        error={fetchStatus === "failed" ? (error ?? "Failed to load files.") : null}
        emptyMessage="No files match your search or filters."
        pagination={{ pageIndex, pageSize, setPageIndex, setPageSize }}
      />
    </section>
  )
}
