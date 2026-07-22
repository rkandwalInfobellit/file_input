import { createApi } from "@reduxjs/toolkit/query/react"
import { axiosBaseQuery } from "./axiosBaseQuery"

export const csApi = createApi({
  reducerPath: "csApi",
  baseQuery: axiosBaseQuery("cs"),
  keepUnusedDataFor: 300,
  tagTypes: ["User"],
  endpoints: () => ({}),
})
