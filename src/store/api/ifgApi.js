import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./axiosBaseQuery"

export const ifgApi = createApi({
  reducerPath: "ifgApi",
  baseQuery: axiosBaseQuery("ifg"),
  keepUnusedDataFor: 300,
  tagTypes: [
    "CatalogFile",
    "Category",
    "Cloud",
    "Release",
    "DraftFile",
    "Notification",
    "ApprovalDetail",
    "VersionFile",
  ],
  endpoints: () => ({}),
})
