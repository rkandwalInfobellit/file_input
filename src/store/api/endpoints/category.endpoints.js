import { ifgApi } from "../ifgApi"
import { API_ROUTES } from "@/lib/apiRoutes"
import CategoryService from "@/services/category.service"

ifgApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query({
      query: ({ page = 1, limit = 10, search = "", is_active } = {}) => ({
        url: API_ROUTES.CATEGORIES_LIST,
        params: {
          page, limit,
          ...(search     ? { search }     : {}),
          ...(is_active !== undefined ? { is_active } : {}),
        },
      }),
      transformResponse: (res) => res?.Data ?? { items: [], current_page: 1, total_pages: 0, total_items: 0 },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({ type: "Category", id: c.category_id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    // createCategory has a two-step flow (POST then conditional S3 PUT + rollback DELETE)
    // that is too complex for a pure RTK Query mutation body, so we delegate to the
    // existing CategoryService which handles the rollback atomically.
    createCategory: build.mutation({
      queryFn: async ({ payload, file }) => {
        let created = null
        try {
          created = await CategoryService.create(payload)
          if (file && created?.template_upload_url) {
            await CategoryService.uploadTemplate(created.template_upload_url, file)
          }
          return { data: created }
        } catch (err) {
          if (created?.category_id) {
            await CategoryService.remove(created.category_id).catch(() => {})
          }
          return { error: { status: "CUSTOM_ERROR", data: err.message ?? "Failed to create category" } }
        }
      },
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: build.mutation({
      query: (payload) => ({
        url: API_ROUTES.CATEGORIES_UPDATE,
        method: "put",
        data: payload,
      }),
      transformResponse: (res) => res?.Data ?? null,
      invalidatesTags: (result, error, { category_id }) => [{ type: "Category", id: category_id }],
    }),

    deleteCategory: build.mutation({
      query: (categoryId) => ({
        url: API_ROUTES.CATEGORIES_DELETE,
        method: "delete",
        data: { category_id: categoryId },
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    toggleCategoryActive: build.mutation({
      query: ({ categoryId, isActive }) => ({
        url: API_ROUTES.CATEGORIES_UPDATE,
        method: "put",
        data: { category_id: categoryId, is_active: isActive },
      }),
      async onQueryStarted({ categoryId, isActive }, { dispatch, getState, queryFulfilled }) {
        // Optimistically flip is_active in every cached getCategories result
        const patches = []
        for (const { endpointName, originalArgs } of ifgApi.util.selectInvalidatedBy(getState(), [{ type: "Category", id: categoryId }])) {
          if (endpointName !== "getCategories") continue
          patches.push(
            dispatch(
              ifgApi.util.updateQueryData("getCategories", originalArgs, (draft) => {
                const item = draft.items?.find((c) => c.category_id === categoryId)
                if (item) item.is_active = isActive
              })
            )
          )
        }
        try {
          await queryFulfilled
        } catch {
          patches.forEach((p) => p.undo())
        }
      },
      invalidatesTags: (result, error, { categoryId }) => [{ type: "Category", id: categoryId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
} = ifgApi
