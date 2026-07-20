import { apiClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

const CategoryService = {
  async list({ page = 1, limit = 10 } = {}) {
    const { data } = await apiClient.get(API_ROUTES.CATEGORIES_LIST, {
      params: { page, limit },
    })
    return data?.Data ?? { items: [], total_items: 0, total_pages: 0, current_page: 1 }
  },

  async detail(categoryId) {
    const { data } = await apiClient.get(API_ROUTES.CATEGORIES_DETAIL, {
      params: { category_id: categoryId },
    })
    return data?.Data ?? null
  },

  async create(payload) {
    const { data } = await apiClient.post(API_ROUTES.CATEGORIES_CREATE, payload)
    return data?.Data
  },

  // Upload template file to the pre-signed S3 URL returned from create()
  async uploadTemplate(uploadUrl, file) {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    })
  },

  async update(payload) {
    const { data } = await apiClient.put(API_ROUTES.CATEGORIES_UPDATE, payload)
    return data?.Data
  },

  async remove(categoryId) {
    const { data } = await apiClient.delete(API_ROUTES.CATEGORIES_DELETE, {
      data: { category_id: categoryId },
    })
    return data
  },

  async toggleActive(categoryId, isActive) {
    const { data } = await apiClient.put(API_ROUTES.CATEGORIES_UPDATE, {
      category_id: categoryId,
      is_active: isActive,
    })
    return data?.Data
  },
}

export default CategoryService
