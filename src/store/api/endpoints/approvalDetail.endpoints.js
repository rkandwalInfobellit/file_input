import { ifgApi } from "../ifgApi"
import { API_ROUTES } from "@/lib/apiRoutes"

ifgApi.injectEndpoints({
  endpoints: (build) => ({
    getApprovalDetail: build.query({
      query: (versionId) => ({
        url: API_ROUTES.APPROVALS_DETAIL,
        params: { version_id: versionId },
      }),
      transformResponse: (res) => res?.Data ?? null,
      providesTags: (result, error, versionId) => [{ type: "ApprovalDetail", id: versionId }],
      keepUnusedDataFor: 0,
    }),

    submitApprovalDecision: build.mutation({
      query: ({ version_id, decision, comment }) => ({
        url: API_ROUTES.APPROVALS_APPROVE,
        method: "post",
        data: { version_id, decision, comment },
      }),
      invalidatesTags: (result, error, { version_id }) => [{ type: "ApprovalDetail", id: version_id }],
    }),

    markUnderReview: build.mutation({
      query: (version_id) => ({
        url: API_ROUTES.APPROVALS_REVIEW,
        method: "post",
        data: { version_id },
      }),
      invalidatesTags: (result, error, version_id) => [{ type: "ApprovalDetail", id: version_id }],
    }),

    submitFile: build.mutation({
      query: ({ governed_apps, clouds, category_id, file_name, change_type, description }) => ({
        url: API_ROUTES.FILE_UPLOAD_SUBMIT,
        method: "post",
        data: { governed_apps, clouds, category_id, file_name, change_type, description },
      }),
      transformResponse: (res) => res?.Data ?? res,
      invalidatesTags: ["CatalogFile"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetApprovalDetailQuery,
  useSubmitApprovalDecisionMutation,
  useMarkUnderReviewMutation,
  useSubmitFileMutation,
} = ifgApi
