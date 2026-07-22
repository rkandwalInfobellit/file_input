import { apiClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

const NotificationService = {
  async fetchInbox({ page = 1, limit = 20, is_read } = {}) {
    const { data } = await apiClient.get(API_ROUTES.NOTIFICATIONS_INBOX, {
      params: {
        page,
        limit,
        ...(is_read !== undefined ? { is_read } : {}),
      },
    })
    return data?.Data ?? { items: [], unread_count: 0, total_items: 0 }
  },

  async markRead({ notification_ids = [], type = "individual" } = {}) {
    const body = type === "all"
      ? { type: "all" }
      : { type: "individual", notification_ids }
    const { data } = await apiClient.patch(API_ROUTES.NOTIFICATIONS_READ, body)
    return data?.Data ?? null
  },

  async clear({ notification_ids = [], type = "individual" } = {}) {
    const body = type === "all"
      ? { type: "all" }
      : { type: "individual", notification_ids }
    const { data } = await apiClient.delete(API_ROUTES.NOTIFICATIONS_CLEAR, { data: body })
    return data?.Data ?? null
  },
}

export default NotificationService
