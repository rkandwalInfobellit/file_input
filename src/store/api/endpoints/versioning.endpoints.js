import { ifgApi } from "../ifgApi"
import { API_ROUTES } from "@/lib/apiRoutes"

ifgApi.injectEndpoints({
  endpoints: (build) => ({
    // Returns file_options list (or single-file history if API decides so)
    getVersionFileOptions: build.query({
      query: ({ governed_app, cloud, category_id, page = 1, limit = 10 }) => ({
        url: API_ROUTES.VERSIONS_INPUT,
        params: { governed_apps: governed_app, clouds: cloud, category_id, page, limit },
      }),
      transformResponse: (res) => res?.Data ?? { items: [], current_page: 1, total_pages: 1, total_items: 0 },
      providesTags: ["VersionFile"],
    }),

    // Returns version history for a single file
    getVersionHistory: build.query({
      query: ({ file_id, page = 1, limit = 50 }) => ({
        url: API_ROUTES.VERSIONS_INPUT,
        params: { file_id, page, limit },
      }),
      transformResponse: (res) => res?.Data ?? null,
      providesTags: (result, error, { file_id }) => [{ type: "VersionFile", id: file_id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVersionFileOptionsQuery,
  useLazyGetVersionFileOptionsQuery,
  useGetVersionHistoryQuery,
  useLazyGetVersionHistoryQuery,
} = ifgApi
