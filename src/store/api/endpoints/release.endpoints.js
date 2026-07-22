import { ifgApi } from "../ifgApi"
import { API_ROUTES } from "@/lib/apiRoutes"

ifgApi.injectEndpoints({
  endpoints: (build) => ({
    getReleases: build.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: API_ROUTES.RELEASE_LIST,
        params: { page, limit },
      }),
      transformResponse: (res) => {
        const raw = res?.Data ?? { items: [], total_pages: 1 }
        return {
          ...raw,
          items: (raw.items ?? []).map((r) => ({
            id: r.release_id,
            name: r.release_name,
            version: r.release_version,
            type: r.release_type,
            notes: r.release_notes,
            status: r.status,
            displayStatus: r.display_status,
            isActive: r.is_active,
            createdBy: r.created_by,
            createdAt: r.created_at,
            releasedAt: r.released_at,
            releasedBy: r.released_by,
            totalItems: r.total_items,
            files: (r.items ?? []).map((f) => ({
              id: f.file_id,
              name: f.file_name,
              categoryId: f.category_id,
              category_display_name: f.category_display_name,
              app: f.governed_app,
              cloud: f.cloud,
              version: f.input_version,
              versionId: f.version_id,
              isLatest: f.is_latest_version,
              uiState: f.ui_state,
              contributor: f.contributor_name ?? f.contributor_email,
              approvedBy: Array.isArray(f.approvers)
                ? f.approvers.join(", ")
                : (f.approvers ?? "—"),
              approvedDate: f.approved_at
                ? new Date(f.approved_at).toLocaleDateString("en-US", {
                    month: "2-digit", day: "2-digit", year: "numeric",
                  })
                : "—",
            })),
          })),
        }
      },
      // Infinite scroll: merge pages in the cache by page number
      serializeQueryArgs: ({ queryArgs }) => ({ limit: queryArgs.limit }),
      merge: (currentCache, newData, { arg }) => {
        if (arg.page === 1) return newData
        return {
          ...newData,
          items: [...(currentCache.items ?? []), ...(newData.items ?? [])],
        }
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: ["Release"],
    }),

    getDraftFiles: build.query({
      query: ({ page = 1, limit = 50 } = {}) => ({
        url: API_ROUTES.RELEASE_DRAFT_FILES,
        params: { page, limit },
      }),
      transformResponse: (res) => res?.Data ?? { items: [], page: 1, pages: 1, total: 0, limit: 50 },
      providesTags: ["DraftFile"],
      keepUnusedDataFor: 0,
    }),

    createRelease: build.mutation({
      query: (payload) => ({
        url: API_ROUTES.RELEASE_CREATE,
        method: "post",
        data: payload,
      }),
      invalidatesTags: ["Release", "DraftFile"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetReleasesQuery,
  useLazyGetReleasesQuery,
  useGetDraftFilesQuery,
  useCreateReleaseMutation,
} = ifgApi
