import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./axiosBaseQuery"

export const portalApi = createApi({
  reducerPath: "portalApi",
  baseQuery: axiosBaseQuery("portal"),
  keepUnusedDataFor: 300,
  tagTypes: ["Application"],
  endpoints: () => ({}),
})
