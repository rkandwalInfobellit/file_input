import { useState } from "react";
import { Plus, ShieldCheck, Search } from "lucide-react";
import { useEndpointPermission } from "@/hooks/useEndpointPermission";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable/DataTable";

import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
} from "@/store/api/endpoints/category.endpoints";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { makeColumns } from "./configuration/columns";
import RuleSheet from "./configuration/RuleSheet";
import DeleteDialog from "./configuration/DeleteDialog";

const PAGE_SIZE = 10;

export default function Configuration() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize,  setPageSize]  = useState(PAGE_SIZE);
  const [search,    setSearch]    = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [sheetOpen,   setSheetOpen]   = useState(false);
  const [editRule,    setEditRule]     = useState(null);
  const [deleteRule,  setDeleteRule]   = useState(null);
  const [togglingId,  setTogglingId]   = useState(null);

  const { data, isLoading, isError } = useGetCategoriesQuery({
    page:   pageIndex + 1,
    limit:  pageSize,
    search: debouncedSearch,
  });

  const categories = data?.items       ?? [];
  const totalItems = data?.total_items ?? 0;

  const [deleteCategory]       = useDeleteCategoryMutation();
  const [toggleCategoryActive] = useToggleCategoryActiveMutation();

  const canCreate = useEndpointPermission("ifgapi/categories/create");
  const canUpdate = useEndpointPermission("ifgapi/categories/update");
  const canDelete = useEndpointPermission("ifgapi/categories/delete");
 
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
      await deleteCategory(categoryId).unwrap();
      toast.success("Category deleted");
      if (categories.length === 1 && pageIndex > 0) setPageIndex((p) => p - 1);
    } catch (err) {
      toast.error(err?.data ?? "Delete failed");
    }
    setDeleteRule(null);
  }

  async function handleToggle(categoryId, isActive) {
    setTogglingId(categoryId);
    try {
      await toggleCategoryActive({ categoryId, isActive }).unwrap();
    } catch (err) {
      toast.error(err?.data ?? "Failed to update status");
    }
    setTogglingId(null);
  }

  const columns = makeColumns(handleEdit, setDeleteRule, handleToggle, togglingId, { canUpdate, canDelete });

  return (
    <section className="flex flex-col gap-4 px-4 py-1">
      <div>
        <h1 className="text-3xl font-extrabold mb-1">Approval Configuration</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Define who can approve files based on cloud, application, and file
          category.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            
              <div className="font-semibold text-sm">Role-Based Approver Rules</div>
                
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }}
                className="w-48 pl-8"
              />
            </div>
            {canCreate && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-1" />
                Add rule
              </Button>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={categories}
          loading={isLoading}
          error={isError ? "Failed to load categories." : null}
          emptyMessage="No categories found."
          className="border-none"
          pagination={{
            pageIndex,
            pageSize,
            setPageIndex: (idx) => setPageIndex(idx),
            setPageSize:  (size) => { setPageSize(size); setPageIndex(0); },
            totalItems,
            pageCount: Math.ceil(totalItems / pageSize),
          }}
        />
      </div>

      <RuleSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditRule(null); }}
        initial={editRule}
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
