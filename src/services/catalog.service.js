import { apiClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

const CatalogService = {
  async list({ tab = "all", page = 1, limit = 10, search = "", governed_app = [], cloud = [], category = [], status = [] } = {}) {
    const { data } = await apiClient.get(API_ROUTES.CATALOG_LIST, {
      params: {
        tab,
        page,
        limit,
        ...(search              ? { search }                                      : {}),
        ...(governed_app.length ? { governed_app: governed_app.join(",") }        : {}),
        ...(cloud.length        ? { cloud: cloud.join(",") }                      : {}),
        ...(category.length     ? { category: category.join(",") }                : {}),
        ...(status.length       ? { status: status.join(",") }                    : {}),
      },
    })
    return data?.Data ?? { items: [], total_items: 0, total_pages: 0, current_page: 1 }
  },
}

export default CatalogService
