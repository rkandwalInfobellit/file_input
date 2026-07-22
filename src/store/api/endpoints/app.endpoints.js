import { ifgApi } from "../ifgApi"
import { csApi } from "../csApi"
import { portalApi } from "../portalApi"
import { API_ROUTES } from "@/lib/apiRoutes"

// ── Clouds (IFG API) ──────────────────────────────────────────────────────────
ifgApi.injectEndpoints({
  endpoints: (build) => ({
    getClouds: build.query({
      query: () => ({ url: API_ROUTES.CLOUDS_LIST }),
      transformResponse: (res) => res?.Data ?? [],
      providesTags: ["Cloud"],
      keepUnusedDataFor: 600,
    }),
  }),
  overrideExisting: false,
})

// ── Applications (AMD Portal API) ─────────────────────────────────────────────
portalApi.injectEndpoints({
  endpoints: (build) => ({
    getApplications: build.query({
      query: () => ({ url: API_ROUTES.APPLICATIONS }),
      transformResponse: (res) => res?.Data ?? [],
      providesTags: ["Application"],
      keepUnusedDataFor: 600,
    }),
  }),
  overrideExisting: false,
})

// ── Users (CS API) ────────────────────────────────────────────────────────────
csApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: API_ROUTES.USERS_LIST,
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      transformResponse: (res) => res?.Data ?? { items: [], total_pages: 0, total_items: 0 },
      providesTags: ["User"],
      keepUnusedDataFor: 60,
    }),
  }),
  overrideExisting: false,
})

export const { useGetCloudsQuery }       = ifgApi
export const { useGetApplicationsQuery } = portalApi
export const { useGetUsersQuery, useLazyGetUsersQuery } = csApi
