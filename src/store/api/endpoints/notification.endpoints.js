import { ifgApi } from "../ifgApi"
import { API_ROUTES } from "@/lib/apiRoutes"

ifgApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query({
      query: ({ page = 1, limit = 20, is_read = false } = {}) => ({
        url: API_ROUTES.NOTIFICATIONS_INBOX,
        params: { page, limit, is_read },
      }),
      transformResponse: (res) => res?.Data ?? { items: [], unread_count: 0 },
      providesTags: ["Notification"],
      keepUnusedDataFor: 0,
    }),

    markNotificationsRead: build.mutation({
      query: ({ notification_ids = [], type = "individual" }) => ({
        url: API_ROUTES.NOTIFICATIONS_READ,
        method: "patch",
        data: type === "all" ? { type: "all" } : { type: "individual", notification_ids },
      }),
      async onQueryStarted({ notification_ids, type }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          ifgApi.util.updateQueryData("getNotifications", { page: 1, limit: 20, is_read: false }, (draft) => {
            if (type === "all") {
              draft.items.forEach((n) => { n.is_read = true })
              draft.unread_count = 0
            } else {
              const idSet = new Set(notification_ids)
              let changed = 0
              draft.items.forEach((n) => {
                if (idSet.has(n.notification_id) && !n.is_read) {
                  n.is_read = true
                  changed++
                }
              })
              draft.unread_count = Math.max(0, draft.unread_count - changed)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    clearNotifications: build.mutation({
      query: ({ notification_ids = [], type = "individual" }) => ({
        url: API_ROUTES.NOTIFICATIONS_CLEAR,
        method: "delete",
        data: type === "all" ? { type: "all" } : { type: "individual", notification_ids },
      }),
      async onQueryStarted({ notification_ids, type }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          ifgApi.util.updateQueryData("getNotifications", { page: 1, limit: 20, is_read: false }, (draft) => {
            if (type === "all") {
              draft.unread_count = 0
              draft.items = []
            } else {
              const idSet = new Set(notification_ids)
              const removed = draft.items.filter((n) => idSet.has(n.notification_id))
              const unreadRemoved = removed.filter((n) => !n.is_read).length
              draft.items = draft.items.filter((n) => !idSet.has(n.notification_id))
              draft.unread_count = Math.max(0, draft.unread_count - unreadRemoved)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
  useClearNotificationsMutation,
} = ifgApi
