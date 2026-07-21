import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox-select";
import { DataTable } from "@/components/DataTable/DataTable";
import { fileCatalogColumns } from "@/components/DataTable/fileCatalog.columns";

import {
  fetchFiles,
  fetchTabCounts,
  setActiveTab,
  setSearch,
  setAppFilter,
  setCloudFilter,
  setCategoryFilter,
  setStatusFilter,
  selectTabCounts,
} from "@/store/slice/fileCatalog.slice";
import { fetchClouds, fetchApplications } from "@/store/slice/app.slice";
import CategoryService from "@/services/category.service";
import {
  selectFileCatalogState,
  selectFiles,
  selectFileCatalogMeta,
} from "@/store/selectors/fileCatalog.selectors";
import { selectFilterOptions } from "@/store/selectors/filterOptions.selectors";
import { ROUTES } from "@/lib/routes";

const TAB_CONFIG = [
  { value: "all",      label: "All" },
  { value: "my_files", label: "My Files" },
  { value: "requests", label: "Requests" },
];

const PAGE_SIZE = 10;

export default function FileCatalogPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { fetchStatus, error, activeTab, search, filters } = useSelector(
    selectFileCatalogState,
  );
  const files = useSelector(selectFiles);
  const { currentPage } = useSelector(selectFileCatalogMeta);
  const { governed_apps, clouds, statuses } =
    useSelector(selectFilterOptions);
  const tabCounts = useSelector(selectTabCounts);

  const searchTimer = useRef(null); 
  // Always-fresh ref — handlers read from here, never from stale closures
  const stateRef = useRef({});
  stateRef.current = { activeTab, search, filters, currentPage };

  const load = useCallback(
    (overrides = {}) => {
      const s = stateRef.current;
      dispatch(
        fetchFiles({
          tab: s.activeTab,
          page: s.currentPage,
          limit: PAGE_SIZE,
          search: s.search,
          governed_app: s.filters.governed_app,
          cloud: s.filters.cloud,
          category: s.filters.category,
          status: s.filters.status,
          ...overrides,
        }),
      );
    },
    [dispatch],
  );

  // Runs once on mount — explicit params so nothing depends on stateRef timing
  useEffect(() => {
    dispatch(fetchClouds());
    dispatch(fetchApplications());
    dispatch(fetchTabCounts());
    dispatch(
      fetchFiles({
        tab: "all",
        page: 1,
        limit: PAGE_SIZE,
        search: "",
        governed_app: [],
        cloud: [],
        category: [],
        status: [],
      }),
    );
  }, [dispatch]);

  // ── Tab ───────────────────────────────────────────────────────────────────
  function handleTabChange(tab) {
    dispatch(setActiveTab(tab));
    load({ tab, page: 1 });
  }

  // ── Search — debounced, wired to Input ───────────────────────────────────
  function handleSearch(val) {
    dispatch(setSearch(val));
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load({ search: val, page: 1 }), 350);
  }

  // ── Filters — dispatch then call API once ─────────────────────────────────
  function handleFilter(setter, key, values) {
    dispatch(setter(values));
    load({ [key]: values, page: 1 });
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  function handlePageChange(pageIndex) {
    load({ page: pageIndex + 1 });
  }

  function handlePageSizeChange(size) {
    load({ page: 1, limit: size });
  }

  const searchCategories = useCallback(async (query, page) => {
    const result = await CategoryService.list({ page, limit: 20, search: query, is_active: true })
    return { items: result.items, total_pages: result.total_pages }
  }, [])

  const filterDefs = [
    {
      label: "App",
      options: governed_apps,
      value: filters.governed_app,
      setter: setAppFilter,
      key: "governed_app",
    },
    {
      label: "Cloud",
      options: clouds,
      value: filters.cloud,
      setter: setCloudFilter,
      key: "cloud",
    },
    {
      label: "Status",
      options: statuses.map(k=>k.toLowerCase()),
      value: filters.status,
      setter: setStatusFilter,
      key: "status",
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
            {fetchStatus === "loading" && files.length > 0
              ? <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
              : <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            }
            <Input
              className="h-8 pl-8 w-full"
              placeholder="Search files..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {filterDefs.map(({ label, options, value, setter, key }) => (
            <div key={key} className="w-36">
              <Combobox
                options={options.map((v) => ({ value: v, label: v }))}
                value={value.map((v) => ({ value: v, label: v }))}
                onChange={(selected) =>
                  handleFilter(setter, key, selected.map((o) => o.value))
                }
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
              value={filters.category.map((id) => ({ category_id: id, display_name: id }))}
              onChange={(selected) =>
                handleFilter(setCategoryFilter, "category", selected.map((o) => o.category_id))
              }
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
          loading={fetchStatus === "loading" && files.length === 0}
          error={
            fetchStatus === "failed" ? (error ?? "Failed to load files.") : null
          }
          emptyMessage="No files match your search or filters."
          pagination={{
            pageIndex: currentPage - 1,
            pageSize: PAGE_SIZE,
            setPageIndex: handlePageChange,
            setPageSize: handlePageSizeChange,
          }}
          meta={{ onView: (id) => navigate(ROUTES.FILE_DETAIL(id)) }}
        />
      </div>
    </section>
  );
}
