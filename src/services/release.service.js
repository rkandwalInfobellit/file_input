import { apiClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

const ReleaseService = {
  async getDraftFiles({ page = 1, limit = 50 } = {}) {
    const { data } = await apiClient.get(API_ROUTES.RELEASE_DRAFT_FILES, {
      params: { page, limit },
    })
    return data?.Data ?? { items: [], page: 1, limit, total: 0, pages: 1 }
  },

  async getList({ page = 1, limit = 10 } = {}) {
    const { data } = await apiClient.get(API_ROUTES.RELEASE_LIST, {
      params: { page, limit },
    })
    return data?.Data ?? { items: [], page: 1, limit, total: 0, pages: 1 }
  },

  async create(payload) {
    const { data } = await apiClient.post(API_ROUTES.RELEASE_CREATE, payload)
    return data
  },
}

export default ReleaseService
