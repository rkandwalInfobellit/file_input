import { ifgApi } from "../ifgApi"
import { API_ROUTES } from "@/lib/apiRoutes"

ifgApi.injectEndpoints({
  endpoints: (build) => ({
    getFiles: build.query({
      query: ({
        tab = "all", page = 1, limit = 10,
        search = "", governed_app = [], cloud = [], category = [], status = [],
      } = {}) => ({
        url: API_ROUTES.CATALOG_LIST,
        params: {
          tab, page, limit,
          ...(search               ? { search }        : {}),
          ...(governed_app?.length ? { governed_app }  : {}),
          ...(cloud?.length        ? { cloud }         : {}),
          ...(category?.length     ? { category }      : {}),
          ...(status?.length       ? { status }        : {}),
        },
      }),
      transformResponse: (res) => res?.Data ?? { items: [], current_page: 1, total_pages: 0, total_items: 0 },
      providesTags: ["CatalogFile"],
      keepUnusedDataFor: 60,
    }),
  }),
  overrideExisting: false,
})

export const { useGetFilesQuery } = ifgApi

// Fires three tiny requests (page=1, limit=1) to get per-tab counts.
// Each lands in its own cache slot keyed by the full arg object.
export function useTabCounts() {
  const allQ = ifgApi.endpoints.getFiles.useQueryState({ tab: "all",      page: 1, limit: 1 })
  const myQ  = ifgApi.endpoints.getFiles.useQueryState({ tab: "my_files", page: 1, limit: 1 })
  const reqQ = ifgApi.endpoints.getFiles.useQueryState({ tab: "requests", page: 1, limit: 1 })
  return {
    all:      allQ.data?.total_items  ?? null,
    my_files: myQ.data?.total_items   ?? null,
    requests: reqQ.data?.total_items  ?? null,
  }
}
