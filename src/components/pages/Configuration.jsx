import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, ShieldCheck, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable/DataTable";

import {
  fetchCategories,
  deleteCategory,
  toggleCategoryActive,
} from "@/store/slice/category.slice";
import {
  selectCategories,
  selectCategoryStatus,
  selectCategoryMeta,
} from "@/store/selectors/category.selectors";

import { makeColumns } from "./configuration/columns";
import RuleSheet from "./configuration/RuleSheet";
import DeleteDialog from "./configuration/DeleteDialog"; 

const PAGE_SIZE = 10;

export default function Configuration() {
  const dispatch = useDispatch();

  const categories = useSelector(selectCategories);
  const status = useSelector(selectCategoryStatus);
  const { totalItems } = useSelector(selectCategoryMeta);

  const [pageIndex, setPageIndex] = useState(0); // 0-based for DataTable
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");
  const searchTimer = useRef(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [deleteRule, setDeleteRule] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  function load(pg = pageIndex + 1, q = search) {
    dispatch(
      fetchCategories({
        page: pg,
        limit: pageSize,
        ...(q ? { search: q } : {}),
      }),
    );
  }

  // Reload when page or pageSize changes
  useEffect(() => {
    load(pageIndex + 1);
  }, [pageIndex, pageSize]); // eslint-disable-line

  // API-side search with debounce
  function handleSearch(val) {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPageIndex(0);
      load(1, val);
    }, 350);
  }

  const activeCount = categories.filter((c) => c.is_active).length;

  function handleEdit(category) {
    setEditRule(category);
    setSheetOpen(true);
  }
  function handleAdd() {
    setEditRule(null);
    setSheetOpen(true);
  }

  async function handleDelete(categoryId) {
    try {
      await dispatch(deleteCategory(categoryId)).unwrap();
      toast.success("Category deleted");
      if (categories.length === 1 && pageIndex > 0) setPageIndex((p) => p - 1);
      else load();
    } catch (err) {
      toast.error(err ?? "Delete failed");
    }
    setDeleteRule(null);
  }

  async function handleToggle(categoryId, isActive) {
    setTogglingId(categoryId);
    try {
      await dispatch(toggleCategoryActive({ categoryId, isActive })).unwrap();
    } catch (err) {
      toast.error(err ?? "Failed to update status");
    }
    setTogglingId(null);
  }

  const columns = makeColumns(
    handleEdit,
    setDeleteRule,
    handleToggle,
    togglingId,
  );

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      <div>
        <h1 className="text-3xl font-extrabold mb-1">Approval Configuration</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Define who can approve files based on cloud, application, and file
          category.
        </p>
      </div>

      {/* Card header — outside DataTable so we keep the Add button */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <div className="font-semibold text-sm">
                Role-Based Approver Rules
              </div>
              <div className="text-xs text-muted-foreground">
                {activeCount} active · {totalItems} total
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-48 pl-8"
              />
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add rule
            </Button>
          </div>
        </div>

        {/* DataTable — no outer border (card already provides it) */}
        <DataTable
          columns={columns}
          data={categories}
          loading={status === "loading"}
          error={status === "failed" ? "Failed to load categories." : null}
          emptyMessage="No categories found."
          className={"border-none"}
          pagination={{
            pageIndex,
            pageSize,
            setPageIndex: (idx) => setPageIndex(idx),
            setPageSize: (size) => {
              setPageSize(size);
              setPageIndex(0);
            },
          }}
        />
      </div>

      <RuleSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditRule(null);
        }}
        initial={editRule}
        onSaved={() => load(pageIndex + 1)}
      />

      <DeleteDialog
        open={!!deleteRule}
        rule={deleteRule}
        onClose={() => setDeleteRule(null)}
        onConfirm={(id) => handleDelete(id)}
      />
    </section>
  );
}
