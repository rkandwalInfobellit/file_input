import { apiClient, csClient, amdPortalClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

const AppService = {
  async fetchClouds() {
    const { data } = await apiClient.get(API_ROUTES.CLOUDS_LIST)
    return data?.Data ?? []
  },

  async fetchApplications() {
    const { data } = await amdPortalClient.get(API_ROUTES.APPLICATIONS)
    return data?.Data ?? []
  },

  async fetchUsers({ page = 1, limit = 10, search = "" } = {}) {
    const { data } = await csClient.get(API_ROUTES.USERS_LIST, {
      params: { page, limit, ...(search ? { search } : {}) },
    })
    return data?.Data ?? { items: [], total_items: 0, total_pages: 0, current_page: 1 }
  },
}

export default AppService
