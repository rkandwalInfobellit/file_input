import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox-select";
import { DataTable } from "@/components/DataTable/DataTable";
import { fileCatalogColumns } from "@/components/DataTable/fileCatalog.columns";

import {
  setActiveTab,
  setSearch,
  setAppFilter,
  setCloudFilter,
  setCategoryFilter,
  setStatusFilter,
} from "@/store/slice/fileCatalog.slice";
import { selectFilterOptions } from "@/store/selectors/filterOptions.selectors";
import { ROUTES } from "@/lib/routes";

import { useGetFilesQuery } from "@/store/api/endpoints/catalog.endpoints";
import { useGetCloudsQuery, useGetApplicationsQuery } from "@/store/api/endpoints/app.endpoints";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import CategoryService from "@/services/category.service";

const TAB_CONFIG = [
  { value: "all",      label: "All" },
  { value: "my_files", label: "My Files" },
  { value: "requests", label: "Requests" },
];

const PAGE_SIZE = 10;

export default function FileCatalogPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // RTK Query — fetch clouds + apps so selector can read from cache
  useGetCloudsQuery();
  useGetApplicationsQuery();

  // Local UI state (replaces the Redux filter state that was previously read
  // via selectors — we keep the Redux actions for backward compat with other
  // consumers that might still read fileCatalog slice, but primary source of
  // truth for the query is local state here)
  const { governed_apps, clouds, statuses } = useSelector(selectFilterOptions);

  const [activeTab,   setActiveTabLocal]   = useState("all");
  const [searchRaw,   setSearchRaw]        = useState("");
  const [appFilter,   setAppFilterLocal]   = useState([]);
  const [cloudFilter, setCloudFilterLocal] = useState([]);
  const [catFilter,   setCatFilterLocal]   = useState([]);
  const [statusFilter,setStatusFilterLocal]= useState([]);
  const [pageIndex,   setPageIndex]        = useState(0);
  const [pageSize,    setPageSize]         = useState(PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(searchRaw, 350);

  // RTK Query — main file list. Refetches automatically whenever any arg changes.
  const { data, isFetching, isError, error } = useGetFilesQuery({
    tab:          activeTab,
    page:         pageIndex + 1,
    limit:        pageSize,
    search:       debouncedSearch,
    governed_app: appFilter,
    cloud:        cloudFilter,
    category:     catFilter,
    status:       statusFilter,
  });

  // Per-tab count queries — each fires independently and caches separately
  const { data: allData }    = useGetFilesQuery({ tab: "all",      page: 1, limit: 1 });
  const { data: myData }     = useGetFilesQuery({ tab: "my_files", page: 1, limit: 1 });
  const { data: reqData }    = useGetFilesQuery({ tab: "requests", page: 1, limit: 1 });
  const tabCounts = {
    all:      allData?.total_items  ?? null,
    my_files: myData?.total_items   ?? null,
    requests: reqData?.total_items  ?? null,
  };

  const files       = data?.items       ?? [];
  const currentPage = data?.current_page ?? 1;
  const totalPages  = data?.total_pages  ?? 0;

  // Synchronise filter changes into Redux so other slices/selectors stay in sync
  function handleTabChange(tab) {
    setActiveTabLocal(tab);
    dispatch(setActiveTab(tab));
    setPageIndex(0);
  }

  function handleSearch(val) {
    setSearchRaw(val);
    dispatch(setSearch(val));
    setPageIndex(0);
  }

  function handleFilter(localSetter, reduxSetter, values) {
    localSetter(values);
    dispatch(reduxSetter(values));
    setPageIndex(0);
  }

  const searchCategories = useCallback(async (query, page) => {
    const result = await CategoryService.list({ page, limit: 20, search: query, is_active: true });
    return { items: result.items, total_pages: result.total_pages };
  }, []);

  const filterDefs = [
    {
      label:   "App",
      options: governed_apps,
      value:   appFilter,
      onChangeFn: (vals) => handleFilter(setAppFilterLocal, setAppFilter, vals),
    },
    {
      label:   "Cloud",
      options: clouds,
      value:   cloudFilter,
      onChangeFn: (vals) => handleFilter(setCloudFilterLocal, setCloudFilter, vals),
    },
    {
      label:   "Status",
      options: statuses.map((k) => k.toLowerCase()),
      value:   statusFilter,
      onChangeFn: (vals) => handleFilter(setStatusFilterLocal, setStatusFilter, vals),
    },
  ];

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
          All governed input files for CCA, EIA, and Scaler. Tracked
          per-application and per-cloud.
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex gap-2">
        {TAB_CONFIG.map(({ value, label }) => (
          <Button
            key={value}
            variant={activeTab === value ? "default" : "secondary"}
            className="rounded-xl"
            onClick={() => handleTabChange(value)}
          >
            {label}
            {tabCounts[value] !== null && (
              <span className="ml-1.5 text-xs opacity-70">({tabCounts[value]})</span>
            )}
          </Button>
        ))}
      </div>

      <div className="border rounded-md">
        <div className="flex border-b rounded-b-none items-center gap-2 rounded-md flex-nowrap p-2 bg-card relative">
          <div className="relative mr-auto w-full">
            {isFetching && files.length > 0
              ? <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
              : <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            }
            <Input
              className="h-8 pl-8 w-full"
              placeholder="Search files..."
              value={searchRaw}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {filterDefs.map(({ label, options, value, onChangeFn }) => (
            <div key={label} className="w-36">
              <Combobox
                options={options.map((v) => ({ value: v, label: v }))}
                value={value.map((v) => ({ value: v, label: v }))}
                onChange={(selected) => onChangeFn(selected.map((o) => o.value))}
                getValue={(o) => o.value}
                getLabel={(o) => o.label}
                placeholder={label}
                multiSelect={true}
                showSelected={false}
                searchable={false}
              />
            </div>
          ))}

          {/* Category — async, paginated, searchable */}
          <div className="w-36">
            <Combobox
              onSearch={searchCategories}
              value={catFilter.map((id) => ({ category_id: id, display_name: id }))}
              onChange={(selected) => {
                const vals = selected.map((o) => o.category_id);
                handleFilter(setCatFilterLocal, setCategoryFilter, vals);
              }}
              getValue={(o) => o.category_id}
              getLabel={(o) => o.display_name}
              placeholder="Category"
              multiSelect={true}
              showSelected={false}
            />
          </div>
        </div>

        <DataTable
          columns={fileCatalogColumns}
          className="border-none"
          data={files}
          loading={isFetching && files.length === 0}
          error={isError ? (error?.data ?? "Failed to load files.") : null}
          emptyMessage="No files match your search or filters."
          pagination={{
            pageIndex,
            pageSize,
            setPageIndex: (idx) => setPageIndex(idx),
            setPageSize:  (size) => { setPageSize(size); setPageIndex(0); },
          }}
          meta={{ onView: (id) => navigate(ROUTES.FILE_DETAIL(id)) }}
        />
      </div>
    </section>
  );
}
