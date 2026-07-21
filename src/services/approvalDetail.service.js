import { apiClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

const ApprovalDetailService = {
  async fetch(versionId) {
    const { data } = await apiClient.get(API_ROUTES.APPROVALS_DETAIL, {
      params: { version_id: versionId },
    })
    return data?.Data ?? null
  },

  async decide({ version_id, decision, comment }) {
    const { data } = await apiClient.post(API_ROUTES.APPROVALS_APPROVE, {
      version_id,
      decision,
      comment,
    })
    return data
  },
}

export default ApprovalDetailService
